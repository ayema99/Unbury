import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return { name: user.name, email: user.email };
  },
});

/**
 * Permanently delete the signed-in user: their encrypted files and indexed
 * chunks, chat history, every linked auth account, and the user document.
 * There is no soft-delete or recovery window.
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of documents) {
      const chunks = await ctx.db
        .query("chunks")
        .withIndex("by_document", (q) => q.eq("documentId", doc._id))
        .collect();
      for (const chunk of chunks) {
        await ctx.db.delete(chunk._id);
      }
      await ctx.storage.delete(doc.storageId);
      await ctx.db.delete(doc._id);
    }

    const chatSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const session of chatSessions) {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      await ctx.db.delete(session._id);
    }

    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();
    for (const account of accounts) {
      const codes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .collect();
      for (const code of codes) {
        await ctx.db.delete(code._id);
      }
      await ctx.db.delete(account._id);
    }

    const authSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    for (const session of authSessions) {
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const token of refreshTokens) {
        await ctx.db.delete(token._id);
      }
      await ctx.db.delete(session._id);
    }

    await ctx.db.delete(userId);
  },
});
