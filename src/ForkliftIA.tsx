import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { AppFooter } from "./Footer";
import { PublicSite } from "./PublicSite";

export default function ForkliftIA() {
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
    <PublicSite>
      <title>ForkliftIA | Proyecto técnico de CIMA e³</title>
      <main id="contenido" className="cima-container cima-access">
        <Link className="cima-back" to="/">← Volver a CIMA e³</Link>
        <section className="cima-access-card" aria-labelledby="forkliftia-title">
          <p className="cima-eyebrow">Un proyecto de CIMA e³</p>
          <span className="cima-badge">En desarrollo</span>
          <h1 id="forkliftia-title">Forklift<span>IA</span></h1>
          <p className="cima-access-intro">Proyecto técnico en desarrollo para documentar fallas reales, códigos de error y diagnósticos asistidos por IA.</p>
          <p className="cima-access-description">Una plataforma técnica para profesionales de autoelevadores. Combina casos reales, códigos de error y manuales técnicos para ayudarte a diagnosticar fallas con mejor criterio.</p>
          <div className="cima-access-actions">
            <button className="cima-button cima-button-primary" type="button" onClick={handleStartDiagnosis} disabled={busy} aria-busy={busy}>
              {busy ? "Ingresando..." : "Iniciar diagnóstico"}
              <span aria-hidden="true">→</span>
            </button>
            <button className="cima-button cima-button-secondary" type="button" onClick={handleGoToForum}>Ver foro técnico <span aria-hidden="true">→</span></button>
          </div>
          <p className="cima-access-description">Los casos que no se resuelven pasan automáticamente al foro técnico, donde otros profesionales pueden aportar su experiencia. Cuantos más casos reales se documentan, más útil se vuelve la herramienta.</p>
        </section>
        <aside className="cima-notice" aria-labelledby="notice-title">
          <h2 id="notice-title">Aviso importante</h2>
          <p>ForkliftIA brinda orientación técnica basada en casos reales, documentación técnica resumida y asistencia de IA. La información publicada es orientativa, no garantiza una reparación y no reemplaza el criterio profesional ni la documentación oficial del fabricante. Toda intervención debe ser realizada únicamente por personal técnico capacitado y bajo condiciones seguras de trabajo.</p>
        </aside>
        <div className="cima-support">
          <p>Contacto y soporte técnico</p>
          <a href="mailto:forkliftia.soporte@gmail.com">forkliftia.soporte@gmail.com</a>
        </div>
        <AppFooter />
      </main>
    </PublicSite>
  );
}
