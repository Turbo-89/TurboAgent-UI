import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json();

  const r = await axios.post("http://localhost:8000/chat", {
    message: body.message
  });

  return NextResponse.json({ reply: r.data.reply });
}
