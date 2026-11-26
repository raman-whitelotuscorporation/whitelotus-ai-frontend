"use client";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useSessionStore } from "@/store/sessionStore";
import { useShellStore } from "@/store/shellStore";
import ChatInput from "@/components/ChatInput";
import ChatEmptyState from "@/components/ChatEmptyState";
import ChatMessageList from "@/components/ChatMessageList";
import AppLoadingScreen from "@/components/AppLoadingScreen";
const KnowledgeBase = lazy(() => import("@/components/KnowledgeBase"));
const PluginsPage   = lazy(() => import("@/components/PluginsPage"));
import type { IntegrationProvider } from "@/types/chat";
import { getInitials, isAdmin } from "@/lib/utils";
import { useConnectedPlugins } from "@/hooks/useConnectedPlugins";
import { useScrollManager } from "@/hooks/useScrollManager";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDocuments } from "@/hooks/useDocuments";
import { pushNotification } from "@/hooks/useNotifications";
import { ingestFile } from "@/lib/api";
import { dispatchAppEvent, listenAppEvent } from "@/lib/events";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const initialSessionId = typeof params.sessionId === "string" ? params.sessionId : "";

  const { user, authState } = useAuth();
  const storeSetActive = useSessionStore((s) => s.setActiveSessionId);

  const setChatCallbacks   = useShellStore((s) => s.setChatCallbacks);
  const clearChatCallbacks = useShellStore((s) => s.clearChatCallbacks);
  const setConnectedPlugins = useShellStore((s) => s.setConnectedPlugins);
  const setKbDocs           = useShellStore((s) => s.setKbDocs);

  // Sync URL session ID into the store
  useEffect(() => {
    if (initialSessionId) storeSetActive(initialSessionId);
  }, [initialSessionId, storeSetActive]);

  const handleNavigate = useCallback((id: string) => {
    router.replace(`/app/chat/${id}`);
  }, [router]);

  const {
    messages, sessionId, isStreaming, isLoadingHistory, error,
    historyError, retryHistory,
    sendMessage, sendDocumentAction, startNewChat, stopStreaming, regenerate,
  } = useChat(
    user?.user_id ?? "",
    undefined,
    handleNavigate,
  );

  const [kbOpenTab, setKbOpenTab] = useState<"docs" | "text" | "file" | null>(null);
  const [pluginsOpen, setPluginsOpen] = useState(false);
  const { docs: kbDocs, refresh: refreshDocs } = useDocuments();
  const { connected: connectedPlugins, pluginStatuses, add: addConnectedPlugin } = useConnectedPlugins(authState, user);
  const { scrollContainerRef, bottomRef, handleScroll, showScrollBtn, visibleCount, setVisibleCount, scrollToBottom } = useScrollManager(messages, sessionId, isStreaming);
  const { searchInputRef } = useKeyboardShortcuts(startNewChat);

  const handleOpenKBDocs   = useCallback(() => setKbOpenTab("docs"), []);
  const handleOpenKBFile   = useCallback(() => setKbOpenTab("file"), []);
  const handleOpenPlugins  = useCallback(() => setPluginsOpen(true), []);
  const handleClosePlugins = useCallback(() => setPluginsOpen(false), []);
  const handleCloseKB      = useCallback(() => { setKbOpenTab(null); refreshDocs(); }, [refreshDocs]);

  // Register chat-specific callbacks into the shell so the persistent Sidebar
  // and RightPanel (in chat/layout.tsx) can access them without prop drilling.
  useEffect(() => {
    setChatCallbacks(handleOpenKBDocs, handleOpenPlugins, sendMessage, searchInputRef);
    return () => clearChatCallbacks();
  }, [setChatCallbacks, clearChatCallbacks, handleOpenKBDocs, handleOpenPlugins, sendMessage, searchInputRef]);

  // Keep RightPanel data in shellStore in sync with live values.
  useEffect(() => { setConnectedPlugins(connectedPlugins); }, [connectedPlugins, setConnectedPlugins]);
  useEffect(() => { setKbDocs(kbDocs); }, [kbDocs, setKbDocs]);

  const lastAssistantIdx = useMemo(
    () => messages.findLastIndex((m) => m.role === "assistant"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages.length, messages[messages.length - 1]?.id]
  );
  const showTyping = useMemo(() => {
    const lastMsg = messages[messages.length - 1];
    return isStreaming && lastMsg?.role === "assistant" && lastMsg.content === "" && lastMsg.type === "text";
  }, [messages, isStreaming]);
  const isEmpty = useMemo(
    () => messages.length === 0 && !isLoadingHistory && !historyError,
    [messages.length, isLoadingHistory, historyError]
  );

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      pushNotification("info", "Uploading", `Uploading ${file.name}…`);
      await ingestFile(file);
      pushNotification("success", "File uploaded", `${file.name} added to knowledge base`);
      refreshDocs();
    } catch (err) {
      pushNotification("error", "Upload failed", err instanceof Error ? err.message : "Upload failed");
    }
  }, [refreshDocs]);

  const handlePluginConnected = useCallback((id: IntegrationProvider) => {
    addConnectedPlugin(id);
  }, [addConnectedPlugin]);

  const handleLoadMore = useCallback(
    () => setVisibleCount((c) => Math.min(c + 20, messages.length)),
    [messages.length, setVisibleCount]
  );
  const handleEdit = useCallback((content: string) => {
    dispatchAppEvent("chat:inject", content);
  }, []);

  const userInitials = useMemo(
    () => (user ? getInitials(user.display_name) : "U"),
    [user]
  );

  const injectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unlisten = listenAppEvent("plugin:chat", (name) => {
      setPluginsOpen(false);
      if (injectTimerRef.current) clearTimeout(injectTimerRef.current);
      injectTimerRef.current = setTimeout(
        () => dispatchAppEvent("chat:inject", `@${name} `), 150
      );
    });
    return () => {
      unlisten();
      if (injectTimerRef.current) clearTimeout(injectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (authState === "unauthenticated") router.replace("/login");
  }, [authState, router]);

  if (authState === "loading") return <AppLoadingScreen />;
  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

      {historyError && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl text-sm shrink-0 animate-fade-up flex items-center justify-between gap-3"
          style={{ background: "var(--status-error-bg)", border: "1px solid var(--status-error-border)", borderLeft: "3px solid var(--status-error-text)", color: "var(--status-error-text)" }}>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>Could not load conversation history.</span>
          </div>
          <button onClick={retryHistory}
            className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
            style={{ background: "var(--status-error-bg)", color: "var(--status-error-text)", border: "1px solid var(--status-error-border)" }}>
            Retry
          </button>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl text-sm shrink-0 animate-fade-up flex items-center justify-between gap-3"
          style={{ background: "var(--status-error-bg)", border: "1px solid var(--status-error-border)", borderLeft: "3px solid var(--status-error-text)", color: "var(--status-error-text)" }}>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={regenerate}
            className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
            style={{ background: "var(--status-error-bg)", color: "var(--status-error-text)", border: "1px solid var(--status-error-border)" }}>
            Try again
          </button>
        </div>
      )}

      <div ref={scrollContainerRef} onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden chat-area">
        {isEmpty ? (
          <ChatEmptyState onOpenKB={handleOpenKBFile} />
        ) : (
          <ChatMessageList
            messages={messages}
            visibleCount={visibleCount}
            onLoadMore={handleLoadMore}
            userInitials={userInitials}
            onDocumentAction={sendDocumentAction}
            isStreaming={isStreaming}
            isLoadingHistory={isLoadingHistory}
            showTyping={showTyping}
            lastAssistantIdx={lastAssistantIdx}
            onRegenerate={regenerate}
            onEdit={handleEdit}
            bottomRef={bottomRef}
          />
        )}
      </div>

      <div className="relative px-0 sm:px-5 pb-5 pt-3 shrink-0 input-area">
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all animate-fade-up"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            title="Scroll to bottom"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </button>
        )}
        <div className="max-w-screen-md mx-auto">
          <ChatInput
            onSend={sendMessage} disabled={isStreaming} onStop={stopStreaming}
            connectedPlugins={connectedPlugins} onOpenPlugins={handleOpenPlugins}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>

      {kbOpenTab && (
        <Suspense fallback={null}>
          <KnowledgeBase onClose={handleCloseKB} isAdmin={isAdmin(user)} defaultTab={kbOpenTab} />
        </Suspense>
      )}
      {pluginsOpen && (
        <Suspense fallback={null}>
          <PluginsPage
            onClose={handleClosePlugins}
            connected={connectedPlugins}
            pluginStatuses={pluginStatuses}
            onConnected={handlePluginConnected}
          />
        </Suspense>
      )}
    </div>
  );
}
