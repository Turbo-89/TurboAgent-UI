"use client";

import { FormEvent, useEffect, useState } from "react";

import { backendUrl } from "@/lib/backend";

type ProviderInfo = {
  available?: boolean;
  configured?: boolean;
  status?: string;
  notes?: string[];
};

type ProviderStatus = {
  google_ads?: ProviderInfo;
  ga4?: ProviderInfo;
};

type Opportunity = {
  type?: string;
  action_type?: string;
  score?: number;
  priority?: string;
  region?: string;
  reason?: string;
  notes?: string[];
  recommended_action?: string;
  expected_impact?: string;
  confidence?: string | number;
  approval_required?: boolean;
  score_breakdown?: Record<string, number>;
  evidence?: unknown;
  evidence_count?: number;
  sources?: string[];
  service_intent?: {
    canonical_service?: string;
    display_name?: string;
  };
};

type OpportunityResponse = {
  ok?: boolean;
  error?: string;
  dry_run?: boolean;
  read_live?: boolean;
  approval_required?: boolean;
  provider_status?: ProviderStatus;
  signals?: Array<Record<string, unknown>>;
  opportunities?: Opportunity[];
  notes?: string[];
};

type ImplementationPlan = {
  ok?: boolean;
  error?: string;
  opportunity_id?: string;
  action_type?: string;
  page_type?: string;
  service_intent?: {
    canonical_service?: string;
    display_name?: string;
    business_meaning?: string;
  };
  service_label?: string;
  region?: string;
  proposed_slug?: string;
  proposed_url_path?: string;
  seo_title?: string;
  meta_description?: string;
  h1?: string;
  h2_outline?: string[];
  content_outline?: string[];
  schema_plan?: string[];
  internal_links?: Array<Record<string, unknown>>;
  likely_turboservices_files?: Array<Record<string, unknown>>;
  validation_commands?: Array<Record<string, unknown>>;
  risks?: Array<Record<string, unknown>>;
  approval_gates?: string[];
  read_only_guarantees?: string[];
};

type ImplementationDraft = {
  ok?: boolean;
  error?: string;
  draft_id?: string;
  source_plan_id?: string;
  approval_summary?: Record<string, unknown>;
  proposed_files?: Array<Record<string, unknown>>;
  proposed_route_structure?: Record<string, unknown>;
  proposed_content_blocks?: Array<Record<string, unknown>>;
  proposed_seo_metadata?: Record<string, unknown>;
  proposed_schema_jsonld?: Record<string, unknown>;
  proposed_internal_links?: Array<Record<string, unknown>>;
  proposed_validation_plan?: Array<Record<string, unknown>>;
  risks?: Array<Record<string, unknown>>;
  blocked_actions?: string[];
  approval_gates?: string[];
  read_only_guarantees?: string[];
};

type ChecklistKey =
  | "planReviewed"
  | "seoReviewed"
  | "contentReviewed"
  | "schemaReviewed"
  | "linksReviewed"
  | "risksReviewed"
  | "approvalStillRequired";

type ReviewChecklist = Record<ChecklistKey, boolean>;

const CHECKLIST_ITEMS: Array<{ key: ChecklistKey; label: string }> = [
  { key: "planReviewed", label: "Plan reviewed" },
  { key: "seoReviewed", label: "SEO metadata reviewed" },
  { key: "contentReviewed", label: "Content outline reviewed" },
  { key: "schemaReviewed", label: "Schema plan reviewed" },
  { key: "linksReviewed", label: "Internal links reviewed" },
  { key: "risksReviewed", label: "Risks reviewed" },
  {
    key: "approvalStillRequired",
    label: "Explicit approval still required before implementation",
  },
];

const EMPTY_REVIEW_CHECKLIST: ReviewChecklist = {
  planReviewed: false,
  seoReviewed: false,
  contentReviewed: false,
  schemaReviewed: false,
  linksReviewed: false,
  risksReviewed: false,
  approvalStillRequired: false,
};

const SAMPLE_SIGNALS = JSON.stringify(
  [
    {
      source: "sample",
      type: "search_term",
      search_term: "rioolgeur Antwerpen rookdetectie",
      campaign: "Ontstopping Antwerpen",
      clicks: 12,
      impressions: 300,
      cost: 25,
      conversions: 2,
    },
    {
      source: "sample",
      type: "landing_page",
      landing_page_path: "/diensten/ontstopping-antwerpen",
      sessions: 60,
      users: 45,
      engagement_rate: 0.25,
      conversions: 0,
      source_medium: "google / organic",
    },
  ],
  null,
  2,
);

function boolText(value?: boolean) {
  return value === undefined ? "unknown" : String(value);
}

function providerLabel(info?: ProviderInfo) {
  if (!info) return "unknown";
  if (info.status) return info.status;
  if (info.available && info.configured) return "ready";
  if (info.available) return "available";
  return "not available";
}

function compactJson(value: unknown) {
  if (value === undefined || value === null) return "None";
  return JSON.stringify(value, null, 2);
}

function markdownValue(value: unknown): string {
  if (value === undefined || value === null) return "None";
  if (Array.isArray(value)) {
    if (!value.length) return "None";
    return value
      .map((item) =>
        typeof item === "string"
          ? `- ${item}`
          : `- \`${JSON.stringify(item)}\``,
      )
      .join("\n");
  }
  if (typeof value === "object") {
    return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
  }
  return String(value);
}

function opportunityServiceLabel(opportunity?: Opportunity | null) {
  if (!opportunity) return "None";
  return (
    opportunity.service_intent?.canonical_service ||
    opportunity.service_intent?.display_name ||
    "None"
  );
}

function isRookdetectiePlan(plan?: ImplementationPlan | null) {
  return plan?.service_intent?.canonical_service === "rookdetectie_geuropsporing";
}

function buildPlanMarkdown(
  opportunity: Opportunity | null,
  plan: ImplementationPlan,
) {
  const sections = [
    "# Landing Page Implementation Plan",
    "",
    "Planning review only. This is a proposed/read-only plan and does not approve implementation, file changes, deploys, publishing, merges, pushes, Ads changes, or GA4 changes.",
    "",
    "## Selected Opportunity",
    `- Type: ${opportunity?.type || opportunity?.action_type || "None"}`,
    `- Service: ${opportunityServiceLabel(opportunity)}`,
    `- Region: ${opportunity?.region || "None"}`,
    `- Score: ${opportunity?.score ?? "None"}`,
    `- Reason: ${opportunity?.reason || "None"}`,
    `- Notes: ${opportunity?.notes?.length ? opportunity.notes.join(", ") : "None"}`,
    "",
    "## Page Basics",
    `- Opportunity ID: ${plan.opportunity_id || "None"}`,
    `- Action type: ${plan.action_type || "None"}`,
    `- Page type: ${plan.page_type || "None"}`,
    `- Service label: ${plan.service_label || "None"}`,
    `- Region: ${plan.region || "None"}`,
    `- Proposed slug: ${plan.proposed_slug || "None"}`,
    `- Proposed URL path: ${plan.proposed_url_path || "None"}`,
    "",
    "## SEO Metadata",
    `- SEO title: ${plan.seo_title || "None"}`,
    `- Meta description: ${plan.meta_description || "None"}`,
    "",
    "## H1, H2, and Content Outline",
    `- H1: ${plan.h1 || "None"}`,
    "",
    "### H2 Outline",
    markdownValue(plan.h2_outline),
    "",
    "### Content Outline",
    markdownValue(plan.content_outline),
    "",
    "## Schema Plan",
    markdownValue(plan.schema_plan),
    "",
    "## Internal Links",
    markdownValue(plan.internal_links),
    "",
    "## Likely/Proposed Turbo Services Files",
    markdownValue(plan.likely_turboservices_files),
    "",
    "## Validation Commands",
    markdownValue(plan.validation_commands),
    "",
    "## Risks",
    markdownValue(plan.risks),
    "",
    "## Approval Gates",
    markdownValue(plan.approval_gates),
    "",
    "## Read-only Guarantees",
    markdownValue(plan.read_only_guarantees),
  ];

  if (isRookdetectiePlan(plan)) {
    sections.push(
      "",
      "## Rookdetectie Business Rule",
      "Turbo Services rookdetectie means rooktest/geuropsporing/rioolgeur/riolering/riool/afvoer. It does not mean rookmelders/brandveiligheid/branddetectie/brandalarm.",
    );
  }

  return sections.join("\n");
}

function buildApprovalChecklistMarkdown(
  opportunity: Opportunity | null,
  plan: ImplementationPlan,
) {
  return [
    "# Planning Approval Checklist",
    "",
    "Planning review only. Approval here is for planning review, not execution.",
    "",
    `- Opportunity: ${plan.opportunity_id || opportunity?.type || "None"}`,
    `- Service: ${plan.service_label || opportunityServiceLabel(opportunity)}`,
    `- Region: ${plan.region || opportunity?.region || "None"}`,
    "",
    "- [ ] Plan reviewed",
    "- [ ] SEO metadata reviewed",
    "- [ ] Content outline reviewed",
    "- [ ] Schema plan reviewed",
    "- [ ] Internal links reviewed",
    "- [ ] Risks reviewed",
    "- [ ] Explicit approval still required before implementation",
    "",
    "Approval gates:",
    markdownValue(plan.approval_gates),
    "",
    "Read-only guarantees:",
    markdownValue(plan.read_only_guarantees),
  ].join("\n");
}

function checklistMarkdown(checklist: ReviewChecklist) {
  return CHECKLIST_ITEMS.map(
    (item) => `- [${checklist[item.key] ? "x" : " "}] ${item.label}`,
  ).join("\n");
}

function missingChecklistItems(checklist: ReviewChecklist) {
  return CHECKLIST_ITEMS.filter((item) => !checklist[item.key]);
}

function buildHandoffBriefMarkdown(
  opportunity: Opportunity | null,
  plan: ImplementationPlan,
  checklist: ReviewChecklist,
  approvalTimestamp: string,
) {
  return [
    "# Implementation Plan Handoff Brief",
    "",
    "Planning review only. This handoff is not approval for file changes, deploy, publish, Ads changes, GA4 changes, merge, or push.",
    "",
    "## Selected Opportunity",
    `- Type: ${opportunity?.type || opportunity?.action_type || "None"}`,
    `- Service: ${plan.service_label || opportunityServiceLabel(opportunity)}`,
    `- Service intent: ${plan.service_intent?.canonical_service || opportunity?.service_intent?.canonical_service || "None"}`,
    `- Region: ${plan.region || opportunity?.region || "None"}`,
    `- Score: ${opportunity?.score ?? "None"}`,
    `- Reason: ${opportunity?.reason || "None"}`,
    "",
    "## Implementation Plan",
    `- Plan ID: ${plan.opportunity_id || "None"}`,
    `- Proposed slug: ${plan.proposed_slug || "None"}`,
    `- Proposed path: ${plan.proposed_url_path || "None"}`,
    "",
    "## Checklist Status",
    checklistMarkdown(checklist),
    "",
    "## Planning Approval",
    `- Approval timestamp: ${approvalTimestamp || "Not approved"}`,
    "- Status: Approved for next planning step only - no implementation authorized.",
    "- Next allowed step: prepare implementation draft only.",
    "",
    "## Explicit Non-Authorization",
    "This is not approval for file changes, deploy, publish, Ads changes, GA4 changes, merge, or push.",
  ].join("\n");
}

function buildImplementationDraftMarkdown(draft: ImplementationDraft) {
  return [
    "# Implementation Draft",
    "",
    "Draft only - no file changes, deploy, publish, Ads changes, GA4 changes, merge, or push authorized.",
    "",
    "## Draft IDs",
    `- Draft ID: ${draft.draft_id || "None"}`,
    `- Source plan ID: ${draft.source_plan_id || "None"}`,
    "",
    "## Approval Summary",
    markdownValue(draft.approval_summary),
    "",
    "## Proposed Files",
    markdownValue(draft.proposed_files),
    "",
    "## Proposed Route Structure",
    markdownValue(draft.proposed_route_structure),
    "",
    "## Proposed Content Blocks",
    markdownValue(draft.proposed_content_blocks),
    "",
    "## Proposed SEO Metadata",
    markdownValue(draft.proposed_seo_metadata),
    "",
    "## Proposed Schema JSON-LD",
    markdownValue(draft.proposed_schema_jsonld),
    "",
    "## Proposed Internal Links",
    markdownValue(draft.proposed_internal_links),
    "",
    "## Proposed Validation Plan",
    markdownValue(draft.proposed_validation_plan),
    "",
    "## Risks",
    markdownValue(draft.risks),
    "",
    "## Blocked Actions",
    markdownValue(draft.blocked_actions),
    "",
    "## Approval Gates",
    markdownValue(draft.approval_gates),
    "",
    "## Read-only Guarantees",
    markdownValue(draft.read_only_guarantees),
  ].join("\n");
}

function buildImplementationPackageMarkdown(
  opportunity: Opportunity | null,
  plan: ImplementationPlan,
  draft: ImplementationDraft,
) {
  return [
    "# Implementation Package",
    "",
    "This package is for later review only.",
    "No file changes are authorized.",
    "No deploy, publish, merge, or push is authorized.",
    "No Ads or GA4 changes are authorized.",
    "Next allowed step: implementation patch preparation only after explicit final approval.",
    "",
    "## Source Opportunity",
    `- Type: ${opportunity?.type || opportunity?.action_type || "None"}`,
    `- Service: ${plan.service_label || opportunityServiceLabel(opportunity)}`,
    `- Service intent: ${plan.service_intent?.canonical_service || opportunity?.service_intent?.canonical_service || "None"}`,
    `- Region: ${plan.region || opportunity?.region || "None"}`,
    `- Score: ${opportunity?.score ?? "None"}`,
    `- Reason: ${opportunity?.reason || "None"}`,
    "",
    "## IDs",
    `- Implementation plan ID: ${plan.opportunity_id || draft.source_plan_id || "None"}`,
    `- Implementation draft ID: ${draft.draft_id || "None"}`,
    "",
    "## Proposed File List",
    markdownValue(draft.proposed_files),
    "",
    "## Proposed Route / Path",
    markdownValue(draft.proposed_route_structure),
    "",
    "## SEO Metadata",
    markdownValue(draft.proposed_seo_metadata),
    "",
    "## Content Blocks Summary",
    markdownValue(draft.proposed_content_blocks),
    "",
    "## Schema Summary",
    markdownValue(draft.proposed_schema_jsonld),
    "",
    "## Validation Plan",
    markdownValue(draft.proposed_validation_plan),
    "",
    "## Blocked Actions",
    markdownValue(draft.blocked_actions),
    "",
    "## Required Final Approvals",
    markdownValue(draft.approval_gates),
    "",
    "## Read-only Guarantees",
    markdownValue(draft.read_only_guarantees),
  ].join("\n");
}

function textList(items?: string[]) {
  if (!items?.length) {
    return <p className="text-sm text-neutral-400">None</p>;
  }

  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-200">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export default function OpportunitiesPage() {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(
    null,
  );
  const [statusError, setStatusError] = useState<string | null>(null);
  const [service, setService] = useState("");
  const [region, setRegion] = useState("");
  const [maxOpportunities, setMaxOpportunities] = useState(10);
  const [readLive, setReadLive] = useState(false);
  const [sampleSignals, setSampleSignals] = useState("");
  const [scanResult, setScanResult] = useState<OpportunityResponse | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [implementationPlan, setImplementationPlan] =
    useState<ImplementationPlan | null>(null);
  const [implementationPlanError, setImplementationPlanError] = useState<
    string | null
  >(null);
  const [activePlanIndex, setActivePlanIndex] = useState<number | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [reviewChecklist, setReviewChecklist] = useState<ReviewChecklist>(
    EMPTY_REVIEW_CHECKLIST,
  );
  const [approvalTimestamp, setApprovalTimestamp] = useState<string | null>(null);
  const [implementationDraft, setImplementationDraft] =
    useState<ImplementationDraft | null>(null);
  const [implementationDraftError, setImplementationDraftError] = useState<
    string | null
  >(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const missingReviewItems = missingChecklistItems(reviewChecklist);
  const isReviewComplete = missingReviewItems.length === 0;

  useEffect(() => {
    async function loadStatus() {
      setStatusError(null);

      try {
        const response = await fetch(backendUrl("/api/opportunities/status"), {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => null)) as
          | { ok?: boolean; providers?: ProviderStatus }
          | null;

        if (!response.ok || !data?.ok) {
          throw new Error("Could not load provider status.");
        }

        setProviderStatus(data.providers || {});
      } catch (err) {
        setStatusError(
          err instanceof Error ? err.message : "Could not load provider status.",
        );
      }
    }

    loadStatus();
  }, []);

  async function runScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setImplementationPlan(null);
    setImplementationPlanError(null);
    setActivePlanIndex(null);
    setSelectedOpportunity(null);
    setCopyStatus(null);
    setCopyError(null);
    setApprovalTimestamp(null);
    setImplementationDraft(null);
    setImplementationDraftError(null);
    setIsGeneratingDraft(false);

    try {
      let parsedSampleSignals: unknown;
      if (sampleSignals.trim()) {
        parsedSampleSignals = JSON.parse(sampleSignals);
        if (!Array.isArray(parsedSampleSignals)) {
          throw new Error("sample_signals must be a JSON array.");
        }
      }

      const response = await fetch(
        backendUrl("/api/opportunities/landing-pages"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: service.trim() || undefined,
            region: region.trim() || undefined,
            max_opportunities: maxOpportunities,
            read_live: readLive,
            dry_run: true,
            sample_signals: parsedSampleSignals,
          }),
        },
      );
      const data = (await response.json().catch(() => null)) as
        | OpportunityResponse
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Opportunity scan failed.");
      }

      setScanResult(data);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Opportunity scan failed.");
    } finally {
      setIsScanning(false);
    }
  }

  async function loadImplementationPlan(
    opportunity: Opportunity,
    index: number,
  ) {
    setActivePlanIndex(index);
    setImplementationPlan(null);
    setImplementationPlanError(null);
    setSelectedOpportunity(opportunity);
    setCopyStatus(null);
    setCopyError(null);
    setApprovalTimestamp(null);
    setReviewChecklist(EMPTY_REVIEW_CHECKLIST);
    setImplementationDraft(null);
    setImplementationDraftError(null);
    setIsGeneratingDraft(false);

    try {
      const response = await fetch(
        backendUrl("/api/opportunities/landing-pages/implementation-plan"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opportunity),
        },
      );
      const data = (await response.json().catch(() => null)) as
        | ImplementationPlan
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Implementation plan failed.");
      }

      setImplementationPlan(data);
    } catch (err) {
      setImplementationPlanError(
        err instanceof Error ? err.message : "Implementation plan failed.",
      );
    } finally {
      setActivePlanIndex(null);
    }
  }

  async function copyTextToClipboard(text: string, successMessage: string) {
    setCopyStatus(null);
    setCopyError(null);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is not available in this browser.");
      }

      await navigator.clipboard.writeText(text);
      setCopyStatus(successMessage);
    } catch (err) {
      setCopyError(err instanceof Error ? err.message : "Clipboard copy failed.");
    }
  }

  function toggleChecklistItem(key: ChecklistKey) {
    setReviewChecklist((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setApprovalTimestamp(null);
    setImplementationDraft(null);
    setImplementationDraftError(null);
  }

  function approveForNextPlanningStep() {
    if (!isReviewComplete) return;
    setApprovalTimestamp(new Date().toLocaleString());
    setCopyStatus(null);
    setCopyError(null);
    setImplementationDraft(null);
    setImplementationDraftError(null);
  }

  async function generateImplementationDraft() {
    if (!implementationPlan || !approvalTimestamp) return;
    setIsGeneratingDraft(true);
    setImplementationDraft(null);
    setImplementationDraftError(null);
    setCopyStatus(null);
    setCopyError(null);

    const handoffBrief = buildHandoffBriefMarkdown(
      selectedOpportunity,
      implementationPlan,
      reviewChecklist,
      approvalTimestamp,
    );

    try {
      const response = await fetch(
        backendUrl("/api/opportunities/landing-pages/implementation-draft"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selected_opportunity: selectedOpportunity,
            implementation_plan: implementationPlan,
            handoff_brief: handoffBrief,
            approval_timestamp: approvalTimestamp,
            checklist_status: reviewChecklist,
          }),
        },
      );
      const data = (await response.json().catch(() => null)) as
        | ImplementationDraft
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Implementation draft failed.");
      }

      setImplementationDraft(data);
    } catch (err) {
      setImplementationDraftError(
        err instanceof Error ? err.message : "Implementation draft failed.",
      );
    } finally {
      setIsGeneratingDraft(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold">Landing Page Opportunities</h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-400">
            Read-only Google Ads and GA4 opportunity planning for Turbo Services
            landing pages.
          </p>
        </header>

        {statusError ? (
          <div className="border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {statusError}
          </div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2">
          {(["google_ads", "ga4"] as const).map((provider) => {
            const info = providerStatus?.[provider];
            return (
              <article
                key={provider}
                className="border border-neutral-800 bg-neutral-900 p-4"
              >
                <h2 className="text-lg font-medium">
                  {provider === "google_ads" ? "Google Ads" : "GA4"}
                </h2>
                <dl className="mt-3 grid gap-2 text-sm text-neutral-300">
                  <div>Status: {providerLabel(info)}</div>
                  <div>Available: {boolText(info?.available)}</div>
                  <div>Configured: {boolText(info?.configured)}</div>
                  <div>Notes: {info?.notes?.length ? info.notes.join(", ") : "None"}</div>
                </dl>
              </article>
            );
          })}
        </section>

        <div className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form
            onSubmit={runScan}
            className="flex flex-col gap-4 border border-neutral-800 bg-neutral-900 p-4"
          >
            <h2 className="text-lg font-medium">Scan settings</h2>

            <label className="text-sm">
              <span className="text-neutral-400">Service</span>
              <input
                value={service}
                onChange={(event) => setService(event.target.value)}
                className="mt-1 w-full border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
                placeholder="rookdetectie"
              />
            </label>

            <label className="text-sm">
              <span className="text-neutral-400">Region</span>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="mt-1 w-full border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
                placeholder="Antwerpen"
              />
            </label>

            <label className="text-sm">
              <span className="text-neutral-400">Max opportunities</span>
              <input
                type="number"
                min={1}
                max={50}
                value={maxOpportunities}
                onChange={(event) =>
                  setMaxOpportunities(Number(event.target.value) || 10)
                }
                className="mt-1 w-full border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={readLive}
                onChange={(event) => setReadLive(event.target.checked)}
                className="h-4 w-4"
              />
              Read live provider data
            </label>

            <section className="border-t border-neutral-800 pt-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium">Sample mode</h3>
                <button
                  type="button"
                  onClick={() => {
                    setService("rookdetectie");
                    setRegion("Antwerpen");
                    setSampleSignals(SAMPLE_SIGNALS);
                    setReadLive(false);
                  }}
                  className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-neutral-100 hover:bg-neutral-700"
                >
                  Load rioolgeur example
                </button>
              </div>

              <textarea
                value={sampleSignals}
                onChange={(event) => setSampleSignals(event.target.value)}
                className="mt-3 min-h-48 w-full border border-neutral-700 bg-neutral-950 p-3 font-mono text-xs text-neutral-100"
                placeholder="Paste sample_signals JSON array"
              />
            </section>

            <button
              type="submit"
              disabled={isScanning}
              className="border border-neutral-700 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-white disabled:cursor-wait disabled:opacity-60"
            >
              {isScanning ? "Running..." : "Run opportunity scan"}
            </button>
          </form>

          <section className="flex flex-col gap-4">
            {scanError ? (
              <div className="border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                {scanError}
              </div>
            ) : null}

            {!scanResult && !scanError ? (
              <div className="border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                Run a read-only scan to view provider status, signals, and scored
                opportunities.
              </div>
            ) : null}

            {scanResult ? (
              <>
                <article className="border border-neutral-800 bg-neutral-900 p-4 text-sm">
                  <h2 className="text-lg font-medium">Scan result</h2>
                  <dl className="mt-3 grid gap-2 text-neutral-300 md:grid-cols-3">
                    <div>dry_run: {String(scanResult.dry_run)}</div>
                    <div>read_live: {String(scanResult.read_live)}</div>
                    <div>
                      approval_required: {String(scanResult.approval_required)}
                    </div>
                  </dl>
                  <pre className="mt-3 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                    {compactJson(scanResult.provider_status)}
                  </pre>
                </article>

                <article className="border border-neutral-800 bg-neutral-900 p-4">
                  <h2 className="text-lg font-medium">
                    Signals ({scanResult.signals?.length || 0})
                  </h2>
                  <div className="mt-3 flex flex-col gap-2">
                    {(scanResult.signals || []).map((signal, index) => (
                      <pre
                        key={index}
                        className="overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300"
                      >
                        {compactJson(signal)}
                      </pre>
                    ))}
                    {!scanResult.signals?.length ? (
                      <p className="text-sm text-neutral-400">No signals returned.</p>
                    ) : null}
                  </div>
                </article>

                <article className="border border-neutral-800 bg-neutral-900 p-4">
                  <h2 className="text-lg font-medium">
                    Opportunities ({scanResult.opportunities?.length || 0})
                  </h2>
                  <div className="mt-3 flex flex-col gap-3">
                    {(scanResult.opportunities || []).map((opportunity, index) => (
                      <section
                        key={`${opportunity.type}-${index}`}
                        className="border border-neutral-800 bg-neutral-950 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="font-mono text-xs text-neutral-500">
                              {opportunity.type || "unknown"}
                            </div>
                            <h3 className="mt-1 text-lg font-medium">
                              Score {opportunity.score ?? "n/a"} -{" "}
                              {opportunity.priority || "unknown"}
                            </h3>
                          </div>
                          <div className="text-sm text-neutral-400">
                            approval_required:{" "}
                            {String(opportunity.approval_required)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => loadImplementationPlan(opportunity, index)}
                          disabled={activePlanIndex === index}
                          className="mt-4 border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-60"
                        >
                          {activePlanIndex === index
                            ? "Loading plan..."
                            : "Implementation plan"}
                        </button>

                        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                          <div>
                            <dt className="text-xs uppercase text-neutral-500">
                              Service
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {opportunity.service_intent?.canonical_service ||
                                "None"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase text-neutral-500">
                              Region
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {opportunity.region || "None"}
                            </dd>
                          </div>
                          <div className="md:col-span-2">
                            <dt className="text-xs uppercase text-neutral-500">
                              Reason
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {opportunity.reason || "None"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase text-neutral-500">
                              Recommended action
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {opportunity.recommended_action || "None"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase text-neutral-500">
                              Expected impact
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {opportunity.expected_impact || "None"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase text-neutral-500">
                              Confidence
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {opportunity.confidence ??
                                opportunity.score_breakdown?.confidence ??
                                "None"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase text-neutral-500">
                              Evidence
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {opportunity.evidence_count ?? "None"} items
                              {opportunity.sources?.length
                                ? ` from ${opportunity.sources.join(", ")}`
                                : ""}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div>
                            <h4 className="text-xs uppercase text-neutral-500">
                              Score breakdown
                            </h4>
                            <pre className="mt-2 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-300">
                              {compactJson(opportunity.score_breakdown)}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-xs uppercase text-neutral-500">
                              Evidence
                            </h4>
                            <pre className="mt-2 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-300">
                              {compactJson(opportunity.evidence)}
                            </pre>
                          </div>
                        </div>
                      </section>
                    ))}
                    {!scanResult.opportunities?.length ? (
                      <p className="text-sm text-neutral-400">
                        No opportunities returned.
                      </p>
                    ) : null}
                  </div>
                </article>

                <article className="border border-neutral-800 bg-neutral-900 p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <h2 className="text-lg font-medium">
                        Proposed implementation plan
                      </h2>
                      <span className="w-fit border border-amber-800 bg-amber-950/40 px-3 py-1 text-xs uppercase text-amber-100">
                        Planning review only
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      Read-only proposal only. This page does not write files,
                      deploy, publish, merge, push, change Ads, or change GA4.
                    </p>
                  </div>

                  {implementationPlanError ? (
                    <div className="mt-3 border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                      {implementationPlanError}
                    </div>
                  ) : null}

                  {!implementationPlan && !implementationPlanError ? (
                    <p className="mt-3 text-sm text-neutral-400">
                      Select an opportunity implementation plan to review the
                      proposed page work.
                    </p>
                  ) : null}

                  {implementationPlan ? (
                    <div className="mt-4 flex flex-col gap-4">
                      <section className="border border-neutral-800 bg-neutral-950 p-4">
                        <h3 className="text-sm font-medium">
                          Selected opportunity
                        </h3>
                        <dl className="mt-3 grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
                          <div>
                            type/action_type:{" "}
                            {selectedOpportunity?.type ||
                              selectedOpportunity?.action_type ||
                              "None"}
                          </div>
                          <div>
                            service:{" "}
                            {implementationPlan.service_label ||
                              opportunityServiceLabel(selectedOpportunity)}
                          </div>
                          <div>
                            service_intent:{" "}
                            {implementationPlan.service_intent
                              ?.canonical_service ||
                              selectedOpportunity?.service_intent
                                ?.canonical_service ||
                              "None"}
                          </div>
                          <div>
                            region:{" "}
                            {selectedOpportunity?.region ||
                              implementationPlan.region ||
                              "None"}
                          </div>
                          <div>
                            score: {selectedOpportunity?.score ?? "None"}
                          </div>
                          <div className="md:col-span-2">
                            reason/notes:{" "}
                            {selectedOpportunity?.reason ||
                              selectedOpportunity?.notes?.join(", ") ||
                              "None"}
                          </div>
                        </dl>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              copyTextToClipboard(
                                buildPlanMarkdown(
                                  selectedOpportunity,
                                  implementationPlan,
                                ),
                                "Plan copied as Markdown.",
                              )
                            }
                            className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-700"
                          >
                            Copy plan as Markdown
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              copyTextToClipboard(
                                buildApprovalChecklistMarkdown(
                                  selectedOpportunity,
                                  implementationPlan,
                                ),
                                "Approval checklist copied.",
                              )
                            }
                            className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-700"
                          >
                            Copy approval checklist
                          </button>
                        </div>

                        {copyStatus ? (
                          <div className="mt-3 border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-100">
                            {copyStatus}
                          </div>
                        ) : null}
                        {copyError ? (
                          <div className="mt-3 border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                            {copyError}
                          </div>
                        ) : null}
                      </section>

                      <section className="border border-neutral-800 bg-neutral-950 p-4">
                        <h3 className="text-sm font-medium">
                          Planning review checklist
                        </h3>
                        <div className="mt-3 grid gap-2 text-sm text-neutral-200 md:grid-cols-2">
                          {CHECKLIST_ITEMS.map((item) => (
                            <label
                              key={item.key}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={reviewChecklist[item.key]}
                                onChange={() => toggleChecklistItem(item.key)}
                                className="h-4 w-4"
                              />
                              {item.label}
                            </label>
                          ))}
                        </div>
                      </section>

                      <section className="border border-neutral-800 bg-neutral-950 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-sm font-medium">
                              Approval-state handoff
                            </h3>
                            <p className="mt-1 text-sm text-neutral-400">
                              Local planning approval only. No implementation,
                              file changes, deploy, publish, merge, push, Ads,
                              or GA4 action is authorized.
                            </p>
                          </div>
                          <span className="w-fit border border-amber-800 bg-amber-950/40 px-3 py-1 text-xs uppercase text-amber-100">
                            Read-only local state
                          </span>
                        </div>

                        {!isReviewComplete ? (
                          <div className="mt-4 border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-300">
                            <div className="font-medium text-neutral-100">
                              Missing checklist items
                            </div>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {missingReviewItems.map((item) => (
                                <li key={item.key}>{item.label}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={approveForNextPlanningStep}
                            disabled={!isReviewComplete}
                            className="border border-neutral-700 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                          >
                            Approve for next planning step
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              copyTextToClipboard(
                                buildHandoffBriefMarkdown(
                                  selectedOpportunity,
                                  implementationPlan,
                                  reviewChecklist,
                                  approvalTimestamp || "Not approved",
                                ),
                                "Handoff brief copied.",
                              )
                            }
                            className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-700"
                          >
                            Copy handoff brief
                          </button>
                        </div>

                        {approvalTimestamp ? (
                          <div className="mt-4 border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-100">
                            Approved for next planning step only - no
                            implementation authorized.
                            <div className="mt-1 text-emerald-200">
                              Approval timestamp: {approvalTimestamp}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-neutral-400">
                            No planning approval recorded in this local UI
                            state.
                          </p>
                        )}
                      </section>

                      <section className="border border-neutral-800 bg-neutral-950 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-sm font-medium">
                              Implementation draft
                            </h3>
                            <p className="mt-1 text-sm text-neutral-400">
                              Draft only - no file changes, deploy, publish,
                              Ads, GA4, merge, or push authorized.
                            </p>
                          </div>
                          <span className="w-fit border border-amber-800 bg-amber-950/40 px-3 py-1 text-xs uppercase text-amber-100">
                            Read-only draft
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={generateImplementationDraft}
                            disabled={!approvalTimestamp || isGeneratingDraft}
                            className="border border-neutral-700 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                          >
                            {isGeneratingDraft
                              ? "Generating draft..."
                              : "Generate implementation draft"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              implementationDraft
                                ? copyTextToClipboard(
                                    buildImplementationDraftMarkdown(
                                      implementationDraft,
                                    ),
                                    "Implementation draft copied as Markdown.",
                                  )
                                : undefined
                            }
                            disabled={!implementationDraft}
                            className="border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Copy implementation draft as Markdown
                          </button>
                        </div>

                        {!approvalTimestamp ? (
                          <p className="mt-3 text-sm text-neutral-400">
                            Local approval for the next planning step is
                            required before a draft can be requested.
                          </p>
                        ) : null}

                        {implementationDraftError ? (
                          <div className="mt-3 border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                            {implementationDraftError}
                          </div>
                        ) : null}

                        {implementationDraft ? (
                          <div className="mt-4 flex flex-col gap-4">
                            <section className="border border-neutral-800 bg-neutral-900 p-4">
                              <h4 className="text-sm font-medium">
                                Draft id / source plan id
                              </h4>
                              <dl className="mt-3 grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
                                <div>
                                  draft_id: {implementationDraft.draft_id || "None"}
                                </div>
                                <div>
                                  source_plan_id:{" "}
                                  {implementationDraft.source_plan_id || "None"}
                                </div>
                              </dl>
                            </section>

                            <section className="border border-neutral-800 bg-neutral-900 p-4">
                              <h4 className="text-sm font-medium">
                                Approval summary
                              </h4>
                              <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                {compactJson(
                                  implementationDraft.approval_summary,
                                )}
                              </pre>
                            </section>

                            <section className="border border-neutral-800 bg-neutral-900 p-4">
                              <h4 className="text-sm font-medium">
                                Proposed files
                              </h4>
                              <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                {compactJson(implementationDraft.proposed_files)}
                              </pre>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                              <div className="border border-neutral-800 bg-neutral-900 p-4">
                                <h4 className="text-sm font-medium">
                                  Proposed route structure
                                </h4>
                                <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                  {compactJson(
                                    implementationDraft.proposed_route_structure,
                                  )}
                                </pre>
                              </div>
                              <div className="border border-neutral-800 bg-neutral-900 p-4">
                                <h4 className="text-sm font-medium">
                                  Proposed SEO metadata
                                </h4>
                                <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                  {compactJson(
                                    implementationDraft.proposed_seo_metadata,
                                  )}
                                </pre>
                              </div>
                            </section>

                            <section className="border border-neutral-800 bg-neutral-900 p-4">
                              <h4 className="text-sm font-medium">
                                Proposed content blocks
                              </h4>
                              <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                {compactJson(
                                  implementationDraft.proposed_content_blocks,
                                )}
                              </pre>
                            </section>

                            <section className="border border-neutral-800 bg-neutral-900 p-4">
                              <h4 className="text-sm font-medium">
                                Proposed schema JSON-LD
                              </h4>
                              <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                {compactJson(
                                  implementationDraft.proposed_schema_jsonld,
                                )}
                              </pre>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                              <div className="border border-neutral-800 bg-neutral-900 p-4">
                                <h4 className="text-sm font-medium">
                                  Proposed internal links
                                </h4>
                                <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                  {compactJson(
                                    implementationDraft.proposed_internal_links,
                                  )}
                                </pre>
                              </div>
                              <div className="border border-neutral-800 bg-neutral-900 p-4">
                                <h4 className="text-sm font-medium">
                                  Proposed validation plan
                                </h4>
                                <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                  {compactJson(
                                    implementationDraft.proposed_validation_plan,
                                  )}
                                </pre>
                              </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                              <div className="border border-neutral-800 bg-neutral-900 p-4">
                                <h4 className="text-sm font-medium">Risks</h4>
                                <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                  {compactJson(implementationDraft.risks)}
                                </pre>
                              </div>
                              <div className="border border-neutral-800 bg-neutral-900 p-4">
                                <h4 className="text-sm font-medium">
                                  Blocked actions
                                </h4>
                                {textList(implementationDraft.blocked_actions)}
                              </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                              <div className="border border-neutral-800 bg-neutral-900 p-4">
                                <h4 className="text-sm font-medium">
                                  Approval gates
                                </h4>
                                {textList(implementationDraft.approval_gates)}
                              </div>
                              <div className="border border-neutral-800 bg-neutral-900 p-4">
                                <h4 className="text-sm font-medium">
                                  Read-only guarantees
                                </h4>
                                {textList(
                                  implementationDraft.read_only_guarantees,
                                )}
                              </div>
                            </section>

                            <section className="border border-neutral-800 bg-neutral-900 p-4">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Implementation package
                                  </h4>
                                  <p className="mt-1 text-sm text-neutral-400">
                                    Structured review package for later explicit
                                    implementation approval only.
                                  </p>
                                </div>
                                <span className="w-fit border border-red-900 bg-red-950/40 px-3 py-1 text-xs uppercase text-red-100">
                                  This package is not an execution command.
                                </span>
                              </div>

                              <div className="mt-4 border border-amber-900 bg-amber-950/30 p-3 text-sm text-amber-100">
                                This package is for review only. No file
                                changes, deploy, publish, merge, push, Ads
                                changes, or GA4 changes are authorized.
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  copyTextToClipboard(
                                    buildImplementationPackageMarkdown(
                                      selectedOpportunity,
                                      implementationPlan,
                                      implementationDraft,
                                    ),
                                    "Implementation package copied.",
                                  )
                                }
                                className="mt-4 border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-700"
                              >
                                Copy implementation package
                              </button>

                              <dl className="mt-4 grid gap-3 text-sm text-neutral-300 md:grid-cols-2">
                                <div>
                                  <dt className="text-xs uppercase text-neutral-500">
                                    Source opportunity
                                  </dt>
                                  <dd className="mt-1 text-neutral-200">
                                    {selectedOpportunity?.type ||
                                      selectedOpportunity?.action_type ||
                                      "None"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs uppercase text-neutral-500">
                                    Implementation plan ID
                                  </dt>
                                  <dd className="mt-1 text-neutral-200">
                                    {implementationPlan.opportunity_id ||
                                      implementationDraft.source_plan_id ||
                                      "None"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs uppercase text-neutral-500">
                                    Implementation draft ID
                                  </dt>
                                  <dd className="mt-1 text-neutral-200">
                                    {implementationDraft.draft_id || "None"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs uppercase text-neutral-500">
                                    Proposed route/path
                                  </dt>
                                  <dd className="mt-1 text-neutral-200">
                                    {String(
                                      implementationDraft
                                        .proposed_route_structure?.route_path ||
                                        implementationDraft
                                          .proposed_route_structure?.slug ||
                                        "None",
                                    )}
                                  </dd>
                                </div>
                              </dl>

                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                  <h5 className="text-xs uppercase text-neutral-500">
                                    Proposed file list
                                  </h5>
                                  <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                    {compactJson(
                                      implementationDraft.proposed_files,
                                    )}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="text-xs uppercase text-neutral-500">
                                    SEO metadata
                                  </h5>
                                  <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                    {compactJson(
                                      implementationDraft.proposed_seo_metadata,
                                    )}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="text-xs uppercase text-neutral-500">
                                    Content blocks summary
                                  </h5>
                                  <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                    {compactJson(
                                      implementationDraft.proposed_content_blocks,
                                    )}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="text-xs uppercase text-neutral-500">
                                    Schema summary
                                  </h5>
                                  <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                    {compactJson(
                                      implementationDraft.proposed_schema_jsonld,
                                    )}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="text-xs uppercase text-neutral-500">
                                    Validation plan
                                  </h5>
                                  <pre className="mt-2 overflow-auto bg-neutral-950 p-3 text-xs text-neutral-300">
                                    {compactJson(
                                      implementationDraft
                                        .proposed_validation_plan,
                                    )}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="text-xs uppercase text-neutral-500">
                                    Blocked actions
                                  </h5>
                                  {textList(implementationDraft.blocked_actions)}
                                </div>
                                <div className="md:col-span-2">
                                  <h5 className="text-xs uppercase text-neutral-500">
                                    Required final approvals
                                  </h5>
                                  {textList(implementationDraft.approval_gates)}
                                </div>
                              </div>
                            </section>
                          </div>
                        ) : null}
                      </section>

                      <section className="border border-neutral-800 bg-neutral-950 p-4">
                        <h3 className="text-sm font-medium">Page basics</h3>
                        <dl className="mt-3 grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
                          <div>opportunity_id: {implementationPlan.opportunity_id || "None"}</div>
                          <div>action_type: {implementationPlan.action_type || "None"}</div>
                          <div>page_type: {implementationPlan.page_type || "None"}</div>
                          <div>service_label: {implementationPlan.service_label || "None"}</div>
                          <div>region: {implementationPlan.region || "None"}</div>
                          <div>proposed_slug: {implementationPlan.proposed_slug || "None"}</div>
                          <div className="md:col-span-2">
                            proposed_url_path:{" "}
                            {implementationPlan.proposed_url_path || "None"}
                          </div>
                        </dl>

                        {implementationPlan.service_intent?.canonical_service ===
                        "rookdetectie_geuropsporing" ? (
                          <div className="mt-4 border border-amber-900 bg-amber-950/30 p-3 text-sm text-amber-100">
                            Turbo Services rookdetectie means rooktest,
                            geuropsporing, rioolgeur, riolering, riool, and
                            afvoer. It does not mean rookmelders,
                            brandveiligheid, branddetectie, or brandalarm.
                          </div>
                        ) : null}
                      </section>

                      <section className="border border-neutral-800 bg-neutral-950 p-4">
                        <h3 className="text-sm font-medium">SEO metadata</h3>
                        <dl className="mt-3 grid gap-3 text-sm">
                          <div>
                            <dt className="text-xs uppercase text-neutral-500">
                              SEO title
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {implementationPlan.seo_title || "None"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase text-neutral-500">
                              Meta description
                            </dt>
                            <dd className="mt-1 text-neutral-200">
                              {implementationPlan.meta_description || "None"}
                            </dd>
                          </div>
                        </dl>
                      </section>

                      <section className="border border-neutral-800 bg-neutral-950 p-4">
                        <h3 className="text-sm font-medium">
                          H1, H2, and content outline
                        </h3>
                        <div className="mt-3 text-sm text-neutral-200">
                          H1: {implementationPlan.h1 || "None"}
                        </div>
                        <h4 className="mt-4 text-xs uppercase text-neutral-500">
                          H2 outline
                        </h4>
                        {textList(implementationPlan.h2_outline)}
                        <h4 className="mt-4 text-xs uppercase text-neutral-500">
                          Content outline
                        </h4>
                        {textList(implementationPlan.content_outline)}
                      </section>

                      <section className="grid gap-4 md:grid-cols-2">
                        <div className="border border-neutral-800 bg-neutral-950 p-4">
                          <h3 className="text-sm font-medium">Schema plan</h3>
                          {textList(implementationPlan.schema_plan)}
                        </div>
                        <div className="border border-neutral-800 bg-neutral-950 p-4">
                          <h3 className="text-sm font-medium">Internal links</h3>
                          <pre className="mt-2 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-300">
                            {compactJson(implementationPlan.internal_links)}
                          </pre>
                        </div>
                      </section>

                      <section className="border border-neutral-800 bg-neutral-950 p-4">
                        <h3 className="text-sm font-medium">
                          Likely/proposed Turbo Services files
                        </h3>
                        <pre className="mt-2 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-300">
                          {compactJson(
                            implementationPlan.likely_turboservices_files,
                          )}
                        </pre>
                      </section>

                      <section className="grid gap-4 md:grid-cols-2">
                        <div className="border border-neutral-800 bg-neutral-950 p-4">
                          <h3 className="text-sm font-medium">
                            Validation commands
                          </h3>
                          <pre className="mt-2 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-300">
                            {compactJson(implementationPlan.validation_commands)}
                          </pre>
                        </div>
                        <div className="border border-neutral-800 bg-neutral-950 p-4">
                          <h3 className="text-sm font-medium">Risks</h3>
                          <pre className="mt-2 overflow-auto bg-neutral-900 p-3 text-xs text-neutral-300">
                            {compactJson(implementationPlan.risks)}
                          </pre>
                        </div>
                      </section>

                      <section className="grid gap-4 md:grid-cols-2">
                        <div className="border border-neutral-800 bg-neutral-950 p-4">
                          <h3 className="text-sm font-medium">Approval gates</h3>
                          {textList(implementationPlan.approval_gates)}
                        </div>
                        <div className="border border-neutral-800 bg-neutral-950 p-4">
                          <h3 className="text-sm font-medium">
                            Read-only guarantees
                          </h3>
                          {textList(implementationPlan.read_only_guarantees)}
                        </div>
                      </section>
                    </div>
                  ) : null}
                </article>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
