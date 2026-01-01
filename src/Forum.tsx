import { useEffect, useMemo, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import { ui } from "./uiText";
import { fetchCases, fetchCaseComments, postCaseComment, resolveCase, updateCase } from "./api/client";
import type { Case, CaseComment } from "./api/client";

type Lang = "en" | "es";
type Tab = "open" | "resolved";

export default function Forum() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("open");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selected, setSelected] = useState<Case | null>(null);
  const [comments, setComments] = useState<CaseComment[]>([]);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsBusy, setCommentsBusy] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({
    brand: "",
    model: "",
    series: "",
    error_code: "",
    symptom: "",
    checks_done: "",
    diagnosis: "",
  });
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolveBusy, setResolveBusy] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

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

  const isResolved = selected?.status === "resolved";

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
      if (selected) {
        const updatedSelected = data.find((c) => c.id === selected.id);
        if (updatedSelected) {
          setSelected(updatedSelected);
        }
      }
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  function getCreatorName(c: Case) {
    const name = (c.creator_public_name ?? c.public_name)?.trim();
    if (name && name.length > 0) return name;
    if (c.created_by_uid) return `${c.created_by_uid.slice(0, 6)}…`;
    return "Usuario";
  }

  function getAuthorName(comment: CaseComment) {
    const name = comment.author_public_name?.trim();
    if (name && name.length > 0) return name;
    if (comment.author_uid) return `${comment.author_uid.slice(0, 6)}…`;
    return "Usuario";
  }

  async function loadComments(caseId: number) {
    setCommentsBusy(true);
    setCommentsError(null);
    try {
      const list = await fetchCaseComments(caseId);
      setComments(list);
    } catch (e: any) {
      setCommentsError(e?.message ?? "Error");
    } finally {
      setCommentsBusy(false);
    }
  }

  useEffect(() => {
    if (!selected) {
      setComments([]);
      setCommentBody("");
      setCommentSuccess(null);
      setCommentsError(null);
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    setEditError(null);
    setResolutionNote(selected?.resolution_note || "");
    setResolveError(null);
    setEditFields({
      brand: selected.brand || "",
      model: selected.model || "",
      series: selected.series || "",
      error_code: selected.error_code || "",
      symptom: selected.symptom || "",
      checks_done: selected.checks_done || "",
      diagnosis: selected.diagnosis || "",
    });
    setCommentSuccess(null);
    setCommentsError(null);
    loadComments(selected.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.status]);

  useEffect(() => {
    loadCases("open");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmitComment() {
    if (!selected) return;
    const body = commentBody.trim();
    if (!body) return;
    setCommentBusy(true);
    setCommentSuccess(null);
    setCommentsError(null);
    try {
      await ensureLogin();
      const created = await postCaseComment(selected.id, body);
      setCommentBody("");
      setComments((prev) => [created, ...prev]);
      setCommentSuccess(tr.commentPosted);
    } catch (e: any) {
      if (e?.status === 401) {
        setCommentsError(tr.loginToComment);
      } else if (e?.status === 403) {
        setCommentsError(e?.message ?? tr.caseClosedNotice);
      } else if (e?.status === 422) {
        setCommentsError(e?.message ?? tr.validationError);
      } else {
        setCommentsError(e?.message ?? "Error");
      }
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleSaveEdit() {
    if (!selected) return;
    setEditBusy(true);
    setEditError(null);
    try {
      const payload = {
        brand: editFields.brand.trim(),
        model: editFields.model.trim(),
        series: editFields.series.trim(),
        error_code: editFields.error_code.trim(),
        symptom: editFields.symptom.trim(),
        checks_done: editFields.checks_done.trim(),
        diagnosis: editFields.diagnosis.trim(),
      };

      const updated = await updateCase(selected.id, payload);
      setIsEditing(false);
      setSelected(updated);
      await loadCases();
    } catch (e: any) {
      if (e?.status === 401) {
        setEditError(tr.notLoggedIn);
      } else if (e?.status === 403) {
        setEditError(e?.message ?? tr.caseClosedNotice);
      } else if (e?.status === 422) {
        setEditError(e?.message ?? tr.validationError);
      } else {
        setEditError(e?.message ?? "Error");
      }
    } finally {
      setEditBusy(false);
    }
  }

  async function handleResolve() {
    if (!selected) return;

    const note = resolutionNote.trim();
    if (!note) {
      setResolveError(tr.resolutionMissing);
      return;
    }

    setResolveBusy(true);
    setResolveError(null);

    try {
      await ensureLogin();
      await resolveCase(selected.id, note);

      setSelected((prev) => (prev ? { ...prev, status: "resolved", resolution_note: note } : prev));
      setTab("resolved");
      await loadCases("resolved");
    } catch (e: any) {
      if (e?.status === 401) {
        setResolveError(tr.notLoggedIn);
      } else if (e?.status === 403) {
        setResolveError(e?.message ?? tr.caseClosedNotice);
      } else if (e?.status === 409) {
        setResolveError(e?.message ?? tr.caseClosedNotice);
      } else if (e?.status === 422) {
        setResolveError(e?.message ?? tr.validationError);
      } else {
        setResolveError(e?.message ?? "Error");
      }
    } finally {
      setResolveBusy(false);
    }
  }

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

              {user && !isResolved && (selected.created_by_uid === user.uid || selected.can_edit) ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setIsEditing((prev) => !prev)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {isEditing ? tr.cancelEdit : tr.editCase}
                  </button>

                  {editError ? (
                    <div style={{ color: "#b91c1c", fontWeight: 700 }}>{editError}</div>
                  ) : null}
                </div>
              ) : null}

              <div style={{ color: "#6b7280", fontSize: 12 }}>
                {tr.status}: <strong>{selected.status || tab}</strong>
                {selected.error_code ? (
                  <>
                    {" "}· {tr.code}: <strong>{selected.error_code}</strong>
                  </>
                ) : null}
              </div>

              {isResolved ? (
                <div
                  style={{
                    border: "1px solid #f59e0b",
                    background: "#fffbeb",
                    color: "#92400e",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontWeight: 700,
                  }}
                >
                  {tr.caseClosedNotice}
                </div>
              ) : null}

              {isEditing ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.brand}</div>
                      <input
                        value={editFields.brand}
                        onChange={(e) => setEditFields((prev) => ({ ...prev, brand: e.target.value }))}
                        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.model}</div>
                      <input
                        value={editFields.model}
                        onChange={(e) => setEditFields((prev) => ({ ...prev, model: e.target.value }))}
                        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.seriesOptional}</div>
                      <input
                        value={editFields.series}
                        onChange={(e) => setEditFields((prev) => ({ ...prev, series: e.target.value }))}
                        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.errorCodeOptional}</div>
                      <input
                        value={editFields.error_code}
                        onChange={(e) =>
                          setEditFields((prev) => ({ ...prev, error_code: e.target.value }))
                        }
                        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.symptom}</div>
                    <textarea
                      value={editFields.symptom}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, symptom: e.target.value }))}
                      rows={3}
                      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb", resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.checksDone}</div>
                    <textarea
                      value={editFields.checks_done}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, checks_done: e.target.value }))}
                      rows={3}
                      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb", resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.diagnosis}</div>
                    <textarea
                      value={editFields.diagnosis}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, diagnosis: e.target.value }))}
                      rows={3}
                      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb", resize: "vertical" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      onClick={handleSaveEdit}
                      disabled={editBusy}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: "#0b2545",
                        color: "#fff",
                        fontWeight: 800,
                        cursor: editBusy ? "not-allowed" : "pointer",
                        opacity: editBusy ? 0.8 : 1,
                      }}
                    >
                      {editBusy ? tr.saving : tr.saveChanges}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={editBusy}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        fontWeight: 800,
                        cursor: editBusy ? "not-allowed" : "pointer",
                      }}
                    >
                      {tr.cancelEdit}
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

              {selected.status === "open" && user && selected.created_by_uid === user.uid ? (
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
                  <div style={{ fontWeight: 900, marginBottom: 4 }}>Solución final</div>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder={tr.resolutionPlaceholder}
                    rows={3}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", resize: "vertical" }}
                  />
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
                    <button
                      onClick={handleResolve}
                      disabled={resolveBusy}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: "#0b2545",
                        color: "#fff",
                        fontWeight: 800,
                        cursor: resolveBusy ? "not-allowed" : "pointer",
                        opacity: resolveBusy ? 0.8 : 1,
                      }}
                    >
                      {resolveBusy ? tr.closing : tr.closeCase}
                    </button>
                    {resolveError ? (
                      <span style={{ color: "#b91c1c", fontWeight: 700 }}>{resolveError}</span>
                    ) : null}
                  </div>
                </div>
              ) : null}

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

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontWeight: 900 }}>{tr.comments}</div>
                  {commentsBusy ? (
                    <span style={{ color: "#6b7280", fontSize: 12 }}>{tr.loading}</span>
                  ) : null}
                </div>

                {commentsError ? (
                  <div style={{ marginTop: 8, color: "#b91c1c", fontWeight: 700 }}>
                    {commentsError}
                  </div>
                ) : null}

                {user && !isResolved ? (
                  <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                    <textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder={tr.commentPlaceholder}
                      rows={3}
                      style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        onClick={handleSubmitComment}
                        disabled={commentBusy || commentBody.trim().length === 0}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "none",
                          background: "#0b2545",
                          color: "#fff",
                          fontWeight: 800,
                          cursor: commentBusy ? "not-allowed" : "pointer",
                          opacity: commentBusy ? 0.8 : 1,
                        }}
                      >
                        {commentBusy ? tr.posting : tr.comment}
                      </button>
                      {commentSuccess ? (
                        <span style={{ color: "#065f46", fontWeight: 700 }}>{commentSuccess}</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {comments.length === 0 && !commentsBusy ? (
                    <div style={{ color: "#6b7280", fontSize: 13 }}>{tr.noComments}</div>
                  ) : null}

                  {comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 10,
                        background: "#f9fafb",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 800 }}>{getAuthorName(c)}</div>
                        <div style={{ color: "#6b7280", fontSize: 12 }}>
                          {new Date(c.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{c.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
