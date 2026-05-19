interface EmptyStateProps {
  loading: boolean;
  error: string | null;
}

export function EmptyState({ loading, error }: EmptyStateProps) {
  if (loading) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "2px solid var(--b2)",
            borderTop: "2px solid var(--acc)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: 16,
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--sub)" }}>
          Scraping Google Maps...
        </p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--dim)", marginTop: 6 }}>
          This takes 1–3 minutes depending on how many results you requested
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--red)",
            maxWidth: 400,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 48,
          fontWeight: 800,
          color: "var(--acc)",
          opacity: 0.15,
          letterSpacing: -2,
          marginBottom: 12,
        }}
      >
        LH
      </div>
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "var(--dim)",
        }}
      >
        Configure your backend URL and search to find leads
      </p>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--sub)",
  padding: 40,
};
