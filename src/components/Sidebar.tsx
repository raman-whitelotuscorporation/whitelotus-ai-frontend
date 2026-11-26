"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { ChatSession, User } from "@/types/chat";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  chat:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  integrations:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>,
  analytics:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  settings:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  team:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  logout:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[16px] h-[16px]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-[14px] h-[14px]"><path d="M12 5v14M5 12h14"/></svg>,
  search:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[15px] h-[15px]"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>,
  dots:        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>,
  rename:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  trash:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  chatSmall:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

const NAV_ITEMS = [
  { id: "chat",         label: "Chat",         icon: IC.chat,         href: "/app" },
  { id: "integrations", label: "Integrations", icon: IC.integrations, href: "/plugins" },
  { id: "analytics",   label: "Analytics",    icon: IC.analytics,    href: "/analytics", soon: true },
  { id: "settings",    label: "Settings",     icon: IC.settings,     href: "/settings" },
  { id: "team",        label: "Team",         icon: IC.team,         href: "/team" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── Context Menu ──────────────────────────────────────────────────────────────
function ContextMenu({ x, y, sessionId, onClose, onRename, onDelete }: {
  x: number; y: number; sessionId: string;
  onClose: () => void; onRename: (id: string) => void; onDelete: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  const W = 160, H = 110;
  const cx = Math.min(x, window.innerWidth - W - 8);
  const cy = Math.min(y, window.innerHeight - H - 8);

  return (
    <div ref={ref}
      style={{ position: "fixed", top: cy, left: cx, zIndex: 9999, width: W }}
      className="panel rounded-xl shadow-xl py-1 overflow-hidden animate-fade-in"
    >
      {[
        { icon: IC.rename, label: "Rename", action: () => { onRename(sessionId); onClose(); }, danger: false },
        { icon: IC.trash,  label: "Delete", action: () => { onDelete(sessionId); onClose(); }, danger: true },
      ].map((item, i) => (
        <button key={i} onClick={item.action}
          className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors ${
            item.danger ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" : "footer-nav-item"
          }`}>
          {item.icon}{item.label}
        </button>
      ))}
    </div>
  );
}

// ── Session Item ──────────────────────────────────────────────────────────────
function SessionItem({ session, isActive, onSwitch, onDelete, onRename, isRenaming, onStartRename, onCancelRename }: {
  session: ChatSession; isActive: boolean;
  onSwitch: (id: string) => void; onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  isRenaming: boolean; onStartRename: (id: string) => void; onCancelRename: () => void;
}) {
  const router = useRouter();
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [renameVal, setRenameVal] = useState(session.title);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) { // eslint-disable-next-line react-hooks/set-state-in-effect
      setRenameVal(session.title); setTimeout(() => renameRef.current?.select(), 50); }
  }, [isRenaming, session.title]);

  function submitRename() {
    const t = renameVal.trim();
    if (t) onRename(session.sessionId, t); else onCancelRename();
  }

  function handleClick() {
    if (isRenaming) return;
    onSwitch(session.sessionId);
  }

  return (
    <>
      <div
        className={`group relative flex items-center gap-2 px-2.5 py-1.5 cursor-pointer select-none session-item transition-colors ${isActive ? "active" : ""}`}
        onClick={handleClick}
      >
        <span className="shrink-0 opacity-40">{IC.chatSmall}</span>
        {isRenaming ? (
          <input ref={renameRef} value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") onCancelRename(); }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-xs rounded-lg px-2 py-0.5 outline-none min-w-0"
            style={{ background: "var(--surface-hover)", color: "var(--text-primary)", border: "1px solid var(--border-focus)" }}
          />
        ) : (
          <span className="truncate flex-1 text-xs leading-snug" style={{ color: "var(--text-primary)" }}>
            {session.title || "New chat"}
          </span>
        )}
        {!isRenaming && (
          <div className="shrink-0 flex items-center justify-end" style={{ minWidth: 28 }}>
            {/* time — visible at rest */}
            <span className="text-[10px] group-hover:opacity-0 transition-opacity leading-none"
              style={{ color: "var(--text-muted)" }}>
              {formatRelativeTime(session.createdAt)}
            </span>
            {/* dots — overlaid on hover */}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuPos({ x: e.clientX, y: e.clientY }); }}
              className="absolute right-2 opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity icon-btn"
              title="Options"
            >{IC.dots}</button>
          </div>
        )}
      </div>
      {menuPos && (
        <ContextMenu x={menuPos.x} y={menuPos.y} sessionId={session.sessionId}
          onClose={() => setMenuPos(null)} onRename={onStartRename} onDelete={onDelete} />
      )}
    </>
  );
}

// ── Search Overlay ────────────────────────────────────────────────────────────
function SearchOverlay({ sessions, onSelect, onNavigate, onClose }: {
  sessions: ChatSession[]; onSelect: (id: string) => void;
  onNavigate: (id: string) => void; onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = q.trim()
    ? sessions.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))
    : sessions.slice(0, 12);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-lg panel rounded-2xl shadow-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)" }}>{IC.search}</span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
            onKeyDown={(e) => e.key === "Escape" && onClose()} />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No conversations found</p>
          ) : filtered.map((s) => (
            <button key={s.sessionId}
              onClick={() => { onSelect(s.sessionId); onNavigate(s.sessionId); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left footer-nav-item">
              <span className="opacity-40">{IC.chatSmall}</span>
              <span className="truncate">{s.title || "New chat"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

function groupSessions(list: ChatSession[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const groups: { label: string; items: ChatSession[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Older", items: [] },
  ];
  for (const s of list) {
    const t = new Date(s.createdAt).getTime();
    if (t >= today) groups[0].items.push(s);
    else if (t >= yesterday) groups[1].items.push(s);
    else groups[2].items.push(s);
  }
  return groups.filter((g) => g.items.length > 0);
}
export type SidebarProps = {
  sessions: ChatSession[]; activeSessionId: string;
  onNewChat: () => void; onSwitch: (id: string) => void;
  onDelete: (id: string) => void; onRename: (id: string, title: string) => void;
  onOpenKB: () => void; onOpenPlugins: () => void;
  isOpen: boolean; onToggle: () => void;
  user: User; onLogout: () => void;
  searchQuery?: string;
  isLoadingSessions?: boolean;
};

export default function Sidebar({
  sessions, activeSessionId, onNewChat, onSwitch, onDelete, onRename,
  onOpenKB, onOpenPlugins, isOpen, onToggle, user, onLogout, searchQuery = "",
  isLoadingSessions = false,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const handleStartRename = useCallback((id: string) => setRenamingId(id), []);
  const handleCancelRename = useCallback(() => setRenamingId(null), []);
  const handleRename = useCallback((id: string, title: string) => { onRename(id, title); setRenamingId(null); }, [onRename]);

  const initials = getInitials(user.display_name);

  const activeNav = pathname === "/plugins" ? "integrations" : pathname === "/settings" ? "settings" : pathname === "/team" ? "team" : pathname.startsWith("/app") ? "chat" : "chat";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
          onClick={onToggle} />
      )}

      <aside
        className="fixed md:relative z-40 h-full flex flex-col sidebar transition-[width] duration-300 ease-in-out shrink-0 overflow-hidden"
        style={{ width: isOpen ? "var(--sidebar-width)" : 0, willChange: "width" }}
      >
        <div className="flex flex-col h-full" style={{ width: "var(--sidebar-width)" }}>

          {/* ── Brand header ── */}
          <div className="flex items-center px-4 pt-5 pb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Whitelotus AI" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Whitelotus AI
              </span>
            </div>
          </div>

          {/* ── New Chat button ── */}
          <div className="px-3 pb-4 shrink-0">
            <button onClick={onNewChat}
              className="new-chat-btn flex items-center justify-center gap-2 w-full py-2.5 px-3"
              title="New chat (⌘N)">
              {IC.plus}
              <span>New Chat</span>
            </button>
          </div>

          {/* ── Primary nav ── */}
          <nav className="px-2 space-y-0.5 shrink-0">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === activeNav;

              if (item.soon) {
                return (
                  <div key={item.id}
                    className="nav-item opacity-50 cursor-not-allowed select-none"
                    title="Coming soon">
                    {item.icon}
                    <span>{item.label}</span>
                    <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(99,102,241,0.10)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.20)" }}>
                      Soon
                    </span>
                  </div>
                );
              }

              if (item.id === "integrations") {
                return (
                  <Link key={item.id} href="/plugins"
                    className={`nav-item ${isActive ? "active" : ""}`}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              if (item.id === "team") {
                return (
                  <Link key={item.id} href="/team" className={`nav-item ${isActive ? "active" : ""}`}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              if (item.id === "settings") {
                return (
                  <Link key={item.id} href="/settings"
                    className={`nav-item ${isActive ? "active" : ""}`}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link key={item.id} href={item.href}
                  className={`nav-item ${isActive ? "active" : ""}`}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Divider ── */}
          <div className="mx-3 my-3 h-px shrink-0" style={{ background: "var(--border)" }} />

          {/* ── Recent chats ── */}
          <div className="flex-1 overflow-y-auto px-2 min-h-0">
            <div className="flex items-center justify-end px-2 mb-1.5">
              <button onClick={() => setSearchOpen(true)} className="icon-btn p-1" title="Search">
                {IC.search}
              </button>
            </div>
            <div className="space-y-0.5">
              {isLoadingSessions ? (
                /* ── Session skeleton ── */
                <div className="space-y-1 px-1 pt-1" aria-busy="true" aria-label="Loading conversations">
                  {[72, 56, 64, 48].map((w, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-1.5">
                      <div className="w-3.5 h-3.5 rounded shrink-0 animate-pulse" style={{ background: "var(--surface-hover)" }} />
                      <div className="h-2.5 rounded animate-pulse" style={{ width: `${w}%`, background: "var(--surface-hover)" }} />
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <>
                  {sessions
                    .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((s) => (
                      <SessionItem
                        key={s.sessionId} session={s} isActive={s.sessionId === activeSessionId}
                        onSwitch={onSwitch} onDelete={onDelete} onRename={handleRename}
                        isRenaming={renamingId === s.sessionId}
                        onStartRename={handleStartRename} onCancelRename={handleCancelRename}
                      />
                    ))}
                  {sessions.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>No conversations found</p>
                  )}
                </>
              ) : sessions.length === 0 ? (
                /* ── Empty state ── */
                <div className="flex flex-col items-center gap-3 px-3 py-8 text-center animate-fade-up">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--surface-hover)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5"
                      style={{ color: "var(--text-muted)" }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No chats yet</p>
                    <p className="text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>Start a conversation to see it here</p>
                  </div>
                  <button onClick={onNewChat}
                    className="hover-surface text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(99,102,241,0.10)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.20)" }}
                  >
                    Start first chat
                  </button>
                </div>
              ) : (
                groupSessions(sessions).map((group) => (
                  <div key={group.label} className="mb-1">
                    <div className="flex items-center gap-2 px-2 pt-3 pb-1">
                      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                      <span className="text-[9px] font-semibold uppercase tracking-widest shrink-0"
                        style={{ color: "var(--text-muted)" }}>{group.label}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "var(--surface-hover)", color: "var(--text-muted)" }}>
                        {group.items.length}
                      </span>
                      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    </div>
                    {group.items.map((s) => (
                      <SessionItem
                        key={s.sessionId} session={s} isActive={s.sessionId === activeSessionId}
                        onSwitch={onSwitch} onDelete={onDelete} onRename={handleRename}
                        isRenaming={renamingId === s.sessionId}
                        onStartRename={handleStartRename} onCancelRename={handleCancelRename}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── User row ── */}
          <div className="shrink-0 px-3 pt-2 pb-3 relative"
            style={{ borderTop: "1px solid var(--border)" }}>
            <div className="absolute -top-6 left-0 right-0 h-6 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, var(--surface-sidebar))" }} />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate leading-none" style={{ color: "var(--text-primary)" }}>
                  {user.display_name}
                </p>
                <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {user.email}
                </p>
              </div>
              <button onClick={onLogout} title="Sign out"
                className="icon-btn p-1.5 hover:text-red-500">
                {IC.logout}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {searchOpen && (
        <SearchOverlay
          sessions={sessions}
          onSelect={onSwitch}
          onNavigate={(id) => router.push(`/app/chat/${id}`)}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}
