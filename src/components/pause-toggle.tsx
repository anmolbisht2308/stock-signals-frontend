"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pause, Play } from "lucide-react";

import { api, type Dashboard } from "@/lib/api";
import { cn } from "@/lib/cn";

import { InfoTip } from "./info-tip";

/** Same as /pause and /resume in Telegram: stops or restarts new buy signals. Exits keep running. */
export function PauseToggle({ paused }: { paused: boolean }) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (pause: boolean) => api.post<{ paused: boolean }>(pause ? "/api/pause" : "/api/resume", {}),
    onSuccess: ({ paused: value }) => {
      qc.setQueryData<Dashboard>(["dashboard"], (d) => (d ? { ...d, paused: value } : d));
    },
  });
  const Icon = paused ? Play : Pause;
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => m.mutate(!paused)}
        disabled={m.isPending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-60",
          paused ? "border-good bg-good-bg text-good" : "border-border bg-surface text-text hover:bg-surface-2",
        )}
      >
        <Icon className="size-4" />
        {paused ? "Resume signals" : "Pause signals"}
      </button>
      <InfoTip term="paused" />
      {m.isError && <span className="text-xs text-bad">{(m.error as Error).message}</span>}
    </span>
  );
}
