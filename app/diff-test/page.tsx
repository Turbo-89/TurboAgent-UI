"use client";

import { useState } from "react";

export default function DiffTestPage() {
  const [file, setFile] = useState("app/diensten/ontstoppingen/scheldeland/page.tsx");
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  async function run() {
    setErr("");
    setOut(null);
    const r = await fetch("/api/diff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) setErr(JSON.stringify(data));
    else setOut(data);
  }

  return (
    <div style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600 }}>Diff test</h1>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, marginBottom: 6 }}>Repo file path</div>
        <input
          value={file}
          onChange={(e) => setFile(e.target.value)}
          style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          onClick={run}
          style={{ marginTop: 10, padding: "8px 12px", border: "1px solid #333", borderRadius: 6 }}
        >
          Get diff
        </button>
      </div>

      {err && (
        <pre style={{ marginTop: 12, color: "#b00", whiteSpace: "pre-wrap" }}>{err}</pre>
      )}

      {out && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 6 }}>
            has_changes: {String(out.has_changes)} — file: {out.file}
          </div>
          <pre style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6, overflowX: "auto" }}>
            {out.diff || "(no changes)"}
          </pre>
        </div>
      )}
    </div>
  );
}