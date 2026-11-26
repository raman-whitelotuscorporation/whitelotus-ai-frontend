"use client";
import Image from "next/image";

export default function ChatEmptyState({ onOpenKB }: { onOpenKB: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-up">
      <div className="mb-5 relative">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg animate-glow"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Image src="/logo.png" alt="Whitelotus AI" width={32} height={32} className="rounded-xl" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center"
          style={{ border: "2px solid var(--surface-page)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-2 h-2">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
        How can I help you today?
      </h2>
      <p className="text-sm max-w-xs mb-7" style={{ color: "var(--text-muted)" }}>
        Ask me anything about your team, projects, or processes.
      </p>

      <button
        onClick={onOpenKB}
        className="hover-dashed-accent flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl"
        style={{ color: "var(--accent)", border: "1.5px solid var(--border)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        Add documents to knowledge base
      </button>
    </div>
  );
}
