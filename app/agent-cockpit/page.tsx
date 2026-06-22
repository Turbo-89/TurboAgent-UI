"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { backendUrl } from "@/lib/backend";

type ServiceGuard = {
  canonical_service?: string;
  meaning?: string;
  positive_terms?: string[];
  excluded_terms?: string[];
};

type Readiness = {
  ok?: boolean;
  cockpit_status?: string;
  current_phase?: string;
  previous_phase?: string;
  completed_milestones?: string[];
  available_read_only_capabilities?: string[];
  blocked_actions?: string[];
  safety_statement?: string;
  recommended_next_work?: string[];
  service_guards?: Record<string, ServiceGuard>;
  execution_requires_human_approval?: boolean;
  site_write_access?: string;
  ads_ga4_write_access?: string;
  deploy_publish_access?: string;
};

type RunHistoryEvent = {
  event_id?: string;
  event_type?: string;
  created_at?: string;
  source?: string;
  actor?: string;
  related_opportunity_id?: string | null;
  related_plan_id?: string | null;
  related_draft_id?: string | null;
  related_review_id?: string | null;
  related_patch_proposal_id?: string | null;
  safety_state?: string;
  blocked_actions?: string[];
  notes?: string;
};

type RunHistory = {
  ok?: boolean;
  history_status?: string;
  current_phase?: string;
  purpose?: string;
  tracked_event_types?: string[];
  sample_events?: RunHistoryEvent[];
  audit_fields?: string[];
  blocked_actions?: string[];
  read_only_guarantees?: string[];
  next_recommended_step?: string;
};

type AuditEventResult = {
  ok?: boolean;
  audit_write_status?: string;
  event_id?: string;
  event_type?: string;
  created_at?: string;
  storage_path?: string;
  safety_state?: string;
  message?: string;
};

const navigationCards = [
  {
    href: "/opportunities",
    title: "Opportunities workflow",
    description: "Review scored landing page opportunities and read-only plans.",
  },
  {
    href: "/workspace-test",
    title: "Workspace test",
    description: "Inspect the read-only workspace file tree test page.",
  },
  {
    href: "/",
    title: "Home",
    description: "Return to the main UI entry point.",
  },
];

const operatorStatuses = [
  {
    label: "Current phase",
    value: "2D \u2014 Cockpit, status overview and operator control",
  },
  {
    label: "Previous phase",
    value: "2C \u2014 Opportunity to read-only patch preparation workflow",
  },
  {
    label: "Execution status",
    value: "blocked until explicit human approval",
  },
  {
    label: "Site write access",
    value: "disabled",
  },
  {
    label: "Ads/GA4 write access",
    value: "disabled",
  },
  {
    label: "Deploy/publish",
    value: "disabled",
  },
];

const workflowSections = [
  "Intelligence",
  "Landing page opportunities",
  "Implementation planning",
  "Draft/package/review",
  "Patch proposal",
  "Patch preparation package",
  "Human approval gates",
  "Blocked actions",
];

const completedMilestones = [
  "2C.2D opportunities UI",
  "2C.3A implementation plan endpoint",
  "2C.3B implementation plan UI",
  "2C.3C review/export UI",
  "2C.3D approval handoff UI",
  "2C.4A implementation draft endpoint",
  "2C.4B implementation draft UI",
  "2C.4C implementation package UI",
  "2C.4D final review endpoint",
  "2C.4E final review UI",
  "2C.5A patch proposal endpoint",
  "2C.5B patch proposal UI",
  "2C.5C patch proposal final approval UI",
  "2C.5D patch preparation package endpoint",
];

const allowedNow = [
  "review opportunities",
  "generate plans",
  "generate drafts",
  "generate reviews",
  "generate patch proposals",
  "copy packages for review",
];

const notAllowedYet = [
  "write files to turboservices",
  "deploy",
  "publish",
  "merge",
  "push-to-live",
  "change Ads",
  "change GA4",
];

const recommendedNextWork = [
  "Make cockpit status dynamic later",
  "Add backend health/readiness endpoint later",
  "Add operator run history later",
];

const blockedActions = [
  "no deploy",
  "no publish",
  "no file write to turboservices",
  "no merge",
  "no push-to-live",
  "no Google Ads changes",
  "no GA4 changes",
];

const roadmapPhases = [
  {
    phase: "2A \u2014 Local context discovery",
    status: "completed",
  },
  {
    phase: "2B \u2014 AI/SEO intelligence basis",
    status: "completed",
  },
  {
    phase: "2C \u2014 Opportunity to read-only patch preparation workflow",
    status: "completed",
  },
  {
    phase: "2D \u2014 Cockpit, status overview and operator control",
    status: "in progress / closing",
  },
];

const doNotExpandHere = [
  "no more extra approval layers",
  "no implementation in turboservices yet",
  "no deploy/publish logic",
  "no Ads/GA4 write logic",
];

const reviewFlowStatuses = [
  ["Review checklist endpoint", "available"],
  ["GitHub PR creation", "disabled"],
  ["Branch creation", "disabled"],
  ["Merge", "disabled"],
  ["Deploy/publish", "disabled"],
  ["Ads/GA4 changes", "disabled"],
];

const allowedIn2I = [
  "generate review checklist",
  "prepare draft PR title/body",
  "review proposed changed files",
  "review validation checklist",
  "review rollback checklist",
];

const notAllowedIn2I = [
  "create GitHub PR",
  "create branch",
  "commit",
  "push",
  "merge",
  "deploy",
  "publish",
  "change Ads",
  "change GA4",
];

const releaseSafetyStatuses = [
  ["Release checklist endpoint", "available"],
  ["Release execution", "disabled"],
  ["Deploy/publish", "disabled"],
  ["Merge", "disabled"],
  ["Push-to-live", "disabled"],
  ["GitHub mutation", "disabled"],
  ["Ads/GA4 changes", "disabled"],
];

const requiredBeforeRelease = [
  "changed files reviewed",
  "SEO reviewed",
  "content reviewed",
  "schema reviewed",
  "build validation reviewed",
  "rollback plan reviewed",
  "manual approval confirmed",
  "no Ads/GA4 changes included",
  "no GitHub mutation authorized yet",
  "no deploy authorized yet",
];

const blockedIn2J = [
  "release execution",
  "deploy",
  "publish",
  "merge",
  "push-to-live",
  "GitHub mutation",
  "branch creation",
  "staging",
  "commit",
  "file writes to turboservices",
  "Ads/GA4 changes",
];

const phase2CompletedBlocks = [
  "2A \u2014 Local context discovery",
  "2B \u2014 AI/SEO intelligence basis",
  "2C \u2014 Opportunity to read-only patch preparation workflow",
  "2D \u2014 Agent cockpit / operator overview",
  "2E \u2014 Operator run history scaffold",
  "2F \u2014 Local audit storage strategy",
  "2G \u2014 Local JSONL audit writer",
  "2H \u2014 Controlled turboservices patch preparation",
  "2I \u2014 Review / PR-flow preparation without live mutation",
  "2J \u2014 Release protocol and safety checklist",
];

const phase2Capabilities = [
  "scan local context",
  "identify landing page opportunities",
  "score opportunities",
  "generate implementation plans",
  "generate drafts/packages/reviews",
  "generate patch proposals",
  "generate turboservices target maps",
  "generate patch plans",
  "generate review checklist material",
  "generate release safety checklist material",
  "show cockpit status",
  "write explicit local audit events to JSONL",
];

const phase2StillBlocked = [
  "automatic deploy",
  "publish",
  "merge",
  "push-to-live",
  "automatic GitHub PR creation",
  "automatic branch creation",
  "automatic file writes to turboservices",
  "Google Ads changes",
  "GA4 changes",
  "Vercel production actions",
];

const runHistoryLimitations = [
  "no persistence yet",
  "no database yet",
  "no real operator history yet",
  "sample events only",
];

function listOrFallback(value: string[] | undefined): string[] {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function booleanLabel(value: boolean | undefined): string {
  if (value === true) return "true";
  if (value === false) return "false";
  return "unknown";
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString();
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-100">{value}</p>
    </article>
  );
}

function StatusIndicator({
  tone,
  label,
}: {
  tone: "ready" | "loading" | "error" | "fallback";
  label: string;
}) {
  const className =
    tone === "ready"
      ? "border-emerald-800 bg-emerald-950/40 text-emerald-100"
      : tone === "loading"
        ? "border-sky-800 bg-sky-950/40 text-sky-100"
        : tone === "error"
          ? "border-red-800 bg-red-950/40 text-red-100"
          : "border-amber-800 bg-amber-950/40 text-amber-100";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function CompactList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-sm text-neutral-500">No status data returned.</p>;
  }

  return (
    <ul className="space-y-2 text-sm text-neutral-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ServiceGuards({ guards }: { guards?: Record<string, ServiceGuard> }) {
  const entries = guards ? Object.entries(guards) : [];

  if (!entries.length) {
    return <p className="text-sm text-neutral-500">No service guards returned.</p>;
  }

  return (
    <div className="space-y-4">
      {entries.map(([name, guard]) => (
        <article
          key={name}
          className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4"
        >
          <p className="text-sm font-medium text-neutral-100">{name}</p>
          <p className="mt-2 text-xs text-neutral-500">
            Canonical service: {guard.canonical_service || "unknown"}
          </p>
          {guard.meaning ? (
            <p className="mt-3 text-sm text-neutral-300">{guard.meaning}</p>
          ) : null}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-400">
                Positive terms
              </p>
              <CompactList items={listOrFallback(guard.positive_terms)} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-red-300">
                Excluded terms
              </p>
              <CompactList items={listOrFallback(guard.excluded_terms)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function SampleEvents({ events }: { events?: RunHistoryEvent[] }) {
  if (!Array.isArray(events) || !events.length) {
    return <p className="text-sm text-neutral-500">No sample events returned.</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <article
          key={event.event_id || `sample-event-${index}`}
          className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-100">
                {event.event_type || "unknown event"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {event.event_id || "unknown id"}
              </p>
            </div>
            <span className="rounded-full border border-amber-800 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-100">
              static sample
            </span>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
            <p>Created: {event.created_at || "unknown"}</p>
            <p>Source: {event.source || "unknown"}</p>
            <p>Actor: {event.actor || "unknown"}</p>
            <p>Safety: {event.safety_state || "unknown"}</p>
            <p>Opportunity: {event.related_opportunity_id || "none"}</p>
            <p>Plan: {event.related_plan_id || "none"}</p>
            <p>Draft: {event.related_draft_id || "none"}</p>
            <p>Review: {event.related_review_id || "none"}</p>
            <p>Patch proposal: {event.related_patch_proposal_id || "none"}</p>
          </div>
          {event.notes ? (
            <p className="mt-3 text-sm text-neutral-400">{event.notes}</p>
          ) : null}
          <div className="mt-3">
            <p className="text-xs uppercase tracking-wide text-red-300">
              Blocked actions
            </p>
            <div className="mt-2">
              <CompactList items={listOrFallback(event.blocked_actions)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function AgentCockpitPage() {
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [lastRefreshFailed, setLastRefreshFailed] = useState("");
  const [runHistory, setRunHistory] = useState<RunHistory | null>(null);
  const [runHistoryLoading, setRunHistoryLoading] = useState(true);
  const [runHistoryError, setRunHistoryError] = useState("");
  const [lastRunHistoryRefreshed, setLastRunHistoryRefreshed] = useState("");
  const [lastRunHistoryRefreshFailed, setLastRunHistoryRefreshFailed] =
    useState("");
  const [auditEventLoading, setAuditEventLoading] = useState(false);
  const [auditEventError, setAuditEventError] = useState("");
  const [auditEventResult, setAuditEventResult] =
    useState<AuditEventResult | null>(null);

  const loadReadiness = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(backendUrl("/api/agent-cockpit/readiness"), {
        cache: "no-store",
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${text || response.statusText}`,
        );
      }

      setReadiness(data);
      setLastRefreshed(formatTimestamp(new Date()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch readiness.");
      setLastRefreshFailed(formatTimestamp(new Date()));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRunHistory = useCallback(async () => {
    setRunHistoryLoading(true);
    setRunHistoryError("");

    try {
      const response = await fetch(backendUrl("/api/agent-cockpit/run-history"), {
        cache: "no-store",
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${text || response.statusText}`,
        );
      }

      setRunHistory(data);
      setLastRunHistoryRefreshed(formatTimestamp(new Date()));
    } catch (err) {
      setRunHistoryError(
        err instanceof Error ? err.message : "Failed to fetch run history.",
      );
      setLastRunHistoryRefreshFailed(formatTimestamp(new Date()));
    } finally {
      setRunHistoryLoading(false);
    }
  }, []);

  const recordCockpitAuditEvent = useCallback(async () => {
    setAuditEventLoading(true);
    setAuditEventError("");
    setAuditEventResult(null);

    try {
      const response = await fetch(backendUrl("/api/agent-cockpit/audit-events"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "run_history_viewed",
          source: "agent_cockpit",
          actor: "operator",
          workflow_phase: "2G \u2014 Local audit writer",
          user_visible_summary:
            "Operator viewed the cockpit run history and readiness status.",
          notes: "Manual cockpit audit event. Local JSONL audit only.",
        }),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${text || response.statusText}`,
        );
      }

      setAuditEventResult(data);
    } catch (err) {
      setAuditEventError(
        err instanceof Error ? err.message : "Failed to record audit event.",
      );
    } finally {
      setAuditEventLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReadiness();
    loadRunHistory();
  }, [loadReadiness, loadRunHistory]);

  const liveStatusCards = readiness
    ? [
        ["Cockpit status", readiness.cockpit_status || "unknown"],
        ["Current phase", readiness.current_phase || "unknown"],
        ["Previous phase", readiness.previous_phase || "unknown"],
        [
          "Human approval required",
          booleanLabel(readiness.execution_requires_human_approval),
        ],
        ["Site write access", readiness.site_write_access || "unknown"],
        ["Ads/GA4 write access", readiness.ads_ga4_write_access || "unknown"],
        ["Deploy/publish access", readiness.deploy_publish_access || "unknown"],
      ]
    : [];
  const usingStaticFallback = Boolean(error || !readiness);

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-neutral-800 pb-5">
          <p className="text-sm uppercase tracking-wide text-emerald-400">
            Read-only workflow overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Turbo Agent Cockpit
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-400">
            This cockpit summarizes the current read-only marketing workflow.
          </p>
        </header>

        <section className="rounded-lg border border-emerald-900/70 bg-emerald-950/20 p-5">
          <h2 className="text-lg font-semibold text-emerald-200">
            Safety statement
          </h2>
          <p className="mt-2 text-sm text-emerald-100">
            {readiness?.safety_statement ||
              "The agent may propose and package work, but execution requires explicit human approval."}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-5">
            <h2 className="text-lg font-semibold">Roadmap status</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {roadmapPhases.map((item) => (
                <div
                  key={item.phase}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4"
                >
                  <p className="text-sm font-medium text-neutral-100">
                    {item.phase}
                  </p>
                  <p
                    className={`mt-2 text-xs font-medium ${
                      item.status === "completed"
                        ? "text-emerald-300"
                        : "text-sky-300"
                    }`}
                  >
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <div className="flex flex-col gap-6">
            <article className="rounded-lg border border-sky-900/70 bg-sky-950/20 p-5">
              <h2 className="text-lg font-semibold text-sky-200">
                Next phase candidate
              </h2>
              <p className="mt-3 text-sm font-medium text-sky-100">
                2E {"\u2014"} Operator run history and audit trail
              </p>
              <p className="mt-3 text-sm text-sky-100/80">
                The next useful phase should record what the agent proposed,
                reviewed and copied, without executing anything.
              </p>
            </article>

            <article className="rounded-lg border border-amber-900/70 bg-amber-950/20 p-5">
              <h2 className="text-lg font-semibold text-amber-200">
                Do not expand here
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-amber-100">
                {doNotExpandHere.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-sky-300">
                Live readiness status
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Backend cockpit readiness
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                Status only. Refreshing re-fetches readiness and does not run
                workflow actions.
              </p>
            </div>
            <button
              type="button"
              onClick={loadReadiness}
              disabled={loading}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh readiness"}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {loading ? (
              <StatusIndicator tone="loading" label="loading" />
            ) : error ? (
              <StatusIndicator tone="error" label="backend offline/error" />
            ) : readiness ? (
              <StatusIndicator tone="ready" label="backend online" />
            ) : null}
            {usingStaticFallback ? (
              <StatusIndicator tone="fallback" label="using static fallback context" />
            ) : (
              <StatusIndicator tone="fallback" label="static fallback available" />
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
              <h3 className="text-sm font-semibold">Backend source</h3>
              <p className="mt-3 text-sm text-neutral-300">
                Live data: GET /api/agent-cockpit/readiness
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                Fallback: static local cockpit content
              </p>
              {lastRefreshed ? (
                <p className="mt-3 text-xs text-emerald-300">
                  Last refreshed: {lastRefreshed}
                </p>
              ) : null}
              {lastRefreshFailed ? (
                <p className="mt-1 text-xs text-red-300">
                  Last refresh failed: {lastRefreshFailed}
                </p>
              ) : null}
            </article>

            <article className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
              <h3 className="text-sm font-semibold">Operator interpretation</h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                <li>Green/ready means read-only planning workflow is available.</li>
                <li>
                  Offline/error means cockpit fallback remains available, but
                  live backend readiness is unavailable.
                </li>
                <li>Execution is still blocked in all cases.</li>
              </ul>
            </article>
          </div>

          {loading ? (
            <p className="mt-5 text-sm text-neutral-400">Loading readiness...</p>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-lg border border-red-900/70 bg-red-950/20 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {readiness ? (
            <div className="mt-5 flex flex-col gap-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {liveStatusCards.map(([label, value]) => (
                  <StatusCard key={label} label={label} value={value} />
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <article>
                  <h3 className="text-sm font-semibold">
                    Completed milestones
                  </h3>
                  <div className="mt-3">
                    <CompactList
                      items={listOrFallback(readiness.completed_milestones)}
                    />
                  </div>
                </article>
                <article>
                  <h3 className="text-sm font-semibold">
                    Available read-only capabilities
                  </h3>
                  <div className="mt-3">
                    <CompactList
                      items={listOrFallback(
                        readiness.available_read_only_capabilities,
                      )}
                    />
                  </div>
                </article>
                <article>
                  <h3 className="text-sm font-semibold">Blocked actions</h3>
                  <div className="mt-3">
                    <CompactList items={listOrFallback(readiness.blocked_actions)} />
                  </div>
                </article>
                <article>
                  <h3 className="text-sm font-semibold">
                    Recommended next work
                  </h3>
                  <div className="mt-3">
                    <CompactList
                      items={listOrFallback(readiness.recommended_next_work)}
                    />
                  </div>
                </article>
              </div>

              <article>
                <h3 className="text-sm font-semibold">Service guards</h3>
                <div className="mt-3">
                  <ServiceGuards guards={readiness.service_guards} />
                </div>
              </article>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-violet-300">
                Operator run history
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Read-only run history scaffold
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                This section previews audit trail structure only. It does not
                persist events or execute workflow actions.
              </p>
            </div>
            <button
              type="button"
              onClick={loadRunHistory}
              disabled={runHistoryLoading}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {runHistoryLoading ? "Refreshing..." : "Refresh run history"}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {runHistoryLoading ? (
              <StatusIndicator tone="loading" label="loading" />
            ) : runHistoryError ? (
              <StatusIndicator tone="error" label="error/offline" />
            ) : runHistory ? (
              <StatusIndicator tone="ready" label="scaffold loaded" />
            ) : null}
            <StatusIndicator tone="fallback" label="static sample only" />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <article className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
              <h3 className="text-sm font-semibold">
                What this will track later
              </h3>
              <p className="mt-3 text-xs uppercase tracking-wide text-violet-300">
                Event types
              </p>
              <div className="mt-2">
                <CompactList
                  items={listOrFallback(runHistory?.tracked_event_types)}
                />
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide text-violet-300">
                Audit fields
              </p>
              <div className="mt-2">
                <CompactList items={listOrFallback(runHistory?.audit_fields)} />
              </div>
            </article>

            <article className="rounded-lg border border-amber-900/70 bg-amber-950/20 p-4">
              <h3 className="text-sm font-semibold text-amber-200">
                Current limitation
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-amber-100">
                {runHistoryLimitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {lastRunHistoryRefreshed ? (
                <p className="mt-4 text-xs text-emerald-300">
                  Last run history refresh: {lastRunHistoryRefreshed}
                </p>
              ) : null}
              {lastRunHistoryRefreshFailed ? (
                <p className="mt-1 text-xs text-red-300">
                  Last run history refresh failed: {lastRunHistoryRefreshFailed}
                </p>
              ) : null}
            </article>

            <article className="rounded-lg border border-sky-900/70 bg-sky-950/20 p-4">
              <h3 className="text-sm font-semibold text-sky-200">
                Next useful step
              </h3>
              <p className="mt-3 text-sm text-sky-100">
                Add local read-only event capture design before adding
                persistence.
              </p>
            </article>
          </div>

          {runHistoryLoading ? (
            <p className="mt-5 text-sm text-neutral-400">
              Loading run history...
            </p>
          ) : null}

          {runHistoryError ? (
            <div className="mt-5 rounded-lg border border-red-900/70 bg-red-950/20 p-4 text-sm text-red-100">
              {runHistoryError}
            </div>
          ) : null}

          {runHistory ? (
            <div className="mt-5 flex flex-col gap-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <StatusCard
                  label="History status"
                  value={runHistory.history_status || "unknown"}
                />
                <StatusCard
                  label="Current phase"
                  value={runHistory.current_phase || "unknown"}
                />
                <StatusCard
                  label="Next recommended step"
                  value={runHistory.next_recommended_step || "unknown"}
                />
              </div>

              <article className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
                <h3 className="text-sm font-semibold">Purpose</h3>
                <p className="mt-3 text-sm text-neutral-300">
                  {runHistory.purpose || "No purpose returned."}
                </p>
              </article>

              <div className="grid gap-5 lg:grid-cols-2">
                <article>
                  <h3 className="text-sm font-semibold">
                    Tracked event types
                  </h3>
                  <div className="mt-3">
                    <CompactList
                      items={listOrFallback(runHistory.tracked_event_types)}
                    />
                  </div>
                </article>
                <article>
                  <h3 className="text-sm font-semibold">Audit fields</h3>
                  <div className="mt-3">
                    <CompactList items={listOrFallback(runHistory.audit_fields)} />
                  </div>
                </article>
                <article>
                  <h3 className="text-sm font-semibold">Blocked actions</h3>
                  <div className="mt-3">
                    <CompactList
                      items={listOrFallback(runHistory.blocked_actions)}
                    />
                  </div>
                </article>
                <article>
                  <h3 className="text-sm font-semibold">
                    Read-only guarantees
                  </h3>
                  <div className="mt-3">
                    <CompactList
                      items={listOrFallback(runHistory.read_only_guarantees)}
                    />
                  </div>
                </article>
              </div>

              <article>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <h3 className="text-sm font-semibold">
                    Static sample events — no real audit log is stored yet
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Samples show shape only.
                  </p>
                </div>
                <div className="mt-3">
                  <SampleEvents events={runHistory.sample_events} />
                </div>
              </article>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-amber-900/70 bg-amber-950/20 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-amber-300">
                Local audit event
              </p>
              <h2 className="mt-1 text-lg font-semibold text-amber-100">
                Record cockpit view audit event
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-amber-100/80">
                This only writes a local audit event. It does not execute,
                deploy, publish, push, merge or change Ads/GA4.
              </p>
            </div>
            <button
              type="button"
              onClick={recordCockpitAuditEvent}
              disabled={auditEventLoading}
              className="rounded-md border border-amber-700 px-4 py-2 text-sm font-medium text-amber-100 transition hover:border-amber-500 hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {auditEventLoading
                ? "Recording..."
                : "Record cockpit view audit event"}
            </button>
          </div>

          {auditEventError ? (
            <div className="mt-5 rounded-lg border border-red-900/70 bg-red-950/40 p-4 text-sm text-red-100">
              {auditEventError}
            </div>
          ) : null}

          {auditEventResult ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatusCard
                label="Event id"
                value={auditEventResult.event_id || "unknown"}
              />
              <StatusCard
                label="Created at"
                value={auditEventResult.created_at || "unknown"}
              />
              <StatusCard
                label="Storage path"
                value={auditEventResult.storage_path || "unknown"}
              />
              <StatusCard
                label="Safety state"
                value={auditEventResult.safety_state || "unknown"}
              />
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-300">
              Review / PR-flow summary
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              Future turboservices review flow
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-neutral-400">
              Deze fase bereidt een review checklist en draft PR-tekst voor,
              maar maakt geen PR aan.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviewFlowStatuses.map(([label, value]) => (
              <StatusCard key={label} label={label} value={value} />
            ))}
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <article className="rounded-lg border border-emerald-900/70 bg-emerald-950/20 p-5">
              <h3 className="text-sm font-semibold text-emerald-200">
                Allowed in 2I
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-emerald-100">
                {allowedIn2I.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-red-900/70 bg-red-950/20 p-5">
              <h3 className="text-sm font-semibold text-red-200">
                Not allowed in 2I
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-red-100">
                {notAllowedIn2I.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-cyan-900/70 bg-cyan-950/20 p-5">
              <h3 className="text-sm font-semibold text-cyan-200">
                Safety statement
              </h3>
              <p className="mt-4 text-sm text-cyan-100">
                2I prepares review material only. PR creation requires explicit
                final approval.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-purple-300">
              Release safety summary
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              Future turboservices release safety
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-neutral-400">
              Deze fase definieert de veiligheidschecklist vóór een toekomstige
              release ooit mag doorgaan.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {releaseSafetyStatuses.map(([label, value]) => (
              <StatusCard key={label} label={label} value={value} />
            ))}
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <article className="rounded-lg border border-emerald-900/70 bg-emerald-950/20 p-5">
              <h3 className="text-sm font-semibold text-emerald-200">
                Required before release
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-emerald-100">
                {requiredBeforeRelease.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-red-900/70 bg-red-950/20 p-5">
              <h3 className="text-sm font-semibold text-red-200">
                Blocked in 2J
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-red-100">
                {blockedIn2J.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-purple-900/70 bg-purple-950/20 p-5">
              <h3 className="text-sm font-semibold text-purple-200">
                Safety statement
              </h3>
              <p className="mt-4 text-sm text-purple-100">
                2J defines release safety only. Release requires explicit final
                release approval.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-emerald-300">
                Phase 2 completion summary
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Phase 2 {"\u2014"} ready to close
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-neutral-400">
                Phase 2 leaves the agent in a controlled planning, review,
                audit and release-safety state. It can prepare work, but it
                cannot execute live changes.
              </p>
            </div>
            <StatusIndicator tone="ready" label="Phase 2 ready to close" />
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <article className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-5">
              <h3 className="text-sm font-semibold">Completed blocks</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                {phase2CompletedBlocks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-emerald-900/70 bg-emerald-950/20 p-5">
              <h3 className="text-sm font-semibold text-emerald-200">
                Current capabilities
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-emerald-100">
                {phase2Capabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-red-900/70 bg-red-950/20 p-5">
              <h3 className="text-sm font-semibold text-red-200">
                Still blocked
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-red-100">
                {phase2StillBlocked.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <article className="rounded-lg border border-sky-900/70 bg-sky-950/20 p-5">
              <h3 className="text-sm font-semibold text-sky-200">
                Recommended next phase
              </h3>
              <p className="mt-4 text-sm font-medium text-sky-100">
                Phase 3 {"\u2014"} Controlled implementation execution
              </p>
            </article>

            <article className="rounded-lg border border-amber-900/70 bg-amber-950/20 p-5">
              <h3 className="text-sm font-semibold text-amber-200">
                Safety statement
              </h3>
              <p className="mt-4 text-sm text-amber-100">
                Phase 3 may only start with explicit approval for local
                implementation execution. No live release is authorized by Phase
                2 completion.
              </p>
            </article>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Navigation</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {navigationCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-4 transition hover:border-neutral-600 hover:bg-neutral-900"
              >
                <p className="text-sm font-medium text-neutral-100">
                  {card.title}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Operator status</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operatorStatuses.map((status) => (
              <StatusCard
                key={status.label}
                label={status.label}
                value={status.value}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-lg border border-emerald-900/70 bg-emerald-950/20 p-5">
            <h2 className="text-lg font-semibold text-emerald-200">
              Allowed now
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-emerald-100">
              {allowedNow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-red-900/70 bg-red-950/20 p-5">
            <h2 className="text-lg font-semibold text-red-200">
              Not allowed yet
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-red-100">
              {notAllowedYet.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-sky-900/70 bg-sky-950/20 p-5">
            <h2 className="text-lg font-semibold text-sky-200">
              Recommended next work
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-sky-100">
              {recommendedNextWork.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflowSections.map((section) => (
            <article
              key={section}
              className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-4"
            >
              <p className="text-sm font-medium text-neutral-100">{section}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Status overview only. No execution controls.
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-5">
            <h2 className="text-lg font-semibold">Completed milestones</h2>
            <ul className="mt-4 grid gap-2 text-sm text-neutral-300 sm:grid-cols-2">
              {completedMilestones.map((milestone) => (
                <li key={milestone} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  <span>{milestone}</span>
                </li>
              ))}
            </ul>
          </article>

          <div className="flex flex-col gap-6">
            <article className="rounded-lg border border-sky-900/70 bg-sky-950/20 p-5">
              <h2 className="text-lg font-semibold text-sky-200">
                Next recommended phase
              </h2>
              <p className="mt-3 text-sm text-sky-100">
                2D {"\u2014"} Cockpit, status overview and operator control
              </p>
            </article>

            <article className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-5">
              <h2 className="text-lg font-semibold">Blocked actions</h2>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                {blockedActions.map((action) => (
                  <li key={action} className="flex gap-2">
                    <span className="text-red-300">Blocked:</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
