import { v } from "convex/values";
import { action, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import {
  answerQuestion,
  NOT_FOUND_MESSAGE,
  Excerpt,
  HistoryTurn,
} from "./lib/groq";
import { clipQuote } from "./lib/citations";
import { currentUkTaxYear } from "./lib/policyAllowlist";

const DOC_TOP_K = 6;
const POLICY_TOP_K = 4;

const TAX_QUESTION_RE =
  /\b(tax|hmrc|paye|p60|p45|p11d|cis|vat|isa|sipp|self[ -]?assessment|national insurance|ni|cgt|capital gains|dividend|personal allowance|tax[ -]?free|tax[ -]?year|income tax|corporation tax|self[ -]?employed|sa100|sa302|withholding)\b/i;

export const ask = action({
  args: {
    sessionId: v.id("chatSessions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const question = args.content.trim();
    if (!question) throw new Error("Question is empty");

    const history = await ctx.runQuery(internal.chat.getContext, {
      sessionId: args.sessionId,
      userId,
    });

    await ctx.runMutation(internal.chat.insertMessage, {
      sessionId: args.sessionId,
      userId,
      role: "user",
      content: question,
    });

    const searchQuery = toSearchQuery(question);

    const docChunks = await ctx.runQuery(internal.chat.searchChunks, {
      userId,
      query: searchQuery,
      limit: DOC_TOP_K,
    });

    const policyChunks = shouldRetrievePolicy(question, history)
      ? await searchPolicy(ctx, searchQuery)
      : [];

    if (docChunks.length === 0 && policyChunks.length === 0) {
      await ctx.runMutation(internal.chat.insertMessage, {
        sessionId: args.sessionId,
        userId,
        role: "assistant",
        content: NOT_FOUND_MESSAGE,
        citations: [],
      });
      return NOT_FOUND_MESSAGE;
    }

    const excerpts: Excerpt[] = [
      ...docChunks.map((chunk, i) => ({
        index: i + 1,
        kind: "document" as const,
        filename: chunk.filename,
        pageNumber: chunk.pageNumber,
        text: chunk.text,
      })),
      ...policyChunks.map((chunk, i) => ({
        index: docChunks.length + i + 1,
        kind: "policy" as const,
        title: chunk.title,
        url: chunk.url,
        taxYear: chunk.taxYear,
        text: chunk.text,
      })),
    ];

    const answer = await answerQuestion({ question, excerpts, history });

    const citations = answer.includes(NOT_FOUND_MESSAGE)
      ? []
      : buildCitations(answer, docChunks, policyChunks);

    await ctx.runMutation(internal.chat.insertMessage, {
      sessionId: args.sessionId,
      userId,
      role: "assistant",
      content: answer,
      citations,
    });

    return answer;
  },
});

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do",
  "does", "for", "from", "has", "have", "how", "i", "if", "in", "is",
  "it", "me", "my", "of", "on", "or", "our", "so", "tell", "that", "the",
  "their", "them", "there", "they", "this", "to", "was", "we", "were",
  "what", "when", "where", "which", "who", "why", "will", "with", "you",
  "your", "about", "specifically", "please",
]);

/**
 * Strip punctuation and stopwords so full-text ranking is driven by the
 * meaningful terms in the question. Falls back to the raw question if
 * everything was filtered out.
 */
function toSearchQuery(question: string): string {
  const terms = question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s$%.-]/gu, " ")
    .split(/\s+/)
    .filter((term) => term.length > 1 && !STOPWORDS.has(term));
  return terms.length > 0 ? terms.join(" ") : question;
}

function looksLikeTaxQuestion(text: string): boolean {
  return TAX_QUESTION_RE.test(text);
}

function shouldRetrievePolicy(
  question: string,
  history: HistoryTurn[]
): boolean {
  if (looksLikeTaxQuestion(question)) return true;
  return history.some(
    (turn) => turn.role === "user" && looksLikeTaxQuestion(turn.content)
  );
}

async function searchPolicy(ctx: ActionCtx, query: string) {
  const taxYear = currentUkTaxYear();
  const currentYearHits = await ctx.runQuery(internal.policy.searchChunks, {
    query,
    limit: POLICY_TOP_K,
    taxYear,
  });
  if (currentYearHits.length > 0) return currentYearHits;

  return await ctx.runQuery(internal.policy.searchChunks, {
    query,
    limit: POLICY_TOP_K,
  });
}

function buildCitations(
  answer: string,
  docChunks: {
    documentId: Id<"documents">;
    filename: string;
    pageNumber: number;
    text: string;
  }[],
  policyChunks: {
    sourceId: Id<"policySources">;
    title: string;
    url: string;
    taxYear: string;
    text: string;
  }[]
) {
  const total = docChunks.length + policyChunks.length;
  const cited = new Set<number>();
  for (const match of answer.matchAll(/\[(\d+)\]/g)) {
    const index = parseInt(match[1], 10);
    if (index >= 1 && index <= total) cited.add(index);
  }

  return [...cited].sort((a, b) => a - b).map((index) => {
    if (index <= docChunks.length) {
      const chunk = docChunks[index - 1];
      return {
        kind: "document" as const,
        documentId: chunk.documentId,
        filename: chunk.filename,
        pageNumber: chunk.pageNumber,
        quote: clipQuote(chunk.text),
      };
    }
    const chunk = policyChunks[index - 1 - docChunks.length];
    return {
      kind: "policy" as const,
      sourceId: chunk.sourceId,
      title: chunk.title,
      url: chunk.url,
      taxYear: chunk.taxYear,
      quote: clipQuote(chunk.text),
    };
  });
}
