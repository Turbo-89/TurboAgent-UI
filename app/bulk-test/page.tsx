"use client";

import { useMemo, useState } from "react";

type BulkItem = {
  service: string;
  region: string;
  target: string;
  has_changes: boolean;
  diff?: string;
};

export default function BulkTestPage() {
  const [service, setService] = useState("ontstoppingen");
  const [region, setRegion] = useState("scheldeland");
  const [onlyChanged, setOnlyChanged] = useState(true);
  const [running, setRunning] = useState(false);

  const [result, setResult] = useState<{ ok?: boolean; count?: number; results?: BulkItem[] } | null>(null);
  const [error, setError] = useState<string>("");

  const filtered = useMemo(() => {
    const rows = result?.results || [];
    return onlyChanged ? rows.filter(r => r.has_changes) : rows;
  }, [result, onlyChanged]);

  async function run() {
    setRunning(true);
    setError("");
    setResult(null);

    const payload = {
      services: service ? [service] : null,
      regions: region ? [region] : null,
      include_diff: false,
    };

    const r = await fetch("/api/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) setError(JSON.stringify(data));
    else setResult(data);

    setRunning(false);
  }

  return (
    <div style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600 }}>Bulk generate (test)</h1>

      <div style={{ display: "grid", gap: 10, marginTop: 12, maxWidth: 720 }}>
        <label>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Service (leeg = alle)</div>
          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Regio slug (leeg = alle)</div>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} />
          <span>Toon enkel wijzigingen (has_changes=true)</span>
        </label>

        <button
          onClick={run}
          disabled={running}
          style={{ padding: "8px 12px", border: "1px solid #333", borderRadius: 6, width: 160 }}
        >
          {running ? "Running..." : "Run bulk"}
        </button>
      </div>

      {error && (
        <pre style={{ marginTop: 12, color: "#b00", whiteSpace: "pre-wrap" }}>{error}</pre>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            ok: {String(result.ok)} — count: {String(result.count)} — shown: {String(filtered.length)}
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 200px 120px 1fr", fontSize: 12, fontWeight: 600, background: "#f6f6f6", padding: 8 }}>
              <div>service</div>
              <div>region</div>
              <div>has_changes</div>
              <div>target</div>
            </div>

            {filtered.map((r, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "200px 200px 120px 1fr", fontSize: 12, padding: 8, borderTop: "1px solid #eee" }}>
                <div>{r.service}</div>
                <div>{r.region}</div>
                <div>{String(r.has_changes)}</div>
                <div style={{ wordBreak: "break-all" }}>{r.target}</div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ padding: 10, fontSize: 12 }}>Geen resultaten (of geen wijzigingen).</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}