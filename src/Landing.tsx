import { Link } from "react-router-dom";
import { PublicSite } from "./PublicSite";
import { whatsappUrl } from "./contact";

const services = [
  "Diagnóstico de fallas eléctricas y electrónicas",
  "Autoelevadores eléctricos",
  "Apiladores",
  "Zorras eléctricas",
  "Reach trucks",
  "Controladores electrónicos",
  "Sensores, contactores, frenos y aceleradores",
  "Comunicación CAN",
  "Cableado y falsos contactos",
  "Soporte tercerizado para talleres",
];

export default function Landing() {
  return (
    <PublicSite>
      <main id="contenido">
        <section className="cima-hero" aria-labelledby="cima-title">
          <div className="cima-container cima-hero-grid">
            <div>
              <p className="cima-eyebrow"><span className="cima-status-dot" /> Servicio técnico especializado</p>
              <h1 id="cima-title">Diagnóstico electrónico, eléctrico y electromecánico para <span>autoelevadores eléctricos</span></h1>
              <p className="cima-lead">Servicio técnico especializado en fallas de tracción, elevación, controladores, sensores, contactores, comunicación CAN, cableado y falsos contactos.</p>
              <div className="cima-actions">
                {whatsappUrl ? (
                  <a className="cima-button cima-button-primary" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Consultar por WhatsApp <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <button className="cima-button cima-button-primary" type="button" disabled>
                    Consultar por WhatsApp
                  </button>
                )}
                <Link className="cima-button cima-button-secondary" to="/forkliftia">
                  Ingresar a ForkliftIA <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <aside className="cima-specialties" aria-label="Especialidades de CIMA e³">
              <p className="cima-eyebrow">Tres áreas. Un mismo enfoque.</p>
              <div className="cima-specialty">
                <span className="cima-specialty-number" aria-hidden="true">01</span>
                <div><h2>Electrónica</h2><p>Controladores, sensores y comunicación CAN.</p></div>
              </div>
              <div className="cima-specialty">
                <span className="cima-specialty-number" aria-hidden="true">02</span>
                <div><h2>Eléctrica</h2><p>Cableado, contactores y falsos contactos.</p></div>
              </div>
              <div className="cima-specialty">
                <span className="cima-specialty-number" aria-hidden="true">03</span>
                <div><h2>Electromecánica</h2><p>Tracción, elevación, frenos y aceleradores.</p></div>
              </div>
              <div className="cima-specialties-foot">CIMA <span>e³</span></div>
            </aside>
          </div>
        </section>

        <section className="cima-services cima-container" id="servicios" aria-labelledby="services-title">
          <div className="cima-section-heading">
            <div><p className="cima-eyebrow">Nuestra especialidad</p><h2 id="services-title">Servicios</h2></div>
            <p>Diagnóstico técnico para equipos eléctricos y soporte para talleres.</p>
          </div>
          <ul className="cima-service-list">
            {services.map((service, index) => (
              <li key={service}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{service}</li>
            ))}
          </ul>
        </section>

        <section className="cima-container cima-project-section" aria-labelledby="project-title">
          <div className="cima-project">
            <div>
              <p className="cima-eyebrow">Un proyecto de CIMA e³ <span className="cima-badge">En desarrollo</span></p>
              <h2 id="project-title">Forklift<span>IA</span></h2>
              <p>Proyecto técnico en desarrollo para documentar fallas reales, códigos de error y diagnósticos asistidos por IA.</p>
            </div>
            <Link className="cima-button cima-button-secondary" to="/forkliftia">
              Ingresar a ForkliftIA <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
    </PublicSite>
  );
}
