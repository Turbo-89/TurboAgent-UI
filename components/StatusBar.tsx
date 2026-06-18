"use client";

import { useEffect, useState } from "react";

export default function StatusBar({
  isStreaming = false,
}: {
  isStreaming?: boolean;
}) {
  const [status, setStatus] = useState<"online" | "offline" | "loading">("loading");

  async function checkStatus() {
    try {
      const res = await fetch("/api/status", { method: "GET" });
      if (!res.ok) throw new Error("No response");
      setStatus("online");
    } catch (_) {
      setStatus("offline");
    }
  }

  useEffect(() => {
    checkStatus();            // eerste check
    const interval = setInterval(checkStatus, 10000); // elke 10 sec
    return () => clearInterval(interval);
  }, []);

  let label = "Onbekend";
  let color = "text-gray-400";

  if (isStreaming) {
    label = "Antwoord wordt geladen...";
    color = "text-yellow-400";
  } else if (status === "online") {
    label = "Verbonden met backend";
    color = "text-green-400";
  } else if (status === "offline") {
    label = "Backend niet bereikbaar";
    color = "text-red-400";
  } else if (status === "loading") {
    label = "Controleren...";
    color = "text-gray-300";
  }

  return (
    <div className="w-full p-2 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center text-sm">
      <div className={`${color} font-medium`}>● {label}</div>
      <div className="text-neutral-400">TurboAgent</div>
    </div>
  );
}
