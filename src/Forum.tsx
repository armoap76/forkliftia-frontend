import { useEffect, useMemo, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import { ui } from "./uiText";
import { fetchCases } from "./api/client";
import type { Case } from "./api/client";

type Lang = "en" | "es";
type Tab = "open" | "resolved";

export default function Forum() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("open");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selected, setSelected] = useState<Case | null>(null);

  const [lang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return saved === "en" || saved === "es" ? saved : "es";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const tr = ui[lang];
  const user = auth.currentUser;

  const title = useMemo(() => {
    return tab === "open" ? tr.openCases : tr.resolvedCases;
  }, [tab, tr]);

  async function ensureLogin() {
    if (auth.currentUser) return;
    await signInWithPopup(auth, googleProvider);
  }

  async function loadCases(nextTab?: Tab) {
    setError(null);
    setBusy(true);

    try {
      await ensureLogin();
      const u = auth.currentUser;
      if (!u) throw new Error(tr.notLoggedIn);

      const status = nextTab ?? tab;

      const data = await fetchCases({ status, limit: 200 });
      setCases(data);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  function getCreatorName(c: Case) {
    const name = (c.creator_public_name ?? c.public_name)?.trim();
    return name && name.length > 0 ? name : "Anónimo";
  }

  useEffect(() => {
    loadCases("open");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gate (login requerido)
  if (!user) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: 12,
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 800,
            color: "#0b2545",
          }}
        >
          ⬅ {lang === "es" ? "Inicio" : "Home"}
        </button>

        <h1 style={{ margin: "6px 0 12px" }}>{tr.forum}</h1>
        <p style={{ color: "#374151", marginTop: 0 }}>{tr.loginRequired}</p>

        <button
          onClick={async () => {
            setBusy(true);
            try {
              await ensureLogin();
              await loadCases("open");
            } catch (e: any) {
              setError(e?.message ?? "Login error");
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          style={{
            marginTop: 10,
            padding: "10px 16px",
            borderRadius: 999,
            border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 800,
            backgroundColor: "#0b2545",
            color: "#ffffff",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? tr.signingIn : tr.loginWithGoogle}
        </button>

        {error ? (
          <div style={{ marginTop: 12, color: "#b91c1c", fontWeight: 700 }}>
            {error}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
      {/* HOME + TITLE */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: 12,
          padding: "6px 12px",
          borderRadius: 999,
          border: "1px solid #d1d5db",
          background: "#ffffff",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 800,
          color: "#0b2545",
        }}
      >
        ⬅ {lang === "es" ? "Inicio" : "Home"}
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "baseline",
        }}
      >
        <div>
          <h1 style={{ margin: "6px 0 6px" }}>{tr.forum}</h1>
          <div style={{ color: "#6b7280", fontSize: 12 }}>{tr.forumReadOnly}</div>
        </div>

        {/* Tabs + refresh */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => {
              setTab("open");
              setSelected(null);
              loadCases("open");
            }}
            disabled={busy}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: tab === "open" ? "#0b2545" : "#fff",
              color: tab === "open" ? "#fff" : "#111827",
              fontWeight: 800,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {tr.open}
          </button>

          <button
            onClick={() => {
              setTab("resolved");
              setSelected(null);
              loadCases("resolved");
            }}
            disabled={busy}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: tab === "resolved" ? "#0b2545" : "#fff",
              color: tab === "resolved" ? "#fff" : "#111827",
              fontWeight: 800,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {tr.resolved}
          </button>

          <button
            onClick={() => loadCases()}
            disabled={busy}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 800,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? tr.refreshing : tr.refresh}
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        {/* LISTA */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            background: "#ffffff",
            padding: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <span style={{ color: "#6b7280", fontSize: 12 }}>{cases.length}</span>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {cases.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: 13 }}>{tr.noCases}</div>
            ) : (
              cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{
                    textAlign: "left",
                    border: selected?.id === c.id ? "2px solid #0b2545" : "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    background: selected?.id === c.id ? "#f3f4f6" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900 }}>
                      ID {c.id} · {c.brand} {c.model}
                      {c.series ? ` (${c.series})` : ""}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>{c.error_code || "—"}</div>
                  </div>

                  <div style={{ marginTop: 6, color: "#111827" }}>
                    {c.symptom?.slice(0, 120) || ""}
                    {c.symptom && c.symptom.length > 120 ? "…" : ""}
                  </div>

                  <div style={{ marginTop: 6, color: "#4b5563", fontSize: 12 }}>
                    Por: <strong>{getCreatorName(c)}</strong>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* DETALLE */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            background: "#ffffff",
            padding: 14,
          }}
        >
          <h2 style={{ margin: 0 }}>{tr.caseDetail}</h2>

          {!selected ? (
            <div style={{ marginTop: 10, color: "#6b7280" }}>{tr.selectCase}</div>
          ) : (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                ID {selected.id} · {selected.brand} {selected.model}
                {selected.series ? ` (${selected.series})` : ""}
              </div>

              <div style={{ color: "#4b5563", fontSize: 12 }}>
                Por: <strong>{getCreatorName(selected)}</strong>
              </div>

              <div style={{ color: "#6b7280", fontSize: 12 }}>
                {tr.status}: <strong>{selected.status || tab}</strong>
                {selected.error_code ? (
                  <>
                    {" "}· {tr.code}: <strong>{selected.error_code}</strong>
                  </>
                ) : null}
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.symptom}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{selected.symptom}</div>
              </div>

              {selected.checks_done ? (
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.checksDone}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{selected.checks_done}</div>
                </div>
              ) : null}

              <div>
                <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.diagnosis}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{selected.diagnosis}</div>
              </div>

              {selected.status === "resolved" && selected.resolution_note ? (
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
                  <div style={{ fontWeight: 900, color: "#065f46" }}>
                    ✅ {tr.resolution}
                  </div>
                  <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
                    {selected.resolution_note}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
