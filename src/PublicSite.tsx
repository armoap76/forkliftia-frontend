import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
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
            <CimaBrand />
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
