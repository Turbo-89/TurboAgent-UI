"use client";

import { useState, useEffect, useRef } from "react";
import MicButton from "@/components/MicButton";
import FileUpload from "@/components/FileUpload";
import ChatMessage from "@/components/ChatMessage";
import WorkspaceTree from "@/components/WorkspaceTree";
import { backendUrl } from "@/lib/backend";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  text: string;
};

type OpenedFile = {
  root: string;
  path: string;
  sha256?: string;
  content: string;
};

type ReadResponse = {
  ok: boolean;
  root: string;
  path: string;
  sha256?: string;
  content: string;
};

function createSessionId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Welkom bij TurboAgent. Hoe kan ik helpen?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [openedFile, setOpenedFile] = useState<OpenedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Sessie laden / aanmaken
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

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    const placeholder: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: "",
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          session_id: sessionId || "default",
          ...(openedFile
            ? {
                context: {
                  open_file: {
                    root: openedFile.root,
                    path: openedFile.path,
                    ...(openedFile.sha256 ? { sha256: openedFile.sha256 } : {}),
                  },
                },
              }
            : {}),
        }),
      });

      if (!res.body) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholder.id
              ? { ...m, text: "Fout: geen streaming body van backend." }
              : m
          )
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      // ----------- EINDE-PROOF STREAMING -------------
      while (true) {
        const { value, done } = await reader.read();

        // STREAM EINDE (done=true) → fallback check voor END
        if (done) {
          const clean = buffer.replace("[END]", "");
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { id: placeholder.id, role: "assistant", text: clean };
            return copy;
          });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        // Als chunk END bevat → direct stoppen
        if (chunk.includes("[END]")) {
          const clean = (buffer + chunk).replace("[END]", "");
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { id: placeholder.id, role: "assistant", text: clean };
            return copy;
          });
          return;
        }

        // Normale token-append
        buffer += chunk;

        // Live weergave
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { id: placeholder.id, role: "assistant", text: buffer };
          return copy;
        });
      }
      // ----------------------------------------------

    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? {
                ...m,
                text:
                  "Fout tijdens streaming: " +
                  (err?.message || "onbekende fout"),
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  async function openWorkspaceFile(rootAlias: string, path: string) {
    setOpenedFile({ root: rootAlias, path, content: "" });
    setFileError(null);
    setFileLoading(true);

    const params = new URLSearchParams({
      root: rootAlias,
      path,
    });

    try {
      const res = await fetch(backendUrl(`/api/fs/read?${params}`), {
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as ReadResponse | null;

      if (!res.ok || !data?.ok) {
        throw new Error("Bestand kon niet worden geopend.");
      }

      setOpenedFile({
        root: data.root,
        path: data.path,
        sha256: data.sha256,
        content: data.content,
      });
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Bestand kon niet worden geopend.");
    } finally {
      setFileLoading(false);
    }
  }

  return (
    <div className="grid h-full w-full grid-cols-[320px_minmax(0,1fr)] gap-4">
      <aside className="min-h-0">
        <WorkspaceTree onOpenFile={openWorkspaceFile} />
      </aside>

      <div className="flex min-h-0 flex-col">
        {openedFile ? (
          <section className="mb-3 max-h-56 overflow-hidden border border-neutral-800 bg-neutral-950">
            <div className="border-b border-neutral-800 p-2 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200">{openedFile.root}</span>
              <span className="mx-1">/</span>
              <span className="font-mono">{openedFile.path}</span>
            </div>
            {fileError ? (
              <div className="p-3 text-sm text-red-300">{fileError}</div>
            ) : (
              <pre className="max-h-44 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs text-neutral-200">
                {fileLoading ? "Laden..." : openedFile.content}
              </pre>
            )}
          </section>
        ) : null}

        {/* Berichten */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} text={m.text} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2 pt-3 mt-2 border-t border-neutral-800">
          <MicButton onTranscript={(t: string) => setInput(t)} />
          <FileUpload />

          <input
            className="flex-1 p-3 rounded bg-neutral-800 text-white border border-neutral-700"
            placeholder="Typ of spreek je bericht..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button
            onClick={sendMessage}
            disabled={isStreaming}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-500"
          >
            Verstuur
          </button>
        </div>
      </div>
    </div>
  );
}
