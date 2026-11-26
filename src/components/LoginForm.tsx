"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type Props = {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, displayName: string, password: string, organizationName?: string, inviteToken?: string) => Promise<void>;
  error: string | null;
  onClearError: () => void;
  defaultMode?: "login" | "register";
  inviteToken?: string;
};

// ── Aurora background — theme-aware ──────────────────────────────────────────

function AuroraBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "var(--surface-page)" }}
    >
      {/* Base radial tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, var(--accent-glow) 0%, transparent 70%)",
        }}
      />
      {/* Orb 1 — top left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600, top: "-15%", left: "-10%",
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          animation: "orb1 18s ease-in-out infinite",
        }}
      />
      {/* Orb 2 — bottom right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 700, height: 700, bottom: "-20%", right: "-10%",
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          animation: "orb2 22s ease-in-out infinite",
        }}
      />
      {/* Orb 3 — center */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400, top: "40%", left: "55%",
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          animation: "orb3 15s ease-in-out infinite",
        }}
      />
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          opacity: 0.4,
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />
    </div>
  );
}

// ── Eye icon ──────────────────────────────────────────────────────────────────

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[15px] h-[15px]">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[15px] h-[15px]">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Input sub-components — theme-aware ────────────────────────────────────────

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ type = "text", value, onChange, placeholder, required, minLength, id }: {
  type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; minLength?: number; id?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} required={required} minLength={minLength}
      className="w-full text-sm outline-none transition-all duration-200 rounded-xl px-4 py-3"
      style={{
        background: focused ? "var(--surface-input)" : "var(--surface-hover)",
        border: focused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
        boxShadow: focused ? "0 0 0 3px var(--accent-glow)" : "none",
        color: "var(--text-primary)",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function PasswordInput({ value, onChange, label, placeholder = "••••••••", id }: {
  value: string; onChange: (v: string) => void; label: string; placeholder?: string; id?: string;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const toggleId = id ? `${id}-toggle` : undefined;
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <input
          id={id} type={show ? "text" : "password"} value={value}
          onChange={(e) => onChange(e.target.value)}
          required minLength={8} placeholder={placeholder}
          className="w-full text-sm outline-none transition-all duration-200 rounded-xl px-4 py-3"
          style={{
            paddingRight: "2.75rem",
            background: focused ? "var(--surface-input)" : "var(--surface-hover)",
            border: focused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
            boxShadow: focused ? "0 0 0 3px var(--accent-glow)" : "none",
            color: "var(--text-primary)",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button
          type="button" onClick={() => setShow((s) => !s)} tabIndex={-1}
          id={toggleId}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <EyeIcon visible={show} />
        </button>
      </div>
    </Field>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LoginForm({ onLogin, onRegister, error, onClearError, defaultMode = "login", inviteToken }: Props) {
  const [mode, setMode]               = useState<"login" | "register">(defaultMode);
  const [email, setEmail]             = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [localError, setLocalError]   = useState<string | null>(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true); }, []);

  const shownError = localError ?? error;

  function switchMode(m: "login" | "register") {
    setMode(m); setLocalError(null); onClearError();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null); onClearError();
    if (mode === "register") {
      if (password !== confirm) { setLocalError("Passwords do not match"); return; }
      if (password.length < 8)  { setLocalError("Password must be at least 8 characters"); return; }
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(email.trim(), password);
      } else {
        await onRegister(email.trim(), displayName.trim(), password, organizationName.trim() || undefined, inviteToken);
      }
    } catch { /* error surfaced via prop */ } finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AuroraBackground />

      {/* Card */}
      <div
        className="relative w-full max-w-[400px]"
        style={{
          animation: mounted ? "fadeSlideUp 0.5s ease both" : "none",
          zIndex: 10,
        }}
      >
        {/* Glow behind card */}
        <div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, var(--accent-glow) 0%, transparent 100%)",
            filter: "blur(1px)",
          }}
        />

        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface-card)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-panel)",
          }}
        >
          {/* Top accent line */}
          <div
            className="h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, var(--accent) 40%, var(--accent-2) 60%, transparent)",
              opacity: 0.5,
            }}
          />

          <div className="px-8 pt-8 pb-9">

            {/* Logo + brand */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-5">
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "var(--accent-glow)",
                    filter: "blur(16px)",
                    transform: "scale(1.6)",
                  }}
                />
                <div
                  className="relative rounded-2xl p-0.5"
                  style={{
                    background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                    boxShadow: "0 8px 32px var(--accent-glow)",
                  }}
                >
                  <Image src="/logo.png" alt="Whitelotus AI" width={52} height={52} className="rounded-xl block" />
                </div>
              </div>

              <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-[13px] mt-1.5 text-center leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {mode === "login"
                  ? "Sign in to your Whitelotus workspace"
                  : "Start your intelligent workspace journey"}
              </p>
            </div>

            {/* Error banner */}
            {shownError && (
              <div
                className="mb-5 px-4 py-3 rounded-xl text-[13px] flex items-start gap-2.5"
                style={{
                  background: "var(--status-error-bg)",
                  border: "1px solid var(--status-error-border)",
                  color: "var(--status-error-text)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {shownError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  {inviteToken ? (
                    <div className="rounded-xl px-3.5 py-3 text-xs" style={{ background: "var(--accent-glow)", border: "1px solid var(--border-focus)", color: "var(--text-secondary)" }}>
                      You are accepting a workspace invitation. Your account will join the invited organization.
                    </div>
                  ) : (
                    <Field label="Workspace name" htmlFor="reg-org">
                      <TextInput id="reg-org" value={organizationName} onChange={setOrganizationName} placeholder="Your company or team" minLength={2} />
                    </Field>
                  )}
                  <Field label="Display name" htmlFor="reg-name">
                    <TextInput id="reg-name" value={displayName} onChange={setDisplayName} placeholder="Your name" required minLength={2} />
                  </Field>
                </>
              )}

              <Field label="Email address" htmlFor="auth-email">
                <TextInput id="auth-email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" required />
              </Field>

              <PasswordInput id="auth-password" value={password} onChange={setPassword} label="Password" />

              {mode === "register" && (
                <PasswordInput id="auth-confirm" value={confirm} onChange={setConfirm} label="Confirm password" />
              )}

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit" disabled={loading}
                  className="relative w-full py-3 text-white text-[13px] font-semibold rounded-xl overflow-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
                    boxShadow: loading ? "none" : "0 4px 24px var(--accent-glow), 0 1px 0 rgba(255,255,255,0.1) inset",
                  }}
                >
                  {/* Shimmer on hover */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading && (
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    )}
                    {loading
                      ? (mode === "login" ? "Signing in…" : "Creating account…")
                      : (mode === "login" ? "Sign in" : "Create account")}
                  </span>
                </button>
              </div>
            </form>

            {/* Divider + mode toggle */}
            <div className="mt-6 space-y-4">
              <Divider label={mode === "login" ? "New to Whitelotus?" : "Already have an account?"} />
              <button
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="hover-surface w-full py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200"
                style={{
                  background: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {mode === "login" ? "Create a free account →" : "← Back to sign in"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] mt-5 tracking-wide" style={{ color: "var(--text-muted)" }}>
          WHITELOTUS AI · SECURE AUTH
        </p>
      </div>
    </div>
  );
}
