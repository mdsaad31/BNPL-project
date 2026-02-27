import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── User Profiles ────────────────────────────────────
  users: defineTable({
    walletAddress: v.string(),
    displayName: v.optional(v.string()),
    isMerchant: v.boolean(),
    merchantName: v.optional(v.string()),
    createdAt: v.number(),
    lastActiveAt: v.number(),
    totalLoans: v.number(),
    totalNFTLoans: v.number(),
  }).index("by_wallet", ["walletAddress"]),

  // ─── BNPL Loan History ────────────────────────────────
  loanHistory: defineTable({
    loanId: v.number(),
    borrower: v.string(),
    merchant: v.string(),
    productId: v.number(),
    productName: v.string(),
    productPrice: v.string(), // BNB amount as string
    status: v.string(), // "ACTIVE" | "REPAID" | "DEFAULTED"
    installmentsPaid: v.number(),
    totalRepaid: v.string(),
    createdAt: v.number(), // block timestamp
    updatedAt: v.number(),
    txHash: v.optional(v.string()),
    chainId: v.string(),
  })
    .index("by_borrower", ["borrower"])
    .index("by_merchant", ["merchant"])
    .index("by_status", ["status"])
    .index("by_loanId", ["loanId", "chainId"]),

  // ─── NFT Loan History ────────────────────────────────
  nftLoanHistory: defineTable({
    loanId: v.number(),
    borrower: v.string(),
    nftContract: v.string(),
    tokenId: v.number(),
    loanAmount: v.string(), // BNB
    interestAmount: v.string(),
    totalDue: v.string(),
    totalRepaid: v.string(),
    status: v.string(), // "ACTIVE" | "REPAID" | "DEFAULTED" | "LIQUIDATED"
    dueTimestamp: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    txHash: v.optional(v.string()),
    chainId: v.string(),
  })
    .index("by_borrower", ["borrower"])
    .index("by_status", ["status"])
    .index("by_loanId", ["loanId", "chainId"]),

  // ─── NFT Collections ─────────────────────────────────
  nftCollections: defineTable({
    contractAddress: v.string(),
    name: v.string(),
    symbol: v.string(),
    floorPrice: v.string(), // BNB
    isApproved: v.boolean(),
    totalLoans: v.number(),
    addedAt: v.number(),
  }).index("by_address", ["contractAddress"]),

  // ─── Transaction Log ──────────────────────────────────
  transactions: defineTable({
    txHash: v.string(),
    walletAddress: v.string(),
    type: v.string(), // "PURCHASE" | "INSTALLMENT" | "DEFAULT" | "NFT_LOAN" | "NFT_REPAY" | "NFT_LIQUIDATE" | "MINT_NFT"
    amount: v.string(), // BNB
    loanId: v.optional(v.number()),
    description: v.string(),
    timestamp: v.number(),
    chainId: v.string(),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_type", ["type"])
    .index("by_txHash", ["txHash"]),

  // ─── Platform Stats ───────────────────────────────────
  platformStats: defineTable({
    key: v.string(), // "global"
    totalBNPLLoans: v.number(),
    totalNFTLoans: v.number(),
    totalVolumeETH: v.string(),
    totalMerchants: v.number(),
    totalUsers: v.number(),
    lastUpdated: v.number(),
  }).index("by_key", ["key"]),
});
