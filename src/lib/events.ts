import type { IntegrationProvider, NotifType } from "@/types/chat";

// ── Typed custom-event helpers ────────────────────────────────────────────────
// Each event has a strongly-typed dispatch + listen pair so callers never need
// `(e as CustomEvent<T>)` casts.

type EventMap = {
  "wl:notification": { type: NotifType; title: string; message: string };
  "wl:auth:expired": undefined;
  "plugin:uninstall": IntegrationProvider;
  "plugin:chat": string;
  "chat:inject": string;
};

export function dispatchAppEvent<K extends keyof EventMap>(
  name: K,
  detail: EventMap[K],
): void {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function listenAppEvent<K extends keyof EventMap>(
  name: K,
  handler: (detail: EventMap[K]) => void,
): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<EventMap[K]>).detail);
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
