import type { Message, MessageType } from "@/types/chat";

const LEGACY_STATUS_TEXT = new Set([
  "Searching your documents...", "Reading the document...",
  "Extracting information...", "Comparing documents...",
  "Analysing the document...", "Searching documents and tools...",
  "Checking Jira...",
  "Sending to Slack...", "Reading Slack...", "Checking Teams...",
  "Drafting email...",
  "Searching Gmail...", "Reading inbox...", "Preparing reply...",
  "Preparing forward...", "Organising email...", "Fetching attachments...",
  "Fetching labels...", "Searching context...", "Generating response...",
]);

const SELECTOR_MARKERS = ["__DOCUMENT_SELECTOR__", "DOCUMENT_SELECTOR:"];
const ACTION_MARKERS   = ["__WL_ACTION__", "WL_ACTION:"];
const STATUS_MARKERS   = ["__STATUS__:", "STATUS:"];

export function normalizeHistoryMessage(input: unknown): Omit<Message, "id"> | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const role = raw.role === "assistant" ? "assistant" : raw.role === "user" ? "user" : null;
  if (!role) return null;

  let type: MessageType = raw.type === "action" || raw.type === "document_selector" ? (raw.type as MessageType) : "text";
  let content = typeof raw.content === "string" ? raw.content : "";
  let data = raw.data && typeof raw.data === "object" ? raw.data as Record<string, unknown> : {};

  const selectorMarker = SELECTOR_MARKERS.find((m) => content.includes(m));
  const selectorIndex  = selectorMarker ? content.indexOf(selectorMarker) : -1;

  if (selectorMarker && selectorIndex >= 0) {
    try {
      const documents = JSON.parse(content.slice(selectorIndex + selectorMarker.length));
      if (Array.isArray(documents)) {
        type = "document_selector";
        const storedPrompt = typeof data.prompt === "string" ? data.prompt : "";
        content = storedPrompt || "Which document would you like me to summarize?";
        data = { documents, ...(storedPrompt ? { prompt: storedPrompt } : {}) };
      }
    } catch {
      return null;
    }
  } else {
    const actionMarker = ACTION_MARKERS.find((m) => content.startsWith(m));
    const statusMarker = STATUS_MARKERS.find((m) => content.startsWith(m));
    if (actionMarker) {
      try {
        const action = JSON.parse(content.slice(actionMarker.length));
        type = "action";
        content = action?.label || (action?.action === "document_summary" ? "Summarize selected document" : "Requested action");
        data = action && typeof action === "object" ? action : {};
      } catch {
        content = "Requested action";
        type = "action";
      }
    } else if (statusMarker) {
      content = content.slice(statusMarker.length).trim();
      if (!content || LEGACY_STATUS_TEXT.has(content)) return null;
    }
  }

  return { role, type, content, data, created_at: typeof raw.created_at === "string" ? raw.created_at : undefined, sources: Array.isArray(data.sources) ? data.sources : undefined };
}

const VISIBLE_STATUS_MARKERS = ["__STATUS__:", "STATUS:"];
const VISIBLE_SELECTOR_MARKERS = ["__DOCUMENT_SELECTOR__", "DOCUMENT_SELECTOR:"];
const VISIBLE_ACTION_MARKERS = ["__WL_ACTION__", "WL_ACTION:"];

export function normalizeMessageContent(content: string): string {
  for (const marker of VISIBLE_STATUS_MARKERS) {
    if (content.startsWith(marker)) return content.slice(marker.length).trim();
  }
  for (const marker of VISIBLE_SELECTOR_MARKERS) {
    if (content.includes(marker)) return "";
  }
  for (const marker of VISIBLE_ACTION_MARKERS) {
    if (content.startsWith(marker)) return "Requested action";
  }
  return content;
}
