"use client";
import Link from "next/link";
import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";

export default function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-5 overflow-hidden"
      style={{ background: "var(--surface-sidebar)" }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div
          className="landing-orb"
          style={{
            width: 600,
            height: 600,
            top: "-25%",
            left: "5%",
            background:
              "radial-gradient(circle, rgba(99,60,255,0.12) 0%, transparent 65%)",
            animation: "orb1 20s ease-in-out infinite",
          }}
        />
        <div
          className="landing-orb"
          style={{
            width: 500,
            height: 500,
            bottom: "-20%",
            right: "5%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 65%)",
            animation: "orb2 24s ease-in-out infinite",
          }}
        />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(129,140,248,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center reveal-hidden reveal-d1">
        <div className="landing-eyebrow mb-6 mx-auto w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          GET STARTED TODAY
        </div>

        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-5"
          style={{ color: "var(--text-primary)" }}
        >
          Bring your business knowledge together.
        </h2>
        <p
          className="text-base mb-9"
          style={{ color: "var(--text-secondary)" }}
        >
          Start with your documents, connect the tools you use, and give your
          team one place to find answers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup" className="landing-btn-primary w-full sm:w-auto">
            Get Started Free
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="w-4 h-4"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="landing-btn-secondary w-full sm:w-auto"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
