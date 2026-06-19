import Link from "next/link";

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

export default function AgentCockpitPage() {
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
            The agent may propose and package work, but execution requires
            explicit human approval.
          </p>
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
              <article
                key={status.label}
                className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  {status.label}
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-100">
                  {status.value}
                </p>
              </article>
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
