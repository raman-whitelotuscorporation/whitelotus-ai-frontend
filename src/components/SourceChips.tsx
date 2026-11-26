"use client";

import { memo, useState } from "react";
import type { DiscoveredSource } from "@/types/chat";

// ── Provider icon (inline SVG, sized to 12×12) ────────────────────────────────
function SourceIcon({ sourceType }: { sourceType: string }) {
  const t = sourceType.toLowerCase();

  if (t === "gmail" || t === "email") {
    return (
      <svg viewBox="0 0 48 48" className="w-3 h-3 shrink-0">
        <path fill="#EA4335" d="M6 40h6V22.5L4 17v20a3 3 0 0 0 3 3z" />
        <path fill="#34A853" d="M36 40h6a3 3 0 0 0 3-3V17l-9 5.5z" />
        <path fill="#FBBC05" d="M36 10l-12 7.5L12 10 4 15l20 12.5L44 15z" />
        <path fill="#4285F4" d="M4 15v2l8 5.5V22.5L4 17z" />
        <path fill="#C5221F" d="M44 15l-8 7.5V22.5L44 17z" />
        <path
          fill="#EA4335"
          d="M12 10H6a3 3 0 0 0-2 .8L24 17.5 44 10.8A3 3 0 0 0 42 10H36L24 17.5z"
        />
      </svg>
    );
  }
  if (t === "google_drive") {
    return (
      <svg viewBox="0 0 87.3 78" className="w-3 h-3 shrink-0">
        <path
          fill="#0066DA"
          d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z"
        />
        <path
          fill="#00AC47"
          d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5A9 9 0 0 0 0 53h27.5z"
        />
        <path
          fill="#EA4335"
          d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z"
        />
        <path
          fill="#00832D"
          d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z"
        />
        <path
          fill="#2684FC"
          d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.4 4.5-1.2z"
        />
        <path
          fill="#FFBA00"
          d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z"
        />
      </svg>
    );
  }
  if (t === "jira") {
    return (
      <svg viewBox="0 0 32 32" className="w-3 h-3 shrink-0">
        <defs>
          <linearGradient id="sc-jira-a" x1="100%" y1="0%" x2="18%" y2="73%">
            <stop offset="0%" stopColor="#0052CC" />
            <stop offset="100%" stopColor="#2684FF" />
          </linearGradient>
          <linearGradient id="sc-jira-b" x1="0%" y1="100%" x2="82%" y2="27%">
            <stop offset="0%" stopColor="#0052CC" />
            <stop offset="100%" stopColor="#2684FF" />
          </linearGradient>
        </defs>
        <path
          fill="url(#sc-jira-a)"
          d="M16 1.6L8.3 9.3l4.7 4.7 3-3 7.7 7.7 4.7-4.7z"
        />
        <path
          fill="url(#sc-jira-b)"
          d="M16 30.4l7.7-7.7-4.7-4.7-3 3-7.7-7.7-4.7 4.7z"
        />
      </svg>
    );
  }
  if (t === "slack") {
    return (
      <svg viewBox="0 0 124 124" className="w-3 h-3 shrink-0">
        <path
          fill="#E01E5A"
          d="M26.3 78.2a13.1 13.1 0 0 1-13.1 13.1A13.1 13.1 0 0 1 0 78.2a13.1 13.1 0 0 1 13.1-13.1h13.2v13.1zm6.6 0a13.1 13.1 0 0 1 13.1-13.1 13.1 13.1 0 0 1 13.2 13.1v32.8A13.1 13.1 0 0 1 46 124.1a13.1 13.1 0 0 1-13.1-13.1V78.2z"
        />
        <path
          fill="#36C5F0"
          d="M45.9 26.2a13.1 13.1 0 0 1-13.1-13.1A13.1 13.1 0 0 1 45.9 0a13.1 13.1 0 0 1 13.2 13.1v13.1H45.9zm0 6.7a13.1 13.1 0 0 1 13.2 13.1 13.1 13.1 0 0 1-13.2 13.2H13A13.1 13.1 0 0 1 0 46a13.1 13.1 0 0 1 13.1-13.1h32.8z"
        />
        <path
          fill="#2EB67D"
          d="M97.8 46a13.1 13.1 0 0 1 13.1-13.1A13.1 13.1 0 0 1 124 46a13.1 13.1 0 0 1-13.1 13.2H97.8V46zm-6.6 0a13.1 13.1 0 0 1-13.2 13.2A13.1 13.1 0 0 1 64.9 46V13.1A13.1 13.1 0 0 1 78 0a13.1 13.1 0 0 1 13.2 13.1V46z"
        />
        <path
          fill="#ECB22E"
          d="M78 97.8a13.1 13.1 0 0 1 13.2 13.1A13.1 13.1 0 0 1 78 124.1a13.1 13.1 0 0 1-13.1-13.2V97.8H78zm0-6.6a13.1 13.1 0 0 1-13.1-13.2A13.1 13.1 0 0 1 78 64.9h32.9A13.1 13.1 0 0 1 124 78a13.1 13.1 0 0 1-13.1 13.2H78z"
        />
      </svg>
    );
  }
  if (t === "google_cal") {
    return (
      <svg viewBox="0 0 48 48" className="w-3 h-3 shrink-0">
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="4"
          fill="#fff"
          stroke="#E0E0E0"
          strokeWidth="1"
        />
        <rect x="6" y="6" width="36" height="10" rx="4" fill="#1A73E8" />
        <rect x="6" y="12" width="36" height="4" fill="#1A73E8" />
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#1A73E8"
        >
          31
        </text>
      </svg>
    );
  }
  if (t === "teams") {
    return (
      <svg viewBox="0 0 48 48" className="w-3 h-3 shrink-0">
        <path
          fill="#5059C9"
          d="M31 18h8a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-8V18z"
        />
        <circle fill="#5059C9" cx="35" cy="13" r="4" />
        <path
          fill="#7B83EB"
          d="M26 18H10a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V21a3 3 0 0 0-3-3z"
        />
        <circle fill="#7B83EB" cx="18" cy="12" r="5" />
      </svg>
    );
  }
  // document / fallback
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="w-3 h-3 shrink-0"
      style={{ color: "var(--accent)" }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

// ── Connector label ────────────────────────────────────────────────────────────
const CONNECTOR_LABELS: Record<string, string> = {
  email: "Gmail",
  gmail: "Gmail",
  google_drive: "Drive",
  jira: "Jira",
  slack: "Slack",
  google_cal: "Calendar",
  teams: "Teams",
  document: "Docs",
};

function connectorLabel(source: DiscoveredSource): string {
  return (
    CONNECTOR_LABELS[source.connector] ??
    CONNECTOR_LABELS[source.source_type] ??
    source.connector
  );
}

// ── Source detail panel ────────────────────────────────────────────────────────
function SourceDetail({
  source,
  onClose,
}: {
  source: DiscoveredSource;
  onClose: () => void;
}) {
  const label = connectorLabel(source);
  return (
    <div
      className="mt-1.5 rounded-xl p-3 text-xs space-y-1.5"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <SourceIcon sourceType={source.source_type} />
          <span
            className="font-semibold shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </span>
          <span
            className="truncate font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {source.title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close source detail"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="w-3 h-3"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {source.sender && (
        <div style={{ color: "var(--text-muted)" }}>
          <span
            className="font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            From:{" "}
          </span>
          {source.sender}
        </div>
      )}
      {source.date && (
        <div style={{ color: "var(--text-muted)" }}>
          <span
            className="font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Date:{" "}
          </span>
          {source.date}
        </div>
      )}
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1"
          style={{ color: "var(--accent-text)", textDecoration: "none" }}
        >
          Open source
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-3 h-3"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      ) : (
        <span style={{ color: "var(--text-muted)" }}>
          No direct link available
        </span>
      )}
    </div>
  );
}

// ── Single chip ────────────────────────────────────────────────────────────────
function SourceChip({
  source,
  isCited,
}: {
  source: DiscoveredSource;
  isCited: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const label = connectorLabel(source);
  const title =
    source.title.length > 48 ? source.title.slice(0, 46) + "…" : source.title;
  const senderDisplay = source.sender
    ? source.sender.split("<")[0].trim().slice(0, 22) ||
      source.sender.slice(0, 22)
    : undefined;

  const chipContent = (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all"
      style={{
        background: "var(--surface-card)",
        border: `1px solid var(--border)`,
        color: "var(--text-secondary)",
        maxWidth: 220,
      }}
    >
      <SourceIcon sourceType={source.source_type} />
      <span
        className="shrink-0 font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span className="flex flex-col min-w-0">
        <span className="truncate" style={{ color: "var(--text-primary)" }}>
          {title}
        </span>
        {senderDisplay && (
          <span
            className="truncate"
            style={{ color: "var(--text-muted)", fontSize: "10px" }}
          >
            {senderDisplay}
          </span>
        )}
      </span>
    </span>
  );

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        title={expanded ? "Hide details" : source.title}
        className="hover-lift inline-flex text-left"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {chipContent}
      </button>
      {expanded && (
        <SourceDetail source={source} onClose={() => setExpanded(false)} />
      )}
    </span>
  );
}

// ── Public component ───────────────────────────────────────────────────────────
const SourceChips = memo(function SourceChips({
  sources,
}: {
  sources: DiscoveredSource[];
}) {
  if (sources.length === 0) return null;

  // Build a stable citation-number map: citation_id → display number (1-based).
  // Sources without a citation_id (empty string) are not numbered.
  const citationNumbers = new Map<string, number>();
  let nextNum = 1;
  for (const s of sources) {
    if (s.citation_id && !citationNumbers.has(s.citation_id)) {
      citationNumbers.set(s.citation_id, nextNum++);
    }
  }

  const cited = sources.filter((s) => s.citation_id);
  const retrievedOnly = sources.filter((s) => !s.citation_id);

  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
      {/* Cited sources */}
      {cited.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-3 h-3 shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Sources · {cited.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cited.map((s) => (
              <SourceChip key={s.source_id} source={s} isCited={true} />
            ))}
          </div>
        </>
      )}

      {/* Retrieved-only sources (not cited in the answer) */}
      {retrievedOnly.length > 0 && (
        <div className={cited.length > 0 ? "mt-2" : ""}>
          <div className="flex items-center gap-1.5 mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-3 h-3 shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Also retrieved · {retrievedOnly.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {retrievedOnly.map((s) => (
              <SourceChip key={s.source_id} source={s} isCited={false} />
            ))}
          </div>
        </div>
      )}

      {/* Fallback: if all sources lack citation_id, render them all without section headers */}
      {cited.length === 0 && retrievedOnly.length === 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sources.map((s) => (
            <SourceChip key={s.source_id} source={s} isCited={false} />
          ))}
        </div>
      )}
    </div>
  );
});

export default SourceChips;
