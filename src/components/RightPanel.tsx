"use client";
import React from "react";
import type { IntegrationProvider, KBDocument } from "@/types/chat";
import { PLUGIN_LABELS } from "@/lib/pluginIcons";
import { PLUGINS } from "@/lib/plugins";

type Props = {
  connectedPlugins: Set<IntegrationProvider>;
  onOpenPlugins: () => void;
  onSendMessage: (text: string) => void;
  onOpenKB: () => void;
  kbDocs: KBDocument[];
};


const SUGGESTED: Record<string, string[]> = {
  jira:         ["Show my tickets", "List open sprints"],
  slack:        ["Read latest messages", "List channels"],
  gmail:        ["Show unread emails", "Draft a reply"],
  google_drive: ["List recent files", "Search documents"],
  google_cal:   ["Show today's events", "List upcoming meetings"],
  teams:        ["Show recent chats", "List channels"],
};

const RightPanel = React.memo(function RightPanel({ connectedPlugins, onOpenPlugins, onSendMessage, onOpenKB, kbDocs }: Props) {
  const connected = [...connectedPlugins];
  const completedDocs = kbDocs.filter((d) => d.status === "COMPLETED").slice(0, 5);

  const suggestions = connected.length > 0
    ? connected.flatMap((id) => (SUGGESTED[id] ?? []).map((p) => ({ prompt: p, plugin: id })))
        .slice(0, 4)
    : [
        { prompt: "Summarise a document", plugin: "" },
        { prompt: "Search knowledge base", plugin: "" },
        { prompt: "What can you help me with?", plugin: "" },
      ];

  return (
    <div className="right-panel w-[240px] shrink-0 flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-2 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Workspace</p>
      </div>
      <div className="p-4 space-y-5">

        {/* Connected Tools */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Connected Tools
            </h3>
            <button onClick={onOpenPlugins}
              className="text-xs font-medium transition-colors"
              style={{ color: "var(--accent)" }}>
              View All
            </button>
          </div>

          {connected.length === 0 ? (
            <button onClick={onOpenPlugins}
              className="hover-dashed-accent w-full flex flex-col items-center gap-3 py-5 rounded-2xl border-2 border-dashed"
              style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}
            >
              {/* Illustration: 3 overlapping tool circles */}
              <div className="relative w-14 h-10">
                {(["#ea4335","#0052cc","#fc6d26"] as const).map((c, i) => (
                  <div key={i} className="absolute w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: `${c}18`, border: `1.5px solid ${c}30`, left: i * 14, top: i % 2 === 1 ? 4 : 0 }}>
                    <div className="w-3 h-3 rounded-md" style={{ background: c, opacity: 0.7 }} />
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>No tools connected</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Connect apps to unlock more</p>
              </div>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg"
                style={{ background: "rgba(99,102,241,0.1)", color: "var(--accent)" }}>
                + Connect tools
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {connected.slice(0, 6).map((id) => {
                const plugin = PLUGINS.find((p) => p.id === id);
                return (
                  <div key={id} className="tool-card">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm"
                      style={{ border: "1px solid var(--border)" }}>
                      {plugin?.logo}
                    </div>
                    <span className="text-[10px] font-medium truncate w-full text-center"
                      style={{ color: "var(--text-secondary)" }}>
                      {PLUGIN_LABELS[id as IntegrationProvider] ?? id}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: "var(--border)" }} />

        {/* Knowledge Base */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Knowledge Base</h3>
            <button onClick={onOpenKB} className="text-xs font-medium transition-colors" style={{ color: "var(--accent)" }}>
              {completedDocs.length === 0 ? "Add docs" : "View All"}
            </button>
          </div>
          {completedDocs.length === 0 ? (
            <button
              onClick={onOpenKB}
              className="hover-dashed-accent w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-dashed text-left"
              style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>No documents yet</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Upload to give AI context</p>
              </div>
            </button>
          ) : (
            <div className="space-y-1">
              {completedDocs.map((doc) => (
                  <button
                  key={doc.doc_id}
                  onClick={() => onSendMessage(`Summarise "${doc.source}"`)}
                  className="hover-left-accent w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left"
                  style={{ background: "var(--surface-hover)", borderLeft: "2px solid transparent" }}
                  title={`Summarise "${doc.source}"`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--accent)", opacity: 0.7 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="flex-1 text-xs truncate" style={{ color: "var(--text-secondary)" }}>{doc.source}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: "var(--border)" }} />

        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Suggested
          </h3>
          <div className="space-y-1.5">
            {suggestions.map((s, i) => (
              <button key={i}
                onClick={() => onSendMessage(s.prompt)}
                className="hover-left-accent hover-left-accent-text group/prompt w-full text-left text-xs px-3 py-2 rounded-xl flex items-center justify-between gap-2"
                style={{ background: "var(--surface-hover)", color: "var(--text-secondary)", borderLeft: "2px solid transparent" }}
              >
                <span className="flex-1 leading-snug">{s.prompt}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 shrink-0 opacity-0 -translate-x-1 group-hover/prompt:opacity-100 group-hover/prompt:translate-x-0 transition-all">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
});

export default RightPanel;
