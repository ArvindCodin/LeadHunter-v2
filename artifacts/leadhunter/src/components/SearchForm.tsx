import { useState } from "react";
import type { SearchParams } from "../lib/types";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
  backendStatus: "unknown" | "ok" | "error";
  onTestBackend: (url: string) => void;
}

const CATEGORY_PRESETS = [
  "Dental Clinic",
  "Interior Designer",
  "Photography Studio",
  "Event Planner",
  "Wedding Hall",
  "Real Estate Agent",
  "Catering",
  "Spa",
  "Salon",
  "Gym",
  "Restaurant",
  "Bakery",
  "Pet Clinic",
  "Travel Agent",
  "Tuition Center",
  "CA / Accountant",
  "Architect",
  "Jewellery Shop",
];

const AREA_PRESETS = [
  "Anna Nagar",
  "Velachery",
  "OMR",
  "Porur",
  "Adyar",
  "T Nagar",
  "Mylapore",
  "Nungambakkam",
  "Sholinganallur",
  "Perungudi",
  "Kilpauk",
  "Egmore",
];

export function SearchForm({
  onSearch,
  loading,
  backendStatus,
  onTestBackend,
}: SearchFormProps) {
  const [backendUrl, setBackendUrl] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [max, setMax] = useState(20);

  function handleSearch() {
    const q = category.trim() && area.trim() ? `${category} in ${area}` : category.trim() || area.trim();
    if (!q || !backendUrl.trim()) return;
    onSearch({ query: q, max, backendUrl: backendUrl.trim() });
  }

  const statusColor =
    backendStatus === "ok"
      ? "var(--acc)"
      : backendStatus === "error"
        ? "var(--red)"
        : "var(--dim)";

  const statusText =
    backendStatus === "ok"
      ? "✓ Connected"
      : backendStatus === "error"
        ? "✗ Unreachable"
        : "Not tested";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Backend URL */}
      <section style={sectionStyle}>
        <SectionTitle>Backend</SectionTitle>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="text"
            placeholder="https://your-backend.replit.app"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={() => onTestBackend(backendUrl.trim())}
            disabled={!backendUrl.trim()}
            style={smallBtnStyle}
          >
            Test
          </button>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: statusColor,
            marginTop: 4,
            letterSpacing: 0.5,
          }}
        >
          {statusText}
        </div>
      </section>

      {/* Category */}
      <section style={sectionStyle}>
        <SectionTitle>Category</SectionTitle>
        <input
          type="text"
          placeholder="e.g. Dental Clinic"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputStyle}
        />
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 8 }}>
          {CATEGORY_PRESETS.map((c) => (
            <Chip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </section>

      {/* Area */}
      <section style={sectionStyle}>
        <SectionTitle>Area</SectionTitle>
        <input
          type="text"
          placeholder="e.g. Velachery, Chennai"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          style={inputStyle}
        />
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 8 }}>
          {AREA_PRESETS.map((a) => (
            <Chip
              key={a}
              label={a}
              active={area === a}
              onClick={() => setArea(a)}
            />
          ))}
        </div>
      </section>

      {/* Max Results */}
      <section style={sectionStyle}>
        <SectionTitle>Max Results</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="range"
            min={5}
            max={40}
            step={5}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            style={{
              flex: 1,
              WebkitAppearance: "none",
              height: 2,
              background: "var(--s3)",
              borderRadius: 2,
              outline: "none",
              border: "none",
              cursor: "pointer",
              accentColor: "var(--acc)",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "var(--acc)",
              minWidth: 28,
            }}
          >
            {max}
          </span>
        </div>
      </section>

      {/* Search button */}
      <button
        onClick={handleSearch}
        disabled={loading || !category.trim() || !backendUrl.trim()}
        style={{
          margin: "12px 16px 16px",
          background: loading ? "var(--s3)" : "var(--acc)",
          color: loading ? "var(--dim)" : "#000",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 1,
          textTransform: "uppercase" as const,
          border: "none",
          borderRadius: 6,
          padding: 13,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all .2s",
        }}
      >
        {loading ? "Scraping..." : "Hunt Leads"}
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: 2,
        textTransform: "uppercase" as const,
        color: "var(--dim)",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
      <span style={{ flex: 1, height: 1, background: "var(--b)", display: "inline-block" }} />
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "rgba(200,245,66,.1)" : "var(--s2)",
        border: active ? "1px solid var(--acc)" : "1px solid var(--b)",
        color: active ? "var(--acc)" : "var(--dim)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        padding: "3px 8px",
        borderRadius: 20,
        cursor: "pointer",
        transition: "all .15s",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </button>
  );
}

const sectionStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--b)",
  padding: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--s2)",
  border: "1px solid var(--b)",
  color: "var(--text)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  padding: "8px 11px",
  borderRadius: 6,
  outline: "none",
};

const smallBtnStyle: React.CSSProperties = {
  background: "rgba(184,125,255,.15)",
  border: "1px solid rgba(184,125,255,.3)",
  color: "var(--purple)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  whiteSpace: "nowrap",
  letterSpacing: 0.5,
  flexShrink: 0,
};
