import { useNavigate } from "react-router-dom";
import { DiagnosisForm } from "./DiagnosisForm";

export default function Diagnosis() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        boxSizing: "border-box",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          maxHeight: "92vh",
          overflow: "auto",
          backgroundColor: "#ffffff",
          borderRadius: 24,
          padding: "20px 20px 24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          color: "#111827",
          boxSizing: "border-box",
        }}
      >
        {/* Botón volver */}
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: 16,
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#374151",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          ← Back to landing
        </button>

        {/* Header igual al landing */}
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="/logo.png"
            alt="ForkliftIA Logo"
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 12px",
              display: "block",
            }}
          />
          <h1 style={{ margin: 0, fontSize: 26, color: "#0b2545" }}>
            ForkliftIA
          </h1>
          <p style={{ margin: "4px 0", color: "#f97316", fontWeight: 600 }}>
            Technical intelligence for forklift technicians.
          </p>
          <p style={{ marginTop: 8, color: "#021c3b", fontSize: 14 }}>
            AI-assisted troubleshooting based on real field cases.
          </p>
        </header>

        <DiagnosisForm />
      </div>
    </div>
  );
}
