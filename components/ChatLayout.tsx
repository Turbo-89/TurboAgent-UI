"use client";

import { useState } from "react";

export default function ChatLayout({
  children,
  onSend = async () => {},
}: {
  children: React.ReactNode;
  onSend?: (text: string) => Promise<void> | void;
}) {
  const [input, setInput] = useState("");

  const submit = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await onSend(text);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col">
      <div className="w-full max-w-5xl mx-auto flex-1 p-4">
        <div className="space-y-2">{children}</div>
      </div>

      <div className="w-full border-t border-neutral-800 bg-neutral-950">
        <div className="w-full max-w-5xl mx-auto p-4 flex gap-2">
          <input
            className="flex-1 rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Typ je bericht..."
          />
          <button
            className="rounded-md bg-neutral-200 text-neutral-950 px-4 py-2"
            onClick={submit}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
