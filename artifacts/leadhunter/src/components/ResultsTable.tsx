import { useState, useMemo } from "react";
import type { Business } from "../lib/types";
import { exportToCsv, whatsappLink } from "../lib/csv-export";
import { opportunityScore, wtpScore, scoreColor, scoreLabel } from "../lib/score";

interface ResultsTableProps {
  leads: Business[];
}

type SortKey = "name" | "rating" | "reviews" | "category" | "area" | "opportunity" | "wtp";
type SortDir = "asc" | "desc";

export function ResultsTable({ leads }: ResultsTableProps) {
  const [search, setSearch] = useState("");
  const [filterNoWebsite, setFilterNoWebsite] = useState(false);
  const [filterHasPhone, setFilterHasPhone] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("opportunity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let result = leads.filter((b) => {
      if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterNoWebsite && b.hasWebsite) return false;
      if (filterHasPhone && !b.phone) return false;
      if (minRating > 0 && b.rating < minRating) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case "name":      av = a.name;              bv = b.name;              break;
        case "rating":    av = a.rating;             bv = b.rating;            break;
        case "reviews":   av = a.reviews;            bv = b.reviews;           break;
        case "category":  av = a.category;           bv = b.category;          break;
        case "area":      av = a.area;               bv = b.area;              break;
        case "opportunity": av = opportunityScore(a); bv = opportunityScore(b); break;
        case "wtp":       av = wtpScore(a);          bv = wtpScore(b);         break;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });

    return result;
  }, [leads, search, filterNoWebsite, filterHasPhone, minRating, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "10px 16px",
          background: "var(--s1)",
          borderBottom: "1px solid var(--b)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          flexWrap: "wrap" as const,
        }}
      >
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b)",
            color: "var(--text)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            padding: "6px 11px",
            borderRadius: 6,
            outline: "none",
            width: 180,
          }}
        />

        <FilterChip
          label="No Website"
          active={filterNoWebsite}
          onClick={() => setFilterNoWebsite((v) => !v)}
          color="var(--acc)"
        />
        <FilterChip
          label="Has Phone"
          active={filterHasPhone}
          onClick={() => setFilterHasPhone((v) => !v)}
          color="var(--acc3)"
        />

        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b)",
            color: "var(--sub)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            padding: "6px 9px",
            borderRadius: 6,
            outline: "none",
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          <option value={0}>All Ratings</option>
          <option value={3}>3★ +</option>
          <option value={3.5}>3.5★ +</option>
          <option value={4}>4★ +</option>
          <option value={4.5}>4.5★ +</option>
        </select>

        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: "var(--dim)",
            marginLeft: 4,
          }}
        >
          {filtered.length} / {leads.length} leads
        </span>

        <button
          onClick={() => exportToCsv(filtered)}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "1px solid var(--acc)",
            color: "var(--acc)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: 1,
            textTransform: "uppercase" as const,
            padding: "6px 14px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
            <tr style={{ background: "var(--s1)" }}>
              {(
                [
                  { key: "name",        label: "Business"    },
                  { key: "category",    label: "Category"    },
                  { key: "area",        label: "Area"        },
                  { key: "rating",      label: "Rating"      },
                  { key: "reviews",     label: "Reviews"     },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <Th key={key} onClick={() => toggleSort(key)}>
                  {label}{sortIndicator(key)}
                </Th>
              ))}
              <Th>Phone</Th>
              <Th>WhatsApp</Th>
              <Th>Website</Th>
              <Th onClick={() => toggleSort("opportunity")} highlight>
                Opportunity{sortIndicator("opportunity")}
              </Th>
              <Th onClick={() => toggleSort("wtp")} highlight>
                WTP{sortIndicator("wtp")}
              </Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((biz, i) => (
              <BusinessRow key={`${biz.name}-${i}`} biz={biz} />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--dim)",
            }}
          >
            No leads match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  highlight,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  highlight?: boolean;
}) {
  return (
    <th
      onClick={onClick}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: "uppercase" as const,
        color: highlight ? "var(--acc2)" : "var(--dim)",
        padding: "9px 14px",
        textAlign: "left" as const,
        borderBottom: "1px solid var(--b)",
        whiteSpace: "nowrap" as const,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none" as const,
      }}
    >
      {children}
    </th>
  );
}

function BusinessRow({ biz }: { biz: Business }) {
  const waLink = whatsappLink(biz.phone);
  const opp = opportunityScore(biz);
  const wtp = wtpScore(biz);

  return (
    <tr
      style={{ transition: "background .1s" }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,.015)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
      }
    >
      <Td>
        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>{biz.name}</div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: "var(--dim)",
            marginTop: 2,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {biz.address}
        </div>
      </Td>
      <Td>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--sub)" }}>
          {biz.category}
        </span>
      </Td>
      <Td>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--sub)" }}>
          {biz.area}
        </span>
      </Td>
      <Td>
        <RatingDisplay rating={biz.rating} />
      </Td>
      <Td>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--sub)" }}>
          {biz.reviews.toLocaleString()}
        </span>
      </Td>
      <Td>
        {biz.phone ? (
          <a
            href={`tel:${biz.phone}`}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--acc)",
              textDecoration: "none",
            }}
          >
            {biz.phone}
          </a>
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--dim)" }}>—</span>
        )}
      </Td>
      <Td>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "rgba(37,211,102,.12)",
              border: "1px solid rgba(37,211,102,.3)",
              color: "#25d366",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 4,
              textDecoration: "none",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            WhatsApp
          </a>
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--dim)" }}>
            No phone
          </span>
        )}
      </Td>
      <Td>
        {biz.hasWebsite ? (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--red)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Has site
          </span>
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--acc)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            No site ✓
          </span>
        )}
      </Td>
      <Td>
        <ScoreBadge score={opp} />
      </Td>
      <Td>
        <ScoreBadge score={wtp} />
      </Td>
    </tr>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = scoreColor(score);
  const label = scoreLabel(score);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 14,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 7,
            letterSpacing: 1,
            color,
            opacity: 0.8,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          height: 3,
          width: "100%",
          background: "var(--b)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: color,
            borderRadius: 2,
            transition: "width .3s",
          }}
        />
      </div>
    </div>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "9px 14px", borderBottom: "1px solid rgba(37,37,51,.6)", verticalAlign: "top" }}>
      {children}
    </td>
  );
}

function RatingDisplay({ rating }: { rating: number }) {
  if (!rating) {
    return (
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--dim)" }}>—</span>
    );
  }
  const color = rating >= 4.5 ? "var(--acc)" : rating >= 3.5 ? "var(--acc2)" : "var(--sub)";
  return (
    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color }}>
      {rating.toFixed(1)}
    </span>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}18` : "var(--s2)",
        border: active ? `1px solid ${color}` : "1px solid var(--b)",
        color: active ? color : "var(--dim)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        padding: "5px 10px",
        borderRadius: 4,
        cursor: "pointer",
        letterSpacing: 0.5,
        textTransform: "uppercase" as const,
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}
