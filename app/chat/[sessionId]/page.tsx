"use client";

import { use, useEffect, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AppShell from "@/components/AppShell";
import Link from "next/link";

export default function ChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  return (
    <AppShell>
      <ChatView sessionId={sessionId as Id<"chatSessions">} />
    </AppShell>
  );
}

type Citation = {
  documentId: Id<"documents">;
  filename: string;
  pageNumber: number;
  quote: string;
};

function ChatView({ sessionId }: { sessionId: Id<"chatSessions"> }) {
  const messages = useQuery(api.chat.listMessages, { sessionId });
  const documents = useQuery(api.documents.list);
  const ask = useAction(api.rag.ask);

  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const readyDocs = documents?.filter((d) => d.status === "ready").length ?? 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, pending]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || pending) return;
    setInput("");
    setError(null);
    setPending(question);
    try {
      await ask({ sessionId, content: question });
    } catch {
      setError("Something went wrong answering that question. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/chat"
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← All chats
        </Link>
        {documents !== undefined && readyDocs === 0 && (
          <Link
            href="/documents"
            className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 hover:bg-amber-100 transition-colors"
          >
            No documents indexed yet — upload one first
          </Link>
        )}
      </div>

      <div className="flex-1 space-y-4 pb-4">
        {messages === undefined ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : messages.length === 0 && !pending ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">
              Ask anything about your uploaded documents, for example:
            </p>
            <p className="text-slate-400 text-sm italic mt-2">
              “What is my deductible for water damage?”
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              role={message.role}
              content={message.content}
              citations={message.citations}
            />
          ))
        )}

        {pending && (
          <>
            <MessageBubble role="user" content={pending} />
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <span className="text-sm text-slate-400 animate-pulse">
                  Searching your documents…
                </span>
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-slate-50 pt-2 pb-4"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents…"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || !!pending}
            className="rounded-xl bg-slate-900 text-white px-5 text-sm font-medium hover:bg-slate-700 disabled:opacity-40 transition-colors"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  citations,
}: {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-slate-900 text-white rounded-2xl px-4 py-2.5 max-w-[85%]">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 max-w-[85%] space-y-3">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        {citations && citations.length > 0 && (
          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Sources
            </p>
            {citations.map((citation, i) => (
              <details key={i} className="group">
                <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900 list-none flex items-center gap-1.5">
                  <span className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono">
                    p.{citation.pageNumber}
                  </span>
                  <span className="truncate">{citation.filename}</span>
                </summary>
                <blockquote className="mt-1.5 ml-1 pl-3 border-l-2 border-slate-200 text-xs text-slate-500 italic leading-relaxed">
                  “{citation.quote}”
                </blockquote>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
