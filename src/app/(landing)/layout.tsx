import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "WhiteLotus AI — AI Assistant for Your Business",
  description:
    "Ask questions across your documents and connected tools — Jira, Slack, Gmail, Google Drive, Google Calendar, Microsoft Teams, and more — in one conversational interface. Self-hosted, secure, and built for teams.",
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "WhiteLotus AI — AI Assistant for Your Business",
    description:
      "Ask questions across your documents and connected tools in one conversational interface.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    siteName: "WhiteLotus AI",
    images: [{ url: "/app-preview.png", width: 1920, height: 905, type: "image/png" }],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
