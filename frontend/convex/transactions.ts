import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Transaction Queries ────────────────────────────────

export const getWalletTransactions = query({
  args: { walletAddress: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("transactions")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .order("desc")
      .take(args.limit || 50);
  },
});

export const getTransactionsByType = query({
  args: { type: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("transactions")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .take(args.limit || 50);
  },
});

export const getRecentTransactions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("transactions")
      .order("desc")
      .take(args.limit || 20);
  },
});

// ─── Transaction Mutations ──────────────────────────────

export const recordTransaction = mutation({
  args: {
    txHash: v.string(),
    walletAddress: v.string(),
    type: v.string(),
    amount: v.string(),
    loanId: v.optional(v.number()),
    description: v.string(),
    chainId: v.string(),
  },
  handler: async (ctx, args) => {
    // Deduplicate by txHash
    const existing = await ctx.db
      .query("transactions")
      .withIndex("by_txHash", (q) => q.eq("txHash", args.txHash))
      .first();
    if (existing) return existing._id;

    return ctx.db.insert("transactions", {
      txHash: args.txHash,
      walletAddress: args.walletAddress.toLowerCase(),
      type: args.type,
      amount: args.amount,
      loanId: args.loanId,
      description: args.description,
      timestamp: Date.now(),
      chainId: args.chainId,
    });
  },
});

// ─── Platform Stats ─────────────────────────────────────

export const getPlatformStats = query({
  handler: async (ctx) => {
    return ctx.db
      .query("platformStats")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
  },
});

export const updatePlatformStats = mutation({
  args: {
    totalBNPLLoans: v.optional(v.number()),
    totalNFTLoans: v.optional(v.number()),
    totalVolumeETH: v.optional(v.string()),
    totalMerchants: v.optional(v.number()),
    totalUsers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("platformStats")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    if (stats) {
      await ctx.db.patch(stats._id, {
        ...(args.totalBNPLLoans !== undefined && { totalBNPLLoans: args.totalBNPLLoans }),
        ...(args.totalNFTLoans !== undefined && { totalNFTLoans: args.totalNFTLoans }),
        ...(args.totalVolumeETH !== undefined && { totalVolumeETH: args.totalVolumeETH }),
        ...(args.totalMerchants !== undefined && { totalMerchants: args.totalMerchants }),
        ...(args.totalUsers !== undefined && { totalUsers: args.totalUsers }),
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("platformStats", {
        key: "global",
        totalBNPLLoans: args.totalBNPLLoans || 0,
        totalNFTLoans: args.totalNFTLoans || 0,
        totalVolumeETH: args.totalVolumeETH || "0",
        totalMerchants: args.totalMerchants || 0,
        totalUsers: args.totalUsers || 0,
        lastUpdated: Date.now(),
      });
    }
  },
});
