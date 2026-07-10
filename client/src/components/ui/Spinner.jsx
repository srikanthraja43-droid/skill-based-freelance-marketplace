export default function Spinner({ size = "md", text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "2rem" }}>
      <div className="spinner" style={{ width: size === "lg" ? 40 : size === "sm" ? 16 : 24, height: size === "lg" ? 40 : size === "sm" ? 16 : 24 }} />
      {text && <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{text}</p>}
    </div>
  );
}
