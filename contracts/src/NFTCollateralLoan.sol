// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title NFTCollateralLoan
 * @notice Allows users to lock ERC-721 NFTs as collateral and receive
 *         BNB loans directly deposited to their wallet.
 *         Supports repayment with interest and liquidation on default.
 */
contract NFTCollateralLoan is ReentrancyGuard, Ownable, IERC721Receiver {
    // ─── Enums ───────────────────────────────────────────────
    enum LoanStatus { ACTIVE, REPAID, DEFAULTED, LIQUIDATED }

    // ─── Structs ─────────────────────────────────────────────
    struct NFTLoan {
        uint256   id;
        address   borrower;
        address   nftContract;      // ERC-721 contract address
        uint256   tokenId;          // NFT token ID
        uint256   loanAmount;       // BNB loaned out (wei)
        uint256   interestAmount;   // Interest owed (wei)
        uint256   totalDue;         // loanAmount + interestAmount
        uint256   totalRepaid;      // amount repaid so far
        uint256   dueTimestamp;     // when the loan must be repaid
        uint256   createdAt;
        LoanStatus status;
    }

    // ─── State ───────────────────────────────────────────────
    uint256 public constant INTEREST_RATE_BPS = 500;     // 5% interest (basis points)
    uint256 public constant LOAN_DURATION = 30 days;     // repayment window
    uint256 public constant GRACE_PERIOD = 7 days;       // extra time before liquidation
    uint256 public constant LTV_RATIO = 50;              // 50% loan-to-value ratio (conservative)

    uint256 public nextLoanId;

    // Minimum floor price for NFTs from approved collections
    // nftContract => floor price in BNB (wei)
    mapping(address => uint256) public nftFloorPrices;
    mapping(address => bool)    public approvedCollections;

    // All loans
    mapping(uint256 => NFTLoan) public nftLoans;

    // Borrower tracking
    mapping(address => uint256[]) public borrowerLoans;

    // Protocol treasury (BNB available for lending)
    uint256 public totalDeposited;

    // ─── Events ──────────────────────────────────────────────
    event CollectionApproved(address indexed nftContract, uint256 floorPrice);
    event CollectionRemoved(address indexed nftContract);
    event FloorPriceUpdated(address indexed nftContract, uint256 newFloorPrice);
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed nftContract,
        uint256 tokenId,
        uint256 loanAmount,
        uint256 interestAmount
    );
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amountPaid);
    event LoanLiquidated(uint256 indexed loanId, address indexed borrower, address indexed nftContract, uint256 tokenId);
    event TreasuryDeposited(address indexed depositor, uint256 amount);
    event TreasuryWithdrawn(address indexed owner, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ─── Admin Functions ─────────────────────────────────────

    /**
     * @notice Approve an NFT collection for collateral with a floor price.
     * @param nftContract The ERC-721 contract address.
     * @param floorPrice The floor price in BNB (wei) for this collection.
     */
    function approveCollection(address nftContract, uint256 floorPrice) external onlyOwner {
        require(nftContract != address(0), "NFTLoan: zero address");
        require(floorPrice > 0, "NFTLoan: zero floor price");
        approvedCollections[nftContract] = true;
        nftFloorPrices[nftContract] = floorPrice;
        emit CollectionApproved(nftContract, floorPrice);
    }

    /**
     * @notice Remove an NFT collection from approved list.
     */
    function removeCollection(address nftContract) external onlyOwner {
        approvedCollections[nftContract] = false;
        nftFloorPrices[nftContract] = 0;
        emit CollectionRemoved(nftContract);
    }

    /**
     * @notice Update floor price for an approved collection.
     */
    function updateFloorPrice(address nftContract, uint256 newFloorPrice) external onlyOwner {
        require(approvedCollections[nftContract], "NFTLoan: collection not approved");
        require(newFloorPrice > 0, "NFTLoan: zero floor price");
        nftFloorPrices[nftContract] = newFloorPrice;
        emit FloorPriceUpdated(nftContract, newFloorPrice);
    }

    /**
     * @notice Deposit BNB into the lending treasury.
     */
    function depositToTreasury() external payable onlyOwner {
        require(msg.value > 0, "NFTLoan: zero deposit");
        totalDeposited += msg.value;
        emit TreasuryDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw BNB from the lending treasury.
     */
    function withdrawFromTreasury(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "NFTLoan: insufficient balance");
        totalDeposited = totalDeposited > amount ? totalDeposited - amount : 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "NFTLoan: withdrawal failed");
        emit TreasuryWithdrawn(msg.sender, amount);
    }

    // ─── Core Loan Functions ─────────────────────────────────

    /**
     * @notice Take a loan by depositing an NFT as collateral.
     *         BNB is sent directly to the borrower's wallet.
     * @param nftContract The ERC-721 contract address.
     * @param tokenId The token ID of the NFT to collateralize.
     */
    function takeLoan(address nftContract, uint256 tokenId) external nonReentrant {
        require(approvedCollections[nftContract], "NFTLoan: collection not approved");

        // Verify caller owns the NFT
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "NFTLoan: not NFT owner");

        // Calculate loan amount based on floor price and LTV
        uint256 floorPrice = nftFloorPrices[nftContract];
        uint256 loanAmount = (floorPrice * LTV_RATIO) / 100;
        require(loanAmount > 0, "NFTLoan: loan amount too small");
        require(address(this).balance >= loanAmount, "NFTLoan: insufficient treasury");

        // Calculate interest
        uint256 interestAmount = (loanAmount * INTEREST_RATE_BPS) / 10000;
        uint256 totalDue = loanAmount + interestAmount;

        // Transfer NFT to this contract (must be approved first)
        nft.safeTransferFrom(msg.sender, address(this), tokenId);

        // Create loan record
        uint256 loanId = nextLoanId++;
        nftLoans[loanId] = NFTLoan({
            id: loanId,
            borrower: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            loanAmount: loanAmount,
            interestAmount: interestAmount,
            totalDue: totalDue,
            totalRepaid: 0,
            dueTimestamp: block.timestamp + LOAN_DURATION,
            createdAt: block.timestamp,
            status: LoanStatus.ACTIVE
        });

        borrowerLoans[msg.sender].push(loanId);

        // Send BNB loan directly to borrower's wallet
        (bool success, ) = payable(msg.sender).call{value: loanAmount}("");
        require(success, "NFTLoan: loan transfer failed");

        emit LoanCreated(loanId, msg.sender, nftContract, tokenId, loanAmount, interestAmount);
    }

    /**
     * @notice Repay a loan (full or partial). When fully repaid, NFT is returned.
     * @param loanId The loan identifier.
     */
    function repayLoan(uint256 loanId) external payable nonReentrant {
        NFTLoan storage loan = nftLoans[loanId];
        require(loan.borrower == msg.sender, "NFTLoan: not your loan");
        require(loan.status == LoanStatus.ACTIVE, "NFTLoan: loan not active");
        require(msg.value > 0, "NFTLoan: zero payment");

        loan.totalRepaid += msg.value;

        if (loan.totalRepaid >= loan.totalDue) {
            // Fully repaid — return NFT to borrower
            loan.status = LoanStatus.REPAID;

            IERC721 nft = IERC721(loan.nftContract);
            nft.safeTransferFrom(address(this), msg.sender, loan.tokenId);

            // Refund overpayment
            uint256 excess = loan.totalRepaid - loan.totalDue;
            if (excess > 0) {
                loan.totalRepaid = loan.totalDue;
                (bool refunded, ) = payable(msg.sender).call{value: excess}("");
                require(refunded, "NFTLoan: refund failed");
            }

            // Add interest back to treasury
            totalDeposited += loan.interestAmount;

            emit LoanRepaid(loanId, msg.sender, loan.totalDue);
        } else {
            emit LoanRepaid(loanId, msg.sender, msg.value);
        }
    }

    /**
     * @notice Liquidate a defaulted loan. Anyone can call after grace period.
     *         The NFT is seized by the protocol (transferred to owner).
     * @param loanId The loan identifier.
     */
    function liquidateLoan(uint256 loanId) external nonReentrant {
        NFTLoan storage loan = nftLoans[loanId];
        require(loan.status == LoanStatus.ACTIVE, "NFTLoan: loan not active");
        require(
            block.timestamp > loan.dueTimestamp + GRACE_PERIOD,
            "NFTLoan: still within grace period"
        );

        loan.status = LoanStatus.LIQUIDATED;

        // Transfer NFT to protocol owner (can be auctioned later)
        IERC721 nft = IERC721(loan.nftContract);
        nft.safeTransferFrom(address(this), owner(), loan.tokenId);

        emit LoanLiquidated(loanId, loan.borrower, loan.nftContract, loan.tokenId);
    }

    // ─── View Functions ──────────────────────────────────────

    function getLoan(uint256 loanId) external view returns (NFTLoan memory) {
        return nftLoans[loanId];
    }

    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }

    function getMaxLoanAmount(address nftContract) external view returns (uint256) {
        if (!approvedCollections[nftContract]) return 0;
        return (nftFloorPrices[nftContract] * LTV_RATIO) / 100;
    }

    function isLoanDefaulted(uint256 loanId) external view returns (bool) {
        NFTLoan storage loan = nftLoans[loanId];
        if (loan.status != LoanStatus.ACTIVE) return false;
        return block.timestamp > loan.dueTimestamp + GRACE_PERIOD;
    }

    function getCollectionInfo(address nftContract) external view returns (
        bool approved,
        uint256 floorPrice,
        uint256 maxLoan
    ) {
        approved = approvedCollections[nftContract];
        floorPrice = nftFloorPrices[nftContract];
        maxLoan = approved ? (floorPrice * LTV_RATIO) / 100 : 0;
    }

    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ─── ERC721 Receiver ─────────────────────────────────────
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // ─── Fallback ────────────────────────────────────────────
    receive() external payable {
        totalDeposited += msg.value;
        emit TreasuryDeposited(msg.sender, msg.value);
    }
}
