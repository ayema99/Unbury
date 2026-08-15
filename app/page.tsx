"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Authenticated } from "convex/react";
import SiteHeader, { SiteMark } from "@/components/SiteHeader";
import { featuredFaqs } from "@/lib/faq";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Signed-in visitors go straight to the app; everyone else sees the landing page immediately. */}
      <Authenticated>
        <RedirectToDocuments />
      </Authenticated>

      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <BuriedStrip />
        <Story />
        <Honesty />
        <Privacy />
        <FaqPreview />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function RedirectToDocuments() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/documents");
  }, [router]);
  return null;
}

/* ------------------------------- Hero ---------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-white">
      {/* soft radial glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[36rem] w-[60rem] rounded-full bg-amber-100/50 blur-3xl"
        aria-hidden
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-medium px-3 py-1 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Your documents, finally answerable
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-slate-900">
            The answer is in there.
            <br />
            <span className="text-amber-600">Somewhere.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
            Insurance policies, leases, tax forms, medical statements — the
            facts you need are buried in pages of fine print. unboxyourtax lets you
            upload your PDFs and ask questions in plain English. Every answer
            comes with a page number and the exact quote it came from.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-slate-900 text-white text-sm font-medium px-6 py-3 hover:bg-slate-700 transition-colors shadow-sm"
            >
              Start unboxing — it&apos;s free
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-slate-300 bg-white text-slate-700 text-sm font-medium px-6 py-3 hover:border-slate-400 hover:text-slate-900 transition-colors"
            >
              Learn more
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Encrypted at rest · Never used for training · Delete anytime
          </p>
        </div>

        <MockChat />
      </div>
    </section>
  );
}

function MockChat() {
  return (
    <div className="relative">
      {/* stacked "buried paper" behind the card */}
      <div
        className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl bg-slate-200/70 rotate-2"
        aria-hidden
      />
      <div
        className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-slate-100 rotate-1"
        aria-hidden
      />
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-green-300" aria-hidden />
          <p className="ml-2 text-xs text-slate-400 font-mono truncate">
            health-insurance-policy.pdf · 48 pages
          </p>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-slate-900 text-white px-4 py-2.5">
              What&apos;s my deductible for out-of-network care?
            </p>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[88%] space-y-3">
              <p className="rounded-2xl rounded-bl-sm bg-slate-100 text-slate-800 px-4 py-2.5 leading-relaxed">
                Your out-of-network deductible is{" "}
                <strong>$1,500 per calendar year</strong>. Emergency care is an
                exception — it&apos;s billed at the in-network rate.
              </p>
              <figure className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
                <blockquote className="text-xs text-slate-600 italic leading-relaxed">
                  “The Member is responsible for an annual deductible of
                  $1,500 for services rendered by Out-of-Network providers…”
                </blockquote>
                <figcaption className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  health-insurance-policy.pdf — page 12
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Buried strip ------------------------------ */

function BuriedStrip() {
  const items = [
    "Insurance policies",
    "Leases",
    "Tax forms",
    "Medical statements",
    "Contracts",
    "Benefit booklets",
  ];
  return (
    <section className="border-y border-slate-100 bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
          Made for the paperwork you avoid
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-amber-400" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------- Story --------------------------------- */

const steps = [
  {
    title: "Drop it into unboxyourtax",
    body: "Drop in your PDFs. Each file is stored encrypted at rest with AES-256 — never exposed through a public link, never shared.",
    icon: (
      <>
        <path d="M12 15V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </>
    ),
  },
  {
    title: "We dig through every page",
    body: "unboxyourtax reads your documents page by page and builds a private index of what's inside — so nothing stays hidden in the fine print.",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
        <path d="M8 11h6" />
      </>
    ),
  },
  {
    title: "Ask. Get the receipt.",
    body: "Ask in plain English. Answers come only from your documents, with a page number and the exact quoted passage — proof included.",
    icon: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.4-4.1-1L3 20l1-5.4a8.5 8.5 0 1 1 17-3.1z" />
        <path d="m9 11 2 2 4-4" />
      </>
    ),
  },
];

function Story() {
  return (
    <section id="story" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          From buried in fine print to unboxed in three steps
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          You shouldn&apos;t need a lawyer, a broker, and a free afternoon to
          find out what your own documents say.
        </p>
      </div>

      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  {step.icon}
                </svg>
              </span>
              <span className="text-5xl font-semibold text-slate-100 select-none">
                {i + 1}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------ Honesty -------------------------------- */

function Honesty() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 lg:pb-24">
      <div className="rounded-3xl bg-slate-900 text-white px-8 py-12 sm:px-14 sm:py-14 grid lg:grid-cols-2 gap-10 items-center overflow-hidden relative">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            No guessing. Ever.
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Most AI tools would rather invent an answer than admit they
            don&apos;t know. unboxyourtax answers only from what&apos;s actually in
            your documents. If it isn&apos;t there, it tells you straight —
            so you never act on a made-up clause.
          </p>
        </div>
        <div className="relative rounded-2xl bg-slate-800/80 border border-slate-700 p-5 text-sm space-y-4">
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-amber-500 text-slate-900 px-4 py-2.5 font-medium">
              Does my lease cover flood damage?
            </p>
          </div>
          <div className="flex justify-start">
            <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-700 text-slate-100 px-4 py-2.5 leading-relaxed">
              I couldn&apos;t find anything about flood damage in your uploaded
              documents. It may be covered in a rider that isn&apos;t uploaded
              yet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Privacy -------------------------------- */

const privacyPoints = [
  {
    title: "Encrypted at rest",
    body: "Files are encrypted with AES-256-GCM and never exposed via public URLs.",
    icon: (
      <>
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  {
    title: "Never used for training",
    body: "Your documents answer your questions. They are never used to train models.",
    icon: (
      <>
        <path d="M12 3 4 7v5c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V7z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "Delete anytime",
    body: "Deleting a document instantly removes the file and everything indexed from it.",
    icon: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      </>
    ),
  },
];

function Privacy() {
  return (
    <section id="privacy" className="scroll-mt-20 border-t border-slate-100 bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            These are your most personal documents.
            <br className="hidden sm:block" /> We treat them that way.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {privacyPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  {point.icon}
                </svg>
              </span>
              <h3 className="font-semibold text-slate-900">{point.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FAQ preview ---------------------------- */

function FaqPreview() {
  return (
    <section id="faq" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Frequently asked questions
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          Short answers to the things people ask before they upload a file.
        </p>
      </div>
      <div className="max-w-3xl mx-auto divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden">
        {featuredFaqs.map((item) => (
          <details key={item.question} className="group">
            <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-4 text-left hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden">
              <span className="font-medium text-slate-900 text-sm sm:text-base">
                {item.question}
              </span>
              <span
                className="mt-0.5 shrink-0 text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/faq"
          className="inline-flex rounded-full border border-slate-300 bg-white text-slate-700 text-sm font-medium px-6 py-3 hover:border-slate-400 hover:text-slate-900 transition-colors"
        >
          See all questions
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------ Final CTA ------------------------------ */

function FinalCta() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24 text-center">
      <div className="flex justify-center mb-6">
        <SiteMark className="h-14 w-14" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
        Stop re-reading. Start asking.
      </h2>
      <p className="mt-4 text-slate-600 max-w-xl mx-auto leading-relaxed">
        Upload your first PDF and get a cited answer in minutes. Free to try —
        no credit card required.
      </p>
      <div className="mt-8">
        <Link
          href="/signup"
          className="inline-block rounded-full bg-slate-900 text-white text-sm font-medium px-8 py-3.5 hover:bg-slate-700 transition-colors shadow-sm"
        >
          Create your free account
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------- Footer -------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} unboxyourtax
        </p>
        <nav className="flex items-center gap-6 text-sm text-slate-500">
          <Link href="/about" className="hover:text-slate-900 transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-slate-900 transition-colors">
            FAQ
          </Link>
          <Link href="/login" className="hover:text-slate-900 transition-colors">
            Log in
          </Link>
        </nav>
      </div>
      <p className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 text-xs text-slate-400 text-center sm:text-left">
        Answers are generated from your uploaded documents for informational
        purposes only and are not legal, financial, or medical advice.
      </p>
    </footer>
  );
}
