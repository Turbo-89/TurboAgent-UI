"use client";
import { useState } from "react";
import axios from "axios";
import ChatMessage from "@/components/ChatMessage";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  async function sendMessage() {
    if (!input.trim()) return;

    const user = { role: "user", content: input };
    const res = await axios.post("/api/agent/chat", { message: input });

    const bot = { role: "assistant", content: res.data.reply };

    setMessages((m) => [...m, user, bot]);
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
      </div>

      <div className="p-4 border-t border-neutral-700 flex space-x-2">
        <input
          className="flex-1 p-2 rounded bg-neutral-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
