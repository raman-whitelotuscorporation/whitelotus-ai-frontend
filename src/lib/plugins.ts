import type { ReactNode } from "react";
import { createElement } from "react";
import type { IntegrationProvider } from "@/types/chat";
import {
  GmailLogo,
  GoogleDriveLogo,
  JiraLogo,
  SlackLogo,
  GoogleCalLogo,
  TeamsLogo,
} from "@/lib/pluginIcons";

export interface Plugin {
  id: IntegrationProvider;
  name: string;
  description: string;
  logo: ReactNode;
  category: "Popular" | "Productivity" | "Communication" | "Developer";
  authLabel?: string;
  loginUrl?: string;
  envVars?: string[];
  live: boolean;
}

export const PLUGINS: Plugin[] = [
  // Popular
  {
    id: "gmail",
    name: "Gmail",
    description: "Read, search, send and manage Gmail",
    logo: createElement(GmailLogo),
    category: "Popular",
    authLabel: "Sign in with Google",
    loginUrl: "__gmail_oauth__",
    envVars: ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_SENDER_EMAIL"],
    live: true,
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Drive, Docs, Sheets or Slides",
    logo: createElement(GoogleDriveLogo),
    category: "Popular",
    authLabel: "Sign in with Google",
    loginUrl: "__google_drive_oauth__",
    live: true,
  },
  // Productivity
  {
    id: "google_cal",
    name: "Google Calendar",
    description: "Manage Google Calendar events",
    logo: createElement(GoogleCalLogo),
    category: "Productivity",
    authLabel: "Sign in with Google",
    loginUrl: "__google_cal_oauth__",
    live: true,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Track issues, sprints, and boards",
    logo: createElement(JiraLogo),
    category: "Productivity",
    authLabel: "Sign in with Jira",
    loginUrl: "__jira_oauth__",
    envVars: [
      "JIRA_BASE_URL",
      "JIRA_EMAIL",
      "JIRA_API_TOKEN",
      "JIRA_DEFAULT_PROJECT",
    ],
    live: true,
  },
  // Communication
  {
    id: "slack",
    name: "Slack",
    description: "Read and manage Slack channels",
    logo: createElement(SlackLogo),
    category: "Communication",
    authLabel: "Sign in with Slack",
    loginUrl: "__slack_oauth__",
    envVars: ["SLACK_BOT_TOKEN", "SLACK_DEFAULT_CHANNEL"],
    live: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Summarize Teams and follow up",
    logo: createElement(TeamsLogo),
    category: "Communication",
    authLabel: "Sign in with Microsoft",
    loginUrl: "__teams_oauth__",
    live: true,
  },
];
