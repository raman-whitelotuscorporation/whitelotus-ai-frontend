"use client";
import { useState, useEffect, useCallback } from "react";
import type { NotifType } from "@/types/chat";
import { dispatchAppEvent, listenAppEvent } from "@/lib/events";

export type { NotifType };

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const NOTIF_STORAGE_KEY = "wl_notifications";
const MAX = 50;

function load(): Notification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: Notification[]) {
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(items.slice(0, MAX)));
}

// Global event so any component can push a notification
export function pushNotification(type: NotifType, title: string, message: string) {
  dispatchAppEvent("wl:notification", { type, title, message });
}

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(load());
  }, []);

  useEffect(() => {
    return listenAppEvent("wl:notification", ({ type, title, message }) => {
      const notif: Notification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
      };
      setItems((prev) => {
        const next = [notif, ...prev].slice(0, MAX);
        save(next);
        return next;
      });
    });
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    localStorage.removeItem(NOTIF_STORAGE_KEY);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  return { items, unreadCount, markAllRead, clearAll };
}
