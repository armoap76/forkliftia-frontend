import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { updatePublicName } from "./api/client";

type PublicNameSetupProps = {
  onSaved: (name: string) => void;
  userDisplayName?: string | null;
};

function validateName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 32) {
    return "Name must be between 3 and 32 characters.";
  }
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return "Only letters, numbers, dash (-) and underscore (_) are allowed.";
  }
  return null;
}

export function PublicNameSetup({ onSaved, userDisplayName }: PublicNameSetupProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const greeting = useMemo(() => {
    if (!userDisplayName) return "";
    return ` (${userDisplayName})`;
  }, [userDisplayName]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const trimmed = name.trim();
    const validationError = validateName(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await updatePublicName(trimmed);
      onSaved(response.public_name);
    } catch (e: any) {
      setError(e?.message ?? "Error updating name");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          display: "grid",
          gap: 14,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 900, color: "#0b2545", fontSize: 20 }}>
            Choose a public name{greeting}
          </div>
          <div style={{ color: "#4b5563", fontSize: 13, marginTop: 6 }}>
            This name will appear in the forum and diagnosis cases. You can set it
            only once.
          </div>
        </div>

        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          <span style={{ fontWeight: 700, color: "#111827" }}>Public name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="tech_master"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 14,
            }}
            disabled={loading}
          />
          <span style={{ color: "#6b7280", fontSize: 12 }}>
            3-32 characters. Letters, numbers, dash (-) and underscore (_).
          </span>
        </label>

        {error ? (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: 10,
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 16px",
            borderRadius: 999,
            border: "none",
            background: "#0b2545",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Saving…" : "Save name"}
        </button>
      </form>
    </div>
  );
}
