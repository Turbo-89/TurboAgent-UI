"use client";

type Props = {
  role: "user" | "assistant" | "system" | "tool";
  text: string | undefined | null;
};

export default function ChatMessage({ role, text }: Props) {
  const content = typeof text === "string" ? text : "";

  // JSON detectie
  const tryParseJson = (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const parsedJson = tryParseJson(content);

  // Detecties
  const isTool =
    role === "tool" ||
    content.startsWith("[TOOL:") ||
    content.includes("[ANALYTICS]");

  const isError =
    role === "system" && content.toLowerCase().includes("error");

  // Alignment
  const alignClass = role === "user" ? "justify-end" : "justify-start";

  // Bubble style
  let bubble =
    "px-4 py-3 rounded-xl max-w-[75%] whitespace-pre-wrap leading-relaxed shadow-md";

  switch (role) {
    case "user":
      bubble += " bg-blue-600 text-white";
      break;
    case "assistant":
      bubble += " bg-neutral-700 text-green-200";
      break;
    case "system":
      bubble += " bg-neutral-800 text-gray-300 text-sm";
      break;
  }

  if (isTool) {
    bubble += " bg-amber-700 text-amber-200 border border-amber-300";
  }

  if (isError) {
    bubble += " bg-red-800 text-red-200 border border-red-400";
  }

  // JSON block styling
  const jsonClass =
    "bg-neutral-900 border border-neutral-700 text-green-200 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto shadow-inner";

  return (
    <div className={`w-full flex ${alignClass} mb-2`}>
      {parsedJson ? (
        <pre className={jsonClass}>
          {JSON.stringify(parsedJson, null, 2)}
        </pre>
      ) : (
        <div className={bubble}>{content}</div>
      )}
    </div>
  );
}
