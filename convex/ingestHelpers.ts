import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getDocument = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const setStatus = internalMutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    pageCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { documentId, ...fields } = args;
    await ctx.db.patch(documentId, fields);
  },
});

/**
 * Swap the document's storage blob for the encrypted version and delete the
 * original plaintext upload.
 */
export const finalizeEncryption = internalMutation({
  args: {
    documentId: v.id("documents"),
    storageId: v.id("_storage"),
    encryptionIv: v.string(),
    encryptionTag: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    const oldStorageId = doc.storageId;
    await ctx.db.patch(args.documentId, {
      storageId: args.storageId,
      encryptionIv: args.encryptionIv,
      encryptionTag: args.encryptionTag,
    });
    await ctx.storage.delete(oldStorageId);
  },
});

export const insertChunkBatch = internalMutation({
  args: {
    documentId: v.id("documents"),
    userId: v.id("users"),
    chunks: v.array(
      v.object({
        pageNumber: v.number(),
        chunkIndex: v.number(),
        text: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const chunk of args.chunks) {
      await ctx.db.insert("chunks", {
        userId: args.userId,
        documentId: args.documentId,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
      });
    }
  },
});
