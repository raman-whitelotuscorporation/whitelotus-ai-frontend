"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import { oauthUrl, OAUTH_PROVIDERS, revokeOAuthToken, connectPlugin, disconnectPlugin, BASE_URL, authFetch } from "@/lib/api";
import { pushNotification } from "@/hooks/useNotifications";
import type { IntegrationProvider, ConnectionStatus } from "@/types/chat";
import { dispatchAppEvent } from "@/lib/events";
import { CloseIcon } from "@/components/icons";
import { useClickOutside } from "@/hooks/useClickOutside";
import { PLUGINS } from "@/lib/plugins";
import type { Plugin } from "@/lib/plugins";

const CATEGORIES = ["All", "Connected", "Popular", "Productivity", "Communication", "Developer"] as const;
type Category = typeof CATEGORIES[number];

// ── Connect modal ────────────────────────────────────────────────────────────

function ConnectModal({ plugin, onClose, onConnected }: {
  plugin: Plugin;
  onClose: () => void;
  onConnected: (id: IntegrationProvider) => void;
}) {
  const [step, setStep] = useState<"prompt" | "confirm">("prompt");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSignIn() {
    if (OAUTH_PROVIDERS.has(plugin.id)) {
      try {
        const url = await oauthUrl(plugin.id);
        window.location.href = url;
      } catch {
        pushNotification("error", "Connection failed", "Could not start OAuth flow. Please try again.");
      }
      return;
    }
    if (plugin.loginUrl) {
      if (plugin.loginUrl.startsWith("/api/")) {
        window.location.href = `${BASE_URL}${plugin.loginUrl}`;
      } else {
        window.open(plugin.loginUrl, "_blank", "noopener,noreferrer");
        setStep("confirm");
      }
    }
  }

  function handleConfirmConnected() {
    onConnected(plugin.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Connect ${plugin.name}`}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "confirm" ? (
          <div className="panel rounded-2xl overflow-hidden">
            <div className="relative flex flex-col items-center pt-10 pb-8 px-8"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%)" }}>
              <button onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                {plugin.logo}
              </div>
              <h2 className="text-white font-bold text-xl text-center">
                Sign in to {plugin.name}
              </h2>
              <p className="text-white/75 text-sm text-center mt-2">
                Complete sign-in in the new tab, then come back here and confirm.
              </p>
            </div>
            <div className="px-8 py-6 space-y-3">
              <button onClick={handleConfirmConnected}
                className="w-full py-3 px-4 rounded-full text-sm font-semibold transition-colors text-white"
                style={{ background: "var(--accent)" }}>
                Connected — continue to Whitelotus AI
              </button>
              <button onClick={() => setStep("prompt")}
                className="w-full py-2.5 px-4 text-sm transition-colors"
                style={{ color: "var(--text-muted)" }}>
                Go back
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Gradient header */}
            <div
              className="relative flex flex-col items-center pt-10 pb-8 px-8"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%)",
              }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>

              {/* Dual icon */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  {plugin.logo}
                </div>
                <div className="w-14 h-14 bg-[#1a1a2e] rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                  <span className="text-white text-lg font-bold">W</span>
                </div>
              </div>

              <h2 className="text-white font-bold text-xl text-center">
                Add {plugin.name} to Whitelotus AI
              </h2>
              <p className="text-white/75 text-sm text-center mt-1">{plugin.description}</p>
            </div>

            {/* Buttons */}
            <div className="px-8 py-6 space-y-3" style={{ background: "var(--surface-overlay)" }}>
              {plugin.authLabel && (
                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-medium shadow-sm transition-colors"
                  style={{ background: "var(--surface-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  <span className="text-base">{plugin.logo}</span>
                  {plugin.authLabel}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 ml-1" style={{ color: "var(--text-muted)" }}>
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </button>
              )}
              {/* Disclaimer */}
              <div className="pt-3 space-y-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>
                  <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>You&apos;re in control.</span>{" "}
                  Whitelotus AI respects your data preferences and is limited to permissions you&apos;ve explicitly set.
                </p>
                <p>
                  <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Apps may introduce elevated risk.</span>{" "}
                  Whitelotus AI is built to protect your data, but third-party integrations may attempt to access your data.
                </p>
                <p>
                  <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Data shared with this app.</span>{" "}
                  By adding this app, you allow it to access basic information and a summary of your recent context and intent.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Plugin card ──────────────────────────────────────────────────────────────

function UninstallConfirmModal({ plugin, onConfirm, onCancel }: {
  plugin: Plugin;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Uninstall ${plugin.name}`}
        className="w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
        style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm" style={{ border: "1px solid var(--border)" }}>
            {plugin.logo}
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Uninstall {plugin.name}?</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>This will disconnect and remove your credentials.</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
          >
            Uninstall
          </button>
        </div>
      </div>
    </div>
  );
}

function PluginCard({ plugin, connected, status, onAdd, onUninstall, onChat, onChangeJiraWorkspace }: {
  plugin: Plugin;
  connected: boolean;
  status?: ConnectionStatus;
  onAdd: (p: Plugin) => void;
  onUninstall: (id: IntegrationProvider) => void;
  onChat: (p: Plugin) => void;
  onChangeJiraWorkspace?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmUninstall, setConfirmUninstall] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const effectiveStatus = status ?? (connected ? "connected" : "not_connected");

  const statusBadge = (() => {
    if (!plugin.live) return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(99,102,241,0.10)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.20)" }}>Soon</span>;
    if (effectiveStatus === "connected") return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(16,185,129,0.10)", color: "#10b981", border: "1px solid rgba(16,185,129,0.20)" }}>Live</span>;
    if (effectiveStatus === "temporarily_unavailable") return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.20)" }}>Unavailable</span>;
    if (effectiveStatus === "reauthorization_required") return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.20)" }}>Reconnect</span>;
    if (effectiveStatus === "configuration_error") return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.20)" }}>Config error</span>;
    return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(99,102,241,0.10)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.20)" }}>Connect</span>;
  })();

  const statusSubtext = (() => {
    if (effectiveStatus === "temporarily_unavailable") return "Temporarily unavailable — try again shortly";
    if (effectiveStatus === "reauthorization_required") return "Authorization expired — reconnect to restore access";
    if (effectiveStatus === "configuration_error") return "Configuration issue — contact your administrator";
    if (effectiveStatus === "disconnected") return "Disconnected";
    return null;
  })();

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors footer-nav-item">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm" style={{ border: "1px solid var(--border)" }}>
        {plugin.logo}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{plugin.name}</p>
          {statusBadge}
        </div>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {statusSubtext ?? plugin.description}
        </p>
      </div>

      {connected ? (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors icon-btn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute z-10 right-0 top-full mt-1 w-48 panel rounded-xl shadow-lg py-1 text-sm">
              <button
                onClick={() => { setMenuOpen(false); onChat(plugin); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 footer-nav-item"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chat
              </button>
              {plugin.id === "jira" && onChangeJiraWorkspace && (
                <button
                  onClick={() => { setMenuOpen(false); onChangeJiraWorkspace(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 footer-nav-item"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h10M7 12h6M7 16h4" />
                  </svg>
                  Change workspace
                </button>
              )}
              <button
                onClick={() => { setMenuOpen(false); onAdd(plugin); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 footer-nav-item"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Reconnect
              </button>
              <div className="my-1" style={{ borderTop: "1px solid var(--border)" }} />
              <button
                onClick={() => { setMenuOpen(false); setConfirmUninstall(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0">
                  <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                Uninstall
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => onAdd(plugin)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 icon-btn"
          style={{ border: "1px solid var(--border)" }}
          title={`Add ${plugin.name}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}
      {confirmUninstall && (
        <UninstallConfirmModal
          plugin={plugin}
          onConfirm={() => { setConfirmUninstall(false); onUninstall(plugin.id); }}
          onCancel={() => setConfirmUninstall(false)}
        />
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────


// ── Shared content (used by both full-page and modal) ─────────────────────────

export function PluginsContent({
  connected,
  pluginStatuses,
  onConnected,
  onClose,
  onChangeJiraWorkspace,
}: {
  connected: Set<IntegrationProvider>;
  pluginStatuses?: Map<IntegrationProvider, ConnectionStatus>;
  onConnected: (id: IntegrationProvider) => void;
  onClose?: () => void;
  onChangeJiraWorkspace?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [connecting, setConnecting] = useState<Plugin | null>(null);
  const liveConnected = useMemo(() => new Set(connected), [connected]);

  async function handleUninstall(id: IntegrationProvider) {
    try {
      if (OAUTH_PROVIDERS.has(id)) await revokeOAuthToken(id);
      await disconnectPlugin(id);
      dispatchAppEvent("plugin:uninstall", id);
      const plugin = PLUGINS.find((p) => p.id === id);
      pushNotification("warning", "Plugin disconnected", `${plugin?.name ?? id} has been uninstalled.`);
    } catch {
      const plugin = PLUGINS.find((p) => p.id === id);
      pushNotification("error", "Disconnect failed", `Could not disconnect ${plugin?.name ?? id}. Please try again.`);
    }
  }

  function handleChat(p: Plugin) {
    onClose?.();
    dispatchAppEvent("plugin:chat", p.name);
  }

  function handleConnected(id: IntegrationProvider) {
    if (!OAUTH_PROVIDERS.has(id)) connectPlugin(id).catch(() => {});
    onConnected(id);
    const plugin = PLUGINS.find((p) => p.id === id);
    pushNotification("success", "Plugin connected", `${plugin?.name ?? id} is now connected and ready to use.`);
  }

  const filtered = PLUGINS.filter((p) => {
    const matchCat =
      category === "All" ||
      (category === "Connected" ? liveConnected.has(p.id) : p.category === category);
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = CATEGORIES.slice(2).reduce<Record<string, Plugin[]>>((acc, cat) => {
    const items = filtered.filter((p) => p.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <>
      {/* Search */}
      <div className="px-6 pt-4 pb-3 shrink-0">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plugins…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-colors"
            style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-6 pb-3 shrink-0 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: category === cat ? "var(--accent)" : "var(--surface-card)",
              color: category === cat ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${category === cat ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Plugin list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="rounded-2xl" style={{ border: "1px solid var(--border)", background: "var(--surface-card)" }}>
          {search.trim() || category !== "All" ? (
            filtered.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
                {category === "Connected" ? "No plugins connected yet" : "No plugins found"}
              </p>
            ) : (
              filtered.map((p, i) => (
                <div key={p.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                  <PluginCard plugin={p} connected={liveConnected.has(p.id)}
                    status={pluginStatuses?.get(p.id)}
                    onAdd={setConnecting} onUninstall={handleUninstall} onChat={handleChat}
                    onChangeJiraWorkspace={onChangeJiraWorkspace} />
                </div>
              ))
            )
          ) : (
            Object.entries(grouped).map(([cat, plugins], gi) => (
              <div key={cat}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-widest px-5 pt-4 pb-2"
                  style={{ color: "var(--text-muted)", borderTop: gi > 0 ? "1px solid var(--border)" : "none" }}
                >
                  {cat}
                </p>
                {plugins.map((p, i) => (
                  <div key={p.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <PluginCard plugin={p} connected={liveConnected.has(p.id)}
                      status={pluginStatuses?.get(p.id)}
                      onAdd={setConnecting} onUninstall={handleUninstall} onChat={handleChat}
                      onChangeJiraWorkspace={onChangeJiraWorkspace} />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {connecting && (
        <ConnectModal
          plugin={connecting}
          onClose={() => setConnecting(null)}
          onConnected={handleConnected}
        />
      )}
    </>
  );
}

// ── Modal wrapper (used from page.tsx) ───────────────────────────────────────

export default function PluginsPage({
  onClose,
  connected,
  pluginStatuses,
  onConnected,
}: {
  onClose: () => void;
  connected: Set<IntegrationProvider>;
  pluginStatuses?: Map<IntegrationProvider, ConnectionStatus>;
  onConnected: (id: IntegrationProvider) => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plugins-dialog-title"
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col animate-fade-up"
        style={{ maxHeight: "88vh", background: "var(--surface-page)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 id="plugins-dialog-title" className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>Integrations</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Connect tools and ask the AI about them in chat</p>
          </div>
          <button onClick={onClose} className="icon-btn p-1.5">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* PluginsContent fills the rest of the modal */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <PluginsContent
            connected={connected}
            pluginStatuses={pluginStatuses}
            onConnected={onConnected}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
