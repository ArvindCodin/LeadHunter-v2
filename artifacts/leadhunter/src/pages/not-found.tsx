export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <span
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 64,
          color: "var(--acc)",
          opacity: 0.3,
        }}
      >
        404
      </span>
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "var(--dim)",
        }}
      >
        Page not found.
      </p>
    </div>
  );
}
