import { Modal } from "./Modal";

const DMCS = ["Globetrek Holidays", "Travelogy DMC", "Asian Adventures", "Premium Voyage"];

export function SuccessPopup({ open, onClose, contractName }: { open: boolean; onClose: () => void; contractName: string }) {
  return (
    <Modal open={open} onClose={onClose} title=" " width={520}>
      <div style={{ textAlign: "center", padding: "8px 8px 0" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 999, background: "var(--color-accent)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, color: "var(--color-primary)", marginBottom: 16,
        }}>✓</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Congratulations, Your contract "{contractName}" has been successfully created.
        </h3>
        <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", marginBottom: 20 }}>
          You can Share it with DMC via email or from the below dropdown list.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <select className="cc-input" style={{ flex: 1 }}>
            <option>Select DMC</option>
            {DMCS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button className="cc-btn cc-btn-primary cc-btn-lg">Share</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", margin: "12px 0" }}>OR</div>
        <button className="cc-btn cc-btn-ghost" style={{ color: "var(--color-primary)" }}>Send via email</button>
        <div style={{ marginTop: 20 }}>
          <button className="cc-btn cc-btn-ghost" onClick={onClose}>OK</button>
        </div>
      </div>
    </Modal>
  );
}
