import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { message, session_id, context } = await req.json();

  const base = process.env.BACKEND_BASE_URL || "http://localhost:8000";
  const backendResponse = await fetch(`${base}/chat-stream`, {
    method: "POST",
    body: JSON.stringify({ message, session_id, context }),
    headers: { "Content-Type": "application/json" },
  });

  const stream = new ReadableStream({
    async start(controller) {
      const reader = backendResponse.body?.getReader();
      if (!reader) {
        controller.enqueue(new TextEncoder().encode("ERROR: no body[END]"));
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(new TextEncoder().encode(decoder.decode(value)));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}

