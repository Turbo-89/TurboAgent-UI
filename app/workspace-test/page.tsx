"use client";

import { useState } from "react";

import WorkspaceTree from "@/components/WorkspaceTree";
import { backendUrl } from "@/lib/backend";

type ReadResponse = {
  ok: boolean;
  root: string;
  path: string;
  content: string;
};

export default function WorkspaceTestPage() {
  const [openedPath, setOpenedPath] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openFile(rootAlias: string, path: string) {
    setOpenedPath(`${rootAlias}:${path}`);
    setContent("");
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      root: rootAlias,
      path,
    });

    try {
      const response = await fetch(backendUrl(`/api/fs/read?${params}`), {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as
        | ReadResponse
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error("Could not read file.");
      }

      setOpenedPath(`${data.root}:${data.path}`);
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid h-full min-h-[600px] grid-cols-[320px_minmax(0,1fr)] gap-4">
      <WorkspaceTree onOpenFile={openFile} />

      <section className="flex min-h-0 flex-col border border-neutral-800 bg-neutral-950 text-neutral-100">
        <div className="border-b border-neutral-800 p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Open file
          </div>
          <div className="mt-1 truncate font-mono text-sm text-neutral-200">
            {openedPath || "No file selected"}
          </div>
        </div>

        {error ? (
          <div className="border-b border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-sm leading-6 text-neutral-200">
          {loading ? "Loading..." : content}
        </pre>
      </section>
    </div>
  );
}
