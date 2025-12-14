import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 0,
        margin: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px 0",
          boxSizing: "border-box",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            textAlign: "center",
            marginBottom: "32px",
            width: "100%",
          }}
        >
          <img
            src="/logo.png"
            alt="ForkliftIA Logo"
            style={{
              width: 180,
              height: 180,
              margin: "0 auto 20px",
              display: "block",
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          />

          <h1
            style={{
              margin: 0,
              fontSize: 36,
              color: "#0b2545",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            ForkliftIA
          </h1>
          <p
            style={{
              margin: "6px 0",
              color: "#f97316",
              fontWeight: 600,
              fontSize: 17,
            }}
          >
            Technical intelligence for forklift technicians.
          </p>
          <p
            style={{
              marginTop: 8,
              color: "#021c3b",
              fontSize: 14,
              lineHeight: 1.4,
              maxWidth: 600,
              margin: "8px auto 0",
            }}
          >
            Fast solutions. Smart manuals. A technical assistant focused on
            real-world forklift failures.
          </p>
        </header>

        {/* CARDS */}
        <section
          style={{
            display: "flex",
            gap: 24,
            marginTop: 24,
            marginBottom: 24,
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              padding: "24px 20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              width: "100%",
              maxWidth: 360,
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)";
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 10,
                color: "#f97316",
                fontSize: 19,
                fontWeight: 700,
              }}
            >
              AI Troubleshooting
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#021c3b",
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              Ask by brand, model, error code and symptom. ForkliftIA combines
              field cases and an internal technical library to suggest a
              diagnostic path.
            </p>
            <button
              onClick={async () => {
              await signInWithPopup(auth, googleProvider);
              onOpenDiagnosis();
}}

              style={{
                marginTop: 12,
                padding: "10px 20px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: "#0b2545",
                color: "#ffffff",
                width: "100%",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0d2e5a";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0b2545";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Open
            </button>
          </div>

          {/* Card 2 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              padding: "24px 20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              width: "100%",
              maxWidth: 360,
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 10,
                color: "#f97316",
                fontSize: 19,
                fontWeight: 700,
              }}
            >
              Spare Parts Catalog
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#021c3b",
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              Structured lists of parts by brand and model. Reference codes,
              descriptions and components overview. Coming soon.
            </p>
            <button
              disabled
              style={{
                marginTop: 12,
                padding: "10px 20px",
                borderRadius: 999,
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: "#e5e7eb",
                color: "#0b2545",
                cursor: "not-allowed",
                width: "100%",
                opacity: 0.6,
              }}
            >
              Soon
            </button>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          width: "100%",
          textAlign: "center",
          padding: "16px 16px",
          backgroundColor: "#0b2545",
          color: "#e5e7eb",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        Project in development. ForkliftIA does not distribute service manuals.
        Information is summarized from private technical sources and field cases.
      </footer>

      <style>{`
        @media (max-width: 768px) {
          h1 { font-size: 36px !important; }
          img { width: 90px !important; height: 90px !important; }
        }
        @media (max-width: 480px) {
          h1 { font-size: 28px !important; }
        }
      `}</style>
    </div>
  );
}
