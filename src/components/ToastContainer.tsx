"use client";
import { useEffect, useState } from "react";
import type { NotifType } from "@/types/chat";
import { listenAppEvent } from "@/lib/events";

interface Toast {
  id: string;
  type: NotifType;
  title: string;
  message: string;
}

const COLORS: Record<NotifType, { bar: string; icon: string }> = {
  success: { bar: "#10b981", icon: "✓" },
  info:    { bar: "#60a5fa", icon: "ℹ" },
  warning: { bar: "#fbbf24", icon: "⚠" },
  error:   { bar: "#f87171", icon: "✕" },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return listenAppEvent("wl:notification", ({ type, title, message }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    });
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const c = COLORS[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl animate-fade-up min-w-[260px] max-w-xs"
            style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)", borderLeft: `3px solid ${c.bar}` }}
          >
            <span className="text-sm font-bold shrink-0 mt-0.5" style={{ color: c.bar }}>{c.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t.title}</p>
              {t.message && <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--text-secondary)" }}>{t.message}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
