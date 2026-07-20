import Groq from "groq-sdk";

export const NOT_FOUND_MESSAGE =
  "I couldn't find that in your uploaded documents.";

export interface Excerpt {
  index: number; // 1-based, used for [n] citations
  filename: string;
  pageNumber: number;
  text: string;
}

export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are a document assistant. Answer the user's question using ONLY the numbered excerpts provided from their own documents.

Rules:
- Base every statement strictly on the excerpts. Never use outside knowledge, never guess, and never generalize about how policies or documents "usually" work.
- After each claim, cite the excerpt(s) that support it using the marker [n], where n is the excerpt number.
- If the excerpts do not contain the information needed to answer, respond with exactly: "${NOT_FOUND_MESSAGE}" and nothing else.
- Be concise and factual. Quote key figures, amounts, and terms exactly as written in the excerpts.
- This is informational assistance only, not legal, financial, or medical advice; do not add advice beyond what the documents state.`;

export async function answerQuestion(options: {
  question: string;
  excerpts: Excerpt[];
  history: HistoryTurn[];
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set");
  const groq = new Groq({ apiKey });

  const context = options.excerpts
    .map(
      (e) =>
        `[${e.index}] (${e.filename}, page ${e.pageNumber})\n${e.text}`
    )
    .join("\n\n");

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...options.history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    {
      role: "user",
      content: `Excerpts from my documents:\n\n${context}\n\nQuestion: ${options.question}`,
    },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    max_tokens: 1024,
    messages,
  });

  return completion.choices[0]?.message?.content ?? NOT_FOUND_MESSAGE;
}
