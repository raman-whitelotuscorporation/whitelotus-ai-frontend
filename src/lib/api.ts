import type { ChatStreamEvent, KBDocument, User, AuthTokens } from "@/types/chat";
import type { MemorySettingsResponse, MemoryWrite, SavedMemory } from "@/types/memory";
import { dispatchAppEvent } from "@/lib/events";

// Normalize: strip a trailing /api so that endpoint paths like /api/session/...
// are never doubled to /api/api/session/... when the env var includes the prefix.
const _rawBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const BASE_URL = _rawBase.replace(/\/api\/?$/, "");

// ── Token storage ─────────────────────────────────────────────────────────────

// Tokens are stored in HttpOnly cookies set by the backend.
// The frontend never reads or writes token values directly.
const USER_ID_KEY = "wl_user_id";

// No-op stubs kept for call-site compatibility; tokens live in HttpOnly cookies.
export function getAccessToken(): string | null { return null; }
export function getRefreshToken(): string | null { return null; }

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

// Only persist the non-sensitive user_id for UI use.
export function saveTokens(tokens: AuthTokens): void {
  if (tokens.user?.user_id && typeof window !== "undefined") {
    localStorage.setItem(USER_ID_KEY, tokens.user.user_id);
  }
}

export function clearTokens(): void {
  if (typeof window !== "undefined") localStorage.removeItem(USER_ID_KEY);
}

// ── Authenticated fetch helper ────────────────────────────────────────────────

function apiError(err: Record<string, unknown>, fallback: string): string {
  return String(err.detail ?? err.message ?? fallback);
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const tokens: AuthTokens = await res.json();
    saveTokens(tokens);
    return true;
  } catch {
    return false;
  }
}

// Single-flight refresh: concurrent 401s share one refresh attempt.
// The promise is cleared after resolution so the next genuine 401 retries.
let _refreshPromise: Promise<boolean> | null = null;
function singleFlightRefresh(): Promise<boolean> {
  if (!_refreshPromise) {
    _refreshPromise = tryRefresh().finally(() => { _refreshPromise = null; });
  }
  return _refreshPromise;
}

// Shared 401 → singleFlightRefresh → retry logic used by both authFetch and streamChat.
async function withTokenRefresh(makeRequest: () => Promise<Response>): Promise<Response> {
  const res = await makeRequest();
  if (res.status !== 401) return res;
  const refreshed = await singleFlightRefresh();
  if (refreshed) return makeRequest();
  clearTokens();
  return res; // caller decides what to do with a 401
}

// Endpoints where a 401-after-refresh means the session is truly gone.
// Peripheral endpoints (integrations/status, etc.) returning 401 should NOT
// trigger a global sign-out — they may have their own auth issues.
const AUTH_SENSITIVE_PATHS = ["/api/profile", "/api/session", "/api/chat", "/api/rag", "/api/organizations", "/api/memory"];

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const makeRequest = () =>
    fetch(input, { ...init, credentials: "include" });

  const res = await withTokenRefresh(makeRequest);
  if (res.status === 401) {
    clearTokens();
    // Only fire session-expired for core endpoints when a real session existed.
    const isSensitive = AUTH_SENSITIVE_PATHS.some((p) => input.includes(p));
    // wl_auth=1 is a non-HttpOnly sentinel cookie set by _set_auth_cookies() in
    // rest_api/package/app/api/auth.py alongside the HttpOnly access token.
    // It has the same max_age as the access token and is cleared on logout.
    // Its sole purpose is to let the frontend distinguish a genuine session
    // expiry (cookie present but 401 returned) from an unauthenticated request
    // (cookie never set), without exposing the token value to JavaScript.
    if (isSensitive && typeof window !== "undefined" && document.cookie.includes("wl_auth=1")) {
      dispatchAppEvent("wl:auth:expired", undefined);
    }
  }
  return res;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function logout(refreshToken?: string): Promise<void> {
  await authFetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    ...(refreshToken ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: refreshToken }) } : {}),
  }).catch(() => {});
  clearTokens();
}

export async function register(
  email: string,
  displayName: string,
  password: string,
  organizationName?: string,
  inviteToken?: string,
): Promise<AuthTokens> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      display_name: displayName,
      password,
      ...(organizationName ? { organization_name: organizationName } : {}),
      ...(inviteToken ? { invite_token: inviteToken } : {}),
    }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Registration failed" }));
    if (res.status === 503) throw new Error(err.message ?? "Session storage is temporarily unavailable. Please try again.");
    throw new Error(apiError(err, `HTTP ${res.status}`));
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Invalid email or password" }));
    if (res.status === 503) throw new Error(err.message ?? "Session storage is temporarily unavailable. Please try again.");
    throw new Error(apiError(err, `HTTP ${res.status}`));
  }
  return res.json();
}

export async function getMe(): Promise<User> {
  const res = await authFetch(`${BASE_URL}/api/profile`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  const raw = await res.json();
  return {
    ...raw,
    role: String(raw?.role ?? "MEMBER").trim().toUpperCase() as User["role"],
  } as User;
}

export async function updateProfile(
  displayName?: string,
  avatarUrl?: string
): Promise<User> {
  const res = await authFetch(`${BASE_URL}/api/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ display_name: displayName, avatar_url: avatarUrl }),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/profile/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to change password" }));
    throw new Error(apiError(err, `HTTP ${res.status}`));
  }
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function createSession(): Promise<string> {
  const res = await authFetch(`${BASE_URL}/api/session`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create session");
  const data = await res.json();
  return data.session_id as string;
}

function clientTimezoneHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone ? { "X-User-Timezone": timezone } : {};
  } catch {
    return {};
  }
}

export async function* streamChat(
  sessionId: string,
  message: string,
  signal: AbortSignal,
  displayMessage?: string,
): AsyncGenerator<ChatStreamEvent> {
  const makeRequest = (): Promise<Response> => {
    return fetch(`${BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...clientTimezoneHeaders() },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        display_message: displayMessage || undefined,
      }),
      signal,
      credentials: "include",
    });
  };

  let res = await withTokenRefresh(makeRequest);
  if (res.status === 401) {
    clearTokens();
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unable to connect to the chat service." }));
    const messageText = String(err.message ?? err.error ?? `HTTP ${res.status}`);
    if (res.status === 413) throw new Error("This request is too large.");
    if (res.status >= 500) throw new Error("The chat service is temporarily unavailable. Please try again.");
    throw new Error(messageText);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("The chat service returned no response stream.");

  const decoder = new TextDecoder();
  let buffer = "";
  let receivedDone = false;

  const parseEvent = (raw: string): ChatStreamEvent | null => {
    let eventType = "message";
    const dataLines: string[] = [];
    for (const line of raw.replace(/\r/g, "").split("\n")) {
      if (line.startsWith("event:")) eventType = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    }
    const payloadText = dataLines.join("\n");
    if (!payloadText && eventType !== "done") return null;

    if (eventType === "message" && payloadText) {
      if (payloadText === "[DONE]") return { type: "done", data: {} };
      if (payloadText.startsWith("__STATUS__:")) return { type: "status", data: { message: payloadText.slice(11) } };
      if (payloadText.startsWith("__DOCUMENT_SELECTOR__")) {
        try {
          const parsed = JSON.parse(payloadText.slice("__DOCUMENT_SELECTOR__".length));
          const data = Array.isArray(parsed)
            ? { documents: parsed }
            : parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
          return { type: "document_selector", data };
        } catch {
          return { type: "error", data: { message: "Unable to load document choices." } };
        }
      }
      return { type: "token", data: { text: payloadText } };
    }

    let data: Record<string, unknown> = {};
    if (payloadText) {
      try {
        const parsed = JSON.parse(payloadText);
        data = parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : { value: parsed };
      } catch {
        data = { text: payloadText };
      }
    }
    if (["status", "token", "replace", "document_selector", "error", "done", "activity", "source_discovered"].includes(eventType)) {
      return { type: eventType as ChatStreamEvent["type"], data };
    }
    return null;
  };

  try {
    while (true) {
      if (signal.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf("\n\n");
      while (boundary >= 0) {
        const raw = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const parsed = parseEvent(raw);
        if (parsed) {
          if (parsed.type === "done") receivedDone = true;
          yield parsed;
          if (receivedDone) return;
        }
        boundary = buffer.indexOf("\n\n");
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      const parsed = parseEvent(buffer);
      if (parsed) {
        if (parsed.type === "done") receivedDone = true;
        yield parsed;
      }
    }
    if (!receivedDone && !signal.aborted) {
      throw new Error("The response stream ended unexpectedly. Please try again.");
    }
  } finally {
    reader.releaseLock();
  }
}

export async function fetchHistory(sessionId: string): Promise<{ messages?: unknown[]; response?: { messages?: unknown[] } }> {
  const res = await authFetch(`${BASE_URL}/api/session/${sessionId}/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/session/${sessionId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete session");
}

export async function fetchSessions(): Promise<Array<{ session_id: string; title: string; updated_at: string }>> {
  const res = await authFetch(`${BASE_URL}/api/session/sessions`);
  if (!res.ok) throw new Error(`Failed to fetch sessions (HTTP ${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.sessions ?? data?.response ?? []);
}

export async function renameSessionTitle(sessionId: string, title: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/session/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Failed to rename session (HTTP ${res.status})`);
}

// ── Saved user memory ─────────────────────────────────────────────────────────

async function memoryRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authFetch(`${BASE_URL}/api/memory${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(apiError(body as Record<string, unknown>, `Memory request failed (HTTP ${res.status})`));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function fetchMemories(): Promise<MemorySettingsResponse> {
  return memoryRequest<MemorySettingsResponse>("");
}

export function addMemory(value: MemoryWrite): Promise<SavedMemory> {
  return memoryRequest<SavedMemory>("", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value),
  });
}

export function updateMemory(memoryId: number, value: MemoryWrite): Promise<SavedMemory> {
  return memoryRequest<SavedMemory>(`/${memoryId}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value),
  });
}

export async function deleteMemory(memoryId: number): Promise<void> {
  await memoryRequest<{ deleted_id: number }>(`/${memoryId}`, { method: "DELETE" });
}

export async function clearMemories(): Promise<number> {
  const result = await memoryRequest<{ deleted_count: number }>("", { method: "DELETE" });
  return Number(result.deleted_count || 0);
}

export async function setMemoryEnabled(enabled: boolean): Promise<boolean> {
  const result = await memoryRequest<{ memory_enabled: boolean }>("/enabled", {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }),
  });
  return Boolean(result.memory_enabled);
}

// ── Knowledge Base (RAG) ──────────────────────────────────────────────────────

export async function fetchDocuments(limit = 200, offset = 0): Promise<KBDocument[]> {
  const res = await authFetch(`${BASE_URL}/api/rag/documents?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.documents ?? data?.response ?? []);
}

export async function ingestText(text: string, source: string): Promise<KBDocument> {
  const res = await authFetch(`${BASE_URL}/api/rag/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, source }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 409) throw new Error("This document already exists in the knowledge base.");
    throw new Error(err.message ?? err.detail ?? `Upload failed (HTTP ${res.status})`);
  }
  return res.json();
}

export async function ingestFile(file: File): Promise<KBDocument> {
  const cleanSource = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const form = new FormData();
  form.append("file", file);
  form.append("source", cleanSource || file.name);
  const res = await authFetch(`${BASE_URL}/api/rag/ingest/file`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 409) throw new Error("This file is already in the knowledge base.");
    if (res.status === 413) throw new Error(err.message ?? "File is too large.");
    if (res.status === 400) throw new Error(err.message ?? "Invalid file.");
    throw new Error(err.message ?? err.detail ?? `Upload failed (HTTP ${res.status})`);
  }
  return res.json();
}

export async function deleteDocument(docId: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/rag/document/${docId}`, { method: "DELETE" });
  // 200 (deleted or already gone) and 404 are both success for the caller.
  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? err.detail ?? `Delete failed (HTTP ${res.status})`);
  }
}

export async function publishDocument(docId: string, published = true): Promise<KBDocument> {
  const res = await authFetch(`${BASE_URL}/api/rag/document/${encodeURIComponent(docId)}/publish?published=${published ? "true" : "false"}`, {
    method: "POST",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(String(data.message ?? data.detail ?? `Publish failed (HTTP ${res.status})`));
  }
  return data as KBDocument;
}

// ── Organization workspace and membership ────────────────────────────────────

export interface OrganizationSummary {
  tenant_id: string;
  name: string;
  slug: string;
  owner_user_id: string | null;
  membership_role: "ADMIN" | "MEMBER" | "VIEWER";
  member_count: number;
  created_at: string;
}

export interface OrganizationMember {
  user_id: string;
  email: string;
  display_name: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
  is_active: boolean;
  joined_at: string;
  is_owner: boolean;
}

export interface OrganizationInvitation {
  invitation_id: number;
  email: string;
  role: "MEMBER";
  expires_at: string;
  created_at: string;
}

async function organizationRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authFetch(`${BASE_URL}/api/organizations${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(apiError(body as Record<string, unknown>, `HTTP ${res.status}`));
  return body as T;
}

export function fetchOrganization(): Promise<OrganizationSummary> {
  return organizationRequest<OrganizationSummary>("/me");
}

export function fetchOrganizationMembers(): Promise<OrganizationMember[]> {
  return organizationRequest<OrganizationMember[]>("/members");
}

export function fetchOrganizationInvitations(): Promise<OrganizationInvitation[]> {
  return organizationRequest<OrganizationInvitation[]>("/invitations");
}

export function inviteOrganizationMember(email: string, role: "MEMBER") {
  return organizationRequest<OrganizationInvitation & { invite_token: string }>("/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });
}

export function updateOrganizationMemberRole(userId: string, role: "ADMIN" | "MEMBER") {
  return organizationRequest<{ user_id: string; role: string; auth_version: number }>(`/members/${encodeURIComponent(userId)}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
}

export function reissueOrganizationInvitation(invitationId: number) {
  return organizationRequest<OrganizationInvitation & { invite_token: string }>(
    `/invitations/${encodeURIComponent(invitationId)}/reissue`,
    { method: "POST" },
  );
}

export async function removeOrganizationMember(userId: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/organizations/members/${encodeURIComponent(userId)}`, { method: "DELETE" });
  if (res.status === 204) return;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(apiError(body as Record<string, unknown>, `HTTP ${res.status}`));
}

// ── Jira workspace selection ──────────────────────────────────────────────────

export interface JiraWorkspace {
  cloud_id: string;
  name: string;
  url: string;
}

export interface JiraWorkspaceList {
  workspaces: JiraWorkspace[];
  selected_cloud_id: string | null;
}

export async function fetchJiraWorkspaces(): Promise<JiraWorkspaceList> {
  const res = await authFetch(`${BASE_URL}/api/integrations/jira/workspaces`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(apiError(body as Record<string, unknown>, `HTTP ${res.status}`));
  return body as JiraWorkspaceList;
}

export async function selectJiraWorkspace(cloudId: string): Promise<{
  connected: boolean;
  selected_cloud_id: string;
  workspace_name: string;
  workspace_url: string;
}> {
  const res = await authFetch(`${BASE_URL}/api/integrations/jira/workspace`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cloud_id: cloudId }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(apiError(body as Record<string, unknown>, `HTTP ${res.status}`));
  return body;
}

// ── Integrations ──────────────────────────────────────────────────────────────

export async function oauthUrl(provider: string): Promise<string> {
  const res = await authFetch(`${BASE_URL}/api/auth/oauth-code`);
  if (!res.ok) throw new Error("Failed to get OAuth code");
  const data = await res.json();
  const code = data.message as string;
  return `${BASE_URL}/api/integrations/${provider}/auth?code=${encodeURIComponent(code)}`;
}

// Providers that have a backend OAuth flow — used by PluginsPage
export const OAUTH_PROVIDERS = new Set(["gmail", "jira", "slack", "google_cal", "google_drive", "teams"]);

const _PROVIDER_ALIAS: Record<string, string> = { email: "gmail" };

export async function fetchConnectedProviders(): Promise<string[]> {
  const res = await authFetch(`${BASE_URL}/api/integrations/status`);
  if (!res.ok) throw new Error(`Failed to fetch integration status (HTTP ${res.status})`);
  const data: Record<string, unknown> = await res.json();
  return Object.entries(data)
    .filter(([, v]) => v === true)
    .map(([k]) => _PROVIDER_ALIAS[k] ?? k);
}

export async function revokeOAuthToken(provider: string): Promise<void> {
  // frontend uses "gmail", backend stores "email" — normalise here
  const backendProvider = provider === "gmail" ? "email" : provider;
  const res = await authFetch(`${BASE_URL}/api/integrations/connections/${backendProvider}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: false }),
  });
  if (!res.ok) throw new Error(`Failed to revoke OAuth token (HTTP ${res.status})`);
}

export async function connectPlugin(pluginName: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/chat/plugins/${pluginName}/connect`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to connect plugin" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
}

export async function disconnectPlugin(pluginName: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/chat/plugins/${pluginName}/connect`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to disconnect plugin (HTTP ${res.status})`);
}
