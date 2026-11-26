/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Derive the API origin (scheme + host, no path) for CSP connect-src.
const apiOrigin = (() => {
  try {
    const u = new URL(API_URL);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "http://localhost:8000";
  }
})();

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  // Prevent the page from being embedded in an iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing the content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin as the referrer (no path/query leakage).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the app does not use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Content-Security-Policy:
  //   - default-src 'self'          — block everything not explicitly allowed
  //   - script-src 'self' 'unsafe-inline' — Next.js inline scripts (theme init)
  //   - style-src 'self' 'unsafe-inline'  — Tailwind inline styles
  //   - img-src 'self' data: blob:        — avatars (data URLs) + Next/Image
  //   - connect-src 'self' <apiOrigin>    — only talk to our own API
  //   - font-src 'self'
  //   - object-src 'none'
  //   - base-uri 'self'
  //   - frame-ancestors 'none'
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      `connect-src 'self' ${apiOrigin}`,
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
