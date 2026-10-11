"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getToken } from "@/lib/api";

import { PageSkeleton } from "./ui";

/** Renders children only when a login token is stored; otherwise sends the user to /login. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getToken()) setReady(true);
    else router.replace("/login");
  }, [router]);

  return ready ? <>{children}</> : <PageSkeleton />;
}
