"use client";
import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";

const STEPS = [
  {
    n: "01",
    title: "Connect your knowledge",
    body: "Upload supported business documents — PDFs, reports, policies, and more. WhiteLotusAI indexes them so they are immediately queryable.",
    icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  },
  {
    n: "02",
    title: "Connect your tools",
    body: "Authorize the integrations your team uses — Gmail, Google Drive, Google Calendar, Jira, Slack, and Microsoft Teams — through a standard OAuth flow.",
    icon: "M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8l-2 2",
  },
  {
    n: "03",
    title: "Ask and act",
    body: "Ask questions in natural language. The agent uses relevant available sources and clearly identifies when information is missing or outside its scope.",
    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 px-5"
      style={{ background: "var(--surface-sidebar)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 reveal-hidden reveal-d1">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent)" }}
          >
            How it works
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Up and running in minutes
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Three steps to give your team a single place to find answers across
            documents and connected tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line — desktop only */}
          <div className="landing-step-connector hidden md:block" aria-hidden />

          {STEPS.map((step, idx) => (
            <div
              key={step.n}
              className={`flex flex-col items-center text-center gap-5 reveal-hidden reveal-d${idx + 2}`}
            >
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--border)",
                    color: "var(--accent)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="w-7 h-7"
                  >
                    <path d={step.icon} />
                  </svg>
                </div>
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                >
                  {idx + 1}
                </span>
              </div>

              <div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p
          className="text-center text-xs mt-12 reveal-hidden reveal-d5"
          style={{ color: "var(--text-muted)" }}
        >
          The agent uses relevant available sources and identifies when
          information is missing or requires additional authorization.
        </p>
      </div>
    </section>
  );
}
