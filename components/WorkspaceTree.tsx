"use client";

import { useEffect, useMemo, useState } from "react";

import { backendUrl } from "../lib/backend";

type FsRoot = {
  id: string;
  alias: string;
  label: string;
};

type FsRootResponse = {
  alias?: string;
  id?: string;
  label?: string;
};

type FsEntry = {
  name: string;
  path: string;
  dir: boolean;
  size?: number | null;
};

type RootsResponse = {
  ok: boolean;
  roots: FsRootResponse[];
};

type ListResponse = {
  ok: boolean;
  root: string;
  path: string;
  entries: FsEntry[];
};

type WorkspaceTreeProps = {
  onOpenFile: (rootAlias: string, path: string) => void;
  onAddContextFile?: (rootAlias: string, path: string) => void;
  selectedContextFiles?: { root: string; path: string }[];
  contextLimitReached?: boolean;
};

function parentPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return parts.join("/");
}

function normaliseRoots(roots: FsRootResponse[]): FsRoot[] {
  return roots
    .map((root) => {
      const id = root.alias || root.id || "";
      return {
        id,
        alias: id,
        label: root.label || root.alias || root.id || id,
      };
    })
    .filter((root) => root.id);
}

function formatFetchError({
  label,
  url,
  error,
  status,
  responseText,
}: {
  label: string;
  url: string;
  error: unknown;
  status?: number;
  responseText?: string;
}) {
  const details = {
    url,
    message: error instanceof Error ? error.message : String(error),
    status,
    responseText,
  };

  console.error(`WorkspaceTree ${label} fetch failed`, details);

  return [
    `${label} fetch failed`,
    `URL: ${details.url}`,
    `Error: ${details.message}`,
    typeof status === "number" ? `Status: ${status}` : null,
    responseText ? `Response: ${responseText}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function fileKey(root: string, path: string): string {
  return `${root}:${path}`;
}

export default function WorkspaceTree({
  onOpenFile,
  onAddContextFile,
  selectedContextFiles = [],
  contextLimitReached = false,
}: WorkspaceTreeProps) {
  const [roots, setRoots] = useState<FsRoot[]>([]);
  const [selectedRoot, setSelectedRoot] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [loadingRoots, setLoadingRoots] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRoots() {
      setLoadingRoots(true);
      setError(null);

      const url = backendUrl("/api/fs/roots");

      try {
        const response = await fetch(url, {
          cache: "no-store",
        });
        const responseText = await response.text();
        const data = JSON.parse(responseText || "null") as RootsResponse | null;

        if (!response.ok || !data?.ok) {
          throw new Error("Could not load workspace roots.");
        }

        if (!cancelled) {
          const normalisedRoots = normaliseRoots(data.roots);
          setRoots(normalisedRoots);
          setSelectedRoot(normalisedRoots[0]?.id || "");
          setCurrentPath("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatFetchError({ label: "roots", url, error: err }));
        }
      } finally {
        if (!cancelled) {
          setLoadingRoots(false);
        }
      }
    }

    loadRoots();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedRoot) {
      setEntries([]);
      return;
    }

    let cancelled = false;

    async function loadEntries() {
      setLoadingEntries(true);
      setError(null);

      const params = new URLSearchParams({
        root: selectedRoot,
        path: currentPath,
      });
      const url = backendUrl(`/api/fs/list?${params}`);

      try {
        const response = await fetch(url, {
          cache: "no-store",
        });
        const responseText = await response.text();
        const data = JSON.parse(responseText || "null") as
          | ListResponse
          | null;

        if (!response.ok || !data?.ok) {
          throw new Error("Could not load directory.");
        }

        if (!cancelled) {
          setEntries(data.entries);
        }
      } catch (err) {
        if (!cancelled) {
          setEntries([]);
          setError(formatFetchError({ label: "list", url, error: err }));
        }
      } finally {
        if (!cancelled) {
          setLoadingEntries(false);
        }
      }
    }

    loadEntries();

    return () => {
      cancelled = true;
    };
  }, [selectedRoot, currentPath]);

  const canGoUp = currentPath.length > 0;
  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.dir !== b.dir) return a.dir ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    [entries],
  );
  const selectedContextKeys = useMemo(
    () =>
      new Set(
        selectedContextFiles.map((file) => fileKey(file.root, file.path)),
      ),
    [selectedContextFiles],
  );

  return (
    <section className="flex h-full min-h-0 flex-col border border-neutral-800 bg-neutral-950 text-sm text-neutral-100">
      <div className="border-b border-neutral-800 p-3">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-400">
          Workspace root
        </label>
        <select
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-2 text-neutral-100 outline-none"
          value={selectedRoot}
          disabled={loadingRoots || roots.length === 0}
          onChange={(event) => {
            setSelectedRoot(event.target.value);
            setCurrentPath("");
          }}
        >
          {roots.length === 0 ? (
            <option value="">No roots</option>
          ) : (
            roots.map((root) => (
              <option key={root.id} value={root.id}>
                {root.label}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-800 p-3">
        <button
          type="button"
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canGoUp || loadingEntries}
          onClick={() => setCurrentPath(parentPath(currentPath))}
        >
          Up
        </button>
        <div className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-400">
          {currentPath || "/"}
        </div>
      </div>

      {error ? (
        <div className="border-b border-red-900 bg-red-950/40 p-3 text-red-200">
          {error}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto">
        {loadingRoots || loadingEntries ? (
          <div className="p-3 text-neutral-400">Loading...</div>
        ) : sortedEntries.length === 0 ? (
          <div className="p-3 text-neutral-500">No files</div>
        ) : (
          <ul className="divide-y divide-neutral-900">
            {sortedEntries.map((entry) => {
              const selected = selectedContextKeys.has(
                fileKey(selectedRoot, entry.path),
              );

              return (
                <li key={entry.path || entry.name}>
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-900">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => {
                        if (entry.dir) {
                          setCurrentPath(entry.path);
                        } else {
                          onOpenFile(selectedRoot, entry.path);
                        }
                      }}
                    >
                      <span className="w-5 shrink-0 text-neutral-500">
                        {entry.dir ? "dir" : "file"}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                      {!entry.dir && typeof entry.size === "number" ? (
                        <span className="shrink-0 text-xs text-neutral-500">
                          {entry.size.toLocaleString()} B
                        </span>
                      ) : null}
                    </button>
                    {!entry.dir && onAddContextFile ? (
                      <button
                        type="button"
                        className="shrink-0 rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-300 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={selected || contextLimitReached}
                        onClick={() => onAddContextFile(selectedRoot, entry.path)}
                      >
                        {selected ? "Selected" : "Add context"}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
