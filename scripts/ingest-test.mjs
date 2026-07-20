import { ConvexHttpClient } from "convex/browser";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "node:fs";

const url =
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  fs.readFileSync(".env.local", "utf8").match(/NEXT_PUBLIC_CONVEX_URL=(\S+)/)?.[1];
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not found");
console.log(`Testing against ${url}`);
const client = new ConvexHttpClient(url);

// Build a small two-page policy-like PDF with selectable text.
const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const page1 = pdf.addPage([612, 792]);
page1.drawText(
  "HOMEOWNERS INSURANCE POLICY\n\nSection 4: Deductibles.\nThe deductible for water damage claims is $500 per occurrence.\nThe deductible for wind and hail damage is $1,000 per occurrence.",
  { x: 50, y: 700, size: 12, font, lineHeight: 16, maxWidth: 500 }
);
const page2 = pdf.addPage([612, 792]);
page2.drawText(
  "Section 7: Exclusions.\nFlood damage caused by rising external water is not covered\nunless a separate flood endorsement is purchased.",
  { x: 50, y: 700, size: 12, font, lineHeight: 16, maxWidth: 500 }
);
const pdfBytes = await pdf.save();
console.log(`Built test PDF (${pdfBytes.length} bytes, 2 pages)`);

// Sign up a throwaway user and run the real upload flow.
const email = `ingest-${Date.now()}@example.com`;
const signUp = await client.action("auth:signIn", {
  provider: "password",
  params: { email, password: "ingest-test-password-1", flow: "signUp" },
});
client.setAuth(signUp.tokens.token);

const uploadUrl = await client.mutation("documents:generateUploadUrl", {});
const uploadResponse = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": "application/pdf" },
  body: pdfBytes,
});
if (!uploadResponse.ok) throw new Error("Upload failed");
const { storageId } = await uploadResponse.json();
console.log("PASS uploaded PDF to Convex storage");

await client.mutation("documents:create", {
  storageId,
  filename: "test-policy.pdf",
});

// Poll until ingest settles.
let doc;
for (let i = 0; i < 60; i++) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const docs = await client.query("documents:list", {});
  doc = docs[0];
  if (doc && (doc.status === "ready" || doc.status === "failed")) break;
}

console.log(`Final status: ${doc.status}`);
if (doc.errorMessage) console.log(`Error message: ${doc.errorMessage}`);
if (doc.pageCount) console.log(`Page count: ${doc.pageCount}`);
console.log(`Encrypted: ${!!doc.encryptionIv}`);

if (doc.status === "ready") {
  // Full RAG round-trip: in-document question, follow-up, and off-topic.
  const sessionId = await client.mutation("chat:createSession", {});

  const answer1 = await client.action("rag:ask", {
    sessionId,
    content: "What is my deductible for water damage?",
  });
  console.log(`\nQ1 (in document): ${answer1}`);

  const answer2 = await client.action("rag:ask", {
    sessionId,
    content: "What about flood damage specifically?",
  });
  console.log(`\nQ2 (follow-up): ${answer2}`);

  const answer3 = await client.action("rag:ask", {
    sessionId,
    content: "What is the capital of France?",
  });
  console.log(`\nQ3 (off-topic, should be not-found): ${answer3}`);

  const messages = await client.query("chat:listMessages", { sessionId });
  const withCitations = messages.filter(
    (m) => m.role === "assistant" && m.citations?.length > 0
  );
  console.log(
    `\nAssistant messages with citations: ${withCitations.length}`
  );
  if (withCitations[0]) {
    console.log(
      `First citation: page ${withCitations[0].citations[0].pageNumber} of ${withCitations[0].citations[0].filename}`
    );
  }
  await client.mutation("chat:removeSession", { sessionId });
}

// Clean up the test document either way.
await client.mutation("documents:remove", { documentId: doc._id });
console.log("\nCleaned up test document and session.");
