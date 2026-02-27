const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying TrustPay Protocol...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📋 Deployer: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} BNB\n`);

  // Deploy CollateralVault
  const VaultFactory = await hre.ethers.getContractFactory("CollateralVault");
  const vault = await VaultFactory.deploy();
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log(`✅ CollateralVault deployed to: ${vaultAddr}`);

  // Deploy BNPLLoan
  const BNPLFactory = await hre.ethers.getContractFactory("BNPLLoan");
  const bnpl = await BNPLFactory.deploy(vaultAddr);
  await bnpl.waitForDeployment();
  const bnplAddr = await bnpl.getAddress();
  console.log(`✅ BNPLLoan deployed to:        ${bnplAddr}`);

  // Link vault to loan contract
  const linkTx = await vault.setLoanContract(bnplAddr);
  await linkTx.wait();
  console.log(`🔗 Vault linked to BNPLLoan\n`);

  // Deploy NFTCollateralLoan
  const NFTLoanFactory = await hre.ethers.getContractFactory("NFTCollateralLoan");
  const nftLoan = await NFTLoanFactory.deploy();
  await nftLoan.waitForDeployment();
  const nftLoanAddr = await nftLoan.getAddress();
  console.log(`✅ NFTCollateralLoan deployed to: ${nftLoanAddr}`);

  // Deploy MockNFT for demo
  const MockNFTFactory = await hre.ethers.getContractFactory("MockNFT");
  const mockNFT = await MockNFTFactory.deploy("TrustPay Demo NFT", "TPNFT");
  await mockNFT.waitForDeployment();
  const mockNFTAddr = await mockNFT.getAddress();
  console.log(`✅ MockNFT deployed to:           ${mockNFTAddr}`);

  // ─── Post-deploy Setup ───────────────────────────────
  // Approve MockNFT collection with 0.05 BNB floor price (testnet-friendly)
  const approveTx = await nftLoan.approveCollection(mockNFTAddr, hre.ethers.parseEther("0.05"));
  await approveTx.wait();
  console.log(`🖼️  MockNFT approved as collateral (floor: 0.05 BNB)`);

  // Fund NFT loan treasury with 0.1 BNB (testnet-friendly)
  const treasuryTx = await nftLoan.depositToTreasury({ value: hre.ethers.parseEther("0.1") });
  await treasuryTx.wait();
  console.log(`💰 NFT Loan treasury funded with 0.1 BNB`);

  console.log("\n─────────────────────────────────────────────");
  console.log("📋 Deployment Summary");
  console.log("─────────────────────────────────────────────");
  console.log(`CollateralVault    : ${vaultAddr}`);
  console.log(`BNPLLoan           : ${bnplAddr}`);
  console.log(`NFTCollateralLoan  : ${nftLoanAddr}`);
  console.log(`MockNFT            : ${mockNFTAddr}`);
  console.log(`Deployer / Owner   : ${deployer.address}`);
  console.log("─────────────────────────────────────────────\n");

  // Write deployment addresses to a JSON file for frontend consumption
  const deploymentData = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contracts: {
      CollateralVault: vaultAddr,
      BNPLLoan: bnplAddr,
      NFTCollateralLoan: nftLoanAddr,
      MockNFT: mockNFTAddr,
    },
    owner: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(outputDir, "deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("💾 Deployment addresses saved to frontend/src/contracts/deployment.json");

  // Copy ABIs to frontend
  const artifactsDir = path.join(__dirname, "..", "artifacts", "src");
  const contracts = ["CollateralVault", "BNPLLoan", "NFTCollateralLoan", "MockNFT"];
  for (const name of contracts) {
    const artifact = JSON.parse(
      fs.readFileSync(path.join(artifactsDir, `${name}.sol`, `${name}.json`), "utf-8")
    );
    fs.writeFileSync(
      path.join(outputDir, `${name}.json`),
      JSON.stringify({ abi: artifact.abi }, null, 2)
    );
  }
  console.log("💾 ABIs copied to frontend/src/contracts/\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
