import type { IntegrationProvider } from "@/types/chat";

export function GmailLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
      <path fill="#EA4335" d="M6 40h6V22.5L4 17v20a3 3 0 0 0 3 3z" />
      <path fill="#34A853" d="M36 40h6a3 3 0 0 0 3-3V17l-9 5.5z" />
      <path fill="#FBBC05" d="M36 10l-12 7.5L12 10 4 15l20 12.5L44 15z" />
      <path fill="#4285F4" d="M4 15v2l8 5.5V22.5L4 17z" />
      <path fill="#C5221F" d="M44 15l-8 7.5V22.5L44 17z" />
      <path fill="#EA4335" d="M12 10H6a3 3 0 0 0-2 .8L24 17.5 44 10.8A3 3 0 0 0 42 10H36L24 17.5z" />
    </svg>
  );
}

export function GoogleDriveLogo() {
  return (
    <svg viewBox="0 0 87.3 78" className="w-7 h-7">
      <path fill="#0066DA" d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" />
      <path fill="#00AC47" d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5A9 9 0 0 0 0 53h27.5z" />
      <path fill="#EA4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" />
      <path fill="#00832D" d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" />
      <path fill="#2684FC" d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.4 4.5-1.2z" />
      <path fill="#FFBA00" d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" />
    </svg>
  );
}

export function JiraLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7">
      <defs>
        <linearGradient id="jira-grad-a" x1="100%" y1="0%" x2="18%" y2="73%">
          <stop offset="0%" stopColor="#0052CC" />
          <stop offset="100%" stopColor="#2684FF" />
        </linearGradient>
        <linearGradient id="jira-grad-b" x1="0%" y1="100%" x2="82%" y2="27%">
          <stop offset="0%" stopColor="#0052CC" />
          <stop offset="100%" stopColor="#2684FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#jira-grad-a)"
        d="M16 1.6L8.3 9.3l4.7 4.7 3-3 7.7 7.7 4.7-4.7z"
      />
      <path
        fill="url(#jira-grad-b)"
        d="M16 30.4l7.7-7.7-4.7-4.7-3 3-7.7-7.7-4.7 4.7z"
      />
    </svg>
  );
}

export function SlackLogo() {
  return (
    <svg viewBox="0 0 124 124" className="w-7 h-7">
      <path fill="#E01E5A" d="M26.3 78.2a13.1 13.1 0 0 1-13.1 13.1A13.1 13.1 0 0 1 0 78.2a13.1 13.1 0 0 1 13.1-13.1h13.2v13.1zm6.6 0a13.1 13.1 0 0 1 13.1-13.1 13.1 13.1 0 0 1 13.2 13.1v32.8A13.1 13.1 0 0 1 46 124.1a13.1 13.1 0 0 1-13.1-13.1V78.2z" />
      <path fill="#36C5F0" d="M45.9 26.2a13.1 13.1 0 0 1-13.1-13.1A13.1 13.1 0 0 1 45.9 0a13.1 13.1 0 0 1 13.2 13.1v13.1H45.9zm0 6.7a13.1 13.1 0 0 1 13.2 13.1 13.1 13.1 0 0 1-13.2 13.2H13A13.1 13.1 0 0 1 0 46a13.1 13.1 0 0 1 13.1-13.1h32.8z" />
      <path fill="#2EB67D" d="M97.8 46a13.1 13.1 0 0 1 13.1-13.1A13.1 13.1 0 0 1 124 46a13.1 13.1 0 0 1-13.1 13.2H97.8V46zm-6.6 0a13.1 13.1 0 0 1-13.2 13.2A13.1 13.1 0 0 1 64.9 46V13.1A13.1 13.1 0 0 1 78 0a13.1 13.1 0 0 1 13.2 13.1V46z" />
      <path fill="#ECB22E" d="M78 97.8a13.1 13.1 0 0 1 13.2 13.1A13.1 13.1 0 0 1 78 124.1a13.1 13.1 0 0 1-13.1-13.2V97.8H78zm0-6.6a13.1 13.1 0 0 1-13.1-13.2A13.1 13.1 0 0 1 78 64.9h32.9A13.1 13.1 0 0 1 124 78a13.1 13.1 0 0 1-13.1 13.2H78z" />
    </svg>
  );
}

export function GoogleCalLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
      <rect x="6" y="6" width="36" height="36" rx="4" fill="#fff" stroke="#E0E0E0" strokeWidth="1" />
      <rect x="6" y="6" width="36" height="10" rx="4" fill="#1A73E8" />
      <rect x="6" y="12" width="36" height="4" fill="#1A73E8" />
      <text x="24" y="34" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1A73E8">31</text>
      <circle cx="16" cy="9" r="2" fill="white" />
      <circle cx="32" cy="9" r="2" fill="white" />
    </svg>
  );
}

export function TeamsLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-7 h-7">
      <path fill="#5059C9" d="M31 18h8a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-8V18z" />
      <circle fill="#5059C9" cx="35" cy="13" r="4" />
      <path fill="#7B83EB" d="M26 18H10a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V21a3 3 0 0 0-3-3z" />
      <circle fill="#7B83EB" cx="18" cy="12" r="5" />
      <path fill="white" fillOpacity="0.5" d="M18 18h8v16h-8z" />
      <path fill="white" d="M14 24h8v2h-8zM14 28h6v2h-6z" />
    </svg>
  );
}

export const PLUGIN_LABELS: Record<IntegrationProvider, string> = {
  gmail: "Gmail",
  google_drive: "Drive",
  jira: "Jira",
  slack: "Slack",
  google_cal: "Calendar",
  teams: "Teams",
};
