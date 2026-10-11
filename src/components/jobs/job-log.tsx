"use client";

import { useMutation } from "@tanstack/react-query";
import { Square, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Badge, Card, ErrorBox } from "@/components/ui";
import { useJobLog } from "@/hooks/use-job-log";
import { api, type JobWithLog } from "@/lib/api";
import { when } from "@/lib/format";
import { STATUS_INFO, elapsed, isActive, jobDef } from "@/lib/jobs";

export function JobLog({ id, onClose, onDone }: { id: string; onClose: () => void; onDone: (job: JobWithLog) => void }) {
  const { job, lines, error } = useJobLog(id, onDone);
  const box = useRef<HTMLPreElement>(null);
  const stick = useRef(true);
  const now = useNow(job != null && isActive(job.status));
  const cancel = useMutation({ mutationFn: () => api.post(`/api/jobs/${id}/cancel`, {}) });

  useLayoutEffect(() => {
    const el = box.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  const status = job ? STATUS_INFO[job.status] : null;
  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold">{job ? (jobDef(job.kind)?.label ?? job.kind) : "Job"}</h2>
        {status && <Badge tone={status.tone}>{status.label}</Badge>}
        {job && <span className="text-xs text-muted">{elapsed(job.started_at, job.finished_at, now)}</span>}
        <div className="ml-auto flex items-center gap-2">
          {job?.status === "running" && (
            <button
              type="button"
              onClick={() => cancel.mutate()}
              disabled={cancel.isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-bad hover:bg-bad-bg disabled:opacity-60"
            >
              <Square className="size-3" /> Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close log"
            className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-text"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      {job && (
        <p className="mb-2 font-mono text-xs break-all text-muted">
          $ {job.command} <span className="font-sans">· started {when(job.started_at)}</span>
        </p>
      )}
      <pre
        ref={box}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        }}
        className="h-72 overflow-auto rounded-lg bg-surface-2 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap"
        aria-live="polite"
      >
        {lines.length ? lines.join("\n") : job ? (isActive(job.status) ? "Starting…" : "No output.") : "Loading…"}
      </pre>
      {job?.status === "failed" && (
        <p className="mt-2 text-sm text-bad">
          {job.error ?? "Failed."} The last lines above usually say why. The error was also sent to Telegram.
        </p>
      )}
      {job?.status === "succeeded" && <p className="mt-2 text-sm text-good">Finished. The result was also sent to Telegram.</p>}
      {error != null && (
        <div className="mt-2">
          <ErrorBox error={error} />
        </div>
      )}
      {cancel.isError && (
        <div className="mt-2">
          <ErrorBox error={cancel.error} />
        </div>
      )}
    </Card>
  );
}

/** Re-renders every second while `active`, for the elapsed-time counter. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}
