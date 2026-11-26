import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--surface-page)" }}
    >
      <div className="flex flex-col items-center gap-5 text-center px-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7" style={{ color: "var(--text-muted)" }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Page not found</p>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/app"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "var(--accent)" }}
        >
          Go to app
        </Link>
      </div>
    </div>
  );
}
