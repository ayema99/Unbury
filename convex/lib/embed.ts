import Groq from "groq-sdk";

export const EMBEDDING_DIMENSIONS = 768;

const MODEL = "nomic-embed-text-v1.5";
const BATCH_SIZE = 100;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set");
  const groq = new Groq({ apiKey });

  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await groq.embeddings.create({
      model: MODEL,
      input: batch,
      encoding_format: "float",
    });
    const sorted = [...response.data].sort((a, b) => a.index - b.index);
    results.push(...sorted.map((d) => d.embedding as number[]));
  }
  return results;
}
