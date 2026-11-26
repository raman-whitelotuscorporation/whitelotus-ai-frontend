// Re-export from the singleton context — all consumers share one auth state.
export { useAuth, AuthProvider } from "@/context/AuthContext";
export type { AuthState } from "@/context/AuthContext";
