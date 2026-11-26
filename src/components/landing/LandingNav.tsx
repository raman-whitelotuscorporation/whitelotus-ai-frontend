"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Integrations", href: "#integrations" },
  { label: "Docs", href: "/docs", external: true },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAnchor(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(9,9,15,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid transparent",
        }}
      >
        <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Image
              src="/logo.png"
              alt="WhiteLotus AI"
              width={30}
              height={30}
              className="rounded-lg"
            />
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              WhiteLotus AI
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => !l.external && handleAnchor(e, l.href)}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.55)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.92)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
                }
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                color: "rgba(255,255,255,0.60)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.90)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.60)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
              }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="landing-btn-primary"
              style={{ padding: "8px 18px", fontSize: 13 }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{
              color: "rgba(255,255,255,0.60)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden animate-fade-in"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-16 left-0 right-0 animate-fade-up"
            style={{
              background: "#0f0f1a",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    if (!l.external) handleAnchor(e, l.href);
                    else setMenuOpen(false);
                  }}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  {l.label}
                </a>
              ))}
              <div
                className="h-px my-2"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <Link
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.65)" }}
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="landing-btn-primary mt-1"
                style={{ padding: "10px 18px", fontSize: 13 }}
                onClick={() => setMenuOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
