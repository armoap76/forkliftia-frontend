import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase";
import { postDiagnosis } from "./api/client";
import type { DiagnosisResponse } from "./api/client";
import { ui } from "./uiText";

type Lang = "en" | "es";

export function DiagnosisForm() {
  // ---- idioma (UI + envío al backend) ----
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return saved === "en" || saved === "es" ? saved : "es";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const tr = ui[lang];

  // ---- form fields ----
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [series, setSeries] = useState("");
  const [controller, setController] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [symptom, setSymptom] = useState("");
  const [checksDone, setChecksDone] = useState("");

  // ---- results/errors ----
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loadingDiag, setLoadingDiag] = useState(false);

  const originLabelByType: Record<string, string> = {
    ai: "IA",
    manuals: "Biblioteca técnica",
    cases: "Base de casos",
    mixed: "IA + biblioteca/casos",
  };

  // ---- handlers ----
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoadingDiag(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert(tr?.notLoggedIn || "Not logged in");
        return;
      }

      const data = await postDiagnosis({
        brand,
        model,
        series,
        controller: controller.trim() || null,
        error_code: errorCode,
        symptom,
        checks_done: checksDone,
        language: lang,
      });

      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? "Error desconocido");
    } finally {
      setLoadingDiag(false);
    }
  }

  function handleNewDiagnosis() {
    setBrand("");
    setModel("");
    setSeries("");
    setController("");
    setErrorCode("");
    setSymptom("");
    setChecksDone("");
    setError(null);
    setResult(null);
  }

  // ---- styles ----
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

  const helperText: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  };

  if (result) {
    const originLabel = result.origin
      ? originLabelByType[result.origin] ?? result.origin
      : null;

    return (
      <div
        style={{
          borderRadius: 16,
          border: "1px solid #dbeafe",
          backgroundColor: "#eff6ff",
          padding: 16,
        }}
      >
        <h2 style={{ margin: 0, color: "#0b2545" }}>Diagnóstico generado correctamente</h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#1f2937", fontWeight: 700 }}>
          Caso #{result.case_id} creado y publicado en el foro técnico.
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#374151" }}>
          El caso ya fue publicado en el foro técnico.
        </p>

        {originLabel ? (
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#374151" }}>
            <strong>{tr?.source || "Origen"}:</strong> {originLabel}
          </p>
        ) : null}

        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #bfdbfe",
            background: "#ffffff",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: 13,
            lineHeight: 1.4,
            color: "#111827",
          }}
        >
          {result.diagnosis_text}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Link
            to={`/forum/cases/${result.case_id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              color: "#ffffff",
              backgroundColor: "#0b2545",
            }}
          >
            Ver caso en el foro
          </Link>

          <button
            type="button"
            onClick={handleNewDiagnosis}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#0b2545",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Nuevo diagnóstico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Selector de idioma */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <label style={{ fontSize: 13, color: "#111827", fontWeight: 800 }}>
          {tr?.language || "Idioma"}
        </label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
            fontWeight: 800,
          }}
        >
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>{tr?.brand || "Marca"}</label>
            <input
              style={inputStyle}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder={tr?.brandPlaceholder || "linde, bt, jungheinrich..."}
            />
          </div>

          <div>
            <label style={labelStyle}>{tr?.model || "Modelo"}</label>
            <input
              style={inputStyle}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={tr?.modelPlaceholder || "e20, ose250..."}
            />
          </div>

          <div>
            <label style={labelStyle}>
              {tr?.seriesOptional || "Serie (opcional)"}
            </label>
            <input
              style={inputStyle}
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder={tr?.seriesPlaceholder || "335..."}
            />
          </div>

          <div>
            <label style={labelStyle}>Controlador electrónico (opcional)</label>
            <input
              style={inputStyle}
              value={controller}
              onChange={(e) => setController(e.target.value)}
              placeholder="Ej: ZAPI, Curtis, Sevcon"
            />
          </div>

          <div>
            <label style={labelStyle}>
              {tr?.errorCodeOptional || "Código de error (opcional)"}
            </label>
            <input
              style={inputStyle}
              value={errorCode}
              onChange={(e) => setErrorCode(e.target.value)}
              placeholder={tr?.errorCodePlaceholder || "e225..."}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>{tr?.symptom || "Síntoma"}</label>
            <textarea
              style={textareaStyle}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder={tr?.symptomPlaceholder || "No levanta carga, se corta, etc."}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>{tr?.checksDone || "Chequeos realizados"}</label>
            <textarea
              style={textareaStyle}
              value={checksDone}
              onChange={(e) => setChecksDone(e.target.value)}
              placeholder={
                tr?.checksPlaceholder || "Batería OK, fusibles OK, cables revisados..."
              }
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button type="submit" style={primaryBtn} disabled={loadingDiag}>
            {loadingDiag ? tr?.generating || "Generando..." : tr?.diagnosis || "Obtener diagnóstico"}
          </button>

          <Link
            to="/forum"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              color: "#0b2545",
              backgroundColor: "#ffffff",
            }}
          >
            {tr?.forum || "Foro técnico"}
          </Link>
        </div>

        <div style={{ ...helperText, marginTop: 10 }}>
          Tip: en pantallas chicas se apila en 1 columna automáticamente.
        </div>

        <style>{`
          @media (max-width: 720px) {
            form > div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </form>

      {/* ERROR DIAG */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: 12,
            padding: "10px 12px",
            marginTop: 14,
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

    </div>
  );
}
