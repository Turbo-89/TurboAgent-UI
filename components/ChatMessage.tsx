export default function ChatMessage({ role, content }) {
  return (
    <div className={`p-3 rounded-lg max-w-2xl ${
      role === "assistant" 
        ? "bg-neutral-800 text-white self-start"
        : "bg-blue-600 text-white self-end"
    }`}>
      {content}
    </div>
  );
}
