"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateId } from "@/lib/utils";
import { normalizeHistoryMessage } from "@/lib/messageNormalizer";
import {
  streamChat,
  fetchHistory,
  renameSessionTitle,
  deleteSession as apiDeleteSession,
} from "@/lib/api";
import type { Message, ChatSession, ChatStreamEvent, DocumentChoice, ActivityItem, DiscoveredSource, VerificationResult } from "@/types/chat";
import { pushNotification } from "@/hooks/useNotifications";
import { useSessionStore } from "@/store/sessionStore";

export function useChat(
  userId: string,
  onMobileSwitch?: () => void,
  onNavigate?: (sessionId: string) => void,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const regenerateModeRef = useRef(false);

  const abortRef = useRef<AbortController | null>(null);
  const creatingSessionRef = useRef(false);
  const userIdRef = useRef(userId);
  const onMobileSwitchRef = useRef(onMobileSwitch);
  const qc = useQueryClient();

  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { onMobileSwitchRef.current = onMobileSwitch; }, [onMobileSwitch]);

  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const isLoadingSessions = false; // sessions loading is handled by layout's useQuery
  const storeSwitchSession = useSessionStore((s) => s.switchSession);
  const storeStartNewChat = useSessionStore((s) => s.startNewChat);
  const storeDeleteSession = useSessionStore((s) => s.deleteSession);
  const storeRenameSession = useSessionStore((s) => s.renameSession);

  // Read sessions from React Query cache — same data as AppShell/Sidebar
  const rawSessions = qc.getQueryData<Array<{ session_id: string; title: string; updated_at: string }>>([ "sessions", userId]) ?? [];
  const sessions: ChatSession[] = rawSessions.map((s) => ({
    sessionId: s.session_id,
    title: s.title || "New chat",
    createdAt: s.updated_at,
  }));

  // Helper to write back to the sessions cache
  const setSessionsCache = useCallback((updater: (prev: Array<{ session_id: string; title: string; updated_at: string }>) => Array<{ session_id: string; title: string; updated_at: string }>) => {
    qc.setQueryData(["sessions", userId], (prev: Array<{ session_id: string; title: string; updated_at: string }> | undefined) =>
      updater(prev ?? [])
    );
  }, [qc, userId]);

  const activeSessionIdRef = useRef(activeSessionId);
  const messagesRef = useRef(messages);
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Clear messages immediately when session changes so stale content never shows
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [activeSessionId]);

  // TanStack Query owns history fetching — no manual useEffect, no loading state, no race guards
  const historyQuery = useQuery({
    queryKey: ["history", activeSessionId],
    queryFn: () => fetchHistory(activeSessionId),
    enabled: !!activeSessionId,
    staleTime: Infinity, // history is only invalidated explicitly after sendMessage
  });

  const isLoadingHistory = historyQuery.isLoading;
  const historyError = historyQuery.error ? (historyQuery.error instanceof Error ? historyQuery.error.message : "Failed to load conversation history") : null;
  const retryHistory = useCallback(() => { historyQuery.refetch(); }, [historyQuery.refetch]);

  // Derive messages from query data — auto-title side effect runs here
  useEffect(() => {
    if (!historyQuery.data || !activeSessionId) return;
    const data = historyQuery.data;
    const rawMessages = Array.isArray(data?.messages)
      ? data.messages
      : Array.isArray(data?.response?.messages)
        ? data.response.messages
        : [];
    const msgs: Message[] = rawMessages
      .map((item: unknown) => normalizeHistoryMessage(item))
      .filter((item): item is Omit<Message, "id"> => item !== null)
      .map((item) => ({ ...item, id: generateId() }));
    setMessages(msgs);

    // Auto-title from first user message if still "New chat"
    const session = sessions.find((s) => s.sessionId === activeSessionId);
    if (msgs.length > 0 && session?.title === "New chat") {
      const firstUser = msgs.find((m) => m.role === "user");
      if (firstUser) {
        const derived = firstUser.content.slice(0, 40);
        renameSessionTitle(activeSessionId, derived).catch(() => {});
        setSessionsCache((prev) => prev.map((s) =>
          s.session_id === activeSessionId ? { ...s, title: derived } : s
        ));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyQuery.data, activeSessionId]);

  const startNewChat = useCallback(async () => {
    if (creatingSessionRef.current) return;
    const currentSession = sessions.find((s) => s.sessionId === activeSessionIdRef.current);
    const isEmptyNewChat = currentSession?.title === "New chat" && messagesRef.current.length === 0 && !isStreaming;
    if (isEmptyNewChat) return;

    creatingSessionRef.current = true;
    abortRef.current?.abort();
    setMessages([]);
    setError(null);

    try {
      const newId = await storeStartNewChat(userIdRef.current);
      if (newId) onNavigate?.(newId);
    } finally {
      creatingSessionRef.current = false;
    }
  }, [isStreaming, storeStartNewChat, onNavigate]);

  const switchSession = useCallback(async (targetSessionId: string) => {
    if (isStreaming || isLoadingHistory || targetSessionId === activeSessionIdRef.current) return;

    // Clean up empty "New chat" before switching
    const currentSession = sessions.find((s) => s.sessionId === activeSessionIdRef.current);
    if (currentSession?.title === "New chat" && messagesRef.current.length === 0) {
      apiDeleteSession(currentSession.sessionId).catch(() => {});
      setSessionsCache((prev) => prev.filter((s) => s.session_id !== currentSession.sessionId));
    }

    abortRef.current?.abort();
    setError(null);
    storeSwitchSession(userIdRef.current, targetSessionId);
    onNavigate?.(targetSessionId);
    if (typeof window !== "undefined" && window.innerWidth < 768) onMobileSwitchRef.current?.();
  }, [isStreaming, isLoadingHistory, storeSwitchSession, setSessionsCache, onNavigate]);

  const deleteSession = useCallback(async (targetSessionId: string) => {
    const navigateAfter = targetSessionId === activeSessionIdRef.current;
    await storeDeleteSession(userId, targetSessionId, sessions);
    if (navigateAfter) {
      const next = useSessionStore.getState().activeSessionId;
      if (next) onNavigate?.(next);
    }
  }, [storeDeleteSession, userId, sessions, onNavigate]);

  const renameSession = useCallback(async (targetSessionId: string, title: string) => {
    await storeRenameSession(targetSessionId, title);
  }, [storeRenameSession]);

  const sendMessage = useCallback(async (text: string, transportText?: string) => {
    const visibleText = text.trim();
    const agentText = (transportText ?? text).trim();
    if (!visibleText || !agentText || isStreaming || !activeSessionId) return;
    setError(null);

    const isAction = agentText.startsWith("__WL_ACTION__");
    const userMsg: Message = {
      id: generateId(),
      role: "user",
      type: isAction ? "action" : "text",
      content: visibleText,
      data: isAction ? { transport: agentText } : {},
      created_at: new Date().toISOString(),
    };
    const assistantMsg: Message = {
      id: generateId(),
      role: "assistant",
      type: "text",
      content: "",
      status: "Understanding your request...",
      data: {},
      verification: undefined,
      created_at: new Date().toISOString(),
    };

    if (regenerateModeRef.current) {
      setMessages((prev) => [...prev, assistantMsg]);
    } else {
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
    }
    setIsStreaming(true);

    // Title + bubble to top
    const session = sessions.find((s) => s.sessionId === activeSessionId);
    if (session) {
      const isFirst = session.title === "New chat";
      const newTitle = isFirst ? visibleText.slice(0, 40) : session.title;
      if (isFirst) renameSessionTitle(activeSessionId, newTitle).catch(() => {});
      setSessionsCache((prev) => {
        const updated = prev.map((s) =>
          s.session_id === activeSessionId
            ? { ...s, title: newTitle, updated_at: new Date().toISOString() }
            : s
        );
        const active = updated.find((s) => s.session_id === activeSessionId)!;
        return [active, ...updated.filter((s) => s.session_id !== activeSessionId)];
      });
    }

    abortRef.current = new AbortController();
    // Invalidate history cache for this session after message completes
    // (done in finally block via qc reference captured in closure)
    const targetSessionId = activeSessionId;
    try {
      for await (const event of streamChat(targetSessionId, agentText, abortRef.current.signal, visibleText)) {
        const updateAssistant = (updater: (m: Message) => Message) => {
          setMessages((prev) => {
            let changed = false;
            const next = prev.map((m) => {
              if (m.id !== assistantMsg.id) return m;
              const updated = updater(m);
              if (updated !== m) changed = true;
              return updated;
            });
            return changed ? next : prev;
          });
        };

        if (event.type === "activity") {
          const item: ActivityItem = {
            step_id:     String(event.data.step_id ?? ""),
            label:       String(event.data.label ?? ""),
            status:      (event.data.status as ActivityItem["status"]) ?? "running",
            tool_name:   String(event.data.tool_name ?? ""),
            category:    String(event.data.category ?? ""),
            duration_ms: typeof event.data.duration_ms === "number" ? event.data.duration_ms : undefined,
            error:       event.data.error ? String(event.data.error) : undefined,
          };
          updateAssistant((m) => {
            const prev = m.activities ?? [];
            const idx = prev.findIndex((a) => a.step_id === item.step_id);
            const next = idx >= 0 ? prev.map((a, i) => (i === idx ? item : a)) : [...prev, item];
            return { ...m, activities: next };
          });
        } else if (event.type === "source_discovered") {
          const src: DiscoveredSource = {
            source_id:   String(event.data.source_id ?? ""),
            source_type: String(event.data.source_type ?? ""),
            title:       String(event.data.title ?? ""),
            connector:   String(event.data.connector ?? ""),
            url:         event.data.url ? String(event.data.url) : undefined,
            citation_id: String(event.data.citation_id ?? ""),
            sender:      event.data.sender ? String(event.data.sender) : undefined,
            date:        event.data.date ? String(event.data.date) : undefined,
          };
          updateAssistant((m) => {
            const prev = m.sources ?? [];
            if (prev.some((s) => s.source_id === src.source_id)) return m;
            return { ...m, sources: [...prev, src] };
          });
        } else if (event.type === "status") {
          updateAssistant((m) => ({ ...m, status: String(event.data.message ?? "Working...") }));
        } else if (event.type === "token") {
          const token = String(event.data.text ?? "");
          if (token) updateAssistant((m) => ({ ...m, type: "text", content: m.content + token, status: undefined }));
        } else if (event.type === "replace") {
          const finalText = String(event.data.text ?? "");
          if (finalText) updateAssistant((m) => ({ ...m, type: "text", content: finalText, status: undefined }));
        } else if (event.type === "document_selector") {
          const documents = Array.isArray(event.data.documents) ? event.data.documents as DocumentChoice[] : [];
          const prompt = String(event.data.prompt ?? "Which document would you like me to continue with?");
          const operation = String(event.data.operation ?? "document_summary");
          const rawActionLabel = String(event.data.action_label ?? "Continue");
          const isCompare = operation === "document_comparison" || operation === "compare" || rawActionLabel.toLowerCase().startsWith("compare");
          const normalizedOperation = isCompare ? "document_comparison" : operation;
          const actionLabel = isCompare ? "Compare" : rawActionLabel;
          const multiSelect = Boolean(event.data.multi_select) || isCompare;
          const rawMin = Number(event.data.min_selection ?? (isCompare ? 2 : 1));
          const minSelection = Number.isFinite(rawMin) ? Math.max(isCompare ? 2 : 1, Math.floor(rawMin)) : (isCompare ? 2 : 1);
          updateAssistant((m) => ({
            ...m,
            type: "document_selector",
            content: prompt,
            data: { documents, prompt, operation: normalizedOperation, action_label: actionLabel, multi_select: multiSelect, min_selection: minSelection },
            status: undefined,
          }));
        } else if (event.type === "verification_complete") {
          const _allowedVerdicts = new Set(["verified", "unverified", "skipped", "failed"]);
          const rawVerdict = String(event.data.verdict ?? "skipped");
          const verdict = _allowedVerdicts.has(rawVerdict) ? rawVerdict : "skipped";
          const reason = String(event.data.reason ?? "").slice(0, 200);
          const result: VerificationResult = { verdict: verdict as VerificationResult["verdict"], reason };
          updateAssistant((m) => ({ ...m, verification: result }));
        } else if (event.type === "error") {
          const errorMessage = String(event.data.message ?? "Something went wrong.");
          setError(errorMessage);
          updateAssistant((m) => ({ ...m, type: "text", content: errorMessage, status: undefined }));
        } else if (event.type === "done") {
          updateAssistant((m) => {
            if (!m.activities?.some((a) => a.status === "running")) return m;
            return {
              ...m,
              activities: m.activities.map((a) =>
                a.status === "running" ? { ...a, status: "interrupted" as const } : a
              ),
            };
          });
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setMessages((prev) => prev
          .map((m) => m.id === assistantMsg.id
            ? { ...m, status: undefined, activities: m.activities?.map((a) => a.status === "running" ? { ...a, status: "skipped" as const } : a) }
            : m
          )
          .filter((m) => !(m.id === assistantMsg.id && !m.content))
        );
        return;
      }
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      setMessages((prev) => prev.map((m) =>
        m.id === assistantMsg.id
          ? { ...m, type: "text", content: errorMessage, status: undefined, activities: m.activities?.map((a) => a.status === "running" ? { ...a, status: "failed" as const } : a) }
          : m
      ));
    } finally {
      regenerateModeRef.current = false;
      setIsStreaming(false);
      abortRef.current = null;
      // Invalidate so next history load reflects the new messages
      qc.invalidateQueries({ queryKey: ["history", activeSessionId] });
    }
  }, [isStreaming, activeSessionId, setSessionsCache, qc]);

  const sendDocumentAction = useCallback((label: string, action: string, payload: Record<string, unknown>) => {
    return sendMessage(label, "__WL_ACTION__" + JSON.stringify({ action, ...payload }));
  }, [sendMessage]);

  const regenerate = useCallback(() => {
    if (isStreaming) return;
    setError(null);
    const msgs = messagesRef.current;
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const lastUserIndex = msgs.findLastIndex((m) => m.role === "user");
    setMessages((prev) => prev.slice(0, lastUserIndex + 1));
    regenerateModeRef.current = true;
    sendMessage(lastUser.content);
  }, [isStreaming, sendMessage]);

  const stopStreaming = useCallback(() => { abortRef.current?.abort(); }, []);

  return {
    messages,
    sessionId: activeSessionId,
    sessions,
    isStreaming,
    isLoadingHistory,
    isLoadingSessions,
    error,
    historyError,
    retryHistory,
    sendMessage,
    sendDocumentAction,
    startNewChat,
    switchSession,
    deleteSession,
    renameSession,
    stopStreaming,
    regenerate,
  };
}
