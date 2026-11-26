"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PluginsContent } from "@/components/PluginsPage";
import { useConnectedPlugins } from "@/hooks/useConnectedPlugins";
import { useAuth } from "@/hooks/useAuth";
import JiraWorkspaceSelector from "@/components/JiraWorkspaceSelector";
import type { JiraWorkspace } from "@/lib/api";
import { pushNotification } from "@/hooks/useNotifications";

export default function PluginsRoute() {
  const router = useRouter();
  const { authState, user } = useAuth();
  const { connected, pluginStatuses, add: handleConnected } = useConnectedPlugins(authState, user);
  const [workspacePickerOpen, setWorkspacePickerOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setWorkspacePickerOpen(params.get("plugin_workspace_required") === "jira");
  }, []);

  function closeWorkspacePicker() {
    setWorkspacePickerOpen(false);
    router.replace("/plugins");
  }

  function completeWorkspaceSelection(workspace: JiraWorkspace) {
    handleConnected("jira");
    setWorkspacePickerOpen(false);
    pushNotification("success", "Jira connected", `Using ${workspace.name} for Jira queries.`);
    router.replace("/plugins");
  }

  return (
    <>
      {/* Page header */}
      <div className="px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-card)" }}>
        <div className="flex items-center justify-between max-w-4xl">
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Integrations</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Connect your tools — then ask the AI about them directly in chat
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(99,102,241,0.08)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.20)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {connected.size} connected
            </div>
          </div>
        </div>
      </div>

      {/* Plugins content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden max-w-4xl w-full mx-auto">
        <PluginsContent
          connected={connected}
          pluginStatuses={pluginStatuses}
          onConnected={handleConnected}
          onClose={() => router.push("/app")}
          onChangeJiraWorkspace={() => setWorkspacePickerOpen(true)}
        />
      </div>
      {workspacePickerOpen && (
        <JiraWorkspaceSelector onSelected={completeWorkspaceSelection} onClose={closeWorkspacePicker} />
      )}
    </>
  );
}
