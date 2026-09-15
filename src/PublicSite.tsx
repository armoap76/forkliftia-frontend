import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import cimaLogo from "./assets/cima-e3-logo.jpg";
import "./PublicSite.css";

export function CimaBrand() {
  return <span className="cima-brand">CIMA <span>e³</span></span>;
}

export function PublicSite({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  return (
    <div className="cima-site">
      <a className="cima-skip-link" href="#contenido">Ir al contenido</a>
      <header className="cima-header">
        <div className="cima-container cima-header-inner">
          <Link className="cima-brand-link" to="/" aria-label="CIMA e³ — Inicio">
            <img className="cima-header-logo" src={cimaLogo} alt="CIMA E³" />
          </Link>
          <nav className="cima-nav" aria-label="Navegación principal">
            <a href="/#servicios">Servicios</a>
            <Link to="/forkliftia">ForkliftIA <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="cima-footer">
        <div className="cima-container cima-footer-inner">
          <div>
            <CimaBrand />
            <p>Electrónica · Eléctrica · Electromecánica</p>
          </div>
          <p>ForkliftIA es un proyecto técnico de CIMA e³.</p>
        </div>
      </footer>
    </div>
  );
}
