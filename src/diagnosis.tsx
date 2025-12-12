import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const API_BASE_URL = "https://flk-backend.onrender.com";

function Diagnosis() {
  const navigate = useNavigate();
  
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

  const handleLoadCases = async () => {
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
  };

  return (
    <div className="app-root">
      <div className="app-card">
        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: "none",
            color: "#22c55e",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginBottom: "16px",
            padding: "4px 0",
          }}
        >
          ← Volver al inicio
        </button>

        <h2 className="app-title">Diagnóstico de Autoelevadores</h2>

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

        {error && <p className="app-error">⚠️ Error: {error}</p>}

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

        <button
          type="button"
          onClick={handleLoadCases}
          className="app-button"
          style={{ marginTop: "1rem" }}
        >
          Cargar casos guardados
        </button>

        {casesError && <p className="app-error">⚠️ {casesError}</p>}

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

export default Diagnosis;
