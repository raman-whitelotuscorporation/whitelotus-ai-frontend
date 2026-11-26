"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon, CloseIcon, EditIcon } from "@/components/icons";
import { useMemories } from "@/hooks/useMemories";
import { pushNotification } from "@/hooks/useNotifications";
import type { MemoryCategory, SavedMemory } from "@/types/memory";

const CATEGORIES: Array<{ value: MemoryCategory; label: string }> = [
  { value: "preference", label: "Preference" },
  { value: "profile", label: "Profile" },
  { value: "project", label: "Project" },
  { value: "other", label: "Other" },
];

const fieldClass = "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]";
const fieldStyle = { background: "var(--surface-input)", borderColor: "var(--border)", color: "var(--text-primary)" } as const;

export default function MemorySettings() {
  const { memories, memoryEnabled, isLoading, isBusy, error, refresh, add, update, remove, clearAll, setEnabled } = useMemories();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("preference");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingCategory, setEditingCategory] = useState<MemoryCategory>("preference");
  const [confirmClear, setConfirmClear] = useState(false);

  async function submitNew(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await add({ text: text.trim(), category });
      setText("");
      pushNotification("success", "Memory saved", "Your saved memory is ready to use in future chats.");
    } catch (err) {
      pushNotification("error", "Could not save memory", err instanceof Error ? err.message : "Please try again.");
    }
  }

  function startEdit(memory: SavedMemory) {
    setEditingId(memory.id);
    setEditingText(memory.text);
    setEditingCategory(memory.category);
  }

  async function submitEdit(id: number) {
    try {
      await update(id, { text: editingText.trim(), category: editingCategory });
      setEditingId(null);
      pushNotification("success", "Memory updated", "Your saved memory has been updated.");
    } catch (err) {
      pushNotification("error", "Could not update memory", err instanceof Error ? err.message : "Please try again.");
    }
  }

  async function deleteOne(id: number) {
    try {
      await remove(id);
      pushNotification("success", "Memory deleted", "The saved memory was removed.");
    } catch (err) {
      pushNotification("error", "Could not delete memory", err instanceof Error ? err.message : "Please try again.");
    }
  }

  async function confirmDeleteAll() {
    try {
      await clearAll();
      setConfirmClear(false);
      pushNotification("success", "Memories cleared", "All saved memories have been removed.");
    } catch (err) {
      pushNotification("error", "Could not clear memories", err instanceof Error ? err.message : "Please try again.");
    }
  }

  async function toggleEnabled() {
    try {
      await setEnabled(!memoryEnabled);
      pushNotification("success", memoryEnabled ? "Memory turned off" : "Memory turned on", memoryEnabled
        ? "Saved memories will no longer be used or updated."
        : "Saved memories can now personalize future chats.");
    } catch (err) {
      pushNotification("error", "Could not update memory setting", err instanceof Error ? err.message : "Please try again.");
    }
  }

  return (
    <section className="mt-8 rounded-2xl border p-5 sm:p-6" style={{ background: "var(--surface-card)", borderColor: "var(--border)" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Memory</h2>
          <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--text-muted)" }}>Save useful details and preferences so WhiteLotusAI can remember them across chats. You can review or remove anything here.</p>
        </div>
        <button type="button" onClick={toggleEnabled} disabled={isBusy || isLoading}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium disabled:opacity-50"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} role="switch" aria-checked={memoryEnabled}>
          <span className={`relative h-5 w-9 rounded-full transition-colors ${memoryEnabled ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]/40"}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${memoryEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
          </span>
          {memoryEnabled ? "On" : "Off"}
        </button>
      </div>

      {!memoryEnabled && (
        <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--surface-hover)", color: "var(--text-muted)" }}>Memory is off. Your saved facts remain here, but they will not be included in chats or updated automatically.</p>
      )}

      <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--border)" }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Saved facts <span style={{ color: "var(--text-muted)" }}>({memories.length})</span></h3>
          {memories.length > 0 && !confirmClear && (
            <button type="button" disabled={isBusy} onClick={() => setConfirmClear(true)} className="text-xs font-medium disabled:opacity-50" style={{ color: "var(--danger, #dc2626)" }}>Clear all</button>
          )}
        </div>

        {confirmClear && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>Remove every saved memory? This cannot be undone.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmClear(false)} disabled={isBusy} className="rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>Cancel</button>
              <button type="button" onClick={confirmDeleteAll} disabled={isBusy} className="rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50" style={{ background: "var(--danger, #dc2626)" }}>Confirm clear</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="py-5 text-sm" style={{ color: "var(--text-muted)" }}>Loading saved memories…</p>
        ) : error ? (
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{error}</p>
            <button type="button" onClick={() => refresh().catch(() => {})} className="mt-2 text-xs font-medium" style={{ color: "var(--accent)" }}>Try again</button>
          </div>
        ) : memories.length === 0 ? (
          <p className="py-5 text-sm" style={{ color: "var(--text-muted)" }}>No saved memories yet. Add a detail you would like remembered between chats.</p>
        ) : (
          <div className="space-y-2">
            {memories.map((memory) => (
              <div key={memory.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                {editingId === memory.id ? (
                  <div className="space-y-2">
                    <input aria-label="Edit memory text" maxLength={200} value={editingText} onChange={(event) => setEditingText(event.target.value)} className={fieldClass} style={fieldStyle} />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <select aria-label="Memory category" value={editingCategory} onChange={(event) => setEditingCategory(event.target.value as MemoryCategory)} className={fieldClass + " sm:max-w-48"} style={fieldStyle}>
                        {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => submitEdit(memory.id)} disabled={isBusy || !editingText.trim()} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50" style={{ background: "var(--accent)" }}><CheckIcon /> Save</button>
                        <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}><CloseIcon className="h-3 w-3" /> Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="whitespace-pre-wrap break-words text-sm" style={{ color: "var(--text-primary)" }}>{memory.text}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: "var(--surface-hover)", color: "var(--text-muted)" }}>{CATEGORIES.find((item) => item.value === memory.category)?.label ?? "Other"}</span>
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{memory.source === "user" ? "Added by you" : "Saved from a chat"}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" title="Edit memory" aria-label="Edit memory" onClick={() => startEdit(memory)} className="rounded-lg p-2" style={{ color: "var(--text-muted)" }}><EditIcon /></button>
                      <button type="button" title="Delete memory" aria-label="Delete memory" onClick={() => deleteOne(memory.id)} disabled={isBusy} className="rounded-lg p-2 disabled:opacity-50" style={{ color: "var(--text-muted)" }}><CloseIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submitNew} className="mt-5 space-y-3 border-t pt-5" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Add a memory</h3>
        <label className="block text-xs font-medium" style={{ color: "var(--text-muted)" }}>What should WhiteLotusAI remember?
          <input value={text} onChange={(event) => setText(event.target.value)} maxLength={200} required placeholder="Example: I prefer concise, step-by-step technical explanations." className={fieldClass + " mt-1.5"} style={fieldStyle} />
        </label>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="block flex-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Category
            <select value={category} onChange={(event) => setCategory(event.target.value as MemoryCategory)} className={fieldClass + " mt-1.5 sm:max-w-48"} style={fieldStyle}>
              {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <button type="submit" disabled={isBusy || !text.trim()} className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>Add memory</button>
        </div>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Keep saved facts short. Do not save passwords, API keys, payment details, or government IDs.</p>
      </form>
    </section>
  );
}
