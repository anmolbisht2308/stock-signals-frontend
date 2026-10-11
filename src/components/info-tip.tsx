"use client";

import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { GLOSSARY, type TermKey } from "@/lib/glossary";

/** ⓘ button that opens a short plain-language explanation from the glossary. */
export function InfoTip({ term }: { term: TermKey }) {
  const t = GLOSSARY[term];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`What is ${t.title}?`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-5 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Info className="size-3.5" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute top-6 left-1/2 z-30 w-72 max-w-[80vw] -translate-x-1/2 rounded-lg border border-border bg-surface p-3 text-left text-sm font-normal text-text normal-case shadow-lg"
        >
          <span className="mb-1 block font-semibold">{t.title}</span>
          <span className="block text-muted">{t.short}</span>
          {"more" in t && t.more && <span className="mt-2 block text-muted">{t.more}</span>}
        </span>
      )}
    </span>
  );
}
