import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const createSession = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    return await ctx.db.insert("chatSessions", {
      userId,
      title: "New chat",
    });
  },
});

export const removeSession = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    await ctx.db.delete(args.sessionId);
  },
});

export const listMessages = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return [];
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

/**
 * Verify session ownership and return recent conversation turns for the
 * RAG action. Throws if the session doesn't belong to the user.
 */
export const getContext = internalQuery({
  args: { sessionId: v.id("chatSessions"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== args.userId) {
      throw new Error("Session not found");
    }
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(8);
    return messages.reverse().map((m) => ({
      role: m.role,
      content: m.content,
    }));
  },
});

export const insertMessage = internalMutation({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    citations: v.optional(
      v.array(
        v.object({
          documentId: v.id("documents"),
          filename: v.string(),
          pageNumber: v.number(),
          quote: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Title new sessions with the first user question.
    if (args.role === "user") {
      const session = await ctx.db.get(args.sessionId);
      if (session && session.title === "New chat") {
        await ctx.db.patch(args.sessionId, {
          title:
            args.content.length > 60
              ? args.content.slice(0, 57) + "..."
              : args.content,
        });
      }
    }
    return await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      citations: args.citations,
    });
  },
});

/**
 * Full-text search over the user's chunks, joined with document metadata.
 * The search index is filtered by userId so results never cross accounts.
 */
export const searchChunks = internalQuery({
  args: {
    userId: v.id("users"),
    query: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const hits = await ctx.db
      .query("chunks")
      .withSearchIndex("search_text", (q) =>
        q.search("text", args.query).eq("userId", args.userId)
      )
      .take(args.limit);

    const results: {
      chunkId: Id<"chunks">;
      documentId: Id<"documents">;
      filename: string;
      pageNumber: number;
      text: string;
    }[] = [];
    for (const chunk of hits) {
      const doc = await ctx.db.get(chunk.documentId);
      if (!doc) continue;
      results.push({
        chunkId: chunk._id,
        documentId: chunk.documentId,
        filename: doc.filename,
        pageNumber: chunk.pageNumber,
        text: chunk.text,
      });
    }
    return results;
  },
});
