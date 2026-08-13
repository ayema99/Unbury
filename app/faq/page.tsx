import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { faqGroups } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ — Unbury",
  description:
    "Answers to common questions about Unbury: how it works, what you can upload, UK tax guidance, privacy, and limitations.",
};

export default function FaqPage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-amber-50/70 to-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-12 lg:pt-24">
            <p className="text-sm font-medium text-amber-700 mb-3">FAQ</p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
              Questions people actually ask
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              How Unbury works, what it can read, how your files are kept
              private, and where UK tax guidance comes from. If something still
              isn&apos;t clear, the honest limitations are listed at the end.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
          <nav
            aria-label="FAQ sections"
            className="flex flex-wrap gap-2"
          >
            {faqGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors"
              >
                {group.title}
              </a>
            ))}
          </nav>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12 pb-20">
          {faqGroups.map((group) => (
            <div key={group.id} id={group.id} className="scroll-mt-24">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">
                {group.title}
              </h2>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden">
                {group.items.map((item) => (
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
            </div>
          ))}

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Unbury · Answers are informational only
            and not legal, financial, or medical advice.
          </p>
          <nav className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              About
            </Link>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Log in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
