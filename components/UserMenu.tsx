"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";

export default function UserMenu() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);

  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const label = user?.name ?? user?.email ?? "";
  const initial = label.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account settings"
        className="h-8 w-8 rounded-full bg-slate-900 text-white text-sm font-medium flex items-center justify-center hover:bg-slate-700 transition-colors"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-lg py-1"
        >
          {user?.email && (
            <p className="px-3 py-2 text-xs text-slate-400 truncate border-b border-slate-100">
              {user.email}
            </p>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.replace("/");
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Sign out
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setConfirmingDelete(true);
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete account
          </button>
        </div>
      )}

      {confirmingDelete && (
        <DeleteAccountDialog onClose={() => setConfirmingDelete(false)} />
      )}
    </div>
  );
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const deleteAccount = useMutation(api.users.deleteAccount);

  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDeleting(true);
    try {
      await deleteAccount();
      // The session rows are already gone, so a failure here is expected.
      await signOut().catch(() => {});
      router.replace("/");
    } catch {
      setError("Could not delete your account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form
        onSubmit={handleDelete}
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">Delete your account?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          This permanently removes your uploaded documents, everything indexed
          from them, and your chat history. It cannot be undone.
        </p>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="delete-confirmation"
          >
            Type <span className="font-mono">delete</span> to confirm
          </label>
          <input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={deleting || confirmation.trim().toLowerCase() !== "delete"}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </form>
    </div>
  );
}
