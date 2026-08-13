import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import {
  policySourceKind,
  policyStatus,
  policyTaxYear,
  policyTopic,
} from "./lib/policyMeta";

const TAX_YEAR_RE = /^\d{4}-\d{2}$/;

function assertTaxYear(taxYear: string) {
  if (!TAX_YEAR_RE.test(taxYear)) {
    throw new Error(`taxYear must look like "2025-26", got "${taxYear}"`);
  }
}

/**
 * Insert or update a policy page by canonical URL. Chunks are left untouched
 * until deleteChunks + insertChunkBatch run after a successful fetch.
 */
export const upsertSource = internalMutation({
  args: {
    url: v.string(),
    title: v.string(),
    source: policySourceKind,
    taxYear: policyTaxYear,
    topic: policyTopic,
    publishedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    status: v.optional(policyStatus),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertTaxYear(args.taxYear);
    const existing = await ctx.db
      .query("policySources")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();

    const fields = {
      title: args.title,
      source: args.source,
      taxYear: args.taxYear,
      topic: args.topic,
      publishedAt: args.publishedAt,
      updatedAt: args.updatedAt,
      ...(args.errorMessage !== undefined
        ? { errorMessage: args.errorMessage }
        : {}),
    };

    if (existing) {
      const yearOrTopicChanged =
        existing.taxYear !== args.taxYear || existing.topic !== args.topic;
      await ctx.db.patch(existing._id, {
        ...fields,
        // Stale denormalized chunk filters until replaceChunks runs.
        status: yearOrTopicChanged
          ? "pending"
          : (args.status ?? existing.status),
      });
      return existing._id;
    }
    return await ctx.db.insert("policySources", {
      url: args.url,
      ...fields,
      status: args.status ?? "pending",
    });
  },
});

export const getSource = internalQuery({
  args: { sourceId: v.id("policySources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sourceId);
  },
});

export const getSourceByUrl = internalQuery({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("policySources")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();
  },
});

export const listSources = internalQuery({
  args: {
    taxYear: v.optional(policyTaxYear),
    topic: v.optional(policyTopic),
  },
  handler: async (ctx, args) => {
    if (args.topic && args.taxYear) {
      return await ctx.db
        .query("policySources")
        .withIndex("by_topic_and_year", (q) =>
          q.eq("topic", args.topic!).eq("taxYear", args.taxYear!)
        )
        .collect();
    }
    if (args.topic) {
      return await ctx.db
        .query("policySources")
        .withIndex("by_topic", (q) => q.eq("topic", args.topic!))
        .collect();
    }
    if (args.taxYear) {
      return await ctx.db
        .query("policySources")
        .withIndex("by_tax_year", (q) => q.eq("taxYear", args.taxYear!))
        .collect();
    }
    return await ctx.db.query("policySources").collect();
  },
});

export const setStatus = internalMutation({
  args: {
    sourceId: v.id("policySources"),
    status: policyStatus,
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Policy source not found");
    await ctx.db.patch(args.sourceId, {
      status: args.status,
      errorMessage: args.errorMessage,
    });
  },
});

export const insertChunkBatch = internalMutation({
  args: {
    sourceId: v.id("policySources"),
    chunks: v.array(
      v.object({
        chunkIndex: v.number(),
        text: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Policy source not found");
    for (const chunk of args.chunks) {
      await ctx.db.insert("policyChunks", {
        sourceId: args.sourceId,
        taxYear: source.taxYear,
        topic: source.topic,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
      });
    }
  },
});

/** Remove indexed excerpts for a source so they can be replaced. */
export const deleteChunks = internalMutation({
  args: { sourceId: v.id("policySources") },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("policyChunks")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .collect();
    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }
  },
});

export const markRefreshed = internalMutation({
  args: {
    sourceId: v.id("policySources"),
    title: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Policy source not found");
    await ctx.db.patch(args.sourceId, {
      title: args.title ?? source.title,
      updatedAt: args.updatedAt ?? source.updatedAt,
      lastRefreshedAt: Date.now(),
      status: "ready",
      errorMessage: undefined,
    });
  },
});

export const removeSource = internalMutation({
  args: { sourceId: v.id("policySources") },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) return;
    const chunks = await ctx.db
      .query("policyChunks")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .collect();
    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }
    await ctx.db.delete(args.sourceId);
  },
});

/**
 * Full-text search over policy chunks, optionally scoped to a tax year and
 * topic. Joins source metadata for citations.
 */
export const searchChunks = internalQuery({
  args: {
    query: v.string(),
    limit: v.number(),
    taxYear: v.optional(policyTaxYear),
    topic: v.optional(policyTopic),
  },
  handler: async (ctx, args) => {
    const hits = await ctx.db
      .query("policyChunks")
      .withSearchIndex("search_text", (q) => {
        const searched = q.search("text", args.query);
        if (args.taxYear && args.topic) {
          return searched.eq("taxYear", args.taxYear).eq("topic", args.topic);
        }
        if (args.taxYear) return searched.eq("taxYear", args.taxYear);
        if (args.topic) return searched.eq("topic", args.topic);
        return searched;
      })
      .take(args.limit);

    const results: {
      chunkId: Id<"policyChunks">;
      sourceId: Id<"policySources">;
      title: string;
      url: string;
      source: Doc<"policySources">["source"];
      taxYear: string;
      topic: string;
      updatedAt?: number;
      lastRefreshedAt?: number;
      chunkIndex: number;
      text: string;
    }[] = [];

    for (const chunk of hits) {
      const source = await ctx.db.get(chunk.sourceId);
      if (!source || source.status !== "ready") continue;
      results.push({
        chunkId: chunk._id,
        sourceId: chunk.sourceId,
        title: source.title,
        url: source.url,
        source: source.source,
        taxYear: chunk.taxYear,
        topic: chunk.topic,
        updatedAt: source.updatedAt,
        lastRefreshedAt: source.lastRefreshedAt,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
      });
    }
    return results;
  },
});
