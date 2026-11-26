"use client";

import { memo, useState } from "react";
import type { ActivityItem } from "@/types/chat";

function resolveLabel(item: ActivityItem): string {
  if (item.step_id === "__planning__") return "Planning the required operations";
  if (item.step_id === "__synthesis__") return "Preparing a source-grounded summary";
  return item.label || "Processing";
}

function StatusIcon({ status }: { status: ActivityItem["status"] }) {
  if (status === "completed") {
    return (
      <span
        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: "var(--status-success-bg)", border: "1px solid var(--status-success-border)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5" style={{ color: "var(--status-success-text)" }}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span
        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: "var(--status-error-bg)", border: "1px solid var(--status-error-border)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5" style={{ color: "var(--status-error-text)" }}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span
        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-2.5 h-2.5" style={{ color: "var(--text-muted)" }}>
          <path d="M5 12h14" />
        </svg>
      </span>
    );
  }
  if (status === "interrupted") {
    return (
      <span
        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5" style={{ color: "#f59e0b" }}>
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </span>
    );
  }
  // running
  return (
    <span className="shrink-0 w-4 h-4 flex items-center justify-center">
      <span
        className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
      />
    </span>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const label = resolveLabel(item);
  const isRunning = item.status === "running";
  const isFailed = item.status === "failed";
  const isSkipped = item.status === "skipped";
  const isInterrupted = item.status === "interrupted";

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
      style={{
        background: isRunning ? "rgba(99,102,241,0.06)" : "transparent",
        border: isRunning ? "1px solid rgba(99,102,241,0.14)" : "1px solid transparent",
        opacity: isSkipped ? 0.45 : 1,
      }}
    >
      <StatusIcon status={item.status} />

      <span
        className="text-xs font-medium flex-1 min-w-0 truncate"
        style={{
          color: isRunning
            ? "var(--text-primary)"
            : isFailed
            ? "var(--status-error-text)"
            : isSkipped
            ? "var(--text-muted)"
            : isInterrupted
            ? "#f59e0b"
            : "var(--text-secondary)",
        }}
      >
        {label}
        {isRunning && (
          <span className="inline-flex gap-0.5 ml-1.5 align-middle" aria-hidden="true">
            <span className="typing-dot" style={{ width: 3, height: 3 }} />
            <span className="typing-dot" style={{ width: 3, height: 3 }} />
            <span className="typing-dot" style={{ width: 3, height: 3 }} />
          </span>
        )}
      </span>

      {item.status === "completed" && item.duration_ms !== undefined && (
        <span className="shrink-0 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
          {item.duration_ms < 1000 ? `${item.duration_ms}ms` : `${(item.duration_ms / 1000).toFixed(1)}s`}
        </span>
      )}
      {isFailed && item.error && (
        <span className="shrink-0 text-[10px]" style={{ color: "var(--status-error-text)" }} title={item.error}>
          Failed
        </span>
      )}
      {isInterrupted && (
        <span className="shrink-0 text-[10px]" style={{ color: "#f59e0b" }}>
          Unconfirmed
        </span>
      )}
    </div>
  );
}

// ── Collapsed summary pill ─────────────────────────────────────────────────────
function CollapsedSummary({
  activities,
  onExpand,
}: {
  activities: ActivityItem[];
  onExpand: () => void;
}) {
  const failed = activities.filter((a) => a.status === "failed" || a.status === "interrupted").length;
  const toolSteps = activities.filter(
    (a) => a.step_id !== "__planning__" && a.step_id !== "__synthesis__"
  );
  const count = toolSteps.length;

  const label = failed > 0
    ? `${count} step${count !== 1 ? "s" : ""} · ${failed} unconfirmed or failed`
    : count > 0
    ? `${count} step${count !== 1 ? "s" : ""} completed`
    : "Completed";

  return (
    <button
      type="button"
      onClick={onExpand}
      className="flex items-center gap-1.5 mb-3 px-2 py-1 rounded-lg transition-all"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "var(--text-muted)",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

// ── Public component ───────────────────────────────────────────────────────────
const ActivityTimeline = memo(function ActivityTimeline({
  activities,
  isStreaming,
}: {
  activities: ActivityItem[];
  isStreaming: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (activities.length === 0) return null;

  const hasRunning = activities.some((a) => a.status === "running");
  const allDone = !hasRunning && !isStreaming;

  // While streaming: always show the full live timeline.
  // After completion: show collapsed summary unless user expanded it.
  // Exception: if there are failures, keep expanded so the user sees them.
  const hasFailed = activities.some((a) => a.status === "failed" || a.status === "interrupted");
  const showCollapsed = allDone && !expanded && !hasFailed;

  // Only show the timeline when there is something meaningful to display.
  // For a pure general_qa (greeting/simple question) the only activities
  // would be __planning__ completed — suppress the timeline in that case
  // to avoid showing a single "Planning" row for every greeting.
  const toolSteps = activities.filter(
    (a) => a.step_id !== "__planning__" && a.step_id !== "__synthesis__"
  );
  const onlyBookends = toolSteps.length === 0;
  if (onlyBookends && allDone) return null;

  if (showCollapsed) {
    return <CollapsedSummary activities={activities} onExpand={() => setExpanded(true)} />;
  }

  return (
    <div className="mb-3 space-y-0.5" role="status" aria-label="Agent activity">
      {activities.map((item) => (
        <ActivityRow key={item.step_id} item={item} />
      ))}
      {/* Collapse toggle shown after completion when user has expanded */}
      {allDone && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex items-center gap-1.5 mt-1 px-3 py-1"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 shrink-0">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span className="text-[11px] font-medium">Hide activity</span>
        </button>
      )}
    </div>
  );
});

export default ActivityTimeline;
