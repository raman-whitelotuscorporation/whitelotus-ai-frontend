"use client";
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { User } from "@/types/chat";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  saveTokens,
  clearTokens,
} from "@/lib/api";
import { pushNotification } from "@/hooks/useNotifications";
import { listenAppEvent } from "@/lib/events";
import { useSessionStore } from "@/store/sessionStore";

export type AuthState = "loading" | "unauthenticated" | "authenticated";

interface AuthContextValue {
  user: User | null;
  authState: AuthState;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string, organizationName?: string, inviteToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName?: string, avatarUrl?: string) => Promise<User>;
  changePassword: (current: string, next: string) => Promise<void>;
  setAuthError: (e: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [authError, setAuthError] = useState<string | null>(null);
  const initDone = useRef(false);

  // Single mount check — runs exactly once for the entire app.
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    getMe()
      .then((u) => { setUser(u); setAuthState("authenticated"); })
      .catch(() => { clearTokens(); setAuthState("unauthenticated"); });
  }, []);

  // Session-expired event — deduplicated with a ref.
  const expiredFiredRef = useRef(false);
  useEffect(() => {
    expiredFiredRef.current = false;
    return listenAppEvent("wl:auth:expired", () => {
      if (expiredFiredRef.current) return;
      expiredFiredRef.current = true;
      useSessionStore.getState().reset();
      setUser(null);
      setAuthState("unauthenticated");
      pushNotification("warning", "Session expired", "Please sign in again.");
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const tokens = await apiLogin(email, password);
      saveTokens(tokens);
      expiredFiredRef.current = false;
      const u = await getMe();
      setUser(u);
      setAuthState("authenticated");
      pushNotification("success", "Welcome back!", `Signed in as ${u.display_name}.`);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  }, []);

  const register = useCallback(async (
    email: string,
    displayName: string,
    password: string,
    organizationName?: string,
    inviteToken?: string,
  ) => {
    setAuthError(null);
    try {
      const tokens = await apiRegister(email, displayName, password, organizationName, inviteToken);
      saveTokens(tokens);
      expiredFiredRef.current = false;
      const u = await getMe();
      setUser(u);
      setAuthState("authenticated");
      pushNotification("success", "Account created", `Welcome to Whitelotus AI, ${u.display_name}!`);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    if (user?.user_id) localStorage.removeItem(`wl_connected_plugins_${user.user_id}`);
    useSessionStore.getState().reset();
    setUser(null);
    setAuthState("unauthenticated");
  }, [user]);

  const updateProfile = useCallback(async (displayName?: string, avatarUrl?: string) => {
    const updated = await apiUpdateProfile(displayName, avatarUrl);
    setUser(updated);
    return updated;
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    await apiChangePassword(current, next);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, authState, authError,
      login, register, logout, updateProfile, changePassword, setAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
