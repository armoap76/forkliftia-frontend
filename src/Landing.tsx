import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { AppFooter } from "./Footer";

export default function Landing() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleGoToForum = () => {
    navigate("/forum");
  };

  const handleStartDiagnosis = async () => {
    if (busy) return;
    setBusy(true);

    try {
      if (!auth.currentUser) {
        await signInWithPopup(auth, googleProvider);
      }
      navigate("/diagnosis");
    } catch (e: any) {
      console.error("Login error:", e);
      alert(e?.code || e?.message || "Error de inicio de sesión");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "32px 16px",
        boxSizing: "border-box",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: 520,
          backgroundColor: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
          padding: "32px 28px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <img
          src="/logo.png"
          alt="ForkliftIA"
          style={{
            width: 120,
            height: 120,
            margin: "0 auto 12px",
            display: "block",
            borderRadius: 16,
          }}
        />

        <h1
          style={{
            margin: 0,
            fontSize: 34,
            color: "#0b2545",
            fontWeight: 800,
          }}
        >
          ForkliftIA
        </h1>

        <p
          style={{
            marginTop: 8,
            marginBottom: 24,
            color: "#111827",
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          Diagnóstico técnico asistido para autoelevadores.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
            marginTop: 8,
          }}
        >
          <button
            onClick={handleStartDiagnosis}
            disabled={busy}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: 999,
              border: "none",
              cursor: busy ? "not-allowed" : "pointer",
              fontSize: 15,
              fontWeight: 700,
              backgroundColor: "#0b2545",
              color: "#ffffff",
              transition: "background-color 0.2s, transform 0.2s",
              opacity: busy ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (busy) return;
              e.currentTarget.style.backgroundColor = "#0d2e5a";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (busy) return;
              e.currentTarget.style.backgroundColor = "#0b2545";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {busy ? "Ingresando..." : "Iniciar diagnóstico"}
          </button>

          <button
            onClick={handleGoToForum}
            style={{
              width: "100%",
              padding: "11px 18px",
              borderRadius: 999,
              border: "1.5px solid #0b2545",
              backgroundColor: "transparent",
              color: "#0b2545",
              cursor: "pointer",
              fontSize: 14.5,
              fontWeight: 700,
              transition: "background-color 0.2s, color 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0b2545";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#0b2545";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Ver foro
          </button>
        </div>
      </main>

      <section
        style={{
          marginTop: 16,
          marginBottom: 8,
          textAlign: "center",
          color: "#6b7280",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <div>Contacto y soporte técnico</div>
        <a
          href="mailto:forkliftia.soporte@gmail.com"
          style={{
            color: "#6b7280",
            textDecoration: "underline",
            fontWeight: 600,
          }}
        >
          forkliftia.soporte@gmail.com
        </a>
      </section>

      <div style={{ marginTop: 16, width: "100%" }}>
        <AppFooter />
      </div>
    </div>
  );
}
