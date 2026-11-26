"use client";
import { memo } from "react";
import type { RefObject } from "react";
import type { Message } from "@/types/chat";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";

interface ChatMessageListProps {
  messages: Message[];
  visibleCount: number;
  onLoadMore: () => void;
  userInitials: string;
  onDocumentAction: (label: string, action: string, payload: Record<string, unknown>) => void;
  isStreaming: boolean;
  isLoadingHistory: boolean;
  showTyping: boolean;
  lastAssistantIdx: number;
  onRegenerate: () => void;
  onEdit?: (content: string) => void;
  bottomRef: RefObject<HTMLDivElement | null>;
}

const ChatMessageList = memo(function ChatMessageList({
  messages, visibleCount, onLoadMore, userInitials, onDocumentAction,
  isStreaming, isLoadingHistory, showTyping, lastAssistantIdx, onRegenerate, onEdit, bottomRef,
}: ChatMessageListProps) {
  return (
    <div className="max-w-screen-lg mx-auto px-5 py-6 space-y-6">
      {messages.length > visibleCount && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="hover-accent text-xs px-3 py-1.5 rounded-full"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            ↑ Load {Math.min(20, messages.length - visibleCount)} older messages
          </button>
        </div>
      )}

      {messages.slice(-visibleCount).map((m, idx) =>
        (!showTyping || m.role !== "assistant" || m.content !== "") && (
          <div key={m.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(idx, 6) * 40}ms`, animationFillMode: "both" }}>
          <ChatMessage
              message={m}
              userInitials={userInitials}
              onDocumentAction={onDocumentAction}
              isStreaming={isStreaming && m.id === messages[messages.length - 1]?.id && m.role === "assistant"}
              onRegenerate={m.role === "assistant" && messages.findLastIndex((x) => x.role === "assistant") === messages.slice(-visibleCount).indexOf(m) + (messages.length - visibleCount) ? onRegenerate : undefined}
              onEdit={m.role === "user" ? onEdit : undefined}
            />
          </div>
        )
      )}

      {isLoadingHistory && messages.length === 0 && (
        <div className="space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              {i % 2 === 0 && <div className="w-8 h-8 rounded-full shrink-0 animate-pulse" style={{ background: "var(--surface-hover)" }} />}
              <div className="space-y-2" style={{ width: i % 2 === 0 ? "60%" : "40%" }}>
                <div className="h-3 rounded-full animate-pulse" style={{ background: "var(--surface-hover)", width: "40%" }} />
                <div className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface-hover)" }} />
              </div>
              {i % 2 !== 0 && <div className="w-8 h-8 rounded-full shrink-0 animate-pulse" style={{ background: "var(--surface-hover)" }} />}
            </div>
          ))}
        </div>
      )}

      {showTyping && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
});

export default ChatMessageList;
