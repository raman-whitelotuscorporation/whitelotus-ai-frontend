"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSessionStore } from "@/store/sessionStore";
import { useQueryClient } from "@tanstack/react-query";
import AppLoadingScreen from "@/components/AppLoadingScreen";

export default function AppIndexPage() {
  const router = useRouter();
  const { user, authState } = useAuth();
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const userId = user?.user_id ?? "";

  const qc = useQueryClient();
  const rawSessions = qc.getQueryData<unknown[]>(["sessions", userId]);
  const isLoading = !rawSessions && !!userId;

  useEffect(() => {
    if (authState === "unauthenticated") { router.replace("/login"); return; }
    if (authState !== "authenticated" || !user) return;

    const callbackParams = new URLSearchParams(window.location.search);
    if (callbackParams.has("plugin_workspace_required") || callbackParams.has("plugin_connected") || callbackParams.has("plugin_error")) {
      router.replace(`/plugins${window.location.search}`);
    }
  }, [authState, user, router]);

  useEffect(() => {
    if (activeSessionId && !isLoading) {
      router.replace(`/app/chat/${activeSessionId}`);
    }
  }, [activeSessionId, isLoading, router]);

  return <AppLoadingScreen />;
}
