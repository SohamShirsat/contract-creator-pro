import { useContract } from "@/lib/contract";

export function Step6Info() {
  const { state, setState } = useContract();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="cc-card">
        <h3 className="cc-section-title">Additional information</h3>
        <div style={{ display: "flex", gap: 4, padding: 8, border: "1px solid var(--color-border)", borderRadius: "8px 8px 0 0", background: "var(--color-muted)" }}>
          {["B", "I", "U", "•", "1.", "🔗"].map((b) => (
            <button key={b} className="cc-icon-btn" style={{ width: 32, height: 32 }}>{b}</button>
          ))}
        </div>
        <textarea
          className="cc-input"
          rows={10}
          style={{ borderRadius: "0 0 8px 8px", borderTop: 0 }}
          value={state.additionalInfo}
          onChange={(e) => setState({ ...state, additionalInfo: e.target.value })}
        />
      </div>


    </div>
  );
}
