"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { InfoTip } from "@/components/info-tip";
import { JobCard } from "@/components/jobs/job-card";
import { JobLog } from "@/components/jobs/job-log";
import { PauseToggle } from "@/components/pause-toggle";
import { Badge, Card, CardTitle, Empty, ErrorBox, PageHeader, PageSkeleton, Table, Td, Th } from "@/components/ui";
import { api, type Dashboard, type JobList, type JobWithLog } from "@/lib/api";
import { when } from "@/lib/format";
import { GROUPS, JOBS, STATUS_INFO, elapsed, isActive, jobDef } from "@/lib/jobs";

export default function RunPage() {
  const qc = useQueryClient();
  const jobs = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.get<JobList>("/api/jobs?limit=25"),
    refetchInterval: (q) => (q.state.data?.running.length ? 2000 : false),
  });
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => api.get<Dashboard>("/api/dashboard") });
  const [picked, setPicked] = useState<string | null>(null);
  const [closed, setClosed] = useState<string | null>(null);

  const onStarted = useCallback(
    (job: JobWithLog) => {
      setPicked(job.id);
      void qc.invalidateQueries({ queryKey: ["jobs"] });
    },
    [qc],
  );
  // A finished job may have changed anything (prices, positions, baskets): refresh every page.
  const onDone = useCallback(() => void qc.invalidateQueries(), [qc]);

  if (jobs.isPending) return <PageSkeleton />;
  if (jobs.isError) return <ErrorBox error={jobs.error} />;

  const running = jobs.data.running;
  const heavy = running.find((j) => j.heavy);
  const busyWith = heavy ? (jobDef(heavy.kind)?.label ?? heavy.kind) : null;
  // Show the job you picked, else whatever is running (unless you closed it).
  const auto = running[0]?.id ?? null;
  const shown = picked ?? (auto !== closed ? auto : null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Run"
        intro="Start the bot's jobs from here instead of the terminal. Each button runs the same command you'd type, and the result also goes to Telegram."
      >
        {dashboard.data && <PauseToggle paused={dashboard.data.paused} />}
      </PageHeader>

      {shown && (
        <JobLog
          key={shown}
          id={shown}
          onDone={onDone}
          onClose={() => {
            setClosed(shown);
            setPicked(null);
          }}
        />
      )}

      {GROUPS.map((g) => (
        <section key={g.key}>
          <h2 className="mb-3 flex items-center gap-1 text-sm font-semibold">
            {g.title}
            {g.key === "daily" && <InfoTip term="job" />}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {JOBS.filter((j) => j.group === g.key).map((j) => (
              <JobCard key={j.kind} job={j} busyWith={busyWith} onStarted={onStarted} />
            ))}
          </div>
        </section>
      ))}

      <Card>
        <CardTitle>History</CardTitle>
        {jobs.data.jobs.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Job</Th>
                <Th>Status</Th>
                <Th>Started</Th>
                <Th right>Took</Th>
                <Th>Command</Th>
                <Th>
                  <span className="sr-only">Log</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {jobs.data.jobs.map((j) => {
                const s = STATUS_INFO[j.status];
                return (
                  <tr key={j.id}>
                    <Td className="font-medium">{jobDef(j.kind)?.label ?? j.kind}</Td>
                    <Td>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </Td>
                    <Td>{when(j.started_at)}</Td>
                    <Td right>{isActive(j.status) ? "…" : elapsed(j.started_at, j.finished_at)}</Td>
                    <Td className="max-w-xs truncate font-mono text-xs text-muted">{j.command}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => {
                          setPicked(j.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs text-accent hover:underline"
                      >
                        View log
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <Empty>No jobs run from the panel yet.</Empty>
        )}
      </Card>
    </div>
  );
}
