"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/chat", label: "Chat" },
    // Andere agent-pagina's kunnen later opnieuw geactiveerd worden:
    // { href: "/agent/chat", label: "Agent – Chat" },
    // { href: "/agent/commands", label: "Agent – Commands" },
    // { href: "/agent/video", label: "Agent – Video" },
    // { href: "/agent/logs", label: "Agent – Logs" },
    // { href: "/agent/deploy", label: "Agent – Deploy" },
  ];

  return (
    <nav className="flex flex-col h-full p-4 space-y-2 text-sm bg-neutral-950">
      <div className="text-lg font-semibold mb-4 text-neutral-300">
        TurboAgent
      </div>

      {links.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-md ${
              active
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
