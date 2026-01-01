import { Navigate } from "react-router-dom";
import { PublicNameSetup } from "./PublicNameSetup";
import { useAuthUser } from "./useAuthUser";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, publicName, profileLoading, setPublicName } = useAuthUser();

  if (loading || profileLoading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/" replace />;

  if (publicName === null) {
    return (
      <PublicNameSetup
        onSaved={setPublicName}
        userDisplayName={user.displayName}
      />
    );
  }

  return <>{children}</>;
}


