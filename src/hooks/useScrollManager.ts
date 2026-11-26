"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import type { Message } from "@/types/chat";

export function useScrollManager(messages: Message[], sessionId: string, isStreaming: boolean) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    isNearBottomRef.current = nearBottom;
    setShowScrollBtn(!nearBottom);
    if (el.scrollTop < 120) {
      setVisibleCount((c) => Math.min(c + 20, messages.length));
    }
  }, [messages.length]);

  useEffect(() => {
    if (isNearBottomRef.current) {
      // Use instant scroll during streaming to avoid repeated smooth-scroll
      // animations on every token. Smooth scroll is reserved for the manual
      // scroll-to-bottom button (see scrollToBottom below).
      bottomRef.current?.scrollIntoView({ behavior: isStreaming ? "instant" : "smooth" });
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(40);
    scrollTimerRef.current = setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "instant" }),
      0
    );
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [sessionId]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return { scrollContainerRef, bottomRef, handleScroll, showScrollBtn, visibleCount, setVisibleCount, scrollToBottom };
}
