"use client";
import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { Plugin } from "@/lib/plugins";
import { PLUGINS } from "@/lib/plugins";
import type { IntegrationProvider } from "@/types/chat";
import { listenAppEvent } from "@/lib/events";
import { normalizeInput } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES } from "@/lib/config";

const MAX_LENGTH = 4000;

type PickerItem = { id: string; name: string; description: string; icon: React.ReactNode; plugin?: Plugin };

type Props = {
  onSend: (text: string) => void;
  disabled: boolean;
  onStop?: () => void;
  connectedPlugins: Set<IntegrationProvider>;
  onOpenPlugins: () => void;
  onFileUpload?: (file: File) => Promise<void>;
};

export default function ChatInput({
  onSend,
  disabled,
  onStop,
  connectedPlugins,
  onOpenPlugins,
  onFileUpload,
}: Props) {
  const [value, setValue] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [activePlugin, setActivePlugin] = useState<IntegrationProvider | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerSearchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  useClickOutside(pickerRef, () => { setPickerOpen(false); setPickerSearch(""); }, pickerOpen);

  useEffect(() => {
    if (pickerOpen) setTimeout(() => pickerSearchRef.current?.focus(), 50);
  }, [pickerOpen]);

  useEffect(() => {
    return listenAppEvent("chat:inject", (text) => {
      setValue(text);
      setTimeout(() => textareaRef.current?.focus(), 80);
    });
  }, []);

  const connectedList = PLUGINS.filter((p) => connectedPlugins.has(p.id));

  const pickerItems: PickerItem[] = [
    ...connectedList
      .filter(
        (p) =>
          !pickerSearch.trim() ||
          p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
          p.description.toLowerCase().includes(pickerSearch.toLowerCase()),
      )
      .map((p) => ({ id: p.id, name: p.name, description: p.description, icon: p.logo, plugin: p })),
    ...(!pickerSearch.trim()
      ? [
          {
            id: "_upload" as const,
            name: "Upload to Knowledge Base",
            description: "Extract and save file to your knowledge base",
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="w-4 h-4"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            ),
          },
          {
            id: "_manage" as const,
            name: "Manage plugins",
            description: "Add or remove tools",
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="w-4 h-4"
              >
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                <line x1="16" y1="8" x2="2" y2="22" />
                <line x1="17.5" y1="15" x2="9" y2="15" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  function handleSend() {
    const t = normalizeInput(value);
    if (!t || disabled || t.length > MAX_LENGTH) return;
    onSend(t);
    setValue("");
    setActivePlugin(null);
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function selectPlugin(p: Plugin) {
    setActivePlugin(p.id);
    const mention = `@${p.name} `;
    setValue((prev) =>
      prev.endsWith(" ") || prev === "" ? prev + mention : prev + " " + mention,
    );
    setPickerOpen(false);
    setPickerSearch("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function removeActivePlugin() {
    if (!activePlugin) return;
    const plugin = PLUGINS.find((p) => p.id === activePlugin);
    if (plugin)
      setValue((prev) =>
        prev.replace(new RegExp(`@${plugin.name}\\s?`, "g"), "").trim(),
      );
    setActivePlugin(null);
  }

  const overLimit = value.length > MAX_LENGTH;
  const activePluginObj = activePlugin
    ? PLUGINS.find((p) => p.id === activePlugin)
    : null;
  const canSend = !disabled && !!value.trim() && !overLimit;

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_FILE_TYPES}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !onFileUpload) return;
          e.target.value = "";
          await onFileUpload(file);
        }}
      />
      {/* Plugin picker */}
      {pickerOpen && (
        <div
          ref={pickerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Plugins and tools"
          className="absolute bottom-full mb-3 left-0 right-0 panel rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-up"
        >
          <div
            className="flex items-center gap-2.5 px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="11" cy="11" r="7.5" />
              <path d="m20.5 20.5-4.5-4.5" />
            </svg>
            <input
              ref={pickerSearchRef}
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search plugins…"
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: "var(--text-primary)" }}
              onKeyDown={(e) => e.key === "Escape" && setPickerOpen(false)}
            />
          </div>
          <div className="py-1.5 max-h-64 overflow-y-auto">
            {pickerItems.length === 0 ? (
              <p
                className="text-center text-sm py-6"
                style={{ color: "var(--text-muted)" }}
              >
                No connected plugins
              </p>
            ) : (
              pickerItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "_manage") {
                      setPickerOpen(false);
                      onOpenPlugins();
                    } else if (item.id === "_upload") {
                      setPickerOpen(false);
                      fileInputRef.current?.click();
                    } else if (item.plugin) selectPlugin(item.plugin); // eslint-disable-line react-hooks/refs
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors footer-nav-item"
                >
                  <span className="w-7 flex items-center justify-center shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-xs ml-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.description}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
          {connectedList.length === 0 && !pickerSearch && (
            <div
              className="px-4 pb-3 pt-1"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <button
                onClick={() => {
                  setPickerOpen(false);
                  onOpenPlugins();
                }}
                className="text-xs transition-colors"
                style={{ color: "var(--accent-text)" }}
              >
                + Connect your first plugin
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input box */}
      <div
        className={`input-box transition-all duration-200 ${overLimit ? "!border-red-400" : ""}`}
      >
        {/* Active plugin chip */}
        {activePluginObj && (
          <div className="flex items-center gap-1.5 px-3.5 pt-3">
            <div
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(124,92,252,0.12)",
                border: "1px solid rgba(124,92,252,0.25)",
                color: "var(--accent-text)",
              }}
            >
              <span>{activePluginObj.logo}</span>
              <span>{activePluginObj.name}</span>
              <button
                onClick={removeActivePlugin}
                className="ml-0.5 transition-colors"
                style={{ color: "var(--accent-text)" }}
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
            </div>
          </div>
        )}

        {/* Textarea row */}
        <div className="flex items-end gap-2 px-3 py-2.5">
          {/* + button */}
          <button
            onClick={() => setPickerOpen((o) => !o)}
            className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all mb-0.5 icon-btn"
            style={
              pickerOpen
                ? {
                    background: "rgba(124,92,252,0.15)",
                    color: "var(--accent-text)",
                  }
                : {}
            }
            aria-label="Open plugins and tools menu"
            aria-expanded={pickerOpen}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="w-4 h-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            className="flex-1 resize-none outline-none text-sm py-1 min-h-[36px] max-h-[160px] bg-transparent leading-relaxed"
            style={{ color: "var(--text-primary)" }}
            placeholder={
              connectedList.length > 0
                ? "Ask anything… (use + for plugins)"
                : "Ask anything…"
            }
            aria-label="Chat message"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            disabled={disabled}
            rows={1}
            spellCheck
            autoFocus
          />

          {disabled ? (
            <button
              onClick={onStop}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.30)",
              }}
              aria-label="Stop generating"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5"
                style={{ color: "#ef4444" }}
              >
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5"
              style={
                canSend
                  ? {
                      background: "linear-gradient(135deg, #7c5cfc, #4f8ef7)",
                      boxShadow: "0 4px 16px rgba(124,92,252,0.45)",
                    }
                  : {
                      background: "var(--surface-hover)",
                      cursor: "not-allowed",
                    }
              }
              aria-label="Send message"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="w-4 h-4"
                style={{ color: canSend ? "#fff" : "var(--text-muted)" }}
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>

        {value.length > 0 && (
          <div className="px-3.5 pb-2.5">
            <span
              className="text-[11px]"
              style={{
                color: overLimit
                  ? "#f87171"
                  : value.length > MAX_LENGTH * 0.8
                    ? "var(--text-secondary)"
                    : "var(--text-muted)",
              }}
            >
              {value.length}/{MAX_LENGTH}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
