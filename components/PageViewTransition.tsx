"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Keyed by pathname so each page gets its own enter/exit transition boundary.
 * Separate boundaries keep their own viewport-relative snapshot positions,
 * unlike a single persistent boundary whose geometry morph looks like a
 * scroll jump when the outgoing page is scrolled down.
 */
export default function PageViewTransition({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ViewTransition
      key={pathname}
      enter="page-enter"
      exit="page-exit"
      default="none"
    >
      <div className="flex flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}
