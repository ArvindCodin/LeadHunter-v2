interface HeaderProps {
  totalLeads: number;
  withPhone: number;
  noWebsite: number;
}

export function Header({ totalLeads, withPhone, noWebsite }: HeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 24px",
        height: 52,
        background: "var(--s1)",
        borderBottom: "1px solid var(--b)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: "-0.5px",
          color: "var(--acc)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        LeadHunter
        <span
          style={{
            background: "rgba(200,245,66,.12)",
            border: "1px solid rgba(200,245,66,.3)",
            color: "var(--acc)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            padding: "2px 7px",
            borderRadius: 3,
            letterSpacing: 1,
          }}
        >
          v2
        </span>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
        <StatPill label="LEADS" value={totalLeads} color="var(--acc)" />
        <StatPill label="W/ PHONE" value={withPhone} color="var(--acc2)" />
        <StatPill label="NO SITE" value={noWebsite} color="var(--acc3)" />
      </div>
    </header>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        background: "var(--s2)",
        border: "1px solid var(--b)",
        borderRadius: 4,
        padding: "5px 12px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "var(--dim)",
        letterSpacing: 0.5,
        textTransform: "uppercase" as const,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Syne', sans-serif",
          letterSpacing: 0,
          color,
        }}
      >
        {value}
      </span>
      {label}
    </div>
  );
}
