"use client";

import { useEffect, useState } from "react";
import { fetchJiraWorkspaces, selectJiraWorkspace, type JiraWorkspace } from "@/lib/api";

export default function JiraWorkspaceSelector({
  onSelected,
  onClose,
}: {
  onSelected: (workspace: JiraWorkspace) => void;
  onClose: () => void;
}) {
  const [workspaces, setWorkspaces] = useState<JiraWorkspace[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchJiraWorkspaces()
      .then((result) => {
        if (!active) return;
        setWorkspaces(result.workspaces ?? []);
        setSelectedId(result.selected_cloud_id ?? "");
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load accessible Jira workspaces");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function saveSelection() {
    if (!selectedId || saving) return;
    setSaving(true);
    setError(null);
    try {
      await selectJiraWorkspace(selectedId);
      const selected = workspaces.find((workspace) => workspace.cloud_id === selectedId);
      if (!selected) throw new Error("The selected Jira workspace is no longer available. Reload and try again.");
      onSelected(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save Jira workspace selection");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
      <section role="dialog" aria-modal="true" aria-labelledby="jira-workspace-title" className="w-full max-w-lg rounded-2xl p-6 shadow-2xl" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="jira-workspace-title" className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Choose your Jira workspace</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Your Atlassian account can access multiple sites. Select the site WhiteLotus AI should use for Jira queries.</p>
          </div>
        </div>

        {error && <div className="mt-4 rounded-xl px-3 py-2.5 text-sm" style={{ background: "var(--status-error-bg)", border: "1px solid var(--status-error-border)", color: "var(--status-error-text)" }}>{error}</div>}

        {loading ? (
          <div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading accessible sites…</div>
        ) : workspaces.length ? (
          <div className="mt-5 space-y-2 max-h-72 overflow-y-auto">
            {workspaces.map((workspace) => {
              const selected = selectedId === workspace.cloud_id;
              return (
                <button key={workspace.cloud_id} type="button" onClick={() => setSelectedId(workspace.cloud_id)} className="w-full rounded-xl px-4 py-3 text-left flex items-center gap-3 transition-colors" style={{ background: selected ? "var(--accent-glow)" : "var(--surface-hover)", border: `1px solid ${selected ? "var(--border-focus)" : "var(--border)"}` }}>
                  <span className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: selected ? "var(--accent)" : "var(--border)" }}>
                    {selected && <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{workspace.name || "Atlassian site"}</span>
                    <span className="block text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{workspace.url}</span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }}><path d="M14 3h7v7M10 14 21 3"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></svg>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No accessible Jira sites were returned. Reconnect Jira or ask your Atlassian administrator to grant site access.</div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>Not now</button>
          <button type="button" onClick={saveSelection} disabled={loading || saving || !selectedId || workspaces.length === 0} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>{saving ? "Saving…" : "Use this workspace"}</button>
        </div>
      </section>
    </div>
  );
}
