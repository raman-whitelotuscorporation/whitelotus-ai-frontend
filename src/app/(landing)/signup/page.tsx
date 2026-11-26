"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";
import AppLoadingScreen from "@/components/AppLoadingScreen";

export default function SignupPage() {
  const router = useRouter();
  const { authState, login, register, authError, setAuthError } = useAuth();
  const [inviteToken, setInviteToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("invite_token")?.trim();
    if (token) {
      setInviteToken(token);
      // Keep the one-time secret out of browser history and subsequent referrers.
      params.delete("invite_token");
      const query = params.toString();
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    }
  }, []);

  useEffect(() => {
    if (authState === "authenticated") router.replace("/app");
  }, [authState, router]);

  if (authState === "loading") return <AppLoadingScreen />;
  if (authState === "authenticated") return null;

  return (
    <LoginForm
      onLogin={login}
      onRegister={register}
      error={authError}
      onClearError={() => setAuthError(null)}
      defaultMode="register"
      inviteToken={inviteToken}
    />
  );
}
