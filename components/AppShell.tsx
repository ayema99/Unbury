"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthLoading>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>
        <Shell>{children}</Shell>
      </Authenticated>
    </>
  );
}

function RedirectToSignIn() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}

function Shell({ children }: { children: ReactNode }) {
  const { signOut } = useAuthActions();
  const pathname = usePathname();
  const router = useRouter();

  const navLink = (href: string, label: string) => {
    const active =
      href === "/documents"
        ? pathname.startsWith("/documents")
        : pathname.startsWith("/chat");
    return (
      <Link
        href={href}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/documents" className="font-semibold tracking-tight">
              Unbury
            </Link>
            <nav className="flex items-center gap-1">
              {navLink("/documents", "Documents")}
              {navLink("/chat", "Chat")}
            </nav>
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.replace("/");
            }}
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <p className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-400 text-center">
          Answers are generated from your uploaded documents for informational
          purposes only and are not legal, financial, or medical advice.
        </p>
      </footer>
    </div>
  );
}
