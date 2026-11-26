"use client";
import { useState } from "react";

export function FormField({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</label>
      {hint && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>}
      {children}
    </div>
  );
}

export function FormInput({ value, onChange, type = "text", placeholder, disabled, id }: {
  value: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean; id?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background: disabled ? "var(--surface-hover)" : "var(--surface-input)",
        border: focused ? "1.5px solid var(--border-focus)" : "1.5px solid var(--border)",
        color: disabled ? "var(--text-muted)" : "var(--text-primary)",
        cursor: disabled ? "not-allowed" : "text",
      }}
      onFocus={() => { if (!disabled) setFocused(true); }}
      onBlur={() => setFocused(false)}
    />
  );
}
