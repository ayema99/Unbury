"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useEffect } from "react";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <AuthLoading>
        <p className="text-slate-400 text-sm">Loading…</p>
      </AuthLoading>
      <Authenticated>
        <RedirectToDocuments />
      </Authenticated>
      <Unauthenticated>
        <SignInCard />
      </Unauthenticated>
    </main>
  );
}

function RedirectToDocuments() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/documents");
  }, [router]);
  return <p className="text-slate-400 text-sm">Redirecting…</p>;
}

function SignInCard() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);
    try {
      await signIn("password", formData);
    } catch {
      setError(
        flow === "signIn"
          ? "Invalid email or password."
          : "Could not create the account. Use a valid email and a password with at least 8 characters."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Unbury</h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Upload your PDFs and ask questions in plain English.
          <br />
          Every answer is cited to your actual documents.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={flow === "signIn" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {submitting
            ? "Please wait…"
            : flow === "signIn"
              ? "Sign in"
              : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-500">
          {flow === "signIn" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setFlow(flow === "signIn" ? "signUp" : "signIn");
              setError(null);
            }}
            className="font-medium text-slate-900 hover:underline"
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>

      <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
        Your documents are encrypted at rest, never used for model training,
        and can be deleted at any time.
      </p>
    </div>
  );
}
