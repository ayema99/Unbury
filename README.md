# Unbury

Upload your own PDFs (insurance policies, tax forms, leases, medical statements) and ask plain-English questions. Every answer is grounded in and cited to your actual documents — page number and quoted snippet included. If the answer isn't in your documents, Unbury says so instead of guessing.

## Stack

- **Next.js** on Vercel — UI (upload, document list, chat with citations)
- **Convex** — auth, database, file storage, vector search, ingest & RAG actions
- **Groq** — `nomic-embed-text-v1.5` embeddings + `llama-3.3-70b-versatile` answers

## How it works

1. You upload a PDF → it's stored in Convex File Storage, encrypted at rest with AES-256-GCM.
2. An ingest action extracts text per page, chunks it (~400 tokens with overlap), embeds each chunk via Groq, and stores vectors in a Convex vector index tagged with your user id.
3. When you ask a question, it's embedded, the top 6 chunks from *your* documents are retrieved, and Groq Llama 3.3 70B answers from those excerpts only — citing page numbers, or replying "I couldn't find that in your uploaded documents."
4. Deleting a document removes the encrypted file, all chunks, and all vectors immediately.

## Privacy

- Documents are encrypted at rest and never exposed via public URLs.
- Your data is never used to train models.
- Everything is deletable on request (delete button per document).
- Answers are informational only — not legal, financial, or medical advice.

## Local development

```bash
npm install

# Terminal 1: Convex backend (creates .env.local on first run)
npx convex dev

# One-time: generate auth + encryption keys on the deployment
node scripts/setup-env.mjs

# One-time: set your Groq API key (get one at https://console.groq.com)
npx convex env set GROQ_API_KEY gsk_...

# Terminal 2: frontend
npm run dev
```

Open http://localhost:3000, create an account, upload a PDF, and start asking questions.

## Deployment

1. **Convex**: `npx convex deploy` (after `npx convex login`). Set `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` (your production URL), `ENCRYPTION_KEY`, and `GROQ_API_KEY` on the production deployment (`node scripts/setup-env.mjs` with `--prod`-configured CLI, or via the Convex dashboard).
2. **Vercel**: import the repo, set `NEXT_PUBLIC_CONVEX_URL` to your production Convex URL, deploy.

## Project layout

```
convex/
  schema.ts        # tables + 768-dim vector index (filtered by userId)
  auth.ts          # Convex Auth, email + password
  documents.ts     # upload URL, create, list, delete (cascades to vectors + storage)
  ingest.ts        # "use node" action: extract → chunk → embed → index
  ingestHelpers.ts # internal mutations/queries used by ingest
  rag.ts           # ask action: vector search → Groq → citations
  chat.ts          # sessions, messages, internal RAG helpers
  lib/             # pdf extraction, chunking, embeddings, Groq prompt, AES-GCM
app/
  page.tsx             # sign in / sign up
  documents/page.tsx   # upload + document list (live status)
  chat/page.tsx        # session list
  chat/[sessionId]/    # chat with cited answers
```

## v1 limitations

- PDFs must contain selectable text (no OCR for scanned/handwritten documents).
- Citations show text snippets, not an embedded PDF page viewer.
- Single-user accounts; no document sharing.
