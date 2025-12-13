import { useNavigate } from "react-router-dom";
import "./App.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="app-landing">
      <header className="landing-header">
        <div className="landing-logo">ForkliftIA</div>
        <h1 className="landing-title">ForkliftIA</h1>
        <p className="landing-subtitle">
          Technical intelligence for forklift technicians.
        </p>
        <p className="landing-tagline">
          Fast solutions. Smart manuals. A technical assistant focused on real-world forklift failures.
        </p>
      </header>

      <section className="landing-cards">
        <div className="landing-card">
          <h2>AI Troubleshooting</h2>
          <p>
            Ask by brand, model, error code and symptom. ForkliftIA combines field
            cases and an internal technical library to suggest a diagnostic path.
          </p>
          <button
            className="button-primary"
            onClick={() => navigate("/diagnosis")}
          >
            Open
          </button>
        </div>

        <div className="landing-card">
          <h2>Spare Parts Catalog</h2>
          <p>
            Structured lists of parts by brand and model. Reference codes,
            descriptions and components overview. Coming soon.
          </p>
          <button className="button-secondary" disabled>
            Soon
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        Project in development. ForkliftIA does not distribute service manuals.
        Information is summarized and adapted from private technical sources and
        real field cases.
      </footer>
    </div>
  );
}

export default Landing;
