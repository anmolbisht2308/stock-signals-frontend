"use client";

import { useEffect, useRef, useState } from "react";

import { api, type JobWithLog } from "@/lib/api";
import { isActive } from "@/lib/jobs";

interface LogState {
  id: string;
  job: JobWithLog | null;
  lines: string[];
  error: unknown;
}

const KEEP_LINES = 5000;

/**
 * Follows one job: polls `/api/jobs/:id?since=N` every second while it runs and keeps the
 * lines seen so far. Calls `onDone` once when a job it watched running has finished.
 */
export function useJobLog(id: string | null, onDone?: (job: JobWithLog) => void) {
  const [state, setState] = useState<LogState | null>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!id) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let since = 0;
    let lines: string[] = [];
    let sawRunning = false;

    const tick = async () => {
      try {
        const job = await api.get<JobWithLog>(`/api/jobs/${id}?since=${since}`);
        if (stopped) return;
        lines = [...lines, ...job.log].slice(-KEEP_LINES);
        since = job.log_total;
        setState({ id, job, lines, error: null });
        if (isActive(job.status)) {
          sawRunning = true;
          timer = setTimeout(tick, 1000);
        } else if (sawRunning) {
          doneRef.current?.(job);
        }
      } catch (error) {
        if (stopped) return;
        setState((s) => ({ id, job: s?.id === id ? s.job : null, lines, error }));
        timer = setTimeout(tick, 3000);
      }
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id]);

  return state && state.id === id ? state : { id, job: null, lines: [], error: null };
}
