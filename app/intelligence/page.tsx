"use client";

import { useEffect, useState } from "react";

import { backendUrl } from "@/lib/backend";

type Cadence = {
  frequency: string;
  suggested_day: string;
  reason: string;
};

type IntelligenceJob = {
  job_id: string;
  name: string;
  description: string;
  enabled_by_default: boolean;
  cadence: Cadence;
  topic: string;
  focus: string;
  service?: string;
  approval_required: boolean;
  allowed_actions: string[];
  forbidden_actions: string[];
};

type JobsResponse = {
  ok: boolean;
  jobs: IntelligenceJob[];
};

type DryRunReport = {
  ok: boolean;
  job: IntelligenceJob;
  research_plan: {
    research_queries?: Array<{
      query: string;
      category: string;
      purpose: string;
    }>;
  };
  research_run: {
    ok?: boolean;
    error?: string;
    summary?: {
      provider?: string;
      result_count?: number;
      notes?: string[];
    };
  };
  analysis: {
    signal_summary?: {
      total_results?: number;
      categories?: Record<string, number>;
      notes?: string[];
    };
  };
  proposal_report: {
    summary: string;
    recommended_actions: Array<{
      action: string;
      type: string;
      requires_approval: boolean;
    }>;
    approval_required: boolean;
    forbidden_actions_respected: boolean;
  };
};

function joinList(items?: string[]) {
  return items?.length ? items.join(", ") : "None";
}

export default function IntelligencePage() {
  const [jobs, setJobs] = useState<IntelligenceJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState<DryRunReport | null>(null);
  const [dryRunError, setDryRunError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      setLoadingJobs(true);
      setJobsError(null);

      try {
        const response = await fetch(backendUrl("/api/intelligence/jobs"), {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => null)) as
          | JobsResponse
          | null;

        if (!response.ok || !data?.ok) {
          throw new Error("Could not load intelligence jobs.");
        }

        setJobs(data.jobs || []);
      } catch (err) {
        setJobsError(
          err instanceof Error ? err.message : "Could not load intelligence jobs.",
        );
      } finally {
        setLoadingJobs(false);
      }
    }

    loadJobs();
  }, []);

  async function runDryRun(jobId: string) {
    setActiveJobId(jobId);
    setDryRun(null);
    setDryRunError(null);

    try {
      const response = await fetch(
        backendUrl(`/api/intelligence/jobs/${encodeURIComponent(jobId)}/dry-run`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const data = (await response.json().catch(() => null)) as
        | DryRunReport
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error("Dry run failed.");
      }

      setDryRun(data);
    } catch (err) {
      setDryRunError(err instanceof Error ? err.message : "Dry run failed.");
    } finally {
      setActiveJobId(null);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold">Intelligence Jobs</h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-400">
            Read-only AI, SEO, local SEO, structured data, ads, and content
            strategy dry-runs for Turbo Services.
          </p>
        </header>

        {jobsError ? (
          <div className="border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {jobsError}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="flex flex-col gap-3">
            {loadingJobs ? (
              <div className="border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
                Loading jobs...
              </div>
            ) : null}

            {jobs.map((job) => (
              <article
                key={job.job_id}
                className="border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-neutral-500">
                      {job.job_id}
                    </div>
                    <h2 className="mt-1 text-lg font-medium text-neutral-100">
                      {job.name}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-300">
                      {job.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => runDryRun(job.job_id)}
                    disabled={activeJobId === job.job_id}
                    className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {activeJobId === job.job_id ? "Running..." : "Dry run"}
                  </button>
                </div>

                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase text-neutral-500">Cadence</dt>
                    <dd className="mt-1 text-neutral-200">
                      {job.cadence.frequency}, {job.cadence.suggested_day}
                    </dd>
                    <dd className="mt-1 text-neutral-400">
                      {job.cadence.reason}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-neutral-500">Topic</dt>
                    <dd className="mt-1 text-neutral-200">{job.topic}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-neutral-500">Focus</dt>
                    <dd className="mt-1 text-neutral-200">{job.focus}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-neutral-500">Service</dt>
                    <dd className="mt-1 text-neutral-200">
                      {job.service || "None"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-neutral-500">
                      Approval required
                    </dt>
                    <dd className="mt-1 text-neutral-200">
                      {String(job.approval_required)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-neutral-500">
                      Allowed actions
                    </dt>
                    <dd className="mt-1 text-neutral-200">
                      {joinList(job.allowed_actions)}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-xs uppercase text-neutral-500">
                      Forbidden actions
                    </dt>
                    <dd className="mt-1 text-neutral-200">
                      {joinList(job.forbidden_actions)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>

          <aside className="border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="text-lg font-medium">Dry-run result</h2>

            {dryRunError ? (
              <div className="mt-3 border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                {dryRunError}
              </div>
            ) : null}

            {!dryRun && !dryRunError ? (
              <p className="mt-3 text-sm text-neutral-400">
                Select a job dry run to view the read-only report.
              </p>
            ) : null}

            {dryRun ? (
              <div className="mt-4 flex flex-col gap-4 text-sm">
                <section>
                  <h3 className="text-xs uppercase text-neutral-500">
                    Research plan
                  </h3>
                  <p className="mt-1 text-neutral-200">
                    {dryRun.research_plan.research_queries?.length || 0} queries
                    prepared.
                  </p>
                </section>

                <section>
                  <h3 className="text-xs uppercase text-neutral-500">
                    Research run
                  </h3>
                  <dl className="mt-1 space-y-1 text-neutral-200">
                    <div>Status: {String(dryRun.research_run.ok)}</div>
                    <div>Error: {dryRun.research_run.error || "None"}</div>
                    <div>
                      Provider: {dryRun.research_run.summary?.provider || "None"}
                    </div>
                    <div>
                      Results: {dryRun.research_run.summary?.result_count || 0}
                    </div>
                  </dl>
                </section>

                <section>
                  <h3 className="text-xs uppercase text-neutral-500">
                    Analysis signals
                  </h3>
                  <p className="mt-1 text-neutral-200">
                    Total results:{" "}
                    {dryRun.analysis.signal_summary?.total_results || 0}
                  </p>
                  <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                    {JSON.stringify(
                      dryRun.analysis.signal_summary?.categories || {},
                      null,
                      2,
                    )}
                  </pre>
                </section>

                <section>
                  <h3 className="text-xs uppercase text-neutral-500">
                    Recommended actions
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {dryRun.proposal_report.recommended_actions.map(
                      (item, index) => (
                        <li
                          key={`${item.type}-${index}`}
                          className="border border-neutral-800 bg-neutral-950 p-3"
                        >
                          <div className="text-neutral-200">{item.action}</div>
                          <div className="mt-1 text-xs text-neutral-500">
                            {item.type} · approval required:{" "}
                            {String(item.requires_approval)}
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                </section>

                <section className="border-t border-neutral-800 pt-3">
                  <div>
                    Approval required:{" "}
                    {String(dryRun.proposal_report.approval_required)}
                  </div>
                  <div>
                    Forbidden actions respected:{" "}
                    {String(dryRun.proposal_report.forbidden_actions_respected)}
                  </div>
                </section>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
