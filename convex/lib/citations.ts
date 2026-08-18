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

/** Matches [1] plus the full-width variants some models emit, e.g. 【1】. */
const CITATION_MARKER_RE = /[[\u3010\uff3b]\s*(\d+)\s*[\]\u3011\uff3d]/g;

/** Rewrite bracket variants to ASCII so marker parsing is style-independent. */
export function normalizeCitationMarkers(text: string): string {
  return text.replace(CITATION_MARKER_RE, (_match, index) => `[${index}]`);
}

/**
 * Drop inline markers from the prose shown in the chat bubble. Sources are
 * listed separately under the answer, so the raw numbers add only noise.
 */
export function stripCitationMarkers(text: string): string {
  return text
    .replace(CITATION_MARKER_RE, "")
    // Adjacent markers ("[3], [4]") otherwise leave a run of separators behind.
    .replace(/[ \t]*[,;](?=[ \t]*[,;])/g, "")
    .replace(/[ \t]+([.,;:!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+$/gm, "")
    .trim();
}
