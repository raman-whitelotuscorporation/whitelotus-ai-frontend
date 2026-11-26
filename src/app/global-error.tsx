"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0f0f13", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", padding: "0 24px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={1.8} style={{ width: 28, height: 28 }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Something went wrong</p>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
              An unexpected error occurred. Please try again.
            </p>
          </div>
          <button
            onClick={reset}
            style={{ padding: "10px 20px", borderRadius: 12, background: "#6366f1", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
