import { create } from "zustand";
import {
  createSession,
  renameSessionTitle,
  deleteSession as apiDeleteSession,
} from "@/lib/api";
import { pushNotification } from "@/hooks/useNotifications";
import { queryClient } from "@/lib/queryClient";

function activeKey(userId: string) { return `wl_active_${userId}`; }

interface SessionStore {
  activeSessionId: string;

  // Called once by layout after auth resolves — picks the right active session
  // from the already-fetched React Query cache.
  resolveActiveSession: (userId: string, sessions: Array<{ sessionId: string }>) => void;

  startNewChat: (userId: string) => Promise<string | undefined>;
  switchSession: (userId: string, id: string) => void;
  deleteSession: (userId: string, id: string, sessions: Array<{ sessionId: string }>) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  setActiveSessionId: (id: string) => void;
  reset: () => void;
}

// Module-level in-flight guard — prevents concurrent createSession calls
// regardless of which component calls startNewChat.
let _creatingNewChat = false;

export const useSessionStore = create<SessionStore>((set, get) => ({
  activeSessionId: "",

  resolveActiveSession: (userId, sessions) => {
    if (!sessions.length) return;
    const stored = localStorage.getItem(activeKey(userId));
    const target = stored && sessions.find((s) => s.sessionId === stored)
      ? stored
      : sessions[0].sessionId;
    localStorage.setItem(activeKey(userId), target);
    if (get().activeSessionId !== target) set({ activeSessionId: target });
  },

  startNewChat: async (userId: string) => {
    // In-flight guard — rapid clicks cannot create concurrent sessions.
    if (_creatingNewChat) return undefined;

    // Reuse existing empty session — never create a duplicate.
    const cached = queryClient.getQueryData<Array<{ session_id: string; title: string; updated_at: string }>>(["sessions", userId]) ?? [];
    const existingEmpty = cached.find((s) => s.title === "New chat");
    if (existingEmpty) {
      localStorage.setItem(activeKey(userId), existingEmpty.session_id);
      set({ activeSessionId: existingEmpty.session_id });
      return existingEmpty.session_id;
    }

    _creatingNewChat = true;
    try {
      const id = await createSession();
      localStorage.setItem(activeKey(userId), id);
      set({ activeSessionId: id });
      // Prepend new session into the React Query cache immediately — no refetch needed
      queryClient.setQueryData(
        ["sessions", userId],
        (prev: Array<{ session_id: string; title: string; updated_at: string }> | undefined) => [
          { session_id: id, title: "New chat", updated_at: new Date().toISOString() },
          ...(prev ?? []),
        ],
      );
      return id;
    } catch { return undefined; }
    finally { _creatingNewChat = false; }
  },

  switchSession: (userId: string, id: string) => {
    localStorage.setItem(activeKey(userId), id);
    set({ activeSessionId: id });
  },

  deleteSession: async (userId: string, id: string, sessions: Array<{ sessionId: string }>) => {
    try {
      await apiDeleteSession(id);
    } catch {
      pushNotification("error", "Delete failed", "Could not delete the conversation. Please try again.");
      return;
    }
    // Remove from React Query cache
    queryClient.setQueryData(
      ["sessions", userId],
      (prev: Array<{ session_id: string; title: string; updated_at: string }> | undefined) =>
        (prev ?? []).filter((s) => s.session_id !== id),
    );
    // If deleted session was active, switch to next
    if (get().activeSessionId === id) {
      const remaining = sessions.filter((s) => s.sessionId !== id);
      if (remaining.length > 0) {
        const next = remaining[0].sessionId;
        localStorage.setItem(activeKey(userId), next);
        set({ activeSessionId: next });
      } else {
        // All gone — create a fresh one
        try {
          const newId = await createSession();
          localStorage.setItem(activeKey(userId), newId);
          set({ activeSessionId: newId });
          queryClient.setQueryData(["sessions", userId], [
            { session_id: newId, title: "New chat", updated_at: new Date().toISOString() },
          ]);
        } catch { set({ activeSessionId: "" }); }
      }
    }
  },

  renameSession: async (id: string, title: string) => {
    try {
      await renameSessionTitle(id, title);
    } catch {
      pushNotification("error", "Rename failed", "Could not rename the conversation. Please try again.");
    }
  },

  setActiveSessionId: (id: string) => set({ activeSessionId: id }),

  reset: () => set({ activeSessionId: "" }),
}));
