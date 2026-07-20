"use node";

import { extractText, getDocumentProxy } from "unpdf";

export async function extractPdfPages(
  data: Uint8Array
): Promise<{ pageCount: number; pages: string[] }> {
  const pdf = await getDocumentProxy(data);
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  return { pageCount: totalPages, pages: text };
}
