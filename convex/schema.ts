import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  documents: defineTable({
    userId: v.id("users"),
    filename: v.string(),
    storageId: v.id("_storage"),
    // AES-256-GCM parameters; present once the blob has been encrypted.
    encryptionIv: v.optional(v.string()),
    encryptionTag: v.optional(v.string()),
    pageCount: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  chunks: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    pageNumber: v.number(),
    chunkIndex: v.number(),
    text: v.string(),
  })
    .index("by_document", ["documentId"])
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["userId"],
    }),

  chatSessions: defineTable({
    userId: v.id("users"),
    title: v.string(),
  }).index("by_user", ["userId"]),

  chatMessages: defineTable({
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
  }).index("by_session", ["sessionId"]),
});
