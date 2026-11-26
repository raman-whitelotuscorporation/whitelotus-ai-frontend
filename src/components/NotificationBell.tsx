"use client";
import React, { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useNotifications } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification, NotifType } from "@/hooks/useNotifications";

const TYPE_STYLES: Record<NotifType, { dot: string; icon: React.ReactNode }> = {
  success: { dot: "bg-emerald-400", icon: <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M20 6 9 17l-5-5"/></svg> },
  info:    { dot: "bg-blue-400",    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth={2} className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> },
  warning: { dot: "bg-amber-400",   icon: <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth={2} className="w-3.5 h-3.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  error:   { dot: "bg-red-400",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg> },
};

function NotifItem({ n }: { n: Notification }) {
  const s = TYPE_STYLES[n.type];
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 transition-colors"
      style={{
        background: n.read ? "transparent" : "rgba(99,102,241,0.04)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span className="shrink-0 mt-0.5">{s.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{n.title}</p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{formatRelativeTime(n.timestamp)}</p>
      </div>
      {!n.read && <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${s.dot}`} />}
    </div>
  );
}

export default function NotificationBell() {
  const { items, unreadCount, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) markAllRead();
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="icon-btn p-2 relative" title="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-red-500 flex items-center justify-center text-[9px] font-bold text-white px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden"
          style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)", maxHeight: "420px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                  {unreadCount}
                </span>
              )}
            </h3>
            {items.length > 0 && (
              <button onClick={clearAll} className="hover-accent text-[11px]"
                style={{ color: "var(--text-muted)" }}>
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "var(--surface-hover)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" style={{ color: "var(--text-muted)" }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No notifications yet</p>
              </div>
            ) : (
              items.map((n) => <NotifItem key={n.id} n={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
