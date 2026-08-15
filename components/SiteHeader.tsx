"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export function SiteMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[55%] w-[55%]"
      >
        {/* Arrow rising out of buried layers */}
        <path d="M12 15V4" />
        <path d="m7 8 5-4 5 4" />
        <path d="M4 15h3m10 0h3" />
        <path d="M4 19h16" />
      </svg>
    </span>
  );
}

function GuestActions() {
  return (
    <>
      <Link
        href="/login"
        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700 transition-colors shadow-sm"
      >
        Get started
      </Link>
    </>
  );
}

export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-md"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-lg text-slate-900"
        >
          <SiteMark />
          unboxyourtax
        </Link>

        <nav className="hidden sm:flex items-center gap-7 text-sm text-slate-600">
          <Link href="/#story" className="hover:text-slate-900 transition-colors">
            How it works
          </Link>
          <Link href="/#privacy" className="hover:text-slate-900 transition-colors">
            Privacy
          </Link>
          <Link href="/about" className="hover:text-slate-900 transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-slate-900 transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <AuthLoading>
            <GuestActions />
          </AuthLoading>
          <Unauthenticated>
            <GuestActions />
          </Unauthenticated>
          <Authenticated>
            <Link
              href="/documents"
              className="rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700 transition-colors shadow-sm"
            >
              Open app
            </Link>
          </Authenticated>
        </div>
      </div>
    </header>
  );
}
