"use client";

import { useState, memo } from "react";
import { CopyButton, ShareIcon, EditIcon, RegenerateIcon, CopyIcon, CheckIcon } from "@/components/icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formatRelativeTime, parseDocumentSelectorData } from "@/lib/utils";
import { normalizeMessageContent } from "@/lib/messageNormalizer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DocumentChoice, Message } from "@/types/chat";
import ActivityTimeline from "@/components/ActivityTimeline";
import SourceChips from "@/components/SourceChips";

const REMARK_PLUGINS = [remarkGfm];

// react-markdown does not expose `parent` in its public node types;
// the cast to `any` is the only way to walk the AST for streaming cursor placement.
interface AstNode { parent?: { children?: AstNode[] } }
function isLastNode(node: unknown): boolean {
  const n = node as AstNode;
  return n === n?.parent?.children?.at(-1);
}

function formatTime(iso: string): string { return formatRelativeTime(iso); }

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const lang = className?.replace("language-", "") ?? "";
  const text = typeof children === "string" ? children : String(children);

  return (
    <div className="relative group/code my-2">
      {/* top bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 rounded-t-xl"
        style={{ background: "var(--code-bg)", borderBottom: "1px solid var(--code-border)", border: "1px solid var(--code-border)", borderBottomColor: "transparent" }}>
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider"
          style={{ color: "var(--code-text)", opacity: 0.5 }}>{lang || "code"}</span>
        <CopyButton text={text} size="xs" />
      </div>
      <pre className="rounded-b-xl px-3.5 py-3 overflow-x-auto text-[12px] font-mono"
        style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)", borderTop: "none", color: "var(--code-text)", margin: 0 }}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function ActionBtn({ onClick, title, active = false, children }: { onClick: () => void; title: string; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover-accent"
      style={{ color: active ? "var(--accent)" : "var(--text-muted)", border: "1px solid var(--border)", background: "var(--surface-card)" }}
    >
      {children}
    </button>
  );
}

const ChatMessage = memo(function ChatMessage({
  message,
  userInitials = "U",
  onDocumentAction,
  isStreaming = false,
  onRegenerate,
  onEdit,
}: {
  message: Message;
  userInitials?: string;
  onDocumentAction?: (label: string, action: string, payload: Record<string, unknown>) => void;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEdit?: (content: string) => void;
}) {
  const isUser = message.role === "user";
  const [selectionSubmitted, setSelectionSubmitted] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const { copied: msgCopied, copy: copyMsg } = useCopyToClipboard();

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 1800);
      }).catch(() => {});
    }
  }

  // const { documents: selectorDocuments, prompt: selectorPrompt, operation: selectorOperation,
  //   actionLabel: selectorActionLabel, multiSelect: selectorMultiSelect, minSelection } =
  //   parseDocumentSelectorData(message);
  const selectorDocuments: DocumentChoice[] = message.type === "document_selector"
    && Array.isArray(message.data?.documents)
    ? message.data.documents as DocumentChoice[]
    : [];
  const selectorPrompt = message.type === "document_selector"
    ? String(message.data?.prompt ?? message.content ?? "Which document would you like me to continue with?")
    : "";
  const selectorOperation = message.type === "document_selector"
    ? String(message.data?.operation ?? "document_summary")
    : "document_summary";
  const rawSelectorActionLabel = message.type === "document_selector"
    ? String(message.data?.action_label ?? "Continue")
    : "Continue";
  const isCompareSelector = message.type === "document_selector" && (
    selectorOperation === "document_comparison" || selectorOperation === "compare" || rawSelectorActionLabel.toLowerCase().startsWith("compare")
  );
  const selectorActionLabel = isCompareSelector ? "Compare" : rawSelectorActionLabel;
  const selectorMultiSelect = message.type === "document_selector" && (Boolean(message.data?.multi_select) || isCompareSelector);
  const rawMinSelection = message.type === "document_selector" ? Number(message.data?.min_selection ?? (isCompareSelector ? 2 : 1)) : 1;
  const minSelection = Number.isFinite(rawMinSelection) ? Math.max(1, Math.floor(rawMinSelection)) : 1;

  const visibleContent = normalizeMessageContent(message.content);

function toggleDocument(doc: DocumentChoice) {
    if (selectionSubmitted) return;
    if (!selectorMultiSelect) {
      setSelectionSubmitted(true);
      setSelectedDocIds([doc.doc_id]);
      onDocumentAction?.(
        `${selectorActionLabel} ${doc.source}`,
        selectorOperation,
        { doc_id: doc.doc_id, document_ids: [doc.doc_id] },
      );
      return;
    }

    setSelectedDocIds((current) =>
      current.includes(doc.doc_id)
        ? current.filter((id) => id !== doc.doc_id)
        : [...current, doc.doc_id]
    );
  }

  function submitSelection() {
    if (selectionSubmitted || !selectorMultiSelect || selectedDocIds.length < minSelection) return;
    setSelectionSubmitted(true);
    const selectedDocs = selectorDocuments.filter((doc) => selectedDocIds.includes(doc.doc_id));
    const names = selectedDocs.map((doc) => doc.source).join(", ");
    onDocumentAction?.(
      `${selectorActionLabel} ${selectedDocs.length} document${selectedDocs.length === 1 ? "" : "s"}${names ? `: ${names}` : ""}`,
      selectorOperation,
      { doc_ids: selectedDocIds, document_ids: selectedDocIds },
    );
  }

  return (
    <div className={`flex gap-3 group animate-fade-up ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="shrink-0 mt-1">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", boxShadow: "0 2px 8px rgba(99,102,241,0.35)" }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="white" opacity="0.9"/>
            </svg>
          </div>
        </div>
      )}

      <div className={`relative flex flex-col min-w-0 ${isUser ? "items-end max-w-[85%] sm:max-w-[60%]" : "items-start max-w-[90%] sm:max-w-[78%] w-full"}`}>

        {isUser ? (
          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed text-white"
            style={{ background: "linear-gradient(135deg, var(--bubble-user-from), var(--bubble-user-to))", boxShadow: "0 2px 12px rgba(99,102,241,0.30)" }}>
            <p className="whitespace-pre-wrap">{visibleContent}</p>
          </div>
        ) : (
          <div className="bubble-ai rounded-2xl px-4 py-4 w-full min-w-0 overflow-x-hidden">
            {/* Activity timeline — shown while streaming and kept visible after */}
            {(message.activities ?? []).length > 0 && (
              <ActivityTimeline
                activities={message.activities!}
                isStreaming={isStreaming}
              />
            )}

            {/* Status pill — only shown before the first activity event arrives.
                Once the timeline has items it provides richer context, so the
                pill is suppressed to avoid two competing indicators. */}
            {message.status && !visibleContent && message.type !== "document_selector"
              && (message.activities ?? []).length === 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(99,102,241,0.08)", color: "var(--accent-text)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <span className="inline-flex gap-0.5">
                    <span className="typing-dot" style={{ width: 4, height: 4 }} />
                    <span className="typing-dot" style={{ width: 4, height: 4 }} />
                    <span className="typing-dot" style={{ width: 4, height: 4 }} />
                  </span>
                  {message.status}
                </span>
              </div>
            )}

            {message.type === "document_selector" && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{selectorPrompt}</p>
                {selectorDocuments.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>No completed documents are available.</p>
                ) : (
                  <>
                    {selectorDocuments.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.doc_id);
                      const ext = doc.file_type?.toUpperCase() ?? "DOC";
                      const sizeKb = doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : null;
                      return (
                        <button
                          key={doc.doc_id}
                          type="button"
                          disabled={selectionSubmitted}
                          onClick={() => toggleDocument(doc)}
                          className="hover-lift w-full text-left rounded-xl px-3.5 py-3 disabled:opacity-40"
                          style={{
                            border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                            background: isSelected ? "rgba(99,102,241,0.06)" : "var(--surface-card)",
                            boxShadow: isSelected ? "0 0 0 3px rgba(99,102,241,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
                            transform: selectionSubmitted ? "none" : undefined,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: isSelected ? "rgba(99,102,241,0.12)" : "var(--surface-hover)" }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"
                                style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{doc.source}</p>
                              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {ext}{sizeKb ? ` · ${sizeKb}` : ""}
                              </p>
                            </div>
                            {selectorMultiSelect && (
                              <span
                                className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
                                style={{
                                  borderColor: isSelected ? "var(--accent)" : "var(--border)",
                                  background: isSelected ? "var(--accent)" : "transparent",
                                }}
                              >
                                {isSelected && (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3.5 h-3.5">
                                    <path d="M20 6 9 17l-5-5"/>
                                  </svg>
                                )}
                              </span>
                            )}
                            {!selectorMultiSelect && isSelected && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0"
                                style={{ color: "var(--accent)" }}>
                                <path d="M20 6 9 17l-5-5"/>
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {selectorMultiSelect && (
                      <button
                        type="button"
                        disabled={selectionSubmitted || selectedDocIds.length < minSelection}
                        onClick={submitSelection}
                        className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-40"
                        style={{
                          background: "var(--accent)",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                        }}
                      >
                        {selectedDocIds.length < minSelection
                          ? `${selectorActionLabel} · Select ${minSelection} or more`
                          : `${selectorActionLabel} (${selectedDocIds.length})`}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {visibleContent && message.type !== "document_selector" && (
              <div className="prose-ai">
                <ReactMarkdown
                  remarkPlugins={REMARK_PLUGINS}
                  components={{
                    p: ({ children, node }) => {
                      const isLast = isLastNode(node);
                      return <p>{children}{isStreaming && isLast ? <span className="streaming-cursor" /> : null}</p>;
                    },
                    h1: ({ children, node }) => { const isLast = isLastNode(node); return <h1>{children}{isStreaming && isLast ? <span className="streaming-cursor" /> : null}</h1>; },
                    h2: ({ children, node }) => { const isLast = isLastNode(node); return <h2>{children}{isStreaming && isLast ? <span className="streaming-cursor" /> : null}</h2>; },
                    h3: ({ children, node }) => { const isLast = isLastNode(node); return <h3>{children}{isStreaming && isLast ? <span className="streaming-cursor" /> : null}</h3>; },
                    ul: ({ children }) => <ul>{children}</ul>,
                    ol: ({ children }) => <ol>{children}</ol>,
                    li: ({ children, node }) => { const isLast = isLastNode(node); return <li>{children}{isStreaming && isLast ? <span className="streaming-cursor" /> : null}</li>; },
                    code: ({ children, className, node }) => {
                      const isBlock = node?.position
                        ? (node as AstNode & { data?: { meta?: unknown } }).data?.meta !== undefined ||
                          className?.includes("language-") ||
                          String(children).includes("\n")
                        : className?.includes("language-");
                      return isBlock ? (
                        <CodeBlock className={className}>{children}</CodeBlock>
                      ) : (
                        <code className="rounded-md px-1.5 py-0.5 text-[12px] font-mono"
                          style={{ background: "var(--inline-code-bg)", color: "var(--inline-code-text)" }}>
                          {children}
                        </code>
                      );
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-2 rounded-xl" style={{ border: "1px solid var(--border)" }}>
                        <table>{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th>{children}</th>,
                    td: ({ children }) => <td>{children}</td>,
                    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                    strong: ({ children }) => <strong>{children}</strong>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                  }}
                >
                  {visibleContent}
                </ReactMarkdown>
              </div>
            )}

            {/* Source chips — shown once sources are discovered */}
            {(message.sources ?? []).length > 0 && message.type !== "document_selector" && (
              <SourceChips sources={message.sources!} />
            )}
          </div>
        )}

        {/* ── User message toolbar ── */}
        {isUser && (
          <div className="flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <ActionBtn onClick={() => copyMsg(visibleContent)} title="Copy">
              {msgCopied ? <CheckIcon className="w-3.5 h-3.5" strokeWidth={2.5} /> : <CopyIcon className="w-3.5 h-3.5" />}
            </ActionBtn>
            {onEdit && (
              <ActionBtn onClick={() => onEdit(visibleContent)} title="Edit">
                <EditIcon />
              </ActionBtn>
            )}
          </div>
        )}

        {/* ── Assistant message toolbar ── */}
        {!isUser && visibleContent && message.type !== "document_selector" && !isStreaming && (
          <div className="flex items-center gap-1 mt-2 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <ActionBtn onClick={() => copyMsg(visibleContent)} title="Copy">
              {msgCopied ? <CheckIcon className="w-3.5 h-3.5" strokeWidth={2.5} /> : <CopyIcon className="w-3.5 h-3.5" />}
            </ActionBtn>
            <ActionBtn onClick={handleShare} title={shareCopied ? "Link copied!" : "Share"} active={shareCopied}>
              <ShareIcon />
            </ActionBtn>
            {onRegenerate && (
              <ActionBtn onClick={onRegenerate} title="Regenerate">
                <RegenerateIcon />
              </ActionBtn>
            )}
            {message.created_at && (
              <span className="text-[10px] ml-1" style={{ color: "var(--text-muted)" }}>
                {formatTime(message.created_at)}
              </span>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--avatar-bg)", border: "1.5px solid var(--avatar-border)", color: "var(--accent)" }}>
            {userInitials}
          </div>
        </div>
      )}
    </div>
  );
});

export default ChatMessage;
