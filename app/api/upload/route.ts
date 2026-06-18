// C:\Projects\TurboAgent-UI\app\api\upload\route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.BACKEND_BASE_URL || "http://localhost:8000";
  const uploadPath = process.env.BACKEND_UPLOAD_PATH || "/api/documents/upload";

  const formData = await req.formData();
  const r = await fetch(`${base}${uploadPath}`, {
    method: "POST",
    body: formData,
  });

  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}