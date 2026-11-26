export type Role = "user" | "assistant";
export type MessageType = "text" | "action" | "document_selector";

export type ConnectionStatus =
  | "connected"
  | "not_connected"
  | "disconnected"
  | "reauthorization_required"
  | "configuration_error"
  | "temporarily_unavailable"
  | "unknown";

export interface IntegrationStatusResponse {
  [plugin: string]: boolean | Record<string, ConnectionStatus> | undefined;
}

export interface DocumentChoice {
  doc_id: string;
  source: string;
  status?: string | null;
  file_type?: string | null;
  file_size?: number | null;
}

export type ActivityStatus = "running" | "completed" | "failed" | "skipped" | "interrupted";

export interface ActivityItem {
  step_id: string;
  label: string;
  status: ActivityStatus;
  tool_name: string;
  category: string;
  duration_ms?: number;
  error?: string;
}

export interface DiscoveredSource {
  source_id: string;
  source_type: string;  // "document" | "gmail" | "jira" | "slack" | "google_drive" | "google_cal" | "teams"
  title: string;
  connector: string;
  url?: string;
  citation_id: string;
  sender?: string;
  date?: string;
}

export type VerificationVerdict = "verified" | "unverified" | "skipped" | "failed";

export interface VerificationResult {
  verdict: VerificationVerdict;
  reason: string;
}

export interface Message {
  id: string;
  role: Role;
  type?: MessageType;
  content: string;
  data?: Record<string, unknown>;
  status?: string;  // transient agent status shown while streaming
  created_at?: string; // ISO timestamp, present for history messages
  activities?: ActivityItem[];
  sources?: DiscoveredSource[];
  verification?: VerificationResult;
}

export interface ChatStreamEvent {
  type: "status" | "token" | "replace" | "document_selector" | "error" | "done" | "activity" | "source_discovered" | "verification_complete";
  data: Record<string, unknown>;
}

export interface ChatSession {
  sessionId: string;
  title: string;
  createdAt: string;
}

export interface KBDocument {
  doc_id: string;
  source: string;
  chunk_count: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  file_type: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string | null;
  updated_at: string | null;
  company_visible?: boolean;
  error_message?: string | null;
}

export type UserRole = "ADMIN" | "MEMBER" | "VIEWER";

export interface User {
  user_id: string;
  email: string;
  display_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: Pick<User, "user_id" | "email" | "display_name"> & { role: string };
}

// ── Integrations ──────────────────────────────────────────────────────────────

export type IntegrationProvider = "jira" | "slack" | "gmail" | "google_drive" | "google_cal" | "teams";

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotifType = "success" | "info" | "warning" | "error";
