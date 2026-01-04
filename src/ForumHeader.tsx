import { ui, type Lang } from "./uiText";

export type ForumTab = "open" | "resolved";

type ForumHeaderProps = {
  lang: Lang;
  tab: ForumTab;
  busy: boolean;
  onHome: () => void;
  onSelectTab: (tab: ForumTab) => void;
  onRefresh: () => void;
};

export function ForumHeader({ lang, tab, busy, onHome, onSelectTab, onRefresh }: ForumHeaderProps) {
  const tr = ui[lang];

  return (
    <>
      <button
        onClick={onHome}
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

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => onSelectTab("open")}
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
            onClick={() => onSelectTab("resolved")}
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
            onClick={onRefresh}
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
    </>
  );
}
