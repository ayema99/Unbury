export interface TextChunk {
  pageNumber: number;
  chunkIndex: number;
  text: string;
}

const CHUNK_SIZE = 1600; // ~400 tokens
const CHUNK_OVERLAP = 240;
const MIN_PAGE_TEXT = 20;

/**
 * Split per-page text into overlapping chunks, preserving the page number
 * each chunk came from. Splits on sentence/whitespace boundaries when
 * possible.
 */
export function chunkPages(pages: string[]): TextChunk[] {
  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  pages.forEach((pageText, i) => {
    const text = normalizeWhitespace(pageText);
    if (text.length < MIN_PAGE_TEXT) return;

    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + CHUNK_SIZE, text.length);
      if (end < text.length) {
        // Prefer to break at a sentence end, otherwise at a word boundary.
        const slice = text.slice(start, end);
        const sentenceBreak = Math.max(
          slice.lastIndexOf(". "),
          slice.lastIndexOf(".\n"),
          slice.lastIndexOf("? "),
          slice.lastIndexOf("! ")
        );
        if (sentenceBreak > CHUNK_SIZE * 0.5) {
          end = start + sentenceBreak + 1;
        } else {
          const wordBreak = slice.lastIndexOf(" ");
          if (wordBreak > CHUNK_SIZE * 0.5) end = start + wordBreak;
        }
      }

      const chunkText = text.slice(start, end).trim();
      if (chunkText.length >= MIN_PAGE_TEXT) {
        chunks.push({ pageNumber: i + 1, chunkIndex: chunkIndex++, text: chunkText });
      }
      if (end >= text.length) break;
      start = Math.max(end - CHUNK_OVERLAP, start + 1);
    }
  });

  return chunks;
}

export function countEmptyPages(pages: string[]): number {
  return pages.filter((p) => normalizeWhitespace(p).length < MIN_PAGE_TEXT).length;
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
