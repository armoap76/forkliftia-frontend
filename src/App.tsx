import { useState } from "react";
import "./App.css";


type DiagnosisResponse = {
  case_id: number;
  diagnosis: string;
  source?: "cases" | "ai";
};

type Case = {
  id: number;
  brand: string;
  model: string;
  series?: string | null;
  error_code?: string | null;
  symptom: string;
  checks_done?: string | null;
  diagnosis: string;
  status?: string; 

};

const API_BASE_URL = "https://flk-backend.onrender.com"; // URL del backend directamente

function App() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [series, setSeries] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [symptom, setSymptom] = useState("");
  const [checksDone, setChecksDone] = useState("");

  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cases, setCases] = useState<Case[]>([]);
  const [casesError, setCasesError] = useState<string | null>(null);

  // Enviar datos a /diagnosis
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const resp = await fetch(`${API_BASE_URL}/diagnosis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand,
          model,
          series,
          error_code: errorCode,
          symptom,
          checks_done: checksDone,
        }),
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data: DiagnosisResponse = await resp.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    }
  }

  // Traer lista de casos desde /cases
  async function handleLoadCases() {
    setCasesError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/cases`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: Case[] = await res.json();
      setCases(data);
    } catch (err: any) {
      console.error(err);
      setCasesError("No se pudieron cargar los casos guardados.");
    }
  }

  
return (
  <div className="app-root">
    <div className="app-card">
      <h1 className="app-title">ForkliftIA</h1>
      <p className="app-subtitle">
        Diagnóstico inicial para autoelevadores (React + Vite)
      </p>

      <form onSubmit={handleSubmit} className="app-form">
        <div>
          <div className="app-label">Marca</div>
          <input
            className="app-input"
            placeholder="Linde, Clark, BT..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>

        <div>
          <div className="app-label">Modelo</div>
          <input
            className="app-input"
            placeholder="E20, TM15..."
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>

        <div>
          <div className="app-label">Serie (opcional)</div>
          <input
            className="app-input"
            placeholder="335, 336, 1275..."
            value={series}
            onChange={(e) => setSeries(e.target.value)}
          />
        </div>

        <div>
          <div className="app-label">Código de error (opcional)</div>
          <input
            className="app-input"
            placeholder="E225, 07, A1-34..."
            value={errorCode}
            onChange={(e) => setErrorCode(e.target.value)}
          />
        </div>

        <div>
          <div className="app-label">Síntoma</div>
          <textarea
            className="app-textarea"
            placeholder="No levanta carga, se corta al mover, etc."
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
          />
        </div>

        <div>
          <div className="app-label">Checks realizados</div>
          <textarea
            className="app-textarea"
            placeholder="Batería OK, motor OK, cables revisados..."
            value={checksDone}
            onChange={(e) => setChecksDone(e.target.value)}
          />
        </div>

        <button type="submit" className="app-button">
          Obtener diagnóstico
        </button>
      </form>

      {/* Errores */}
      {error && <p className="app-error">⚠️ Error: {error}</p>}

      {/* Diagnóstico */}
      {result && (
        <section className="app-section">
          <h2>Diagnóstico generado</h2>
          <p>
            <strong>Case ID:</strong> {result.case_id}
          </p>

          <pre className="app-pre">{result.diagnosis}</pre>

          {result.source === "cases" && (
            <p className="app-origin">
              <strong>Origen:</strong> ⚙️ Base de casos guardados
            </p>
          )}
          {result.source === "ai" && (
            <p className="app-origin">
              <strong>Origen:</strong> 🤖 Modelo de IA
            </p>
          )}
        </section>
      )}

      {/* Errores al cargar casos */}
      {casesError && <p className="app-error">⚠️ {casesError}</p>}

      {/* Lista de casos (si ya tenés handleLoadCases y setCases) */}
      {cases.length > 0 && (
        <section className="app-section">
          <h2>Casos guardados</h2>
          <div className="app-cases-list">
            {cases.map((c) => (
              <div key={c.id} className="app-case-item">
                <strong>ID {c.id}</strong> · {c.brand} {c.model} ·{" "}
                <span>{c.error_code || "Sin código"}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  </div>
);


}

export default App;
