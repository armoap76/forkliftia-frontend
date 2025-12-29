import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { fetchCases, postDiagnosis, resolveCase } from "./api/client";
import type { Case, DiagnosisResponse } from "./api/client";
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
  const [errorCode, setErrorCode] = useState("");
  const [symptom, setSymptom] = useState("");
  const [checksDone, setChecksDone] = useState("");

  // ---- results/errors ----
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cases, setCases] = useState<Case[]>([]);
  const [casesError, setCasesError] = useState<string | null>(null);

  const [loadingDiag, setLoadingDiag] = useState(false);
  const [loadingCases, setLoadingCases] = useState(false);

  // ---- resolve case ----
  const [resolutionById, setResolutionById] = useState<Record<number, string>>(
    {}
  );
  const [resolvingId, setResolvingId] = useState<number | null>(null);

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

  async function handleLoadCases() {
    setCasesError(null);
    setLoadingCases(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert(tr?.notLoggedIn || "Not logged in");
        return;
      }

      const data = await fetchCases({ limit: 200 });
      setCases(data);
    } catch (err: any) {
      setCasesError(err?.message ?? "Error desconocido");
    } finally {
      setLoadingCases(false);
    }
  }

  async function handleResolveCase(caseId: number) {
    setCasesError(null);
    setResolvingId(caseId);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert(tr?.notLoggedIn || "Not logged in");
        return;
      }

      const resolution_note = (resolutionById[caseId] || "").trim();
      if (!resolution_note) {
        alert(
          lang === "es"
            ? "Escribí la solución aplicada (aunque sea una línea)."
            : "Write the final fix applied (at least one line)."
        );
        return;
      }

      await resolveCase(caseId, resolution_note);

      // refrescar para ver status actualizado
      await handleLoadCases();

      // limpiar input de ese caso
      setResolutionById((prev) => ({ ...prev, [caseId]: "" }));
    } catch (err: any) {
      setCasesError(err?.message ?? "Error desconocido");
    } finally {
      setResolvingId(null);
    }
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

  const badge = (status: string): React.CSSProperties => ({
    fontSize: 12,
    padding: "3px 8px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: status === "resolved" ? "#ecfdf5" : "#fff7ed",
    color: "#111827",
    fontWeight: 800,
  });

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
          {tr?.language || (lang === "es" ? "Idioma" : "Language")}
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
            <label style={labelStyle}>Brand</label>
            <input
              style={inputStyle}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="linde, bt, jungheinrich..."
            />
          </div>

          <div>
            <label style={labelStyle}>Model</label>
            <input
              style={inputStyle}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e20, ose250..."
            />
          </div>

          <div>
            <label style={labelStyle}>Series (optional)</label>
            <input
              style={inputStyle}
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder="335..."
            />
          </div>

          <div>
            <label style={labelStyle}>Error code (optional)</label>
            <input
              style={inputStyle}
              value={errorCode}
              onChange={(e) => setErrorCode(e.target.value)}
              placeholder="e225..."
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>{tr?.symptom || "Síntoma"}</label>
            <textarea
              style={textareaStyle}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder={
                lang === "es"
                  ? "No levanta carga, se corta, etc."
                  : "Does not lift load, cuts out, etc."
              }
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>{tr?.checksDone || "Chequeos realizados"}</label>
            <textarea
              style={textareaStyle}
              value={checksDone}
              onChange={(e) => setChecksDone(e.target.value)}
              placeholder={
                lang === "es"
                  ? "Batería OK, fusibles OK, cables revisados..."
                  : "Battery OK, fuses OK, cables checked..."
              }
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button type="submit" style={primaryBtn} disabled={loadingDiag}>
            {loadingDiag
              ? lang === "es"
                ? "Generando..."
                : "Generating..."
              : tr?.diagnosis || (lang === "es" ? "Obtener diagnóstico" : "Get diagnosis")}
          </button>

          <button
            type="button"
            onClick={handleLoadCases}
            style={secondaryBtn}
            disabled={loadingCases}
          >
            {loadingCases
              ? lang === "es"
                ? "Cargando..."
                : "Loading..."
              : tr?.loadCases || (lang === "es" ? "Cargar casos guardados" : "Load saved cases")}
          </button>
        </div>

        <div style={{ ...helperText, marginTop: 10 }}>
          {lang === "es"
            ? "Tip: en pantallas chicas se apila en 1 columna automáticamente."
            : "Tip: on small screens it auto stacks into one column."}
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

      {/* RESULT */}
      {result && (
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            padding: 14,
            marginTop: 14,
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#0b2545" }}>
              {tr?.diagnosis || (lang === "es" ? "Diagnóstico" : "Diagnosis")}
            </h3>
            <span style={{ fontSize: 13, color: "#374151" }}>
              <strong>Case ID:</strong> {result.case_id}
            </span>
            <span style={{ fontSize: 13, color: "#374151" }}>
              <strong>{lang === "es" ? "Origen" : "Source"}:</strong>{" "}
              {result.source === "cases"
                ? lang === "es"
                  ? "⚙️ Base de casos"
                  : "⚙️ Case base"
                : "🤖 AI"}
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

      {/* ERROR CASES */}
      {casesError && (
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
          ⚠️ {casesError}
        </div>
      )}

      {/* CASES LIST */}
      {cases.length > 0 && (
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            padding: 14,
            marginTop: 14,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 10, color: "#0b2545" }}>
            {lang === "es" ? "Casos guardados" : "Saved cases"} ({cases.length})
          </h3>

          <div style={{ display: "grid", gap: 10 }}>
            {cases.map((c) => {
              const status = c.status || "open";
              const isResolved = status === "resolved";
              const isBusy = resolvingId === c.id;

              return (
                <div
                  key={c.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    fontSize: 13,
                    color: "#111827",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>
                      ID {c.id} · {c.brand} {c.model}{" "}
                      <span style={{ fontWeight: 700, color: "#6b7280" }}>
                        [{status}]
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>{c.error_code || "—"}</span>
                      <span style={badge(status)}>
                        {isResolved ? tr?.resolved || "Resolved" : tr?.open || "Open"}
                      </span>
                    </div>
                  </div>

                  {!isResolved ? (
                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <input
                        style={{ ...inputStyle, flex: "1 1 320px" }}
                        value={resolutionById[c.id] || ""}
                        onChange={(e) =>
                          setResolutionById((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          tr?.resolutionPlaceholder ||
                          (lang === "es"
                            ? "Solución aplicada (ej: cambio ficha solenoide, ajuste sensor, etc.)"
                            : "Final fix applied (e.g. replace solenoid connector, adjust sensor, etc.)")
                        }
                      />

                      <button
                        style={{
                          ...primaryBtn,
                          opacity: isBusy ? 0.75 : 1,
                          cursor: isBusy ? "not-allowed" : "pointer",
                        }}
                        disabled={isBusy}
                        onClick={() => handleResolveCase(c.id)}
                        type="button"
                      >
                        {isBusy
                          ? tr?.closing || (lang === "es" ? "Cerrando..." : "Closing...")
                          : tr?.closeCase || (lang === "es" ? "Cerrar caso" : "Close case")}
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, color: "#065f46", fontWeight: 800 }}>
                      ✅ {lang === "es" ? "Resuelto" : "Resolved"}
                      {c.resolution_note ? (
                        <div style={{ marginTop: 6, color: "#111827", fontWeight: 600 }}>
                          {c.resolution_note}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
