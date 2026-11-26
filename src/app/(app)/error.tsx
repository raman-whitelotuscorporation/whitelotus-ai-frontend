"use client";

import Link from "next/link";

export default function AppGroupError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--surface-page)" }}
    >
      <div className="flex flex-col items-center gap-5 text-center px-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--status-error-bg)", border: "1px solid var(--status-error-border)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7" style={{ color: "var(--status-error-text)" }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div>
          <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Something went wrong</p>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
            An unexpected error occurred. You can try again or return to the app.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "var(--accent)" }}
          >
            Try again
          </button>
          <Link
            href="/app"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Go to app
          </Link>
        </div>
      </div>
    </div>
  );
}
