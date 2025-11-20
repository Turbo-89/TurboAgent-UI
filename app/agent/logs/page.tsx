"use client";
import useSWR from "swr";

const fetcher = (u) => fetch(u).then(r => r.json());

export default function LogsPage() {
  const { data } = useSWR("/api/agent/logs", fetcher, { refreshInterval: 2500 });

  return (
    <div className="p-6">
      <pre className="bg-neutral-800 p-4 rounded h-[90vh] overflow-auto text-sm">
        {data?.log || ""}
      </pre>
    </div>
  );
}
