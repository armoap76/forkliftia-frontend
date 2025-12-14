import { Navigate } from "react-router-dom";
import { useAuthUser } from "./useAuthUser";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/" replace />;

  return <>{children}</>;
}


