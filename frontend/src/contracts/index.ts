// Contract addresses — updated by deploy script
// These are default Hardhat addresses for local development
import deploymentData from './deployment.json';
import CollateralVaultArtifact from './CollateralVault.json';
import BNPLLoanArtifact from './BNPLLoan.json';
import NFTCollateralLoanArtifact from './NFTCollateralLoan.json';
import MockNFTArtifact from './MockNFT.json';

export const DEPLOYMENT = deploymentData;

export const CONTRACTS = {
  CollateralVault: {
    address: deploymentData.contracts.CollateralVault,
    abi: CollateralVaultArtifact.abi,
  },
  BNPLLoan: {
    address: deploymentData.contracts.BNPLLoan,
    abi: BNPLLoanArtifact.abi,
  },
  NFTCollateralLoan: {
    address: deploymentData.contracts.NFTCollateralLoan,
    abi: NFTCollateralLoanArtifact.abi,
  },
  MockNFT: {
    address: deploymentData.contracts.MockNFT,
    abi: MockNFTArtifact.abi,
  },
} as const;

export const COLLATERAL_RATIO = 150; // 150%
export const NUM_INSTALLMENTS = 4;
export const INSTALLMENT_INTERVAL_DAYS = 7;
export const GRACE_PERIOD_DAYS = 3;

// NFT Loan constants
export const NFT_INTEREST_RATE_BPS = 500; // 5%
export const NFT_LOAN_DURATION_DAYS = 30;
export const NFT_GRACE_PERIOD_DAYS = 7;
export const NFT_LTV_RATIO = 50; // 50%
