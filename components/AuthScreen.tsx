"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import SiteHeader, { SiteMark } from "@/components/SiteHeader";

type Flow = "signIn" | "signUp";

type Step =
  | { kind: "credentials" }
  | { kind: "emailVerification"; email: string }
  | { kind: "forgotPassword" }
  | { kind: "passwordReset"; email: string };

const formClass =
  "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4";
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
const codeInputClass = `${inputClass} tracking-widest text-center`;
const submitClass =
  "w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors";
const linkClass = "font-medium text-slate-900 hover:underline";

export default function AuthScreen({ initialFlow }: { initialFlow: Flow }) {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-amber-50/60 via-white to-white">
        <AuthLoading>
          <p className="text-slate-400 text-sm">Loading…</p>
        </AuthLoading>
        <Authenticated>
          <RedirectToDocuments />
        </Authenticated>
        <Unauthenticated>
          <SignInCard initialFlow={initialFlow} />
        </Unauthenticated>
      </main>
    </div>
  );
}

function RedirectToDocuments() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/documents");
  }, [router]);
  return <p className="text-slate-400 text-sm">Redirecting…</p>;
}

function SignInCard({ initialFlow }: { initialFlow: Flow }) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<Flow>(initialFlow);
  const [step, setStep] = useState<Step>({ kind: "credentials" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function goTo(next: Step) {
    setStep(next);
    setError(null);
  }

  async function handleCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);
    try {
      const result = await signIn("password", formData);
      if (!result.signingIn) {
        goTo({
          kind: "emailVerification",
          email: formData.get("email") as string,
        });
        setSubmitting(false);
      }
    } catch {
      setError(
        flow === "signIn"
          ? "Invalid email or password."
          : "Could not create the account. Use a valid email and a password with at least 8 characters."
      );
      setSubmitting(false);
    }
  }

  async function handleEmailVerification(
    event: React.FormEvent<HTMLFormElement>,
    email: string
  ) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", "email-verification");
    formData.set("email", email);
    try {
      await signIn("password", formData);
    } catch {
      setError("Invalid or expired code.");
      setSubmitting(false);
    }
  }

  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", "reset");
    try {
      await signIn("password", formData);
      goTo({ kind: "passwordReset", email: formData.get("email") as string });
    } catch {
      setError("We couldn't send a reset code. Check the email address.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset(
    event: React.FormEvent<HTMLFormElement>,
    email: string
  ) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", "reset-verification");
    formData.set("email", email);
    try {
      await signIn("password", formData);
    } catch {
      setError(
        "Invalid or expired code, or the new password is shorter than 8 characters."
      );
      setSubmitting(false);
    }
  }

  const heading = headingFor(step, flow);

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <SiteMark className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {heading.title}
        </h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          {heading.subtitle}
        </p>
      </div>

      {step.kind === "credentials" && (
        <form onSubmit={handleCredentials} className={formClass}>
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
              className={inputClass}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={
                flow === "signIn" ? "current-password" : "new-password"
              }
              className={inputClass}
            />
            {flow === "signIn" && (
              <p className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => goTo({ kind: "forgotPassword" })}
                  className="text-xs text-slate-500 hover:text-slate-900 hover:underline"
                >
                  Forgot password?
                </button>
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className={submitClass}>
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
              className={linkClass}
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      )}

      {step.kind === "emailVerification" && (
        <form
          onSubmit={(event) => handleEmailVerification(event, step.email)}
          className={formClass}
        >
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="code">
              Verification code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={8}
              maxLength={8}
              pattern="[0-9]{8}"
              className={codeInputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className={submitClass}>
            {submitting ? "Please wait…" : "Verify email"}
          </button>

          <p className="text-center text-sm text-slate-500">
            <button
              type="button"
              onClick={() => goTo({ kind: "credentials" })}
              className={linkClass}
            >
              Back
            </button>
          </p>
        </form>
      )}

      {step.kind === "forgotPassword" && (
        <form onSubmit={handleForgotPassword} className={formClass}>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="reset-email"
            >
              Email
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className={submitClass}>
            {submitting ? "Please wait…" : "Send reset code"}
          </button>

          <p className="text-center text-sm text-slate-500">
            <button
              type="button"
              onClick={() => goTo({ kind: "credentials" })}
              className={linkClass}
            >
              Back to sign in
            </button>
          </p>
        </form>
      )}

      {step.kind === "passwordReset" && (
        <form
          onSubmit={(event) => handlePasswordReset(event, step.email)}
          className={formClass}
        >
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="reset-code"
            >
              Reset code
            </label>
            <input
              id="reset-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={8}
              maxLength={8}
              pattern="[0-9]{8}"
              className={codeInputClass}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="newPassword"
            >
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className={submitClass}>
            {submitting ? "Please wait…" : "Set new password"}
          </button>

          <p className="text-center text-sm text-slate-500">
            <button
              type="button"
              onClick={() => goTo({ kind: "forgotPassword" })}
              className={linkClass}
            >
              Use a different email
            </button>
          </p>
        </form>
      )}

      <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
        Your documents are encrypted at rest, never used for model training,
        and can be deleted at any time.
      </p>

      <p className="text-center text-xs text-slate-400 mt-2">
        <Link href="/" className="hover:text-slate-600 underline underline-offset-2">
          Back to home
        </Link>
      </p>
    </div>
  );
}

function headingFor(step: Step, flow: Flow) {
  switch (step.kind) {
    case "emailVerification":
      return {
        title: "Check your email",
        subtitle: `We sent an 8-digit code to ${step.email}.`,
      };
    case "forgotPassword":
      return {
        title: "Reset your password",
        subtitle: "We'll email you an 8-digit code to confirm it's you.",
      };
    case "passwordReset":
      return {
        title: "Choose a new password",
        subtitle: `Enter the code we sent to ${step.email}.`,
      };
    default:
      return {
        title: flow === "signIn" ? "Welcome back" : "Create your account",
        subtitle: "Ask your documents anything. Every answer is cited.",
      };
  }
}
