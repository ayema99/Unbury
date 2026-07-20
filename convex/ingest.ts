"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { extractPdfPages } from "./lib/pdf";
import { chunkPages, countEmptyPages } from "./lib/chunk";
import { encrypt } from "./lib/crypto";

const INSERT_BATCH_SIZE = 20;

export const ingestDocument = internalAction({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.runQuery(internal.ingestHelpers.getDocument, {
      documentId: args.documentId,
    });
    if (!doc) return;

    try {
      await ctx.runMutation(internal.ingestHelpers.setStatus, {
        documentId: args.documentId,
        status: "processing",
      });

      const blob = await ctx.storage.get(doc.storageId);
      if (!blob) throw new Error("Uploaded file is missing from storage");
      const raw = new Uint8Array(await blob.arrayBuffer());

      // Extract text before encrypting the original.
      const { pageCount, pages } = await extractPdfPages(raw);
      if (pageCount === 0) throw new Error("The PDF has no pages.");

      const emptyPages = countEmptyPages(pages);
      if (emptyPages / pageCount > 0.5) {
        throw new Error(
          "This PDF appears to be scanned without readable text. OCR is not supported yet — please upload a PDF with selectable text."
        );
      }

      // Encrypt the original PDF at rest and drop the plaintext upload.
      const { ciphertext, iv, tag } = encrypt(raw);
      const encryptedStorageId = await ctx.storage.store(
        new Blob([new Uint8Array(ciphertext)], { type: "application/octet-stream" })
      );
      await ctx.runMutation(internal.ingestHelpers.finalizeEncryption, {
        documentId: args.documentId,
        storageId: encryptedStorageId,
        encryptionIv: iv,
        encryptionTag: tag,
      });

      const chunks = chunkPages(pages);
      if (chunks.length === 0) {
        throw new Error("No readable text could be extracted from this PDF.");
      }

      for (let i = 0; i < chunks.length; i += INSERT_BATCH_SIZE) {
        const batch = chunks.slice(i, i + INSERT_BATCH_SIZE).map((chunk) => ({
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
        }));
        await ctx.runMutation(internal.ingestHelpers.insertChunkBatch, {
          documentId: args.documentId,
          userId: doc.userId,
          chunks: batch,
        });
      }

      await ctx.runMutation(internal.ingestHelpers.setStatus, {
        documentId: args.documentId,
        status: "ready",
        pageCount,
      });
    } catch (error) {
      await ctx.runMutation(internal.ingestHelpers.setStatus, {
        documentId: args.documentId,
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Processing failed",
      });
    }
  },
});
