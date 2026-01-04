import { useEffect, useMemo, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { auth, googleProvider } from "./firebase";
import { ui, type Lang } from "./uiText";
import {
  fetchCaseComments,
  fetchCases,
  postCaseComment,
  resolveCase,
  updateCase,
  type Case,
  type CaseComment,
} from "./api/client";
import { ForumHeader, type ForumTab } from "./ForumHeader";
import { formatCaseTitle, getAuthorName, getCreatorName } from "./forumUtils";

export default function ForumCaseDetail() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(() => {
    const fromState = location.state as { caseData?: Case } | null;
    return fromState?.caseData ?? null;
  });
  const [tab, setTab] = useState<ForumTab>(() => {
    const param = new URLSearchParams(window.location.search).get("tab");
    if (param === "resolved") return "resolved";
    const fromState = location.state as { tab?: ForumTab } | null;
    return fromState?.tab === "resolved" ? "resolved" : "open";
  });
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
  const [showResolveModal, setShowResolveModal] = useState(false);

  const [lang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return saved === "en" || saved === "es" ? saved : "es";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const tr = ui[lang];
  const user = auth.currentUser;

  const isResolved = caseData?.status === "resolved";
  const isCaseCreator = !!(user && caseData && caseData.created_by_uid === user.uid);

  const statusLabel = useMemo(() => {
    if (!caseData) return "";
    return `${tr.status}: ${caseData.status || tab}`;
  }, [caseData, tab, tr]);

  async function ensureLogin() {
    if (auth.currentUser) return;
    await signInWithPopup(auth, googleProvider);
  }

  function getCaseId() {
    const id = Number(caseId);
    if (Number.isNaN(id)) return null;
    return id;
  }

  async function findCaseByStatus(targetId: number, status: ForumTab) {
    const list = await fetchCases({ status, limit: 200 });
    return list.find((c) => c.id === targetId) ?? null;
  }

  async function loadCaseDetails() {
    const targetId = getCaseId();
    if (!targetId) {
      setError(tr.caseNotFound ?? "Case not found.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await ensureLogin();
      const u = auth.currentUser;
      if (!u) throw new Error(tr.notLoggedIn);

      const preferredOrder: ForumTab[] = tab === "resolved" ? ["resolved", "open"] : ["open", "resolved"];

      let found: Case | null = null;
      for (const status of preferredOrder) {
        found = await findCaseByStatus(targetId, status);
        if (found) break;
      }

      if (!found) {
        setError(tr.caseNotFound ?? "Case not found.");
        return;
      }

      setCaseData(found);
      setTab(found.status === "resolved" ? "resolved" : "open");
      setSearchParams(found.status === "resolved" ? { tab: "resolved" } : {});
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  async function loadComments(caseIdValue: number) {
    setCommentsBusy(true);
    setCommentsError(null);
    try {
      const list = await fetchCaseComments(caseIdValue);
      setComments(list);
    } catch (e: any) {
      setCommentsError(e?.message ?? "Error");
    } finally {
      setCommentsBusy(false);
    }
  }

  useEffect(() => {
    if (!caseData) {
      loadCaseDetails();
      return;
    }

    setEditFields({
      brand: caseData.brand || "",
      model: caseData.model || "",
      series: caseData.series || "",
      error_code: caseData.error_code || "",
      symptom: caseData.symptom || "",
      checks_done: caseData.checks_done || "",
      diagnosis: caseData.diagnosis || "",
    });
    setCommentSuccess(null);
    setCommentsError(null);
    loadComments(caseData.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseData?.id, caseData?.status]);

  useEffect(() => {
    const param = searchParams.get("tab") === "resolved" ? "resolved" : "open";
    if (param !== tab) {
      setTab(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleSubmitComment() {
    if (!caseData) return;
    const body = commentBody.trim();
    if (!body) return;
    setCommentBusy(true);
    setCommentSuccess(null);
    setCommentsError(null);
    try {
      await ensureLogin();
      const created = await postCaseComment(caseData.id, body);
      setCommentBody("");
      setComments((prev) => [created, ...prev]);
      setCommentSuccess(tr.commentPosted);
    } catch (e: any) {
      if (e?.status === 401) {
        setCommentsError(tr.loginToComment);
      } else if (e?.status === 403 || e?.status === 409) {
        setCommentsError(tr.caseClosedNotice);
      } else if (e?.status === 422) {
        setCommentsError(tr.validationError);
      } else {
        setCommentsError(e?.message ?? "Error");
      }
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleSaveEdit() {
    if (!caseData) return;
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

      const updated = await updateCase(caseData.id, payload);
      setIsEditing(false);
      setCaseData(updated);
      setTab(updated.status === "resolved" ? "resolved" : "open");
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
    if (!caseData) return;

    const note = resolutionNote.trim();
    if (!note) {
      setResolveError(tr.resolutionMissing);
      return;
    }

    if (note.length < 10) {
      setResolveError(tr.resolutionTooShort);
      return;
    }

    setResolveBusy(true);
    setResolveError(null);

    try {
      await ensureLogin();
      await resolveCase(caseData.id, note);

      setCaseData((prev) => (prev ? { ...prev, status: "resolved", resolution_note: note } : prev));
      setTab("resolved");
      setShowResolveModal(false);
      setCommentBody("");
    } catch (e: any) {
      if (e?.status === 401) {
        setResolveError(tr.notLoggedIn);
      } else if (e?.status === 403 || e?.status === 409) {
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

  const backToForumHref = `/forum${tab === "resolved" ? "?tab=resolved" : ""}`;

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
              await loadCaseDetails();
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
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 18 }}>
        <ForumHeader
          lang={lang}
          tab={tab}
          busy={busy}
          onHome={() => navigate("/")}
          onSelectTab={(nextTab) => navigate(`/forum${nextTab === "resolved" ? "?tab=resolved" : ""}`)}
          onRefresh={() => loadCaseDetails()}
        />

        <button
          onClick={() => navigate(backToForumHref)}
          style={{
            marginTop: 12,
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
          ⬅ {tr.backToForum}
        </button>

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

        {!caseData ? (
          <div style={{ marginTop: 14, color: "#6b7280" }}>{tr.selectCase}</div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                background: "#ffffff",
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>{formatCaseTitle(caseData)}</div>

              <div style={{ color: "#4b5563", fontSize: 12 }}>
                Por: <strong>{getCreatorName(caseData)}</strong>
              </div>

              <div style={{ color: "#6b7280", fontSize: 12 }}>{statusLabel}</div>

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
                  {tr.caseClosedReadOnly}
                </div>
              ) : null}

              {user && !isResolved && (isCaseCreator || caseData.can_edit) ? (
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

              {!isResolved && isCaseCreator ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={() => {
                      setResolutionNote("");
                      setResolveError(null);
                      setShowResolveModal(true);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "1px solid #0b2545",
                      background: "#0b2545",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {tr.closeCase}
                  </button>
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
                        onChange={(e) => setEditFields((prev) => ({ ...prev, error_code: e.target.value }))}
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

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.symptom}</div>
                    <div style={{ lineHeight: 1.5 }}>{caseData.symptom}</div>
                  </div>

                  {caseData.checks_done ? (
                    <div>
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.checksDone}</div>
                      <div style={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {caseData.checks_done}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.diagnosis}</div>
                    <div style={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {caseData.diagnosis}
                    </div>
                  </div>

                  {caseData.resolution_note ? (
                    <div>
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>{tr.resolution}</div>
                      <div style={{ lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {caseData.resolution_note}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                background: "#ffffff",
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h3 style={{ margin: 0 }}>{tr.comments}</h3>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{comments.length}</div>
              </div>

              {isResolved ? (
                <div style={{ color: "#6b7280", fontSize: 13 }}>{tr.caseClosedReadOnly}</div>
              ) : null}

              {commentsError ? (
                <div style={{ color: "#b91c1c", fontWeight: 700 }}>{commentsError}</div>
              ) : null}

              {!isResolved ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder={tr.commentPlaceholder}
                    rows={3}
                    disabled={commentBusy}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      resize: "vertical",
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={handleSubmitComment}
                      disabled={commentBusy || !commentBody.trim()}
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
                      <div style={{ color: "#059669", fontWeight: 700 }}>{commentSuccess}</div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  {tr.caseClosedReadOnly}
                </div>
              )}

              <div style={{ display: "grid", gap: 10 }}>
                {commentsBusy ? (
                  <div style={{ color: "#6b7280" }}>{tr.loading}</div>
                ) : comments.length === 0 ? (
                  <div style={{ color: "#6b7280" }}>{tr.noComments}</div>
                ) : (
                  comments.map((c) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showResolveModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 18,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <h3 style={{ margin: 0 }}>{tr.closeCase}</h3>
              <button
                onClick={() => {
                  if (resolveBusy) return;
                  setShowResolveModal(false);
                  setResolveError(null);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                  cursor: resolveBusy ? "not-allowed" : "pointer",
                }}
                disabled={resolveBusy}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 800 }}>{tr.finalSolution}</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder={tr.resolutionPlaceholder}
                rows={4}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  resize: "vertical",
                }}
              />
              {resolveError ? (
                <div style={{ color: "#b91c1c", fontWeight: 700 }}>{resolveError}</div>
              ) : null}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowResolveModal(false)}
                  disabled={resolveBusy}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    fontWeight: 800,
                    cursor: resolveBusy ? "not-allowed" : "pointer",
                  }}
                >
                  {tr.cancelEdit}
                </button>
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
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
