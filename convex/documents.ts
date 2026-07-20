import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const metadata = await ctx.db.system.get(args.storageId);
    if (!metadata) throw new Error("Uploaded file not found");
    if (metadata.size > MAX_FILE_BYTES) {
      await ctx.storage.delete(args.storageId);
      throw new Error("File exceeds the 25 MB limit");
    }
    if (metadata.contentType !== "application/pdf") {
      await ctx.storage.delete(args.storageId);
      throw new Error("Only PDF files are supported");
    }

    const documentId = await ctx.db.insert("documents", {
      userId,
      filename: args.filename,
      storageId: args.storageId,
      status: "pending",
    });

    await ctx.scheduler.runAfter(0, internal.ingest.ingestDocument, {
      documentId,
    });

    return documentId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) throw new Error("Document not found");

    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(args.documentId);
  },
});
