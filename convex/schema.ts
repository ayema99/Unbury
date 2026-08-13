import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  policySourceKind,
  policyStatus,
  policyTaxYear,
  policyTopic,
} from "./lib/policyMeta";
import { citation } from "./lib/citations";

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
    citations: v.optional(v.array(citation)),
  }).index("by_session", ["sessionId"]),

  /**
   * One official UK tax guidance page (GOV.UK, legislation, HMRC manual).
   * Global — not scoped to a user. Replaced in place when the page is refreshed.
   */
  policySources: defineTable({
    url: v.string(),
    title: v.string(),
    source: policySourceKind,
    taxYear: policyTaxYear,
    topic: policyTopic,
    publishedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    lastRefreshedAt: v.optional(v.number()),
    status: policyStatus,
    errorMessage: v.optional(v.string()),
  })
    .index("by_url", ["url"])
    .index("by_tax_year", ["taxYear"])
    .index("by_topic", ["topic"])
    .index("by_topic_and_year", ["topic", "taxYear"]),

  /**
   * Searchable excerpts of a policy source. taxYear and topic are denormalized
   * so retrieval can filter without joining.
   */
  policyChunks: defineTable({
    sourceId: v.id("policySources"),
    taxYear: policyTaxYear,
    topic: policyTopic,
    chunkIndex: v.number(),
    text: v.string(),
  })
    .index("by_source", ["sourceId"])
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["taxYear", "topic"],
    }),
});
