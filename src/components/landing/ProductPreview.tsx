"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  GmailLogo,
  GoogleDriveLogo,
  GoogleCalLogo,
  JiraLogo,
  SlackLogo,
  TeamsLogo,
} from "@/lib/pluginIcons";

const TOOLS = [
  { id: "jira", label: "Jira", icon: <JiraLogo /> },
  { id: "slack", label: "Slack", icon: <SlackLogo /> },
  { id: "gmail", label: "Gmail", icon: <GmailLogo /> },
  { id: "drive", label: "Drive", icon: <GoogleDriveLogo /> },
  { id: "calendar", label: "Calendar", icon: <GoogleCalLogo /> },
  { id: "teams", label: "Teams", icon: <TeamsLogo /> },
];

const KB_FILES = [
  "Q3_Budget_2024.xlsx",
  "Company_Policies.pdf",
  "Product_Roadmap.pdf",
  "Team_Handbook.pdf",
];

const AGENT_STEPS = [
  { label: "Understanding the request…", tool: null },
  { label: "Searching Jira for open issues…", tool: "jira" },
  { label: "Searching Slack discussions…", tool: "slack" },
  { label: "Reviewing matching documents…", tool: "drive" },
  { label: "Preparing source-grounded summary…", tool: null },
];

const RESPONSE_LINES = [
  { type: "heading", text: "Project Risk Summary" },
  {
    type: "body",
    text: "Based on available Jira issues and Slack discussions, three active risks were identified:",
  },
  {
    type: "bullet",
    text: "API rate-limit errors in the integration layer (Jira: WL-412)",
  },
  {
    type: "bullet",
    text: "Delayed design review blocking Q4 launch (Jira: WL-398)",
  },
  {
    type: "bullet",
    text: "Onboarding doc gaps flagged in #team-updates (Slack)",
  },
  { type: "sources", text: "" },
];

const SOURCES = [
  { icon: "jira", label: "WL-412, WL-398" },
  { icon: "slack", label: "#team-updates" },
  { icon: "drive", label: "Product_Roadmap.pdf" },
];

const STEP_DURATION = 700;
const RESPONSE_DELAY = AGENT_STEPS.length * STEP_DURATION + 300;
const LINE_INTERVAL = 260;
const TOTAL_DURATION =
  RESPONSE_DELAY + RESPONSE_LINES.length * LINE_INTERVAL + 400;
const LOOP_PAUSE = 5000; // ms to show completed state before restarting

function SourceIcon({ id }: { id: string }) {
  const map: Record<string, React.ReactElement> = {
    jira: <JiraLogo />,
    slack: <SlackLogo />,
    drive: <GoogleDriveLogo />,
  };
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 shrink-0">
      {map[id] ?? null}
    </span>
  );
}

export default function ProductPreview() {
  const [step, setStep] = useState(-1);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());
  const [visibleLines, setVisibleLines] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reducedMotion = useRef(false);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    setStep(-1);
    setActiveTools(new Set());
    setVisibleLines(0);
    setShowResponse(false);
    setShowTyping(false);
  }, []);

  const runSequence = useCallback(() => {
    if (reducedMotion.current) {
      setStep(AGENT_STEPS.length - 1);
      setActiveTools(new Set(TOOLS.map((t) => t.id)));
      setShowResponse(true);
      setVisibleLines(RESPONSE_LINES.length);
      return;
    }

    const push = (fn: () => void, delay: number) => {
      timers.current.push(setTimeout(fn, delay));
    };

    AGENT_STEPS.forEach((s, i) => {
      push(
        () => {
          setStep(i);
          if (s.tool) setActiveTools((prev) => new Set([...prev, s.tool!]));
        },
        i * STEP_DURATION + 400,
      );
    });

    push(() => setShowTyping(true), RESPONSE_DELAY - 300);
    push(() => {
      setShowTyping(false);
      setShowResponse(true);
    }, RESPONSE_DELAY);

    RESPONSE_LINES.forEach((_, i) => {
      push(() => setVisibleLines(i + 1), RESPONSE_DELAY + i * LINE_INTERVAL);
    });

    // Loop: pause then restart
    push(() => {
      reset();
      // eslint-disable-next-line react-hooks/immutability
      push(runSequence, 400);
    }, TOTAL_DURATION + LOOP_PAUSE);
  }, [reset]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    runSequence();
    return clearAll;
  }, [runSequence, clearAll]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow:
          "0 0 0 1px rgba(117,87,246,0.12), 0 40px 100px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)",
        background: "#0a0a14",
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-1.5 px-4 py-3"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a14 100%)",
        }}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ background: "#ff5f57" }}
        />
        <span
          className="w-3 h-3 rounded-full"
          style={{ background: "#febc2e" }}
        />
        <span
          className="w-3 h-3 rounded-full"
          style={{ background: "#28c840" }}
        />
        <div
          className="flex-1 mx-4 h-6 rounded-lg flex items-center px-3 gap-1.5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-3 h-3 shrink-0"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
            app.whitelotusai.com
          </span>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-3.5 h-3.5"
          style={{ color: "rgba(255,255,255,0.20)" }}
        >
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
        </svg>
      </div>

      {/* App layout */}
      <div className="flex" style={{ minHeight: 460 }}>
        {/* Sidebar */}
        <div
          className="hidden sm:flex flex-col shrink-0"
          style={{
            width: 180,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a14 100%)",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Image
              src="/logo.png"
              alt=""
              width={18}
              height={18}
              className="rounded"
            />
            <span
              className="text-xs font-bold"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              WhiteLotus AI
            </span>
          </div>

          <div className="px-2 pt-2.5">
            <div
              className="flex items-center justify-center gap-1.5 py-1.5 w-full rounded-lg text-white"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="w-3 h-3"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Chat
            </div>
          </div>

          <div className="flex flex-col gap-0.5 px-2 pt-3">
            {[
              {
                label: "Chat",
                active: true,
                icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
              },
              {
                label: "Integrations",
                active: false,
                icon: "M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8l-2 2",
              },
              {
                label: "Settings",
                active: false,
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{
                  background: item.active
                    ? "rgba(117,87,246,0.18)"
                    : "transparent",
                  color: item.active ? "#a5b4fc" : "rgba(255,255,255,0.35)",
                  fontSize: 11,
                  fontWeight: item.active ? 600 : 500,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-3.5 h-3.5 shrink-0"
                >
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="px-2 pt-4">
            <p
              className="text-[9px] uppercase tracking-widest px-2 mb-1.5"
              style={{ color: "rgba(255,255,255,0.20)" }}
            >
              Today
            </p>
            {[
              "Summarize project risks…",
              "What's my calendar look like?",
              "Find open Jira issues",
              "Latest team updates",
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-3 h-3 shrink-0 opacity-40"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="truncate">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat */}
        <div
          className="flex-1 flex flex-col min-w-0"
          style={{
            background: "#0a0a14",
            backgroundImage:
              "radial-gradient(circle, rgba(117,87,246,0.03) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="flex-1 overflow-hidden px-4 py-4 flex flex-col gap-3">
            {/* User message */}
            <div className="flex justify-end">
              <div
                className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs text-white"
                style={{
                  background: "linear-gradient(135deg, #7557f6, #4f8ef7)",
                  lineHeight: 1.55,
                  boxShadow: "0 2px 16px rgba(117,87,246,0.35)",
                }}
              >
                Summarize the latest project risks and identify related
                discussions.
              </div>
            </div>

            {/* Agent steps */}
            {step >= 0 && (
              <div className="flex flex-col gap-1.5">
                {AGENT_STEPS.slice(0, step + 1).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl animate-step-appear"
                    style={{
                      background:
                        i < step
                          ? "rgba(74,222,128,0.04)"
                          : "rgba(117,87,246,0.06)",
                      border: `1px solid ${i < step ? "rgba(74,222,128,0.18)" : "rgba(117,87,246,0.25)"}`,
                      opacity: i < step ? 0.55 : 1,
                      fontSize: 10,
                      color:
                        i < step
                          ? "rgba(74,222,128,0.85)"
                          : "rgba(255,255,255,0.60)",
                      maxWidth: "88%",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {i < step ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        className="w-3 h-3 shrink-0"
                        style={{ color: "#4ade80" }}
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="w-3 h-3 shrink-0 flex items-center justify-center">
                        <span
                          className="w-2.5 h-2.5 rounded-full border-2 border-t-transparent animate-spin"
                          style={{
                            borderColor: "rgba(117,87,246,0.9)",
                            borderTopColor: "transparent",
                          }}
                        />
                      </span>
                    )}
                    {s.label}
                  </div>
                ))}
              </div>
            )}

            {/* Typing */}
            {showTyping && (
              <div
                className="px-3 py-2.5 rounded-2xl flex items-center gap-1.5 animate-fade-in"
                style={{
                  background: "rgba(117,87,246,0.06)",
                  border: "1px solid rgba(117,87,246,0.15)",
                  maxWidth: 72,
                }}
              >
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}

            {/* AI response */}
            {showResponse && (
              <div
                className="px-4 py-3 rounded-2xl flex flex-col gap-1.5 animate-fade-in"
                style={{
                  background: "rgba(117,87,246,0.05)",
                  border: "1px solid rgba(117,87,246,0.15)",
                  maxWidth: "92%",
                  fontSize: 11,
                  lineHeight: 1.65,
                }}
              >
                {RESPONSE_LINES.slice(0, visibleLines).map((line, i) => {
                  if (line.type === "heading")
                    return (
                      <p
                        key={i}
                        className="font-bold text-xs"
                        style={{ color: "rgba(255,255,255,0.94)" }}
                      >
                        {line.text}
                      </p>
                    );
                  if (line.type === "bullet")
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 animate-fade-in"
                      >
                        <span
                          className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                          style={{ background: "#7c6ff7" }}
                        />
                        <span style={{ color: "rgba(255,255,255,0.72)" }}>
                          {line.text}
                        </span>
                      </div>
                    );
                  if (
                    line.type === "sources" &&
                    visibleLines >= RESPONSE_LINES.length
                  )
                    return (
                      <div
                        key={i}
                        className="flex flex-wrap items-center gap-1.5 pt-2 mt-1 animate-fade-in"
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <span
                          className="text-[9px] uppercase tracking-widest"
                          style={{ color: "rgba(255,255,255,0.28)" }}
                        >
                          Sources
                        </span>
                        {SOURCES.map((src) => (
                          <span
                            key={src.icon}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px]"
                            style={{
                              background: "rgba(117,87,246,0.10)",
                              color: "rgba(255,255,255,0.60)",
                              border: "1px solid rgba(117,87,246,0.20)",
                            }}
                          >
                            <SourceIcon id={src.icon} />
                            {src.label}
                          </span>
                        ))}
                      </div>
                    );
                  return (
                    <p
                      key={i}
                      className="animate-fade-in"
                      style={{ color: "rgba(255,255,255,0.60)" }}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="px-3 pb-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 11,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "rgba(255,255,255,0.22)" }}
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span style={{ color: "rgba(255,255,255,0.20)", flex: 1 }}>
                Ask anything…
              </span>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #7557f6, #8b5cf6)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2.5}
                  className="w-3 h-3"
                >
                  <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div
          className="hidden lg:flex flex-col shrink-0"
          style={{
            width: 196,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a14 100%)",
          }}
        >
          {/* Connected Tools */}
          <div
            className="p-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span
                className="text-[10px] font-semibold"
                style={{ color: "rgba(255,255,255,0.80)" }}
              >
                Connected Tools
              </span>
              <span className="text-[9px]" style={{ color: "#7c6ff7" }}>
                View All
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {TOOLS.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg"
                  style={{
                    background: activeTools.has(t.id)
                      ? "rgba(117,87,246,0.16)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${activeTools.has(t.id) ? "rgba(117,87,246,0.40)" : "rgba(255,255,255,0.07)"}`,
                    boxShadow: activeTools.has(t.id)
                      ? "0 0 12px rgba(117,87,246,0.22)"
                      : "none",
                    transition: "all 0.4s ease",
                  }}
                  title={t.label}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {t.icon}
                  </span>
                  <span
                    className="text-[8px]"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                  >
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Base */}
          <div
            className="p-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span
                className="text-[10px] font-semibold"
                style={{ color: "rgba(255,255,255,0.80)" }}
              >
                Knowledge Base
              </span>
              <span className="text-[9px]" style={{ color: "#7c6ff7" }}>
                View All
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {KB_FILES.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-3 h-3 shrink-0"
                    style={{ color: "#7c6ff7" }}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span
                    className="text-[9px] truncate"
                    style={{ color: "rgba(255,255,255,0.40)" }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-3">
            <p
              className="text-[10px] font-semibold mb-2"
              style={{ color: "rgba(255,255,255,0.80)" }}
            >
              Recent Activity
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                {
                  label: "Analyzed 3 documents",
                  time: "2m ago",
                  color: "#4ade80",
                },
                { label: "Queried Jira", time: "4m ago", color: "#7c6ff7" },
                { label: "Searched Slack", time: "6m ago", color: "#36C5F0" },
              ].map((a) => (
                <div
                  key={a.label}
                  className="flex items-center justify-between gap-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: a.color }}
                    />
                    <span
                      className="text-[9px]"
                      style={{ color: "rgba(255,255,255,0.40)" }}
                    >
                      {a.label}
                    </span>
                  </div>
                  <span
                    className="text-[9px]"
                    style={{ color: "rgba(255,255,255,0.20)" }}
                  >
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
