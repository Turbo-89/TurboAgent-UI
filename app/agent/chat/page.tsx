"use client";

import ChatLayout from "@/components/ChatLayout";
import ChatMessage from "@/components/ChatMessage";
import { useEffect, useState } from "react";

type Role = "user" | "assistant";
type Msg = { role: Role; text: string };

function createSessionId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AgentChatPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem("turbo_session_id");
    } catch {
      stored = null;
    }

    if (stored) {
      setSessionId(stored);
    } else {
      const id = createSessionId();
      setSessionId(id);
      try {
        window.localStorage.setItem("turbo_session_id", id);
      } catch {}
    }
  }, []);

  const sendMessage = async (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    setMessages((prev) => [...prev, { role: "user", text: cleaned }]);

    const res = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: cleaned, session_id: sessionId || "default" }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", text: data.reply || String(data) }]);
  };

  return (
    <ChatLayout onSend={sendMessage}>
      {messages.map((m, i) => (
        <ChatMessage key={i} role={m.role as any} text={m.text} />
      ))}
    </ChatLayout>
  );
}
