import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const r = await axios.get("http://localhost:8000/logs");
  return NextResponse.json(r.data);
}
