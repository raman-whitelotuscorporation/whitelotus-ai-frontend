"use client";
import Image from "next/image";
import Link from "next/link";

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
  muted?: boolean;
};
type NavCol = { heading: string; links: NavLink[] };

export default function LandingFooter() {
  const COLS: NavCol[] = [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Integrations", href: "/#integrations" },
        { label: "Docs", href: "/docs", external: true },
      ],
    },
    {
      heading: "Account",
      links: [
        { label: "Sign In", href: "/login" },
        { label: "Get Started", href: "/signup" },
        { label: "Open App", href: "/app" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", href: "#", muted: true },
        { label: "Terms of Service", href: "#", muted: true },
      ],
    },
  ];

  return (
    <footer
      className="py-14 px-5"
      style={{
        background: "#0c0c14",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.png"
                alt="WhiteLotus AI"
                width={26}
                height={26}
                className="rounded-lg"
              />
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: "rgba(255,255,255,0.88)" }}
              >
                WhiteLotus AI
              </span>
            </Link>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              AI assistant for businesses. Ask questions across your company
              documents and connected tools in one conversational interface.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.heading}>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noopener noreferrer" : undefined}
                      className="text-sm transition-colors"
                      style={{
                        color: l.muted
                          ? "rgba(255,255,255,0.22)"
                          : "rgba(255,255,255,0.45)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.80)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = l.muted
                          ? "rgba(255,255,255,0.22)"
                          : "rgba(255,255,255,0.45)")
                      }
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
            © {new Date().getFullYear()} WhiteLotus AI. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
            Built with Next.js & FastAPI
          </p>
        </div>
      </div>
    </footer>
  );
}
