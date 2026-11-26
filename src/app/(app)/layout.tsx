"use client";
import type { ReactNode } from "react";
import { useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useSessionStore } from "@/store/sessionStore";
import { useShellStore } from "@/store/shellStore";
import { fetchSessions, createSession } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import AppNavbar from "@/components/AppNavbar";
import AppLoadingScreen from "@/components/AppLoadingScreen";
import type { ChatSession } from "@/types/chat";

function activeKey(userId: string) { return `wl_active_${userId}`; }

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authState, logout } = useAuth();
  const userId = user?.user_id ?? "";

  const resolveActiveSession = useSessionStore((s) => s.resolveActiveSession);
  const startNewChat         = useSessionStore((s) => s.startNewChat);
  const switchSession        = useSessionStore((s) => s.switchSession);
  const deleteSession        = useSessionStore((s) => s.deleteSession);
  const renameSession        = useSessionStore((s) => s.renameSession);
  const activeSessionId      = useSessionStore((s) => s.activeSessionId);

  const sidebarOpen   = useShellStore((s) => s.sidebarOpen);
  const toggleSidebar = useShellStore((s) => s.toggleSidebar);
  const searchQuery   = useShellStore((s) => s.searchQuery);
  const setSearchQuery = useShellStore((s) => s.setSearchQuery);
  const onOpenKB      = useShellStore((s) => s.onOpenKB);
  const onOpenPlugins = useShellStore((s) => s.onOpenPlugins);

  const searchInputRef = useShellStore((s) => s.searchInputRef);

  // Show "Back to chat" on non-chat pages
  const backHref = pathname.startsWith("/app/chat") ? undefined : "/app";

  // ── Sessions fetch — single owner, staleTime 60s ──────────────────────────
  const { data: rawSessions } = useQuery({
    queryKey: ["sessions", userId],
    queryFn: async () => {
      const sessions = await fetchSessions();
      if (sessions.length === 0) {
        const id = await createSession();
        const newSession = { session_id: id, title: "New chat", updated_at: new Date().toISOString() };
        localStorage.setItem(activeKey(userId), id);
        return [newSession];
      }
      return sessions;
    },
    enabled: authState === "authenticated" && !!userId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!rawSessions?.length || !userId) return;
    resolveActiveSession(userId, rawSessions.map((s) => ({ sessionId: s.session_id })));
  }, [rawSessions, userId, resolveActiveSession]);

  const sessions = useMemo<ChatSession[]>(
    () => (rawSessions ?? []).map((s) => ({
      sessionId: s.session_id,
      title: s.title || "New chat",
      createdAt: s.updated_at,
    })),
    [rawSessions],
  );

  const handleNewChat = useCallback(async () => {
    const id = await startNewChat(userId);
    if (id) router.push(`/app/chat/${id}`);
  }, [startNewChat, userId, router]);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authState === "unauthenticated") router.replace("/login");
  }, [authState, router]);

  if (authState === "loading") return <AppLoadingScreen />;
  if (authState === "unauthenticated" || !user) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface-page)" }}>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSwitch={(id) => {
          switchSession(userId, id);
          router.push(`/app/chat/${id}`);
          // Close sidebar on mobile after switching
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            useShellStore.getState().setSidebarOpen(false);
          }
        }}
        onDelete={(id) => deleteSession(userId, id, sessions)}
        onRename={renameSession}
        onOpenKB={onOpenKB ?? (() => router.push("/app"))}
        onOpenPlugins={onOpenPlugins ?? (() => router.push("/plugins"))}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        user={user}
        onLogout={logout}
        searchQuery={searchQuery}
        isLoadingSessions={!rawSessions && !!userId}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppNavbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={!!searchInputRef}
          searchInputRef={searchInputRef ?? undefined}
          searchPlaceholder="Search  ⌘K"
          backHref={backHref}
          user={user}
          onLogout={logout}
        />
        {children}
      </div>
    </div>
  );
}
