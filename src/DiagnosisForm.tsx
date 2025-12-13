import { useState } from "react";

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
};

const API_BASE_URL = "https://flk-backend.onrender.com";

export function DiagnosisForm() {
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

  const [loadingDiag, setLoadingDiag] = useState(false);
  const [loadingCases, setLoadingCases] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoadingDiag(true);

    try {
      const res = await fetch(`${API_BASE_URL}/diagnosis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          model,
          series,
          error_code: errorCode,
          symptom,
          checks_done: checksDone,
        }),
      });

      if (!res.ok) throw new Error("Error consultando diagnóstico");

      const data = (await res.json()) as DiagnosisResponse;
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? "Error desconocido");
    } finally {
      setLoadingDiag(false);
    }
  }

  async function handleLoadCases() {
    setCasesError(null);
    setLoadingCases(true);

    try {
      const res = await fetch(`${API_BASE_URL}/cases`);
      if (!res.ok) throw new Error("Error al cargar casos");

      const data = (await res.json()) as Case[];
      setCases(data);
    } catch (err: any) {
      setCasesError(err?.message ?? "Error desconocido");
    } finally {
      setLoadingCases(false);
    }
  }

  // Estilos base (claros, consistentes con el landing)
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: "#111827",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    fontSize: 14,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 96,
    resize: "vertical",
  };

  const primaryBtn: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    backgroundColor: "#0b2545",
    color: "#ffffff",
  };

  const secondaryBtn: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    backgroundColor: "#ffffff",
    color: "#111827",
  };

  const helperText: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  };

  return (
    <div>
      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
        {/* Grid: 2 columnas en desktop, 1 en chico */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>Marca</label>
            <input
              style={inputStyle}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Linde, BT, Hyster..."
              autoComplete="off"
            />
          </div>

          <div>
            <label style={labelStyle}>Modelo</label>
            <input
              style={inputStyle}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="E20, R16, etc"
              autoComplete="off"
            />
          </div>

          <div>
            <label style={labelStyle}>Serie (opcional)</label>
            <input
              style={inputStyle}
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder="335, 336..."
              autoComplete="off"
            />
          </div>

          <div>
            <label style={labelStyle}>Código de error (opcional)</label>
            <input
              style={inputStyle}
              value={errorCode}
              onChange={(e) => setErrorCode(e.target.value)}
              placeholder="E225, 07..."
              autoComplete="off"
            />
            <div style={helperText}>Si no hay código, dejalo vacío.</div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Síntoma</label>
            <textarea
              style={textareaStyle}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="No levanta carga, se corta, etc"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Checks realizados</label>
            <textarea
              style={textareaStyle}
              value={checksDone}
              onChange={(e) => setChecksDone(e.target.value)}
              placeholder="Batería OK, fusibles OK, cables revisados..."
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button type="submit" style={primaryBtn} disabled={loadingDiag}>
            {loadingDiag ? "Generando..." : "Obtener diagnóstico"}
          </button>

          <button
            type="button"
            onClick={handleLoadCases}
            style={secondaryBtn}
            disabled={loadingCases}
          >
            {loadingCases ? "Cargando..." : "Cargar casos guardados"}
          </button>
        </div>

        {/* Tip: responsive simple */}
        <div style={{ ...helperText, marginTop: 10 }}>
          Tip: en pantallas chicas se apila en 1 columna automáticamente (si lo
          ves a 2 columnas muy apretado, te lo ajusto).
        </div>

        {/* Para que en móvil no quede 2 columnas demasiado apretado */}
        <style>{`
          @media (max-width: 720px) {
            form > div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </form>

      {/* ERRORES */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 14,
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* RESULTADO */}
      {result && (
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#0b2545" }}>Diagnóstico</h3>
            <span style={{ fontSize: 13, color: "#374151" }}>
              <strong>Case ID:</strong> {result.case_id}
            </span>
            <span style={{ fontSize: 13, color: "#374151" }}>
              <strong>Origen:</strong>{" "}
              {result.source === "cases" ? "⚙️ Base de casos" : "🤖 IA"}
            </span>
          </div>

          <pre
            style={{
              marginTop: 10,
              marginBottom: 0,
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#111827",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {result.diagnosis}
          </pre>
        </div>
      )}

      {/* ERRORES CASOS */}
      {casesError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 14,
            fontSize: 13,
          }}
        >
          ⚠️ {casesError}
        </div>
      )}

      {/* CASOS */}
      {cases.length > 0 && (
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            padding: 14,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 10, color: "#0b2545" }}>
            Casos guardados ({cases.length})
          </h3>

          <div style={{ display: "grid", gap: 8 }}>
            {cases.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  fontSize: 13,
                  color: "#111827",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  <strong>ID {c.id}</strong> · {c.brand} {c.model}
                </span>
                <span style={{ color: "#6b7280" }}>
                  {c.error_code || "Sin código"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
