import { NextResponse } from "next/server";

function extractReply(data: any): string {
  // voorkeur: bewezen backend structuur: result.result.response
  const r1 = data?.result?.response;
  if (typeof r1 === "string" && r1.trim()) return r1;

  const r2 = data?.result?.result?.response;
  if (typeof r2 === "string" && r2.trim()) return r2;

  // fallback: als backend ooit "reply" gebruikt
  const r3 = data?.reply;
  if (typeof r3 === "string" && r3.trim()) return r3;

  // laatste fallback: serialize
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const base = process.env.BACKEND_BASE_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json({ reply: extractReply(data), raw: data });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
