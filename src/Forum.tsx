import { useEffect, useMemo, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import { ui, type Lang } from "./uiText";
import { fetchCases } from "./api/client";
import type { Case } from "./api/client";
import { ForumHeader, type ForumTab } from "./ForumHeader";
import { formatCaseTitle, getCreatorName } from "./forumUtils";

export default function Forum() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState<ForumTab>(() => {
    const param = new URLSearchParams(window.location.search).get("tab");
    return param === "resolved" ? "resolved" : "open";
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);

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

  async function loadCases(nextTab?: ForumTab) {
    setError(null);
    setBusy(true);

    try {
      await ensureLogin();
      const u = auth.currentUser;
      if (!u) throw new Error(tr.notLoggedIn);

      const status = nextTab ?? tab;
      const data = await fetchCases({ status, limit: 200 });
      setCases(data);
      setTab(status);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const paramTab = searchParams.get("tab") === "resolved" ? "resolved" : "open";
    if (paramTab !== tab) {
      setTab(paramTab);
      loadCases(paramTab);
    } else if (cases.length === 0) {
      loadCases(paramTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    <>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        <ForumHeader
          lang={lang}
          tab={tab}
          busy={busy}
          onHome={() => navigate("/")}
          onSelectTab={(nextTab) => {
            setSearchParams(nextTab === "open" ? {} : { tab: nextTab });
            loadCases(nextTab);
          }}
          onRefresh={() => loadCases()}
        />

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

        <div
          style={{
            marginTop: 14,
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
                  onClick={() =>
                    navigate(`/forum/cases/${c.id}${tab === "resolved" ? "?tab=resolved" : ""}`, {
                      state: { caseData: c, tab },
                    })
                  }
                  style={{
                    textAlign: "left",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{formatCaseTitle(c)}</div>

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
      </div>
    </>
  );
}
