import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── NFT Loan Queries ──────────────────────────────────

export const getBorrowerNFTLoans = query({
  args: { borrower: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("nftLoanHistory")
      .withIndex("by_borrower", (q) => q.eq("borrower", args.borrower.toLowerCase()))
      .order("desc")
      .collect();
  },
});

export const getNFTLoansByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("nftLoanHistory")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const getRecentNFTLoans = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("nftLoanHistory")
      .order("desc")
      .take(args.limit || 20);
  },
});

// ─── NFT Loan Mutations ────────────────────────────────

export const recordNFTLoan = mutation({
  args: {
    loanId: v.number(),
    borrower: v.string(),
    nftContract: v.string(),
    tokenId: v.number(),
    loanAmount: v.string(),
    interestAmount: v.string(),
    totalDue: v.string(),
    dueTimestamp: v.number(),
    chainId: v.string(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("nftLoanHistory", {
      loanId: args.loanId,
      borrower: args.borrower.toLowerCase(),
      nftContract: args.nftContract.toLowerCase(),
      tokenId: args.tokenId,
      loanAmount: args.loanAmount,
      interestAmount: args.interestAmount,
      totalDue: args.totalDue,
      totalRepaid: "0",
      status: "ACTIVE",
      dueTimestamp: args.dueTimestamp,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      txHash: args.txHash,
      chainId: args.chainId,
    });
  },
});

export const updateNFTLoanStatus = mutation({
  args: {
    loanId: v.number(),
    chainId: v.string(),
    status: v.string(),
    totalRepaid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const loan = await ctx.db
      .query("nftLoanHistory")
      .withIndex("by_loanId", (q) =>
        q.eq("loanId", args.loanId).eq("chainId", args.chainId)
      )
      .first();
    if (!loan) return;
    await ctx.db.patch(loan._id, {
      status: args.status,
      updatedAt: Date.now(),
      ...(args.totalRepaid !== undefined && { totalRepaid: args.totalRepaid }),
    });
  },
});
