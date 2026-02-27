import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── User Queries & Mutations ───────────────────────────

export const getUser = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .first();
  },
});

export const upsertUser = mutation({
  args: {
    walletAddress: v.string(),
    displayName: v.optional(v.string()),
    isMerchant: v.optional(v.boolean()),
    merchantName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const addr = args.walletAddress.toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", addr))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastActiveAt: Date.now(),
        ...(args.displayName !== undefined && { displayName: args.displayName }),
        ...(args.isMerchant !== undefined && { isMerchant: args.isMerchant }),
        ...(args.merchantName !== undefined && { merchantName: args.merchantName }),
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      walletAddress: addr,
      displayName: args.displayName || "",
      isMerchant: args.isMerchant || false,
      merchantName: args.merchantName || "",
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      totalLoans: 0,
      totalNFTLoans: 0,
    });
  },
});

export const incrementUserLoans = mutation({
  args: { walletAddress: v.string(), loanType: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .first();
    if (!user) return;
    if (args.loanType === "BNPL") {
      await ctx.db.patch(user._id, { totalLoans: user.totalLoans + 1 });
    } else {
      await ctx.db.patch(user._id, { totalNFTLoans: user.totalNFTLoans + 1 });
    }
  },
});
