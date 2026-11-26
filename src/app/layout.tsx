import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ToastContainer from "@/components/ToastContainer";
import { AuthProvider } from "@/context/AuthContext";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { FONT_MAP, DENSITY_MAP } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Whitelotus AI",
  description: "Conversational AI assistant for software teams",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "Whitelotus AI",
    description: "Conversational AI assistant for software teams",
    images: [{ url: "/app-preview.png", width: 1920, height: 905, type: "image/png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whitelotus AI",
    description: "Conversational AI assistant for software teams",
    images: ["/app-preview.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Escape </script> sequences so the inline script can never break out of its tag.
function safeJson(v: unknown): string {
  return JSON.stringify(v)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// Injected before React hydrates — prevents flash of wrong theme.
// Minified to reduce HTML payload on every page load.
const themeScript = `(function(){try{var t=localStorage.getItem('wl-theme');if(t==='dark')document.documentElement.classList.add('dark');var f=localStorage.getItem('wl-font');var d=localStorage.getItem('wl-density');var fm=${safeJson(FONT_MAP)};var dm=${safeJson(DENSITY_MAP)};if(f&&fm[f])document.documentElement.style.setProperty('--font-family',fm[f]);if(d&&dm[d])document.documentElement.style.setProperty('--density-spacing',dm[d]);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script above mutates classList/style
    // before React hydrates, so the server-rendered HTML will differ from the
    // client — this suppresses the expected mismatch warning.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
