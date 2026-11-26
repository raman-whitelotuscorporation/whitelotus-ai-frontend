"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { IntegrationProvider } from "@/types/chat";
import type { ConnectionStatus } from "@/types/chat";
import { getUserId } from "@/lib/api";
import { listenAppEvent } from "@/lib/events";
import { pushNotification } from "@/hooks/useNotifications";
import type { AuthState } from "@/hooks/useAuth";
import type { User } from "@/types/chat";

// Exhaustive set of valid providers — any other value in the callback param is rejected.
const VALID_PROVIDERS = new Set<IntegrationProvider>([
  "jira", "slack", "gmail",
  "google_drive", "google_cal", "teams",
]);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const _PROVIDER_ALIAS: Record<string, string> = { email: "gmail" };

function pluginsKey(userId: string | null): string {
  return userId ? `wl_connected_plugins_${userId}` : "wl_connected_plugins_anon";
}

function statusKey(userId: string | null): string {
  return userId ? `wl_plugin_statuses_${userId}` : "wl_plugin_statuses_anon";
}

function load(userId: string | null): Set<IntegrationProvider> {
  try {
    const raw = localStorage.getItem(pluginsKey(userId));
    return new Set(JSON.parse(raw ?? "[]") as IntegrationProvider[]);
  } catch {
    return new Set();
  }
}

function loadStatuses(userId: string | null): Map<IntegrationProvider, ConnectionStatus> {
  try {
    const raw = localStorage.getItem(statusKey(userId));
    return new Map(JSON.parse(raw ?? "[]") as [IntegrationProvider, ConnectionStatus][]);
  } catch {
    return new Map();
  }
}

function save(s: Set<IntegrationProvider>, userId: string | null) {
  localStorage.setItem(pluginsKey(userId), JSON.stringify([...s]));
}

function saveStatuses(m: Map<IntegrationProvider, ConnectionStatus>, userId: string | null) {
  localStorage.setItem(statusKey(userId), JSON.stringify([...m.entries()]));
}

async function fetchProviderStatus(): Promise<{
  connected: Set<IntegrationProvider>;
  statuses: Map<IntegrationProvider, ConnectionStatus>;
}> {
  const { authFetch } = await import("@/lib/api");
  const res = await authFetch(`${BASE_URL}/api/integrations/status`);
  if (!res.ok) throw new Error(`Failed to fetch integration status (HTTP ${res.status})`);
  const data: Record<string, unknown> = await res.json();

  const statusMap = data["status"] as Record<string, ConnectionStatus> | undefined;
  const statuses = new Map<IntegrationProvider, ConnectionStatus>();

  // Populate statuses from the nested "status" object (keyed by backend provider name)
  if (statusMap && typeof statusMap === "object") {
    for (const [k, v] of Object.entries(statusMap)) {
      const provider = (_PROVIDER_ALIAS[k] ?? k) as IntegrationProvider;
      if (VALID_PROVIDERS.has(provider)) statuses.set(provider, v);
    }
  }

  // Also check top-level boolean flags as a fallback for providers not in statusMap
  for (const [k, v] of Object.entries(data)) {
    if (k === "status") continue;
    if (v !== true) continue;
    const provider = (_PROVIDER_ALIAS[k] ?? k) as IntegrationProvider;
    if (VALID_PROVIDERS.has(provider) && !statuses.has(provider)) {
      statuses.set(provider, "connected");
    }
  }

  // Derive connected set from statuses — single source of truth
  const connected = new Set<IntegrationProvider>();
  for (const [provider, status] of statuses) {
    if (status === "connected") connected.add(provider);
  }

  return { connected, statuses };
}

export function useConnectedPlugins(authState: AuthState, user?: User | null) {
  const [connected, setConnected] = useState<Set<IntegrationProvider>>(new Set());
  const [pluginStatuses, setPluginStatuses] = useState<Map<IntegrationProvider, ConnectionStatus>>(new Map());
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const userId = user?.user_id ?? getUserId();
  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  // Load from localStorage on mount + handle OAuth callback query param
  useEffect(() => {
    const savedStatuses = loadStatuses(userId);
    // Derive connected from statuses — single source of truth, same as backend sync
    const derivedConnected = new Set<IntegrationProvider>(
      [...savedStatuses.entries()]
        .filter(([, s]) => s === "connected")
        .map(([p]) => p)
    );
    // Fall back to the legacy connected-plugins key if statuses are empty
    const initialConnected = derivedConnected.size > 0 ? derivedConnected : load(userId);
    setConnected(initialConnected);
    setPluginStatuses(savedStatuses);
    const params = new URLSearchParams(window.location.search);
    if (params.get("plugin_workspace_required") === "jira" && pathname !== "/plugins") {
      router.replace("/plugins?plugin_workspace_required=jira");
      return;
    }
    const rawPluginId = params.get("plugin_connected");
    const pluginId = rawPluginId && VALID_PROVIDERS.has(rawPluginId as IntegrationProvider)
      ? rawPluginId as IntegrationProvider
      : null;
    const pluginError = params.get("plugin_error");
    if (pluginId) {
      setConnected((prev) => {
        const next = new Set([...prev, pluginId]);
        save(next, userId);
        return next;
      });
      setPluginStatuses((prev) => {
        const next = new Map(prev);
        next.set(pluginId, "connected");
        saveStatuses(next, userId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["integrationStatus", userId] });
      setTimeout(() => router.replace(pathname), 0);
    } else if (pluginError) {
      const reason = params.get("reason") ?? "unknown error";
      pushNotification("error", `Failed to connect ${pluginError}`, reason.replace(/_/g, " "));
      router.replace(pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, pathname, router]);

  // Sync from backend after auth — useQuery replaces syncedRef + manual effect
  const { data: backendStatus } = useQuery({
    queryKey: ["integrationStatus", userId],
    queryFn: fetchProviderStatus,
    enabled: authState === "authenticated" && !!userId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!backendStatus) return;
    setConnected(backendStatus.connected);
    setPluginStatuses(backendStatus.statuses);
    save(backendStatus.connected, userIdRef.current);
    saveStatuses(backendStatus.statuses, userIdRef.current);
  }, [backendStatus]);

  // Listen for uninstall events
  useEffect(() => {
    return listenAppEvent("plugin:uninstall", (id) => {
      setConnected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        save(next, userId);
        return next;
      });
      setPluginStatuses((prev) => {
        const next = new Map(prev);
        next.set(id, "disconnected");
        saveStatuses(next, userId);
        return next;
      });
    });
  }, [userId]);

  const add = useCallback((id: IntegrationProvider) => {
    setConnected((prev) => {
      const next = new Set([...prev, id]);
      save(next, userId);
      return next;
    });
    setPluginStatuses((prev) => {
      const next = new Map(prev);
      next.set(id, "connected");
      saveStatuses(next, userId);
      return next;
    });
  }, [userId]);

  return { connected, pluginStatuses, add };
}
