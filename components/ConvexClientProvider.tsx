"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexAuthProvider
      client={convex}
      // sessionStorage doesn't exist during server-side prerendering
      storage={typeof window === "undefined" ? undefined : window.sessionStorage}
    >
      {children}
    </ConvexAuthProvider>
  );
}
