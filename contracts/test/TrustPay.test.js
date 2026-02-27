const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TrustPay Protocol", function () {
  let vault, bnpl;
  let owner, merchant, buyer, outsider;
  const PRODUCT_PRICE = ethers.parseEther("1.0"); // 1 BNB
  const COLLATERAL = ethers.parseEther("1.5");     // 1.5 BNB (150%)
  const INSTALLMENT = ethers.parseEther("0.25");   // 0.25 BNB per installment
  const ONE_WEEK = 7 * 24 * 60 * 60;
  const THREE_DAYS = 3 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, merchant, buyer, outsider] = await ethers.getSigners();

    // Deploy CollateralVault
    const VaultFactory = await ethers.getContractFactory("CollateralVault");
    vault = await VaultFactory.deploy();
    await vault.waitForDeployment();

    // Deploy BNPLLoan
    const BNPLFactory = await ethers.getContractFactory("BNPLLoan");
    bnpl = await BNPLFactory.deploy(await vault.getAddress());
    await bnpl.waitForDeployment();

    // Link vault -> loan contract
    await vault.setLoanContract(await bnpl.getAddress());
  });

  // ─── Vault Tests ─────────────────────────────────────────

  describe("CollateralVault", function () {
    it("should compute required collateral at 150%", async function () {
      const required = await vault.getRequiredCollateral(PRODUCT_PRICE);
      expect(required).to.equal(COLLATERAL);
    });

    it("should reject direct collateral lock (only loan contract)", async function () {
      await expect(
        vault.connect(buyer).lockCollateral(buyer.address, 0, PRODUCT_PRICE, {
          value: COLLATERAL,
        })
      ).to.be.revertedWith("Vault: caller is not the loan contract");
    });
  });

  // ─── Merchant Tests ──────────────────────────────────────

  describe("Merchant Registration & Products", function () {
    it("should register a merchant", async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      expect(await bnpl.registeredMerchants(merchant.address)).to.be.true;
      expect(await bnpl.merchantNames(merchant.address)).to.equal("CyberShop");
    });

    it("should reject duplicate merchant registration", async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      await expect(
        bnpl.connect(merchant).registerMerchant("CyberShop2")
      ).to.be.revertedWith("BNPL: already registered");
    });

    it("should create a product", async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      await bnpl
        .connect(merchant)
        .createProduct("Neural Headset", "AR interface device", "ipfs://img1", PRODUCT_PRICE);

      const product = await bnpl.getProduct(0);
      expect(product.name).to.equal("Neural Headset");
      expect(product.price).to.equal(PRODUCT_PRICE);
      expect(product.merchant).to.equal(merchant.address);
      expect(product.active).to.be.true;
    });

    it("should reject product from non-merchant", async function () {
      await expect(
        bnpl.connect(outsider).createProduct("Hacked", "no", "", PRODUCT_PRICE)
      ).to.be.revertedWith("BNPL: not a merchant");
    });

    it("should toggle product active status", async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      await bnpl
        .connect(merchant)
        .createProduct("Item", "Desc", "", PRODUCT_PRICE);
      await bnpl.connect(merchant).toggleProduct(0);
      const product = await bnpl.getProduct(0);
      expect(product.active).to.be.false;
    });
  });

  // ─── Purchase / Loan Tests ───────────────────────────────

  describe("BNPL Purchase Flow", function () {
    beforeEach(async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      await bnpl
        .connect(merchant)
        .createProduct("Neural Headset", "AR device", "ipfs://img1", PRODUCT_PRICE);
    });

    it("should create a loan with proper collateral lock", async function () {
      await bnpl.connect(buyer).purchaseProduct(0, { value: COLLATERAL });

      const loan = await bnpl.getLoan(0);
      expect(loan.buyer).to.equal(buyer.address);
      expect(loan.merchant).to.equal(merchant.address);
      expect(loan.productPrice).to.equal(PRODUCT_PRICE);
      expect(loan.installmentAmount).to.equal(INSTALLMENT);
      expect(loan.installmentsPaid).to.equal(0);
      expect(loan.status).to.equal(0); // ACTIVE

      const col = await vault.getCollateral(buyer.address, 0);
      expect(col.amount).to.equal(COLLATERAL);
      expect(col.locked).to.be.true;
    });

    it("should reject purchase with insufficient collateral", async function () {
      await expect(
        bnpl.connect(buyer).purchaseProduct(0, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("BNPL: insufficient collateral");
    });

    it("should reject merchant buying own product", async function () {
      await expect(
        bnpl.connect(merchant).purchaseProduct(0, { value: COLLATERAL })
      ).to.be.revertedWith("BNPL: cannot buy own product");
    });

    it("should track buyer loans correctly", async function () {
      await bnpl.connect(buyer).purchaseProduct(0, { value: COLLATERAL });
      const loanIds = await bnpl.getBuyerLoans(buyer.address);
      expect(loanIds.length).to.equal(1);
      expect(loanIds[0]).to.equal(0);
    });
  });

  // ─── Repayment Tests ────────────────────────────────────

  describe("Installment Repayment", function () {
    beforeEach(async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      await bnpl
        .connect(merchant)
        .createProduct("Neural Headset", "AR device", "", PRODUCT_PRICE);
      await bnpl.connect(buyer).purchaseProduct(0, { value: COLLATERAL });
    });

    it("should accept an installment payment and forward to merchant", async function () {
      const merchantBalBefore = await ethers.provider.getBalance(merchant.address);
      await bnpl.connect(buyer).payInstallment(0, { value: INSTALLMENT });

      const loan = await bnpl.getLoan(0);
      expect(loan.installmentsPaid).to.equal(1);
      expect(loan.totalRepaid).to.equal(INSTALLMENT);

      const merchantBalAfter = await ethers.provider.getBalance(merchant.address);
      expect(merchantBalAfter - merchantBalBefore).to.equal(INSTALLMENT);
    });

    it("should fully repay and release collateral after 4 installments", async function () {
      const buyerBalBefore = await ethers.provider.getBalance(buyer.address);

      for (let i = 0; i < 4; i++) {
        await bnpl.connect(buyer).payInstallment(0, { value: INSTALLMENT });
      }

      const loan = await bnpl.getLoan(0);
      expect(loan.status).to.equal(1); // REPAID
      expect(loan.installmentsPaid).to.equal(4);

      const col = await vault.getCollateral(buyer.address, 0);
      expect(col.locked).to.be.false;
    });

    it("should reject payment from non-buyer", async function () {
      await expect(
        bnpl.connect(outsider).payInstallment(0, { value: INSTALLMENT })
      ).to.be.revertedWith("BNPL: not your loan");
    });

    it("should reject insufficient installment payment", async function () {
      await expect(
        bnpl.connect(buyer).payInstallment(0, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("BNPL: insufficient payment");
    });
  });

  // ─── Default / Liquidation Tests ─────────────────────────

  describe("Default & Liquidation", function () {
    beforeEach(async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      await bnpl
        .connect(merchant)
        .createProduct("Neural Headset", "AR device", "", PRODUCT_PRICE);
      await bnpl.connect(buyer).purchaseProduct(0, { value: COLLATERAL });
    });

    it("should reject default trigger before grace period", async function () {
      await expect(
        bnpl.connect(outsider).triggerDefault(0)
      ).to.be.revertedWith("BNPL: still within grace period");
    });

    it("should allow default after grace period and liquidate collateral", async function () {
      // Fast-forward past first due date + grace period
      await time.increase(ONE_WEEK + THREE_DAYS + 1);

      const merchantBalBefore = await ethers.provider.getBalance(merchant.address);
      const buyerBalBefore = await ethers.provider.getBalance(buyer.address);

      await bnpl.connect(outsider).triggerDefault(0);

      const loan = await bnpl.getLoan(0);
      expect(loan.status).to.equal(2); // DEFAULTED

      const col = await vault.getCollateral(buyer.address, 0);
      expect(col.locked).to.be.false;

      // Merchant should receive outstanding debt (4 * 0.25 = 1.0 BNB)
      const merchantBalAfter = await ethers.provider.getBalance(merchant.address);
      expect(merchantBalAfter - merchantBalBefore).to.equal(PRODUCT_PRICE);

      // Buyer should receive refund (1.5 - 1.0 = 0.5 BNB)
      const buyerBalAfter = await ethers.provider.getBalance(buyer.address);
      expect(buyerBalAfter - buyerBalBefore).to.equal(ethers.parseEther("0.5"));
    });

    it("should liquidate with partial payments correctly", async function () {
      // Pay 1 installment
      await bnpl.connect(buyer).payInstallment(0, { value: INSTALLMENT });

      // Fast-forward past next due date + grace period
      await time.increase(ONE_WEEK + THREE_DAYS + 1);

      const merchantBalBefore = await ethers.provider.getBalance(merchant.address);

      await bnpl.connect(outsider).triggerDefault(0);

      const loan = await bnpl.getLoan(0);
      expect(loan.status).to.equal(2); // DEFAULTED

      // Merchant should receive remaining 3 installments (0.75 BNB)
      const merchantBalAfter = await ethers.provider.getBalance(merchant.address);
      expect(merchantBalAfter - merchantBalBefore).to.equal(ethers.parseEther("0.75"));
    });
  });

  // ─── View Functions ──────────────────────────────────────

  describe("View Functions", function () {
    it("should return all products", async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      await bnpl.connect(merchant).createProduct("Item 1", "Desc 1", "", PRODUCT_PRICE);
      await bnpl.connect(merchant).createProduct("Item 2", "Desc 2", "", ethers.parseEther("2.0"));

      const all = await bnpl.getAllProducts();
      expect(all.length).to.equal(2);
      expect(all[0].name).to.equal("Item 1");
      expect(all[1].name).to.equal("Item 2");
    });

    it("should detect overdue loans", async function () {
      await bnpl.connect(merchant).registerMerchant("CyberShop");
      await bnpl.connect(merchant).createProduct("Item", "D", "", PRODUCT_PRICE);
      await bnpl.connect(buyer).purchaseProduct(0, { value: COLLATERAL });

      expect(await bnpl.isLoanOverdue(0)).to.be.false;

      await time.increase(ONE_WEEK + THREE_DAYS + 1);

      expect(await bnpl.isLoanOverdue(0)).to.be.true;
    });
  });
});
