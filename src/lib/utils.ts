import type { User, DocumentChoice } from "@/types/chat";

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatRelativeTime(date: number | string): string {
  const ms = typeof date === "number" ? date : new Date(date).getTime();
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "1d ago";
  if (d < 7)  return `${d}d ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function getInitials(displayName: string): string {
  return displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function normalizeInput(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")   // zero-width chars
    .replace(/[\u2018\u2019]/g, "'")           // smart single quotes
    .replace(/[\u201C\u201D]/g, '"')           // smart double quotes
    .replace(/\u2013|\u2014/g, "-")            // em/en dash → hyphen
    .replace(/[ \t]+/g, " ")                   // collapse spaces
    .replace(/\n{3,}/g, "\n\n")               // max 2 consecutive newlines
    .trim();
}

export function isAdmin(user: User | null | undefined): boolean {
  return String(user?.role ?? "").trim().toUpperCase() === "ADMIN";
}

export function parseDocumentSelectorData(message: { type?: string; data?: Record<string, unknown>; content?: string }) {
  const documents: DocumentChoice[] =
    message.type === "document_selector" && Array.isArray(message.data?.documents)
      ? (message.data!.documents as DocumentChoice[])
      : [];
  const prompt = message.type === "document_selector"
    ? String(message.data?.prompt ?? message.content ?? "Which document would you like me to continue with?")
    : "";
  const operation = message.type === "document_selector"
    ? String(message.data?.operation ?? "document_summary")
    : "document_summary";
  const actionLabel = message.type === "document_selector"
    ? String(message.data?.action_label ?? (operation === "document_comparison" ? "Compare selected" : "Continue"))
    : "Continue";
  const multiSelect = message.type === "document_selector" && Boolean(message.data?.multi_select);
  const rawMin = message.type === "document_selector"
    ? Number(message.data?.min_selection ?? (operation === "document_comparison" ? 2 : 1))
    : 1;
  const minSelection = Number.isFinite(rawMin) ? Math.max(1, Math.floor(rawMin)) : 1;
  return { documents, prompt, operation, actionLabel, multiSelect, minSelection };
}
