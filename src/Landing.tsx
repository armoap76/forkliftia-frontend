import { Link } from "react-router-dom";
import { PublicSite } from "./PublicSite";
import { whatsappUrl } from "./contact";

const services = [
  {
    "title": "Diagnóstico electrónico",
    "description": "Fallas en controladores, sensores, aceleradores, frenos eléctricos y sistemas de tracción."
  },
  {
    "title": "Reparación eléctrica",
    "description": "Revisión de cableados, falsos contactos, alimentación, contactores, fusibles y conexiones."
  },
  {
    "title": "Mantenimiento preventivo",
    "description": "Control general del sistema eléctrico/electrónico para reducir paradas inesperadas."
  },
  {
    "title": "Placas, controladores y sensores",
    "description": "Asistencia sobre módulos electrónicos, señales de entrada/salida y componentes críticos."
  },
  {
    "title": "Soporte para talleres y flotas",
    "description": "Servicio técnico tercerizado para diagnósticos complejos o refuerzo operativo."
  }
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
          <div className="cima-services-grid">
            <div className="cima-services-content">
              <div className="cima-section-heading">
                <p className="cima-eyebrow">Servicios</p>
                <h2 id="services-title">Soluciones técnicas para equipos en movimiento</h2>
                <p className="cima-services-description">Diagnóstico, reparación y mantenimiento de sistemas electrónicos, eléctricos y electromecánicos en autoelevadores, apiladores y equipos de movimiento de materiales.</p>
              </div>
              <ul className="cima-service-list">
                {services.map((service, index) => (
                  <li key={service.title}>
                    <span className="cima-service-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <figure className="cima-workshop">
              <div className="cima-workshop-image">
                <img
                  src="/cima-technician-workshop.png"
                  alt="Técnico de CIMA e³ revisando una placa electrónica con un multímetro en el taller."
                  width="941"
                  height="1672"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>Servicio técnico especializado para talleres y flotas.</figcaption>
            </figure>
          </div>
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
