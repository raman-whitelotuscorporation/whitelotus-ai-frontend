import { create } from "zustand";
import type { RefObject } from "react";
import type { IntegrationProvider, KBDocument } from "@/types/chat";

interface ShellStore {
  sidebarOpen: boolean;
  searchQuery: string;
  // Chat page writes these on mount, clears on unmount.
  // Non-chat pages leave them null — sidebar hides KB/plugins buttons.
  onOpenKB: (() => void) | null;
  onOpenPlugins: (() => void) | null;
  onSendMessage: ((text: string, transportText?: string) => void) | null;
  // Search input ref forwarded from chat page's useKeyboardShortcuts
  searchInputRef: RefObject<HTMLInputElement | null> | null;
  // RightPanel data — pushed by ChatPage, consumed by chat/layout.tsx
  connectedPlugins: Set<IntegrationProvider>;
  kbDocs: KBDocument[];

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (q: string) => void;
  setChatCallbacks: (onOpenKB: () => void, onOpenPlugins: () => void, onSendMessage: (text: string, transportText?: string) => void, searchInputRef: RefObject<HTMLInputElement | null>) => void;
  clearChatCallbacks: () => void;
  setConnectedPlugins: (plugins: Set<IntegrationProvider>) => void;
  setKbDocs: (docs: KBDocument[]) => void;
}

export const useShellStore = create<ShellStore>((set) => ({
  sidebarOpen: true,
  searchQuery: "",
  onOpenKB: null,
  onOpenPlugins: null,
  onSendMessage: null,
  searchInputRef: null,
  connectedPlugins: new Set(),
  kbDocs: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setChatCallbacks: (onOpenKB, onOpenPlugins, onSendMessage, searchInputRef) => set({ onOpenKB, onOpenPlugins, onSendMessage, searchInputRef }),
  // Only clear overlay callbacks + searchInputRef on ChatPage unmount.
  // onSendMessage, connectedPlugins, kbDocs are intentionally kept so
  // RightPanel (in chat/layout.tsx) doesn't flash stale/empty state
  // between session switches. They are overwritten by the next setChatCallbacks.
  clearChatCallbacks: () => set({ onOpenKB: null, onOpenPlugins: null, searchInputRef: null }),
  setConnectedPlugins: (plugins) => set({ connectedPlugins: plugins }),
  setKbDocs: (docs) => set({ kbDocs: docs }),
}));
