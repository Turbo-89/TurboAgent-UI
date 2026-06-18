// C:\Projects\TurboAgent-UI\app\api\status\route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id") || "default";

  const base = process.env.BACKEND_BASE_URL || "http://localhost:8000";
  const r = await fetch(`${base}/api/status/${encodeURIComponent(session_id)}`, {
    cache: "no-store",
  });

  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}