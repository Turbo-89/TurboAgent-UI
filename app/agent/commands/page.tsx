"use client";

import ChatLayout from "@/components/ChatLayout";
import ChatMessage from "@/components/ChatMessage";
import { useState } from "react";

export default function CommandsPage() {
  const [messages, setMessages] = useState([]);

  const runCommand = async (cmd: string) => {
    setMessages((prev) => [...prev, { role: "user", text: cmd }]);

    const res = await fetch("/api/agent/action", {
      method: "POST",
      body: JSON.stringify({ command: cmd })
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", text: data.output }]);
  };

  return (
    <ChatLayout>
      {messages.map((m, i) => (
        <ChatMessage key={i} role={m.role as any} text={m.text} />
      ))}
    </ChatLayout>
  );
}
