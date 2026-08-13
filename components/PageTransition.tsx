"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UnburyMark } from "@/components/SiteHeader";

const COLUMNS = 5;
const STAGGER_MS = 60;
const COVER_MS = 420 + (COLUMNS - 1) * STAGGER_MS + 40;
const REVEAL_MS = 400 + (COLUMNS - 1) * STAGGER_MS + 40;
const HASH_COVER_MS = 300 + (COLUMNS - 1) * 40 + 30;
const HASH_REVEAL_MS = 280 + (COLUMNS - 1) * 40 + 30;

type Phase = "idle" | "cover" | "hold" | "reveal";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToTarget(id: string) {
  if (!id) {
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) {
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  el.scrollIntoView({ behavior: "auto", block: "start" });
  el.classList.remove("section-arrive");
  void el.offsetWidth;
  el.classList.add("section-arrive");
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<"full" | "quick">("full");
  const busy = useRef(false);
  const pathnameRef = useRef(pathname);
  const onPathChange = useRef<(() => void) | null>(null);

  pathnameRef.current = pathname;

  useEffect(() => {
    onPathChange.current?.();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition != null) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/_next")) return;

      event.preventDefault();
      event.stopPropagation();
      void navigate(url.pathname + url.search, url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lock in listener once
  }, []);

  async function navigate(pathWithSearch: string, hash: string) {
    if (busy.current) return;

    const path = pathWithSearch.split("?")[0] || "/";
    const samePage = path === pathnameRef.current;
    const id = hash.replace(/^#/, "");

    if (prefersReducedMotion()) {
      if (samePage) scrollToTarget(id);
      else router.push(pathWithSearch + hash);
      return;
    }

    busy.current = true;
    setSpeed(samePage ? "quick" : "full");
    setPhase("cover");
    await wait(samePage ? HASH_COVER_MS : COVER_MS);

    if (samePage) {
      scrollToTarget(id);
    } else {
      setPhase("hold");
      await new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          onPathChange.current = null;
          scrollToTarget(id);
          resolve();
        };
        onPathChange.current = finish;
        router.push(pathWithSearch + hash);
        window.setTimeout(finish, 500);
      });
    }

    setPhase("reveal");
    await wait(samePage ? HASH_REVEAL_MS : REVEAL_MS);
    setPhase("idle");
    busy.current = false;
  }

  return (
    <>
      {children}
      <div
        className="page-curtain"
        data-phase={phase}
        data-speed={speed}
        aria-hidden
      >
        {Array.from({ length: COLUMNS }, (_, index) => (
          <div
            key={index}
            className="page-curtain-col"
            style={{
              transitionDelay: `${index * (speed === "quick" ? 40 : STAGGER_MS)}ms`,
            }}
          />
        ))}
        <div className="page-curtain-mark">
          <UnburyMark className="h-14 w-14" />
        </div>
      </div>
    </>
  );
}
