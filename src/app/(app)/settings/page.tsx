"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/chat";
import { useTheme } from "@/components/ThemeProvider";
import { FormField, FormInput } from "@/components/FormField";
import { ACCENTS, FONT_MAP, DENSITY_MAP } from "@/lib/theme";
import { getInitials } from "@/lib/utils";

type Tab = "profile" | "security" | "appearance" | "notifications";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

// ── Field wrapper ─────────────────────────────────────────────────────────────
// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ loading, label = "Save changes" }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
      style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(99,102,241,0.30)" }}
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

// ── Shared types ─────────────────────────────────────────────────────────────
type FormMsg = { type: "ok" | "err"; text: string };

// ── Banner ────────────────────────────────────────────────────────────────────
function Banner({ msg }: { msg: FormMsg | null }) {
  if (!msg) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl text-sm flex items-center gap-2.5"
      style={{
        background: msg.type === "ok" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
        border: `1px solid ${msg.type === "ok" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
        color: msg.type === "ok" ? "#10b981" : "#ef4444",
      }}
    >
      {msg.type === "ok"
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
      }
      {msg.text}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {children}
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, onUpdateProfile }: {
  user: User;
  onUpdateProfile: (name?: string, avatar?: string) => Promise<User>;
}) {
  const [displayName, setDisplayName] = useState(user.display_name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<FormMsg | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const initials = getInitials(user.display_name);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await onUpdateProfile(displayName.trim() || undefined, avatarUrl.trim() || undefined);
      setMsg({ type: "ok", text: "Profile updated successfully" });
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Banner msg={msg} />

      <Section title="Personal information">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold overflow-hidden transition-opacity"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                title="Upload photo">
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </button>
              {/* Camera overlay on hover */}
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-5 h-5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.display_name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{user.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(99,102,241,0.10)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.20)" }}>
                {user.role}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-xs font-medium transition-colors"
                  style={{ color: "var(--accent)" }}>
                  Upload photo
                </button>
                {avatarUrl && (
                  <>
                    <span style={{ color: "var(--border)" }}>·</span>
                    <button type="button" onClick={() => { setAvatarUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
                      className="hover-danger text-xs"
                      style={{ color: "var(--text-muted)" }}>
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <FormField label="Display name" htmlFor="settings-display-name">
            <FormInput id="settings-display-name" value={displayName} onChange={setDisplayName} placeholder="Your name" />
          </FormField>

          <FormField label="Email address" htmlFor="settings-email">
            <FormInput id="settings-email" value={user.email} disabled />
          </FormField>

          <FormField label="Account ID" htmlFor="settings-account-id">
            <FormInput id="settings-account-id" value={user.user_id} disabled />
          </FormField>

          <div className="flex justify-end pt-1">
            <SaveBtn loading={saving} />
          </div>
        </form>
      </Section>
    </div>
  );
}

// ── Security tab ──────────────────────────────────────────────────────────────
function SecurityTab({ onChangePassword }: {
  onChangePassword: (current: string, next: string) => Promise<void>;
}) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<FormMsg | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setMsg({ type: "err", text: "Passwords do not match" }); return; }
    if (newPw.length < 8) { setMsg({ type: "err", text: "Password must be at least 8 characters" }); return; }
    setSaving(true); setMsg(null);
    try {
      await onChangePassword(currentPw, newPw);
      setMsg({ type: "ok", text: "Password changed successfully" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Failed to change password" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Banner msg={msg} />

      <Section title="Change password">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Current password" htmlFor="settings-current-pw">
            <FormInput id="settings-current-pw" type="password" value={currentPw} onChange={setCurrentPw} placeholder="••••••••" />
          </FormField>
          <FormField label="New password" hint="Minimum 8 characters" htmlFor="settings-new-pw">
            <FormInput id="settings-new-pw" type="password" value={newPw} onChange={setNewPw} placeholder="••••••••" />
          </FormField>
          <FormField label="Confirm new password" htmlFor="settings-confirm-pw">
            <FormInput id="settings-confirm-pw" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="••••••••" />
          </FormField>
          <div className="flex justify-end pt-1">
            <SaveBtn loading={saving} label="Update password" />
          </div>
        </form>
      </Section>

      <Section title="Active sessions">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--surface-hover)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4" style={{ color: "var(--text-muted)" }}>
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Current session</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>This device · Active now</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: "rgba(16,185,129,0.10)", color: "#10b981", border: "1px solid rgba(16,185,129,0.20)" }}>
            Active
          </span>
        </div>
      </Section>
    </div>
  );
}

// ── Appearance tab ────────────────────────────────────────────────────────────
function AppearanceTab() {
  const { theme, toggle, font, setFont, density, setDensity, accent, setAccent } = useTheme();

  const fonts = Object.keys(FONT_MAP);
  const densities = Object.keys(DENSITY_MAP);

  return (
    <div className="space-y-5">
      <Section title="Theme">
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "light", label: "Light", desc: "Clean white interface",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
            { id: "dark",  label: "Dark",  desc: "Easy on the eyes",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
          ]).map((t) => {
            const active = theme === t.id;
            return (
              <button key={t.id} onClick={() => { if (!active) toggle(); }}
                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                style={{
                  border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "rgba(99,102,241,0.06)" : "var(--surface-card)",
                }}>
                <span style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}>{t.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: active ? "var(--accent)" : "var(--text-primary)" }}>{t.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
                </div>
                {active && (
                  <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--accent)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Accent colour">
        <div className="flex items-center gap-3">
          {ACCENTS.map((a) => {
            const color = theme === "dark" ? a.dark.accent : a.light.accent;
            const isActive = accent === a.id;
            return (
              <button key={a.id} onClick={() => setAccent(a.id)}
                title={a.label}
                className="relative w-8 h-8 rounded-full transition-all"
                style={{
                  background: color,
                  boxShadow: isActive ? `0 0 0 3px var(--surface-card), 0 0 0 5px ${color}` : "none",
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                }}
              >
                {isActive && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="absolute inset-0 m-auto w-3.5 h-3.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Changes apply instantly across the app</p>
      </Section>

      <Section title="Font">
        <div className="flex flex-wrap gap-2">
          {fonts.map((f) => (
            <button key={f} onClick={() => setFont(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                border: `1.5px solid ${font === f ? "var(--accent)" : "var(--border)"}`,
                background: font === f ? "rgba(99,102,241,0.06)" : "var(--surface-card)",
                color: font === f ? "var(--accent)" : "var(--text-secondary)",
              }}>
              {f}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Density">
        <div className="flex flex-wrap gap-2">
          {densities.map((d) => (
            <button key={d} onClick={() => setDensity(d)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                border: `1.5px solid ${density === d ? "var(--accent)" : "var(--border)"}`,
                background: density === d ? "rgba(99,102,241,0.06)" : "var(--surface-card)",
                color: density === d ? "var(--accent)" : "var(--text-secondary)",
              }}>
              {d}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Notifications tab ─────────────────────────────────────────────────────────
const NOTIF_DEFAULTS = {
  email_digest: true, chat_replies: true, plugin_alerts: false,
  security_alerts: true, product_updates: false,
};

function NotificationsTab({ userId }: { userId: string }) {
  const NOTIF_KEY = `wl-notif-prefs:${userId}`;
  const [prefs, setPrefs] = useState<typeof NOTIF_DEFAULTS>(() => {
    try {
      return { ...NOTIF_DEFAULTS, ...JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "{}") };
    } catch { return NOTIF_DEFAULTS; }
  });

  function toggle(key: keyof typeof NOTIF_DEFAULTS) {
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] };
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
      return next;
    });
  }

  const items: { key: keyof typeof NOTIF_DEFAULTS; label: string; desc: string }[] = [
    { key: "email_digest",    label: "Weekly email digest",    desc: "Summary of your activity every week" },
    { key: "chat_replies",    label: "Chat reply alerts",      desc: "Notify when AI responds to your messages" },
    { key: "plugin_alerts",   label: "Plugin status alerts",   desc: "Alerts when a connected tool has issues" },
    { key: "security_alerts", label: "Security alerts",        desc: "Login attempts and account changes" },
    { key: "product_updates", label: "Product updates",        desc: "New features and announcements" },
  ];

  return (
    <div className="space-y-5">
      <div
        className="px-4 py-3 rounded-xl text-xs"
        style={{
          background: "rgba(251,191,36,0.08)",
          border: "1px solid rgba(251,191,36,0.25)",
          color: "var(--status-warn-text)",
        }}
      >
        These preferences are saved locally in this browser only. No notification emails are currently sent by the application.
      </div>
      <Section title="In-app notification preferences">
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={item.key}
              className="flex items-center justify-between py-3"
              style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={prefs[item.key]}
                aria-label={item.label}
                onClick={() => toggle(item.key)}
                className="relative shrink-0 rounded-full transition-colors"
                style={{ width: 40, height: 22, background: prefs[item.key] ? "var(--accent)" : "var(--border-hover)" }}>
                <span
                  className="absolute top-0.5 rounded-full bg-white shadow transition-transform"
                  style={{ width: 18, height: 18, left: 2, transform: prefs[item.key] ? "translateX(18px)" : "translateX(0)" }} />
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const SEARCH_MAP: Record<Tab, string[]> = {
  profile:       ["name", "avatar", "email", "account", "display", "profile"],
  security:      ["password", "login", "session", "security", "2fa"],
  appearance:    ["theme", "dark", "light", "font", "density", "color", "appearance"],
  notifications: ["email", "notify", "alert", "digest", "notification"],
};

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { user, authState, updateProfile, changePassword } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null);
  const [tab, setTab] = useState<Tab>(initialTab && TABS.find((x) => x.id === initialTab) ? initialTab : "profile");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTabs = searchQuery.trim()
    ? TABS.filter((t) => {
        const q = searchQuery.toLowerCase();
        return t.label.toLowerCase().includes(q) || SEARCH_MAP[t.id].some((kw) => kw.includes(q));
      })
    : TABS;

  return (
    <>
      {/* Page header */}
      <div className="px-6 pt-5 pb-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-card)" }}>
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

        {/* Tab nav — horizontal scroll on mobile, fixed sidebar on md+ */}
        <div
          className="settings-nav flex md:flex-col md:w-52 md:shrink-0 md:p-3 md:space-y-0.5 md:overflow-y-auto overflow-x-auto shrink-0 px-3 py-2 gap-1"
          style={{ background: "var(--surface-card)" }}
        >
          {filteredTabs.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>No results</p>
          ) : filteredTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`nav-item shrink-0 md:w-full ${tab === t.id ? "active" : ""}`}>
              {t.icon}
              <span className="md:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {tab === "profile"       && user && <ProfileTab user={user} onUpdateProfile={updateProfile} />}
            {tab === "security"      && <SecurityTab onChangePassword={changePassword} />}
            {tab === "appearance"    && <AppearanceTab />}
            {tab === "notifications" && user && <NotificationsTab userId={user.user_id} />}
          </div>
        </div>
      </div>
    </>
  );
}
