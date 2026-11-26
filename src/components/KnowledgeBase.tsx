"use client";
import { useState, useRef, useEffect } from "react";
import {
  ingestText,
  ingestFile,
  deleteDocument,
  publishDocument,
} from "@/lib/api";
import { pushNotification } from "@/hooks/useNotifications";
import { useDocuments } from "@/hooks/useDocuments";
import type { KBDocument } from "@/types/chat";
import { DocIcon } from "./icons";
import { ACCEPTED_FILE_TYPES } from "@/lib/config";

type Props = {
  onClose: () => void;
  defaultTab?: "docs" | "text" | "file";
  isAdmin?: boolean;
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  border: string;
  pulse?: boolean;
};
const STATUS_CONFIG: Record<KBDocument["status"], StatusConfig> = {
  COMPLETED: {
    label: "Ready",
    color: "var(--status-success-text)",
    bg: "var(--status-success-bg)",
    border: "var(--status-success-border)",
  },
  PROCESSING: {
    label: "Processing…",
    color: "var(--status-info-text)",
    bg: "var(--status-info-bg)",
    border: "var(--status-info-border)",
    pulse: true,
  },
  PENDING: {
    label: "Pending",
    color: "var(--status-warn-text)",
    bg: "var(--status-warn-bg)",
    border: "var(--status-warn-border)",
  },
  FAILED: {
    label: "Failed",
    color: "var(--status-error-text)",
    bg: "var(--status-error-bg)",
    border: "var(--status-error-border)",
  },
};

function StatusBadge({ status }: { status: KBDocument["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full${cfg.pulse ? " animate-pulse" : ""}`}
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
}

export default function KnowledgeBase({
  onClose,
  defaultTab = "docs",
  isAdmin = false,
}: Props) {
  const { docs, setDocs, loading, error: fetchError, refresh } = useDocuments();
  const [uploading, setUploading] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [tab, setTab] = useState<"docs" | "text" | "file">(defaultTab);
  const [textInput, setTextInput] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [docSearch, setDocSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Combine fetch error and mutation error for display; mutation error takes precedence.
  const error = mutationError ?? fetchError;

  async function handleIngestText() {
    if (!textInput.trim() || !sourceLabel.trim()) return;
    setUploading(true);
    setMutationError(null);
    try {
      await ingestText(textInput.trim(), sourceLabel.trim());
      setTextInput("");
      setSourceLabel("");
      pushNotification(
        "success",
        "Knowledge Base updated",
        `"${sourceLabel.trim()}" has been added to the knowledge base.`,
      );
      await refresh();
      setTab("docs");
    } catch (e: unknown) {
      setMutationError(e instanceof Error ? e.message : "Ingest failed");
    } finally {
      setUploading(false);
    }
  }

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setMutationError(null);
    setUploadProgress({ done: 0, total: files.length });
    const failed: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await ingestFile(file);
      } catch (e: unknown) {
        failed.push(
          `"${file.name}": ${e instanceof Error ? e.message : "Upload failed"}`,
        );
      }
      setUploadProgress({ done: i + 1, total: files.length });
    }
    if (failed.length) setMutationError(failed.join("\n"));
    else
      pushNotification(
        "success",
        "Files uploaded",
        files.length === 1
          ? `"${files[0].name}" ingested successfully.`
          : `${files.length} files ingested successfully.`,
      );
    await refresh();
    setTab("docs");
    setUploading(false);
    setUploadProgress(null);
    setPendingFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingFiles(files);
    await uploadFiles(files);
  }

  async function handleDelete(docId: string, source: string) {
    try {
      await deleteDocument(docId);
      setDocs((prev) => prev.filter((d) => d.doc_id !== docId));
      setConfirmDeleteId(null);
      pushNotification(
        "info",
        "Document removed",
        `"${source}" has been removed from the knowledge base.`,
      );
    } catch {
      setMutationError("Failed to delete document.");
    }
  }

  async function handlePublish(
    docId: string,
    source: string,
    published: boolean,
  ) {
    try {
      await publishDocument(docId, published);
      setDocs((prev) =>
        prev.map((d) =>
          d.doc_id === docId ? { ...d, company_visible: published } : d,
        ),
      );
      pushNotification(
        "success",
        published ? "Document published" : "Document unpublished",
        `"${source}" visibility updated.`,
      );
    } catch (e: unknown) {
      setMutationError(
        e instanceof Error
          ? e.message
          : "Failed to update document visibility.",
      );
    }
  }

  const completedCount = docs.filter((d) => d.status === "COMPLETED").length;
  const filteredDocs = docSearch.trim()
    ? docs.filter((d) =>
        d.source.toLowerCase().includes(docSearch.toLowerCase()),
      )
    : docs;

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kb-dialog-title"
        className="panel rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col"
        style={{
          background: "var(--surface-overlay)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2
              id="kb-dialog-title"
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Knowledge Base
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Documents the AI uses as context
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-btn p-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex px-5 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {(["docs", "text", "file"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2.5 px-3 text-xs mr-2 border-b-2 transition-colors ${
                tab === t
                  ? "border-[var(--accent)] font-medium"
                  : "border-transparent hover:opacity-80"
              }`}
              style={{
                color: tab === t ? "var(--accent-text)" : "var(--text-muted)",
              }}
            >
              {t === "docs"
                ? `Documents (${completedCount}/${docs.length})`
                : t === "text"
                  ? "Add Text"
                  : "Upload File"}
            </button>
          ))}
        </div>

        {/* Alerts */}
        <div className="px-5 pt-3 space-y-2 shrink-0">
          {error && (
            <div
              className="text-xs rounded-lg px-3 py-2"
              style={{
                color: "#f87171",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.20)",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {/* Documents list */}
          {tab === "docs" && (
            <>
              {loading ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Loading…
                </p>
              ) : docs.length === 0 ? (
                <div className="text-center py-10">
                  <DocIcon />
                  <p className="text-sm text-gray-500 font-medium">
                    No documents yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add text or upload a file to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Search input */}
                  {docs.length > 3 && (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3"
                      style={{
                        background: "var(--surface-input)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" />
                      </svg>
                      <input
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        placeholder="Filter documents…"
                        className="flex-1 text-xs bg-transparent outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                      {docSearch && (
                        <button
                          onClick={() => setDocSearch("")}
                          style={{ color: "var(--text-muted)" }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            className="w-3 h-3"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                  {filteredDocs.length === 0 ? (
                    <p
                      className="text-xs text-center py-6"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No documents match &ldquo;{docSearch}&rdquo;
                    </p>
                  ) : (
                    filteredDocs.map((doc) => (
                      <div
                        key={doc.doc_id}
                        className="flex items-start justify-between p-3 rounded-xl group"
                        style={{
                          border: `1px solid ${confirmDeleteId === doc.doc_id ? "rgba(239,68,68,0.35)" : "var(--border)"}`,
                          background:
                            confirmDeleteId === doc.doc_id
                              ? "rgba(239,68,68,0.04)"
                              : "var(--surface-hover)",
                          transition: "border-color 0.15s, background 0.15s",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {doc.source}
                            </p>
                            <StatusBadge status={doc.status} />
                            {doc.company_visible && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                Company
                              </span>
                            )}
                          </div>
                          <p
                            className="text-xs mt-0.5 flex flex-wrap gap-x-2"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {doc.file_type && (
                              <span
                                className="uppercase font-medium"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {doc.file_type}
                              </span>
                            )}
                            {doc.file_size != null && (
                              <span>{formatBytes(doc.file_size)}</span>
                            )}
                            {doc.status === "COMPLETED" && (
                              <span>
                                {doc.chunk_count} chunk
                                {doc.chunk_count !== 1 ? "s" : ""}
                              </span>
                            )}
                            {doc.created_at && (
                              <span>
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                          {doc.status === "FAILED" && doc.error_message && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: "var(--status-error-text)" }}
                            >
                              {doc.error_message}
                            </p>
                          )}
                          {confirmDeleteId === doc.doc_id && (
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className="text-xs"
                                style={{ color: "#f87171" }}
                              >
                                Remove this document?
                              </span>
                              <button
                                onClick={() =>
                                  handleDelete(doc.doc_id, doc.source)
                                }
                                className="text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors"
                                style={{
                                  background: "rgba(239,68,68,0.12)",
                                  color: "#f87171",
                                  border: "1px solid rgba(239,68,68,0.25)",
                                }}
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs px-2 py-0.5 rounded-lg transition-colors"
                                style={{
                                  color: "var(--text-muted)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex items-center gap-1.5 shrink-0 mt-0.5">
                          {isAdmin && doc.status === "COMPLETED" && (
                            <button
                              onClick={() =>
                                handlePublish(
                                  doc.doc_id,
                                  doc.source,
                                  !Boolean(doc.company_visible),
                                )
                              }
                              className="text-xs px-2 py-1 rounded-lg transition-colors"
                              style={{
                                color: "var(--accent-text)",
                                border: "1px solid var(--border)",
                              }}
                              title={
                                doc.company_visible
                                  ? "Make private"
                                  : "Publish to company"
                              }
                            >
                              {doc.company_visible ? "Make private" : "Publish"}
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDeleteId(doc.doc_id)}
                            className="text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                            style={{ color: "#f87171" }}
                            title="Remove document"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              className="w-3 h-3"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* Add text */}
          {tab === "text" && (
            <div className="space-y-3">
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Source label
                </label>
                <input
                  type="text"
                  placeholder="e.g. leave_policy, onboarding_guide"
                  value={sourceLabel}
                  onChange={(e) => setSourceLabel(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    background: "var(--surface-input)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Content
                </label>
                <textarea
                  placeholder="Paste your document content here…"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none transition-colors"
                  style={{
                    background: "var(--surface-input)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {textInput.length} characters
                </p>
              </div>
              <button
                onClick={handleIngestText}
                disabled={uploading || !textInput.trim() || !sourceLabel.trim()}
                className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors text-white"
                style={{ background: "var(--accent)" }}
              >
                {uploading ? "Ingesting…" : "Add to Knowledge Base"}
              </button>
            </div>
          )}

          {/* Upload file */}
          {tab === "file" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragging
                    ? "var(--accent)"
                    : "var(--border-hover)",
                  background: dragging
                    ? "rgba(99,102,241,0.04)"
                    : "transparent",
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length) {
                    setPendingFiles(files);
                    uploadFiles(files);
                  }
                }}
              >
                {dragging ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-8 h-8 mx-auto mb-2"
                    style={{ color: "var(--accent)" }}
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-8 h-8 mx-auto mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                )}
                <p
                  className="text-sm font-medium"
                  style={{
                    color: dragging
                      ? "var(--accent-text)"
                      : "var(--text-secondary)",
                  }}
                >
                  {dragging ? "Drop to upload" : "Click or drag a file here"}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Supports PDF, DOCX, XLSX, PPTX, ODT, ODS, ODP, CSV, TSV, JSON, XML, HTML, RTF, EML, TXT, MD, PNG, JPG, WEBP, BMP, TIFF · multiple files allowed
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {/* Pending file preview */}
              {pendingFiles.length > 0 && !uploading && (
                <div className="space-y-1.5">
                  {pendingFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      style={{
                        background: "var(--surface-input)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: "var(--accent)" }}
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span
                        className="flex-1 truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {f.name
                          .replace(/\.[^.]+$/, "")
                          .replace(/[_-]+/g, " ")
                          .trim()}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>
                        {formatBytes(f.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {uploading && uploadProgress && (
                <div className="space-y-1.5">
                  <div
                    className="flex items-center justify-between text-xs"
                    style={{ color: "var(--accent-text)" }}
                  >
                    <span>Uploading and processing…</span>
                    <span>
                      {uploadProgress.done}/{uploadProgress.total}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.done / uploadProgress.total) * 100}%`,
                        background:
                          "linear-gradient(90deg, var(--accent), var(--accent-2))",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Chunked, embedded with{" "}
            <code
              className="px-1 rounded"
              style={{ background: "var(--surface-hover)" }}
            >
              bge-small-en-v1.5
            </code>
            , stored in PgVector
          </p>
        </div>
      </div>
    </div>
  );
}
