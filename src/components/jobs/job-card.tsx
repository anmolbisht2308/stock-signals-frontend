"use client";

import { useMutation } from "@tanstack/react-query";
import { Clock, Play } from "lucide-react";
import { useState } from "react";

import { InfoTip } from "@/components/info-tip";
import { Card, ErrorBox } from "@/components/ui";
import { api, type JobWithLog } from "@/lib/api";
import { type FieldValues, type JobDef, defaults, toParams } from "@/lib/jobs";

export function JobCard({
  job,
  busyWith,
  onStarted,
}: {
  job: JobDef;
  /** Label of the heavy job that is running, if any. */
  busyWith: string | null;
  onStarted: (job: JobWithLog) => void;
}) {
  const [values, setValues] = useState<FieldValues>(() => defaults(job));
  const start = useMutation({
    mutationFn: () => api.post<JobWithLog>("/api/jobs", { kind: job.kind, params: toParams(job, values) }),
    onSuccess: onStarted,
  });
  const blocked = job.heavy && busyWith != null;

  return (
    <Card className="flex flex-col">
      <div className="mb-1 flex items-center gap-1">
        <h3 className="font-semibold">{job.label}</h3>
        {job.term && <InfoTip term={job.term} />}
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted">
          <Clock className="size-3" /> {job.duration}
        </span>
      </div>
      <p className="text-sm">{job.what}</p>
      <p className="mt-1 text-sm text-muted">
        <span className="font-medium">When: </span>
        {job.when}
      </p>

      <form
        className="mt-3 flex flex-1 flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          start.mutate();
        }}
      >
        {job.fields.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {job.fields.map((f) => {
              const id = `${job.kind}-${f.name}`;
              if (f.type === "checkbox") {
                const checked = values[f.name] === true;
                return (
                  <div key={f.name} className="w-full">
                    <label htmlFor={id} className="flex items-start gap-2 text-sm">
                      <input
                        id={id}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setValues({ ...values, [f.name]: e.target.checked })}
                        className="mt-0.5 size-4 accent-accent"
                      />
                      <span>
                        {f.label} {f.term && <InfoTip term={f.term} />}
                      </span>
                    </label>
                    {checked && f.warning && <p className="mt-1 ml-6 text-xs text-warn">{f.warning}</p>}
                  </div>
                );
              }
              return (
                <label key={f.name} htmlFor={id} className="flex min-w-32 flex-1 flex-col gap-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    {f.label} {f.term && <InfoTip term={f.term} />}
                  </span>
                  {f.type === "select" ? (
                    <select
                      id={id}
                      value={String(values[f.name])}
                      onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
                    >
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={id}
                      type="date"
                      value={String(values[f.name])}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text"
                    />
                  )}
                  {f.type === "date" && !values[f.name] && f.placeholder && (
                    <span className="text-[11px]">Empty = {f.placeholder}</span>
                  )}
                </label>
              );
            })}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={blocked || start.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Play className="size-3.5" /> {start.isPending ? "Starting…" : "Run"}
          </button>
          {blocked && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              Waiting for {busyWith} to finish <InfoTip term="heavyJob" />
            </span>
          )}
        </div>
        {start.isError && <ErrorBox error={start.error} />}
      </form>
    </Card>
  );
}
