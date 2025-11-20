import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const { endpoint, args } = await req.json();

  const r = await axios.post(`http://localhost:8000/${endpoint}`, args || {});

  return NextResponse.json(r.data);
}
