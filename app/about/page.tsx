import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About — Unbury",
  description:
    "Why Unbury exists, how it answers questions from your own documents, and what it will never do with your data.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-amber-50/70 to-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-12 lg:pt-24">
            <p className="text-sm font-medium text-amber-700 mb-3">
              About Unbury
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
              Important answers shouldn&apos;t be buried in fine print.
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              The documents that govern the biggest parts of your life — your
              health coverage, your home, your taxes — are also the ones
              nobody actually reads. Unbury exists so you can stop skimming
              48-page PDFs and just ask.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-4 space-y-14 pb-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">
              What Unbury is
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Unbury is a private question-answering tool for your own
              documents. You upload PDFs — insurance policies, leases, tax
              forms, medical statements, contracts — and ask questions in
              plain English. Instead of a generic AI response, you get an
              answer grounded in <em>your</em> files, with the page number and
              the exact quoted passage it came from. If the answer isn&apos;t
              in your documents, Unbury says so rather than guessing.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">
              How it works
            </h2>
            <ol className="space-y-5">
              {[
                {
                  title: "Upload",
                  body: "Your PDF is stored encrypted at rest with AES-256-GCM. It is never exposed through a public link.",
                },
                {
                  title: "Index",
                  body: "Unbury extracts the text page by page and builds a private search index tied only to your account.",
                },
                {
                  title: "Ask",
                  body: "When you ask a question, the most relevant passages from your documents are retrieved, and a language model answers strictly from those excerpts — citing page numbers as it goes.",
                },
                {
                  title: "Delete",
                  body: "Removing a document immediately deletes the encrypted file and everything indexed from it.",
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-slate-600 leading-relaxed text-sm">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">
              What Unbury will never do
            </h2>
            <ul className="space-y-3">
              {[
                "Use your documents to train models.",
                "Share your files or expose them through public URLs.",
                "Invent an answer when your documents don't contain one.",
                "Keep your data after you delete it.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">
              Honest limitations
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Unbury works with PDFs that contain selectable text — scanned or
              handwritten documents aren&apos;t supported yet. And while every
              answer is cited to your documents, Unbury is an informational
              tool: it isn&apos;t legal, financial, or medical advice.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Ready to ask your documents something?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Upload your first PDF and get a cited answer in minutes.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-full bg-slate-900 text-white text-sm font-medium px-6 py-3 hover:bg-slate-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <p className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-xs text-slate-400 text-center">
          © {new Date().getFullYear()} Unbury · Answers are informational only
          and not legal, financial, or medical advice.
        </p>
      </footer>
    </div>
  );
}
