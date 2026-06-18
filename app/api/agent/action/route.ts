import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { endpoint, args } = await req.json();

    // Beperkte veilige endpoints
    const allowed = ["deploy", "execute", "scan", "fix"];
    if (!allowed.includes(endpoint)) {
      return NextResponse.json(
        { error: "Forbidden endpoint" },
        { status: 403 }
      );
    }

    const res = await fetch(`http://localhost:8000/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args || {}),
    });

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
