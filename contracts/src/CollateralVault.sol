// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CollateralVault
 * @notice Manages BNB collateral locks for the TrustPay BNPL protocol.
 *         Enforces a strict 150% collateral ratio.
 */
contract CollateralVault is ReentrancyGuard, Ownable {
    // ─── State ───────────────────────────────────────────────
    uint256 public constant COLLATERAL_RATIO = 150; // 150% = 1.5x
    address public loanContract;

    struct Collateral {
        uint256 amount;       // BNB locked
        uint256 productPrice; // product price in BNB
        bool    locked;
    }

    // buyer => loanId => Collateral
    mapping(address => mapping(uint256 => Collateral)) public collaterals;

    // ─── Events ──────────────────────────────────────────────
    event CollateralLocked(address indexed buyer, uint256 indexed loanId, uint256 amount, uint256 productPrice);
    event CollateralReleased(address indexed buyer, uint256 indexed loanId, uint256 amount);
    event CollateralLiquidated(address indexed buyer, uint256 indexed loanId, uint256 toMerchant, uint256 refund);

    // ─── Modifiers ───────────────────────────────────────────
    modifier onlyLoanContract() {
        require(msg.sender == loanContract, "Vault: caller is not the loan contract");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ─── Admin ───────────────────────────────────────────────
    function setLoanContract(address _loanContract) external onlyOwner {
        require(_loanContract != address(0), "Vault: zero address");
        loanContract = _loanContract;
    }

    // ─── Core ────────────────────────────────────────────────

    /**
     * @notice Lock BNB collateral for a BNPL purchase.
     * @param buyer The buyer address.
     * @param loanId The loan identifier.
     * @param productPrice The product price in BNB (wei).
     */
    function lockCollateral(
        address buyer,
        uint256 loanId,
        uint256 productPrice
    ) external payable onlyLoanContract nonReentrant {
        uint256 requiredCollateral = (productPrice * COLLATERAL_RATIO) / 100;
        require(msg.value >= requiredCollateral, "Vault: insufficient collateral");
        require(!collaterals[buyer][loanId].locked, "Vault: already locked");

        collaterals[buyer][loanId] = Collateral({
            amount: msg.value,
            productPrice: productPrice,
            locked: true
        });

        emit CollateralLocked(buyer, loanId, msg.value, productPrice);
    }

    /**
     * @notice Release collateral back to the buyer after full repayment.
     * @param buyer The buyer address.
     * @param loanId The loan identifier.
     */
    function releaseCollateral(
        address buyer,
        uint256 loanId
    ) external onlyLoanContract nonReentrant {
        Collateral storage col = collaterals[buyer][loanId];
        require(col.locked, "Vault: not locked");

        uint256 amount = col.amount;
        col.locked = false;
        col.amount = 0;

        (bool success,) = payable(buyer).call{value: amount}("");
        require(success, "Vault: transfer failed");

        emit CollateralReleased(buyer, loanId, amount);
    }

    /**
     * @notice Liquidate collateral: pay remaining debt to merchant, refund excess to buyer.
     * @param buyer The buyer address.
     * @param loanId The loan identifier.
     * @param merchant The merchant address to receive outstanding amount.
     * @param outstandingDebt The remaining unpaid amount.
     */
    function liquidateCollateral(
        address buyer,
        uint256 loanId,
        address merchant,
        uint256 outstandingDebt
    ) external onlyLoanContract nonReentrant {
        Collateral storage col = collaterals[buyer][loanId];
        require(col.locked, "Vault: not locked");

        uint256 totalCollateral = col.amount;
        col.locked = false;
        col.amount = 0;

        // Pay outstanding debt to merchant
        uint256 merchantPayment = outstandingDebt > totalCollateral ? totalCollateral : outstandingDebt;
        (bool s1,) = payable(merchant).call{value: merchantPayment}("");
        require(s1, "Vault: merchant payment failed");

        // Refund remaining to buyer
        uint256 refund = totalCollateral - merchantPayment;
        if (refund > 0) {
            (bool s2,) = payable(buyer).call{value: refund}("");
            require(s2, "Vault: refund failed");
        }

        emit CollateralLiquidated(buyer, loanId, merchantPayment, refund);
    }

    // ─── Views ───────────────────────────────────────────────
    function getCollateral(address buyer, uint256 loanId) external view returns (
        uint256 amount,
        uint256 productPrice,
        bool locked
    ) {
        Collateral storage col = collaterals[buyer][loanId];
        return (col.amount, col.productPrice, col.locked);
    }

    function getRequiredCollateral(uint256 productPrice) external pure returns (uint256) {
        return (productPrice * COLLATERAL_RATIO) / 100;
    }
}
