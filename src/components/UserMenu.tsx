"use client";
import { useState, useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { User } from "@/types/chat";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

type Props = {
  user: User;
  onLogout: () => void;
};

function Avatar({ user, size = 32 }: { user: User; size?: number }) {
  if (user.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar_url}
        alt={user.display_name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = getInitials(user.display_name);
  const colors: Record<string, string> = {
    ADMIN: "bg-purple-600",
    MEMBER: "bg-blue-600",
    VIEWER: "bg-slate-600",
  };
  return (
    <div
      className={`${colors[user.role] ?? "bg-blue-600"} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export default function UserMenu({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="hover-surface flex items-center gap-2 px-2 py-1.5 rounded-xl"
        style={{ color: "var(--text-secondary)" }}
        title={user.display_name}
      >
        <Avatar user={user} size={26} />
        <span
          className="text-xs font-medium max-w-[120px] truncate hidden sm:block"
          style={{ color: "var(--text-secondary)" }}
        >
          {user.display_name}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-3 h-3"
          style={{ color: "var(--text-muted)" }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 panel rounded-2xl shadow-2xl py-1.5 z-50 animate-fade-in">
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {user.display_name}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {user.email}
            </p>
          </div>
          {[
            {
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-3.5 h-3.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ),
              label: "Edit profile",
              href: "/settings",
            },
            {
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-3.5 h-3.5"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              label: "Change password",
              href: "/settings?tab=security",
            },
            {
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-3.5 h-3.5"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              ),
              label: "Integrations",
              href: "/plugins",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs transition-colors footer-nav-item"
            >
              <span style={{ color: "var(--text-muted)" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div
            className="mt-1 pt-1"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="w-3.5 h-3.5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
