// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CollateralVault.sol";

/**
 * @title BNPLLoan
 * @notice Coordinates BNPL loans with 4-installment repayment schedules.
 *         Guarantees instant payment to merchants upon loan creation.
 */
contract BNPLLoan is ReentrancyGuard, Ownable {
    // ─── Enums ───────────────────────────────────────────────
    enum LoanStatus { ACTIVE, REPAID, DEFAULTED }

    // ─── Structs ─────────────────────────────────────────────
    struct Product {
        uint256 id;
        string  name;
        string  description;
        string  imageUri;
        uint256 price;       // in BNB (wei)
        address merchant;
        bool    active;
    }

    struct Loan {
        uint256    id;
        address    buyer;
        address    merchant;
        uint256    productId;
        uint256    productPrice;
        uint256    totalRepaid;
        uint256    installmentAmount;   // productPrice / 4
        uint8      installmentsPaid;
        uint256    nextDueTimestamp;
        uint256    createdAt;
        LoanStatus status;
    }

    // ─── State ───────────────────────────────────────────────
    CollateralVault public vault;

    uint256 public constant NUM_INSTALLMENTS = 4;
    uint256 public constant INSTALLMENT_INTERVAL = 1 weeks; // 1 week between payments
    uint256 public constant GRACE_PERIOD = 3 days;          // tolerance after due date

    uint256 public nextProductId;
    uint256 public nextLoanId;

    mapping(uint256 => Product) public products;
    mapping(uint256 => Loan)    public loans;

    // Merchant registration
    mapping(address => bool)      public registeredMerchants;
    mapping(address => string)    public merchantNames;
    mapping(address => uint256[]) public merchantProducts;
    mapping(address => uint256[]) public merchantLoans;

    // Buyer tracking
    mapping(address => uint256[]) public buyerLoans;

    // ─── Events ──────────────────────────────────────────────
    event MerchantRegistered(address indexed merchant, string name);
    event ProductCreated(uint256 indexed productId, address indexed merchant, string name, uint256 price);
    event ProductToggled(uint256 indexed productId, bool active);
    event LoanCreated(uint256 indexed loanId, address indexed buyer, address indexed merchant, uint256 productId, uint256 price);
    event InstallmentPaid(uint256 indexed loanId, address indexed buyer, uint8 installmentNumber, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed buyer);
    event LoanDefaulted(uint256 indexed loanId, address indexed buyer);
    event CollateralClaimed(uint256 indexed loanId, address indexed buyer, uint256 amount);
    event MerchantPaid(uint256 indexed loanId, address indexed merchant, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────
    constructor(address _vault) Ownable(msg.sender) {
        vault = CollateralVault(_vault);
    }

    /// @notice Accept BNB deposits for the protocol treasury.
    receive() external payable {}

    // ─── Merchant Functions ──────────────────────────────────

    function registerMerchant(string calldata name) external {
        require(!registeredMerchants[msg.sender], "BNPL: already registered");
        require(bytes(name).length > 0, "BNPL: empty name");
        registeredMerchants[msg.sender] = true;
        merchantNames[msg.sender] = name;
        emit MerchantRegistered(msg.sender, name);
    }

    function createProduct(
        string calldata name,
        string calldata description,
        string calldata imageUri,
        uint256 price
    ) external {
        require(registeredMerchants[msg.sender], "BNPL: not a merchant");
        require(price > 0, "BNPL: zero price");

        uint256 productId = nextProductId++;
        products[productId] = Product({
            id: productId,
            name: name,
            description: description,
            imageUri: imageUri,
            price: price,
            merchant: msg.sender,
            active: true
        });

        merchantProducts[msg.sender].push(productId);
        emit ProductCreated(productId, msg.sender, name, price);
    }

    function toggleProduct(uint256 productId) external {
        Product storage p = products[productId];
        require(p.merchant == msg.sender, "BNPL: not your product");
        p.active = !p.active;
        emit ProductToggled(productId, p.active);
    }

    // ─── Buyer Functions ─────────────────────────────────────

    /**
     * @notice Purchase a product with BNPL. Buyer sends 1.5x collateral.
     *         Merchant is instantly paid the product price from the collateral logic:
     *         Actually, merchant is paid from the installments. The collateral is a guarantee.
     *         For MVP: merchant receives instant payment from the protocol treasury (this contract).
     * @param productId The ID of the product to purchase.
     */
    function purchaseProduct(uint256 productId) external payable nonReentrant {
        Product storage p = products[productId];
        require(p.active, "BNPL: product not active");
        require(p.merchant != msg.sender, "BNPL: cannot buy own product");

        uint256 requiredCollateral = vault.getRequiredCollateral(p.price);
        require(msg.value >= requiredCollateral, "BNPL: insufficient collateral");

        uint256 loanId = nextLoanId++;

        // Lock collateral in vault
        vault.lockCollateral{value: msg.value}(msg.sender, loanId, p.price);

        // Pay merchant instantly from protocol treasury
        require(address(this).balance >= p.price, "BNPL: insufficient treasury");
        (bool merchantPaid,) = payable(p.merchant).call{value: p.price}("");
        require(merchantPaid, "BNPL: merchant payment failed");
        emit MerchantPaid(loanId, p.merchant, p.price);

        loans[loanId] = Loan({
            id: loanId,
            buyer: msg.sender,
            merchant: p.merchant,
            productId: productId,
            productPrice: p.price,
            totalRepaid: 0,
            installmentAmount: p.price / NUM_INSTALLMENTS,
            installmentsPaid: 0,
            nextDueTimestamp: block.timestamp + INSTALLMENT_INTERVAL,
            createdAt: block.timestamp,
            status: LoanStatus.ACTIVE
        });

        buyerLoans[msg.sender].push(loanId);
        merchantLoans[p.merchant].push(loanId);

        emit LoanCreated(loanId, msg.sender, p.merchant, productId, p.price);
    }

    /**
     * @notice Pay the next installment on a loan.
     * @param loanId The loan identifier.
     */
    function payInstallment(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.buyer == msg.sender, "BNPL: not your loan");
        require(loan.status == LoanStatus.ACTIVE, "BNPL: loan not active");
        require(loan.installmentsPaid < NUM_INSTALLMENTS, "BNPL: all paid");
        require(msg.value >= loan.installmentAmount, "BNPL: insufficient payment");

        loan.installmentsPaid++;
        loan.totalRepaid += msg.value;

        // Installment stays in contract treasury (merchant was already paid on purchase)

        emit InstallmentPaid(loanId, msg.sender, loan.installmentsPaid, msg.value);

        if (loan.installmentsPaid >= NUM_INSTALLMENTS) {
            // Fully repaid — buyer must call claimCollateral() separately
            loan.status = LoanStatus.REPAID;
            emit LoanRepaid(loanId, msg.sender);
        } else {
            // Set next due date
            loan.nextDueTimestamp = block.timestamp + INSTALLMENT_INTERVAL;
        }
    }

    /**
     * @notice Trigger default/liquidation for a missed payment.
     *         Anyone can call this if the grace period has elapsed.
     * @param loanId The loan identifier.
     */
    function triggerDefault(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.ACTIVE, "BNPL: loan not active");
        require(
            block.timestamp > loan.nextDueTimestamp + GRACE_PERIOD,
            "BNPL: still within grace period"
        );

        loan.status = LoanStatus.DEFAULTED;

        // Calculate outstanding debt owed to protocol treasury
        uint256 remainingInstallments = NUM_INSTALLMENTS - loan.installmentsPaid;
        uint256 outstandingDebt = remainingInstallments * loan.installmentAmount;

        // Liquidate collateral: recover outstanding to treasury, refund excess to buyer
        vault.liquidateCollateral(loan.buyer, loanId, address(this), outstandingDebt);

        emit LoanDefaulted(loanId, loan.buyer);
    }

    /**
     * @notice Claim collateral back after fully repaying a loan.
     * @param loanId The loan identifier.
     */
    function claimCollateral(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.buyer == msg.sender, "BNPL: not your loan");
        require(loan.status == LoanStatus.REPAID, "BNPL: loan not repaid");
        vault.releaseCollateral(msg.sender, loanId);
        emit CollateralClaimed(loanId, msg.sender, 0); // amount logged by vault event
    }

    // ─── View Functions ──────────────────────────────────────

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    function getProduct(uint256 productId) external view returns (Product memory) {
        return products[productId];
    }

    function getBuyerLoans(address buyer) external view returns (uint256[] memory) {
        return buyerLoans[buyer];
    }

    function getMerchantLoans(address merchant) external view returns (uint256[] memory) {
        return merchantLoans[merchant];
    }

    function getMerchantProducts(address merchant) external view returns (uint256[] memory) {
        return merchantProducts[merchant];
    }

    function getAllProducts() external view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](nextProductId);
        for (uint256 i = 0; i < nextProductId; i++) {
            allProducts[i] = products[i];
        }
        return allProducts;
    }

    function isLoanOverdue(uint256 loanId) external view returns (bool) {
        Loan storage loan = loans[loanId];
        if (loan.status != LoanStatus.ACTIVE) return false;
        return block.timestamp > loan.nextDueTimestamp + GRACE_PERIOD;
    }

    // ─── Admin / Dev Functions ───────────────────────────────

    /**
     * @notice Get current block timestamp (useful for frontend time display).
     */
    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }
}
