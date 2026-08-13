import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { chunkText } from "./lib/chunk";
import {
  contentTimestamps,
  extractGovukText,
  fetchGovukContent,
  isWithdrawn,
} from "./lib/govuk";
import { policyAllowlist } from "./lib/policyAllowlist";

const INSERT_BATCH_SIZE = 20;
const FETCH_GAP_MS = 250;
const MIN_TEXT_LENGTH = 80;

export const ingestAllowlist = internalAction({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const force = args.force ?? false;
    const entries = policyAllowlist();
    const summary = {
      ingested: 0,
      skipped: 0,
      failed: [] as { url: string; error: string }[],
    };

    for (const [index, entry] of entries.entries()) {
      if (index > 0) {
        await new Promise((resolve) => setTimeout(resolve, FETCH_GAP_MS));
      }

      const url = `https://www.gov.uk${entry.path}`;
      try {
        const item = await fetchGovukContent(entry.path);
        if (item.document_type === "redirect") {
          throw new Error("Page is a redirect");
        }
        if (isWithdrawn(item)) {
          throw new Error("Page has been withdrawn");
        }

        const text = extractGovukText(item);
        if (text.length < MIN_TEXT_LENGTH) {
          throw new Error("Not enough readable text on the page");
        }

        const { publishedAt, updatedAt } = contentTimestamps(item);
        const existing = await ctx.runQuery(internal.policy.getSourceByUrl, {
          url,
        });

        if (
          !force &&
          existing?.status === "ready" &&
          updatedAt !== undefined &&
          existing.updatedAt === updatedAt
        ) {
          await ctx.runMutation(internal.policy.markRefreshed, {
            sourceId: existing._id,
            title: item.title,
            updatedAt,
          });
          summary.skipped += 1;
          continue;
        }

        const sourceId = await ctx.runMutation(internal.policy.upsertSource, {
          url,
          title: item.title,
          source: "gov.uk",
          taxYear: entry.taxYear,
          topic: entry.topic,
          publishedAt,
          updatedAt,
          status: "processing",
        });

        const chunks = chunkText(text);
        if (chunks.length === 0) {
          throw new Error("Chunking produced no excerpts");
        }

        await ctx.runMutation(internal.policy.deleteChunks, { sourceId });
        for (let i = 0; i < chunks.length; i += INSERT_BATCH_SIZE) {
          await ctx.runMutation(internal.policy.insertChunkBatch, {
            sourceId,
            chunks: chunks.slice(i, i + INSERT_BATCH_SIZE),
          });
        }

        await ctx.runMutation(internal.policy.markRefreshed, {
          sourceId,
          title: item.title,
          updatedAt,
        });
        summary.ingested += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ingest failed";
        summary.failed.push({ url, error: message });
        const existing = await ctx.runQuery(internal.policy.getSourceByUrl, {
          url,
        });
        if (existing) {
          await ctx.runMutation(internal.policy.setStatus, {
            sourceId: existing._id,
            status: "failed",
            errorMessage: message,
          });
        } else {
          await ctx.runMutation(internal.policy.upsertSource, {
            url,
            title: entry.path,
            source: "gov.uk",
            taxYear: entry.taxYear,
            topic: entry.topic,
            status: "failed",
            errorMessage: message,
          });
        }
      }
    }

    return summary;
  },
});
