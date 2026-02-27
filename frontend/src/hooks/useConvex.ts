import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useWeb3 } from "../context/Web3Context";
import { useCallback } from "react";

/**
 * Hook providing Convex database operations for the NexaPay platform.
 * Connects on-chain events to off-chain persistent storage.
 */
export function useConvex() {
  const { address, chainId } = useWeb3();
  const chain = String(chainId || "31337");

  // ─── Queries ──────────────────────────────────────────
  const user = useQuery(
    api.users.getUser,
    address ? { walletAddress: address } : "skip"
  );

  const bnplLoans = useQuery(
    api.loans.getBorrowerLoans,
    address ? { borrower: address } : "skip"
  );

  const nftLoans = useQuery(
    api.nftLoans.getBorrowerNFTLoans,
    address ? { borrower: address } : "skip"
  );

  const transactions = useQuery(
    api.transactions.getWalletTransactions,
    address ? { walletAddress: address, limit: 50 } : "skip"
  );

  const platformStats = useQuery(api.transactions.getPlatformStats);

  // ─── Mutations ────────────────────────────────────────
  const upsertUserMut = useMutation(api.users.upsertUser);
  const incrementLoansMut = useMutation(api.users.incrementUserLoans);
  const recordLoanMut = useMutation(api.loans.recordLoan);
  const updateLoanStatusMut = useMutation(api.loans.updateLoanStatus);
  const recordNFTLoanMut = useMutation(api.nftLoans.recordNFTLoan);
  const updateNFTLoanStatusMut = useMutation(api.nftLoans.updateNFTLoanStatus);
  const recordTxMut = useMutation(api.transactions.recordTransaction);

  // ─── Wrapped Actions ──────────────────────────────────

  const syncUser = useCallback(async (opts?: { isMerchant?: boolean; merchantName?: string }) => {
    if (!address) return;
    await upsertUserMut({
      walletAddress: address,
      isMerchant: opts?.isMerchant,
      merchantName: opts?.merchantName,
    });
  }, [address, upsertUserMut]);

  const logBNPLPurchase = useCallback(async (args: {
    loanId: number;
    merchant: string;
    productId: number;
    productName: string;
    productPrice: string;
    txHash: string;
  }) => {
    if (!address) return;
    await recordLoanMut({
      loanId: args.loanId,
      borrower: address,
      merchant: args.merchant,
      productId: args.productId,
      productName: args.productName,
      productPrice: args.productPrice,
      chainId: chain,
      txHash: args.txHash,
    });
    await incrementLoansMut({ walletAddress: address, loanType: "BNPL" });
    await recordTxMut({
      txHash: args.txHash,
      walletAddress: address,
      type: "PURCHASE",
      amount: args.productPrice,
      loanId: args.loanId,
      description: `BNPL Purchase: ${args.productName}`,
      chainId: chain,
    });
  }, [address, chain, recordLoanMut, incrementLoansMut, recordTxMut]);

  const logInstallmentPayment = useCallback(async (args: {
    loanId: number;
    installmentsPaid: number;
    totalRepaid: string;
    amount: string;
    txHash: string;
    isFullyRepaid: boolean;
  }) => {
    if (!address) return;
    await updateLoanStatusMut({
      loanId: args.loanId,
      chainId: chain,
      status: args.isFullyRepaid ? "REPAID" : "ACTIVE",
      installmentsPaid: args.installmentsPaid,
      totalRepaid: args.totalRepaid,
    });
    await recordTxMut({
      txHash: args.txHash,
      walletAddress: address,
      type: "INSTALLMENT",
      amount: args.amount,
      loanId: args.loanId,
      description: `Installment #${args.installmentsPaid} payment`,
      chainId: chain,
    });
  }, [address, chain, updateLoanStatusMut, recordTxMut]);

  const logDefault = useCallback(async (args: {
    loanId: number;
    txHash: string;
  }) => {
    if (!address) return;
    await updateLoanStatusMut({
      loanId: args.loanId,
      chainId: chain,
      status: "DEFAULTED",
    });
    await recordTxMut({
      txHash: args.txHash,
      walletAddress: address,
      type: "DEFAULT",
      amount: "0",
      loanId: args.loanId,
      description: `Loan #${args.loanId} defaulted`,
      chainId: chain,
    });
  }, [address, chain, updateLoanStatusMut, recordTxMut]);

  const logNFTLoan = useCallback(async (args: {
    loanId: number;
    nftContract: string;
    tokenId: number;
    loanAmount: string;
    interestAmount: string;
    totalDue: string;
    dueTimestamp: number;
    txHash: string;
  }) => {
    if (!address) return;
    await recordNFTLoanMut({
      loanId: args.loanId,
      borrower: address,
      nftContract: args.nftContract,
      tokenId: args.tokenId,
      loanAmount: args.loanAmount,
      interestAmount: args.interestAmount,
      totalDue: args.totalDue,
      dueTimestamp: args.dueTimestamp,
      chainId: chain,
      txHash: args.txHash,
    });
    await incrementLoansMut({ walletAddress: address, loanType: "NFT" });
    await recordTxMut({
      txHash: args.txHash,
      walletAddress: address,
      type: "NFT_LOAN",
      amount: args.loanAmount,
      loanId: args.loanId,
      description: `NFT Loan: Token #${args.tokenId}`,
      chainId: chain,
    });
  }, [address, chain, recordNFTLoanMut, incrementLoansMut, recordTxMut]);

  const logNFTRepay = useCallback(async (args: {
    loanId: number;
    totalRepaid: string;
    amount: string;
    txHash: string;
    isFullyRepaid: boolean;
  }) => {
    if (!address) return;
    await updateNFTLoanStatusMut({
      loanId: args.loanId,
      chainId: chain,
      status: args.isFullyRepaid ? "REPAID" : "ACTIVE",
      totalRepaid: args.totalRepaid,
    });
    await recordTxMut({
      txHash: args.txHash,
      walletAddress: address,
      type: "NFT_REPAY",
      amount: args.amount,
      loanId: args.loanId,
      description: `NFT Loan #${args.loanId} repayment`,
      chainId: chain,
    });
  }, [address, chain, updateNFTLoanStatusMut, recordTxMut]);

  const logNFTLiquidation = useCallback(async (args: {
    loanId: number;
    txHash: string;
  }) => {
    if (!address) return;
    await updateNFTLoanStatusMut({
      loanId: args.loanId,
      chainId: chain,
      status: "LIQUIDATED",
    });
    await recordTxMut({
      txHash: args.txHash,
      walletAddress: address,
      type: "NFT_LIQUIDATE",
      amount: "0",
      loanId: args.loanId,
      description: `NFT Loan #${args.loanId} liquidated`,
      chainId: chain,
    });
  }, [address, chain, updateNFTLoanStatusMut, recordTxMut]);

  return {
    // Queries
    user,
    bnplLoans,
    nftLoans,
    transactions,
    platformStats,
    // Actions
    syncUser,
    logBNPLPurchase,
    logInstallmentPayment,
    logDefault,
    logNFTLoan,
    logNFTRepay,
    logNFTLiquidation,
  };
}
