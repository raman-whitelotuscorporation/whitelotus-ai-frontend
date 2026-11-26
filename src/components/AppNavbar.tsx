"use client";
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import UserMenu from "@/components/UserMenu";
import NotificationBell from "@/components/NotificationBell";
import type { User } from "@/types/chat";
import Link from "next/link";

type Props = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  user: User;
  onLogout: () => void;
  backHref?: string;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  searchPlaceholder?: string;
  showSearch?: boolean;
  children?: React.ReactNode;
};

export default function AppNavbar({
  sidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  user,
  onLogout,
  backHref,
  searchInputRef,
  searchPlaceholder = "Search",
  showSearch = true,
  children,
}: Props) {
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <header className="navbar flex items-center gap-3 px-4 py-2 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="icon-btn p-1.5 shrink-0"
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="w-[18px] h-[18px]"
        >
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M9 3v18" />
        </svg>
      </button>

      <div className="hidden sm:block flex-1 max-w-xs mx-auto">
        {showSearch && (
          <div className="search-bar flex items-center gap-2 px-3 py-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        )}
      </div>

      {/* Mobile search slot (page.tsx passes <MobileSearch> here) */}
      {children}

      <div className="flex-1" />

      <div className="flex items-center gap-2 shrink-0">
        {backHref && (
          <Link
            href={backHref}
            className="hover-border-primary flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-3.5 h-3.5"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to chat
          </Link>
        )}

        <div className="flex items-center gap-1.5">
          {theme === "dark" ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
          <button
            onClick={toggleTheme}
            className={`theme-toggle ${theme}`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          />
        </div>

        <NotificationBell />
        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}
