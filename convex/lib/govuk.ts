const CONTENT_API = "https://www.gov.uk/api/content";
const USER_AGENT = "Unbury/0.1 (UK tax policy ingest)";

export interface GovukContentItem {
  title: string;
  base_path: string;
  schema_name: string;
  document_type: string;
  description?: string | null;
  first_published_at?: string | null;
  public_updated_at?: string | null;
  updated_at?: string | null;
  details?: Record<string, unknown>;
  withdrawn_notice?: Record<string, unknown>;
}

export async function fetchGovukContent(path: string): Promise<GovukContentItem> {
  const url = CONTENT_API + (path.startsWith("/") ? path : `/${path}`);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(`GOV.UK ${response.status} for ${path}`);
  }
  return (await response.json()) as GovukContentItem;
}

export function isWithdrawn(item: GovukContentItem): boolean {
  const notice = item.withdrawn_notice;
  return !!notice && Object.keys(notice).length > 0;
}

export function contentTimestamps(item: GovukContentItem): {
  publishedAt?: number;
  updatedAt?: number;
} {
  const publishedAt = parseTimestamp(item.first_published_at);
  const updatedAt =
    parseTimestamp(item.public_updated_at) ?? parseTimestamp(item.updated_at);
  return { publishedAt, updatedAt };
}

export function extractGovukText(item: GovukContentItem): string {
  const sections: string[] = [];
  if (item.title) sections.push(item.title);
  if (item.description) sections.push(item.description);

  const details = item.details ?? {};
  if (typeof details.body === "string") {
    sections.push(details.body);
  }
  if (Array.isArray(details.parts)) {
    for (const part of details.parts) {
      if (!part || typeof part !== "object") continue;
      const chapter = part as { title?: unknown; body?: unknown };
      if (typeof chapter.title === "string") {
        sections.push(`<h2>${chapter.title}</h2>`);
      }
      if (typeof chapter.body === "string") {
        sections.push(chapter.body);
      }
    }
  }

  const text = htmlToText(sections.join("\n"));
  return stripOpenGovernmentLicence(text);
}

function parseTimestamp(value?: string | null): number | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : undefined;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  pound: "£",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/tr>/gi, "\n")
      .replace(/<\/(li|dt|dd)>/gi, "\n")
      .replace(/<\/t[dh]>/gi, " | ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(?:\s*\|\s*){2,}/g, " | ")
    .trim();
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function stripOpenGovernmentLicence(text: string): string {
  const marker = "How much Income Tax someone pays";
  const index = text.indexOf(marker);
  if (index > 0 && /Open Government Licence/i.test(text.slice(0, index))) {
    return text.slice(index).trim();
  }
  return text.replace(
    /This publication is licensed under the terms of the Open Government Licence[\s\S]*?copyright holders concerned\.\s*/i,
    ""
  );
}
