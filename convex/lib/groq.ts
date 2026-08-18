import Groq from "groq-sdk";
import { normalizeCitationMarkers } from "./citations";

export const NOT_FOUND_MESSAGE =
  "I couldn't find that in your uploaded documents or in current UK tax guidance.";

/**
 * Overridable via the GROQ_MODEL environment variable so a provider
 * deprecation can be handled without a redeploy.
 */
const DEFAULT_MODEL = "openai/gpt-oss-120b";

export type DocumentExcerpt = {
  index: number;
  kind: "document";
  filename: string;
  pageNumber: number;
  text: string;
};

export type PolicyExcerpt = {
  index: number;
  kind: "policy";
  title: string;
  url: string;
  taxYear: string;
  text: string;
};

export type Excerpt = DocumentExcerpt | PolicyExcerpt;

export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are a document and UK tax assistant. Answer the user's question using ONLY the numbered excerpts.

Excerpts labelled "Your document" come from the user's uploaded files.
Excerpts labelled "UK tax guidance" come from official GOV.UK / HMRC pages for a stated tax year.

Rules:
- Base every statement strictly on the excerpts. Never use outside knowledge, never guess rates or thresholds, and never generalize about how tax or policies "usually" work.
- Distinguish sources in the answer: "your document" vs "HMRC/GOV.UK guidance for [tax year]".
- After each claim, cite the excerpt(s) that support it using the marker [n], where n is the excerpt number. Use plain ASCII square brackets exactly like [1]. Never use 【1】, (1), or any other bracket style.
- Write plain text only. Never use Markdown: no ** for bold, no * for italics, no backticks, no headings, no tables. To draw attention to a figure, quote the figure itself rather than styling it.
- Quote key figures, amounts, dates, and terms exactly as written in the excerpts.
- If the user's document and the guidance appear to differ, state both and cite both. Do not pick a winner. If they cover different tax years, say which year each one applies to.
- When the excerpts answer only part of the question, answer the part you can, then say plainly what is missing and name the specific documents that would usually contain it — for example a payslip, P45, P11D, SA302 or self-assessment return, pension statement, or savings interest certificate — and invite the user to upload them. Naming the document that holds a figure is information, not advice.
- If the excerpts contain nothing relevant at all, begin with exactly: "${NOT_FOUND_MESSAGE}" and then, in one or two sentences, name the documents that would let you answer.
- Be concise and factual: at most three short paragraphs.
- This is informational assistance only, not tax, legal, financial, or medical advice. Do not tell the user what they should file, claim, or pay.`;

export async function answerQuestion(options: {
  question: string;
  excerpts: Excerpt[];
  history: HistoryTurn[];
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set");
  const groq = new Groq({ apiKey });

  const context = options.excerpts.map(formatExcerpt).join("\n\n");

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...options.history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    {
      role: "user",
      content: `Excerpts:\n\n${context}\n\nQuestion: ${options.question}`,
    },
  ];

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? DEFAULT_MODEL,
    temperature: 0,
    max_tokens: 1280,
    messages,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) return NOT_FOUND_MESSAGE;
  return normalizeCitationMarkers(stripMarkdown(content));
}

/**
 * The chat bubble renders answers as literal text, so any Markdown the model
 * emits despite the system prompt would show up as stray punctuation.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1$2")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "");
}

function formatExcerpt(excerpt: Excerpt): string {
  if (excerpt.kind === "policy") {
    return `[${excerpt.index}] UK tax guidance (${excerpt.taxYear}): ${excerpt.title}\n${excerpt.url}\n${excerpt.text}`;
  }
  return `[${excerpt.index}] Your document: ${excerpt.filename}, page ${excerpt.pageNumber}\n${excerpt.text}`;
}
