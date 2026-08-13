import { v } from "convex/values";

/** Existing chat rows omit `kind`; new document citations include it. */
export const documentCitation = v.object({
  kind: v.optional(v.literal("document")),
  documentId: v.id("documents"),
  filename: v.string(),
  pageNumber: v.number(),
  quote: v.string(),
});

export const policyCitation = v.object({
  kind: v.literal("policy"),
  sourceId: v.id("policySources"),
  title: v.string(),
  url: v.string(),
  taxYear: v.string(),
  quote: v.string(),
});

export const citation = v.union(documentCitation, policyCitation);

export function clipQuote(text: string, max = 240): string {
  return text.length > max ? text.slice(0, max - 3) + "..." : text;
}
