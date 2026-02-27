import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── BNPL Loan Queries ─────────────────────────────────

export const getBorrowerLoans = query({
  args: { borrower: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("loanHistory")
      .withIndex("by_borrower", (q) => q.eq("borrower", args.borrower.toLowerCase()))
      .order("desc")
      .collect();
  },
});

export const getMerchantLoans = query({
  args: { merchant: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("loanHistory")
      .withIndex("by_merchant", (q) => q.eq("merchant", args.merchant.toLowerCase()))
      .order("desc")
      .collect();
  },
});

export const getLoansByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("loanHistory")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const getRecentLoans = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("loanHistory")
      .order("desc")
      .take(args.limit || 20);
  },
});

// ─── BNPL Loan Mutations ────────────────────────────────

export const recordLoan = mutation({
  args: {
    loanId: v.number(),
    borrower: v.string(),
    merchant: v.string(),
    productId: v.number(),
    productName: v.string(),
    productPrice: v.string(),
    chainId: v.string(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("loanHistory", {
      loanId: args.loanId,
      borrower: args.borrower.toLowerCase(),
      merchant: args.merchant.toLowerCase(),
      productId: args.productId,
      productName: args.productName,
      productPrice: args.productPrice,
      status: "ACTIVE",
      installmentsPaid: 0,
      totalRepaid: "0",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      txHash: args.txHash,
      chainId: args.chainId,
    });
  },
});

export const updateLoanStatus = mutation({
  args: {
    loanId: v.number(),
    chainId: v.string(),
    status: v.string(),
    installmentsPaid: v.optional(v.number()),
    totalRepaid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const loan = await ctx.db
      .query("loanHistory")
      .withIndex("by_loanId", (q) =>
        q.eq("loanId", args.loanId).eq("chainId", args.chainId)
      )
      .first();
    if (!loan) return;
    await ctx.db.patch(loan._id, {
      status: args.status,
      updatedAt: Date.now(),
      ...(args.installmentsPaid !== undefined && { installmentsPaid: args.installmentsPaid }),
      ...(args.totalRepaid !== undefined && { totalRepaid: args.totalRepaid }),
    });
  },
});
