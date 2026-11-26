"use client";
import { useState, useRef } from "react";
import { CloseIcon } from "@/components/icons";

export default function MobileSearch({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function expand() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function collapse() {
    setOpen(false);
    setSearchQuery("");
  }

  return (
    <div className="sm:hidden flex items-center">
      {open ? (
        <div className="search-bar flex items-center gap-2 px-3 py-1.5 animate-fade-up" style={{ width: 180 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0"
            style={{ color: "var(--text-muted)" }}>
            <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
          </svg>
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
            onKeyDown={(e) => e.key === "Escape" && collapse()}
            onBlur={() => { if (!searchQuery) collapse(); }}
          />
          <button onClick={collapse} className="shrink-0" style={{ color: "var(--text-muted)" }}>
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button onClick={expand} className="icon-btn p-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"
            style={{ color: "var(--text-muted)" }}>
            <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
          </svg>
        </button>
      )}
    </div>
  );
}
