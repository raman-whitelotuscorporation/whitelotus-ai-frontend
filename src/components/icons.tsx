"use client";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function CheckIcon({
  className = "w-3 h-3",
  strokeWidth = 2.5,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CopyIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CopyButton({
  text,
  size = "sm",
}: {
  text: string;
  size?: "sm" | "xs";
}) {
  const { copied, copy } = useCopyToClipboard();
  const iconCls = size === "xs" ? "w-3 h-3" : "w-3 h-3";
  const textCls = size === "xs" ? "text-[10px]" : "text-[11px]";

  return (
    <button
      onClick={() => copy(text)}
      className={`flex items-center gap-1.5 ${textCls} transition-all`}
      style={{ color: copied ? "#10b981" : "var(--text-muted)" }}
    >
      {copied ? (
        <>
          <CheckIcon className={iconCls} />
          Copied
        </>
      ) : (
        <>
          <CopyIcon className={iconCls} />
          Copy
        </>
      )}
    </button>
  );
}

export function ThumbsDownIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M17 2H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2" />
      <path d="M3 13.5V4a2 2 0 0 1 2-2h8.5a2 2 0 0 1 1.8 1.1l2.5 5.5c.2.4.2.9 0 1.3L15.3 15c-.3.7-1 1-1.8 1H9a1 1 0 0 1-1-1v-2.5a1 1 0 0 0-1-1H4a1 1 0 0 1-1-1V13.5z" />
    </svg>
  );
}

export function SpeakerIcon({ className = "w-3.5 h-3.5", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className={className}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function ShareIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export function BookmarkIcon({ className = "w-3.5 h-3.5", filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function EditIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function RegenerateIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    </svg>
  );
}

export function MoreHorizIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

export function DocIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-8 h-8 mx-auto mb-2"
      style={{ color: "var(--text-muted)" }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
