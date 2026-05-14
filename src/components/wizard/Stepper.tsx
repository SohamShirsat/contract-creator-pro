import { useContract } from "@/lib/contract";

const labels = ["Setup", "Season & Pricing", "Add-ons", "Policies", "Surcharges & Tax", "Add. Info", "Preview"];

export function Stepper() {
  const { step, setStep } = useContract();
  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid var(--color-border)",
        padding: "20px 50px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", maxWidth: 1340, margin: "0 auto" }}>
        {labels.map((l, i) => {
          const n = i + 1;
          const completed = n < step;
          const active = n === step;
          const reachable = n <= step;
          return (
            <div key={l} style={{ display: "flex", alignItems: "center", flex: i < labels.length - 1 ? 1 : "none" }}>
              <button
                onClick={() => completed && setStep(n)}
                disabled={!completed}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: 0,
                  cursor: completed ? "pointer" : "default",
                  padding: 0,
                  minWidth: 80,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    background: active || completed ? "var(--color-primary)" : "white",
                    color: active || completed ? "white" : "var(--color-muted-foreground)",
                    border: `1.5px solid ${active || completed ? "var(--color-primary)" : "var(--color-border)"}`,
                  }}
                >
                  {completed ? "✓" : n}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: reachable ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {l}
                </div>
              </button>
              {i < labels.length - 1 && (
                <div
                  style={{
                    height: 2,
                    flex: 1,
                    background: n < step ? "var(--color-primary)" : "var(--color-border)",
                    margin: "0 8px",
                    marginTop: 15,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
