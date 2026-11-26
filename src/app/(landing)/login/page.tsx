"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";
import AppLoadingScreen from "@/components/AppLoadingScreen";

export default function LoginPage() {
  const router = useRouter();
  const { authState, login, register, authError, setAuthError } = useAuth();

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
    />
  );
}
