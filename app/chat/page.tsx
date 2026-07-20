"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppShell from "@/components/AppShell";
import Link from "next/link";

export default function ChatIndexPage() {
  return (
    <AppShell>
      <SessionList />
    </AppShell>
  );
}

function SessionList() {
  const router = useRouter();
  const sessions = useQuery(api.chat.listSessions);
  const createSession = useMutation(api.chat.createSession);
  const removeSession = useMutation(api.chat.removeSession);

  return (
    <div className="space-y-6 max-w-2xl w-full mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Chats</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ask questions about your uploaded documents.
          </p>
        </div>
        <button
          onClick={async () => {
            const sessionId = await createSession();
            router.push(`/chat/${sessionId}`);
          }}
          className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          New chat
        </button>
      </div>

      {sessions === undefined ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-400">
          No chats yet. Start a new chat to ask your documents a question.
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <Link
                href={`/chat/${session._id}`}
                className="flex-1 min-w-0 group"
              >
                <p className="text-sm font-medium truncate group-hover:underline">
                  {session.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(session._creationTime).toLocaleString()}
                </p>
              </Link>
              <button
                onClick={() => {
                  if (confirm("Delete this chat?")) {
                    removeSession({ sessionId: session._id });
                  }
                }}
                className="text-xs text-slate-400 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
