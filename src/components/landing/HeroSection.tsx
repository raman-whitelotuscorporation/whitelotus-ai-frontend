"use client";
import Link from "next/link";
import dynamic from "next/dynamic";

const ProductPreview = dynamic(() => import("./ProductPreview"), {
  ssr: false,
});

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-28 pb-20 overflow-hidden landing-grid-bg"
      style={{ background: "var(--surface-page)" }}
    >
      {/* ── Ambient orbs — GPU-composited, no blur animation ── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        {/* Top-left primary violet */}
        <div
          className="landing-orb"
          style={{
            width: 860,
            height: 860,
            top: "-15%",
            left: "-10%",
            background:
              "radial-gradient(circle, rgba(117,87,246,0.32) 0%, rgba(117,87,246,0.10) 40%, transparent 68%)",
            animation: "orb-drift-a 24s ease-in-out infinite",
          }}
        />
        {/* Bottom-right lavender */}
        <div
          className="landing-orb"
          style={{
            width: 780,
            height: 780,
            bottom: "-16%",
            right: "-8%",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.26) 0%, rgba(167,139,250,0.07) 42%, transparent 68%)",
            animation: "orb-drift-b 30s ease-in-out infinite",
          }}
        />
        {/* Center-right blue */}
        <div
          className="landing-orb"
          style={{
            width: 480,
            height: 480,
            top: "28%",
            left: "60%",
            background:
              "radial-gradient(circle, rgba(79,142,247,0.18) 0%, transparent 65%)",
            animation: "orb-drift-c 20s ease-in-out infinite",
          }}
        />
        {/* Top-center wide spread */}
        <div
          className="landing-orb"
          style={{
            width: 700,
            height: 280,
            top: "2%",
            left: "15%",
            background:
              "radial-gradient(ellipse, rgba(117,87,246,0.14) 0%, transparent 70%)",
            filter: "blur(70px)",
            animation: "orb-drift-a 32s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Text block — hero-enter with fill:both starts invisible ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        {/* Eyebrow */}
        <div className="landing-eyebrow mb-6 hero-enter hero-enter-d1">
          <span className="relative flex w-2 h-2 shrink-0">
            <span
              className="dot-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "#4ade80" }}
            />
            <span
              className="relative inline-flex rounded-full w-2 h-2"
              style={{ background: "#4ade80" }}
            />
          </span>
          YOUR AI BUSINESS ASSISTANT
        </div>

        {/* Headline */}
        <h1 className="w-full">
          <span
            className="block text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.12] hero-enter hero-enter-d2"
            style={{ color: "rgba(255,255,255,0.96)" }}
          >
            Your work has context.
          </span>
          <span className="block text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.12] mb-6 landing-gradient-text hero-enter hero-enter-d3">
            Now your AI does too.
          </span>
        </h1>

        {/* Supporting copy */}
        <p
          className="text-base sm:text-lg leading-relaxed max-w-2xl mb-9 hero-enter hero-enter-d4"
          style={{ color: "rgba(255,255,255,0.52)" }}
        >
          Ask questions across your company documents and connected tools.
          WhiteLotusAI helps you find information, understand your work, and
          move faster — from one conversational interface.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto hero-enter hero-enter-d5">
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
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#how-it-works")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="landing-btn-secondary w-full sm:w-auto"
          >
            See How It Works
          </a>
        </div>

        {/* Trust line */}
        <p
          className="mt-6 text-xs hero-enter hero-enter-d6"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Your documents. Your tools. One intelligent workspace.
        </p>
      </div>

      {/* ── Product preview ── */}
      <div className="relative z-10 mt-16 w-full max-w-5xl mx-auto hero-enter hero-enter-d6">
        {/* Pulsing glow — opacity only, no transform/blur animation */}
        <div
          className="absolute pointer-events-none landing-preview-glow"
          style={{
            inset: "-48px",
            borderRadius: "2rem",
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(117,87,246,0.30) 0%, rgba(117,87,246,0.10) 45%, transparent 72%)",
          }}
          aria-hidden
        />
        {/* Crisp border glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: "-1px",
            borderRadius: "1rem",
            background:
              "linear-gradient(135deg, rgba(117,87,246,0.45) 0%, rgba(167,139,250,0.25) 50%, rgba(79,142,247,0.20) 100%)",
            opacity: 0.55,
          }}
          aria-hidden
        />
        <ProductPreview />
      </div>

      {/* ── Trust badges ── */}
      <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 hero-enter hero-enter-d5">
        {[
          {
            icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
            label: "Your data stays with you",
          },
          {
            icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
            label: "Answers grounded in sources",
          },
          {
            icon: "M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z",
            label: "You control connected tools",
          },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--accent)" }}
            >
              <path d={b.icon} />
            </svg>
            <span
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
