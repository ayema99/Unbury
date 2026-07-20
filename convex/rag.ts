import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { embedTexts } from "./lib/embed";
import { answerQuestion, NOT_FOUND_MESSAGE, Excerpt } from "./lib/groq";

const TOP_K = 6;

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

    // Verifies session ownership; grabs recent turns for follow-ups.
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

    const [queryEmbedding] = await embedTexts([question]);
    const hits = await ctx.vectorSearch("chunkEmbeddings", "by_embedding", {
      vector: queryEmbedding,
      limit: TOP_K,
      filter: (q) => q.eq("userId", userId),
    });

    const chunks = await ctx.runQuery(internal.chat.resolveChunks, {
      embeddingIds: hits.map((h) => h._id),
      userId,
    });

    if (chunks.length === 0) {
      await ctx.runMutation(internal.chat.insertMessage, {
        sessionId: args.sessionId,
        userId,
        role: "assistant",
        content: NOT_FOUND_MESSAGE,
        citations: [],
      });
      return NOT_FOUND_MESSAGE;
    }

    const excerpts: Excerpt[] = chunks.map((chunk, i) => ({
      index: i + 1,
      filename: chunk.filename,
      pageNumber: chunk.pageNumber,
      text: chunk.text,
    }));

    const answer = await answerQuestion({ question, excerpts, history });

    // Map [n] markers in the answer back to the excerpts they reference.
    const citations = answer.includes(NOT_FOUND_MESSAGE)
      ? []
      : buildCitations(answer, chunks);

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

function buildCitations(
  answer: string,
  chunks: {
    documentId: string;
    filename: string;
    pageNumber: number;
    text: string;
  }[]
) {
  const cited = new Set<number>();
  for (const match of answer.matchAll(/\[(\d+)\]/g)) {
    const index = parseInt(match[1], 10);
    if (index >= 1 && index <= chunks.length) cited.add(index);
  }
  return [...cited].sort((a, b) => a - b).map((index) => {
    const chunk = chunks[index - 1];
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      documentId: chunk.documentId as any,
      filename: chunk.filename,
      pageNumber: chunk.pageNumber,
      quote:
        chunk.text.length > 240 ? chunk.text.slice(0, 237) + "..." : chunk.text,
    };
  });
}
