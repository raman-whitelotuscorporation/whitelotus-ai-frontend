"use client";
import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import {
  GmailLogo,
  GoogleDriveLogo,
  GoogleCalLogo,
  JiraLogo,
  SlackLogo,
  TeamsLogo,
} from "@/lib/pluginIcons";

const INTEGRATIONS = [
  { name: "Gmail", icon: <GmailLogo />, desc: "Email search & assistance" },
  {
    name: "Google Drive",
    icon: <GoogleDriveLogo />,
    desc: "File discovery & review",
  },
  {
    name: "Google Calendar",
    icon: <GoogleCalLogo />,
    desc: "Schedule queries",
  },
  { name: "Jira", icon: <JiraLogo />, desc: "Issue & project queries" },
  { name: "Slack", icon: <SlackLogo />, desc: "Message & channel search" },
  { name: "Microsoft Teams", icon: <TeamsLogo />, desc: "Teams assistance" },
];

export default function IntegrationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef, { threshold: 0.08 });

  return (
    <section
      id="integrations"
      ref={sectionRef}
      className="py-24 px-5"
      style={{ background: "var(--surface-page)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 reveal-hidden reveal-d1">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent)" }}
          >
            Integrations
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Works with the tools you already use
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Authorize access once through a standard OAuth flow. The agent then
            queries your connected tools based on what your request requires —
            no manual switching between applications.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {INTEGRATIONS.map((integration, i) => (
            <div
              key={integration.name}
              className={`landing-integration-card flex flex-col items-center gap-3 p-5 reveal-hidden reveal-d${Math.min(i + 2, 6)}`}
              title={integration.name}
            >
              {integration.icon}
              <div className="text-center">
                <p
                  className="text-xs font-semibold leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {integration.name}
                </p>
                <p
                  className="text-[10px] mt-0.5 leading-tight"
                  style={{ color: "var(--text-muted)" }}
                >
                  {integration.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p
          className="text-center text-xs mt-10 reveal-hidden reveal-d6"
          style={{ color: "var(--text-muted)" }}
        >
          Integrations are authorized by each user through the Settings →
          Integrations flow. Access is limited to what you have authorized.
        </p>
      </div>
    </section>
  );
}
