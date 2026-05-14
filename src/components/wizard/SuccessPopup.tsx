import { useState } from "react";
import { Modal } from "./Modal";
import { useContract } from "@/lib/contract";

const DMCS = ["Globetrek Holidays", "Travelogy DMC", "Asian Adventures", "Premium Voyage"];

export function SuccessPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setState } = useContract();
  const [published, setPublished] = useState(false);

  // Reset state when opening
  if (!open && published) setPublished(false);

  if (!published) {
    return (
      <Modal open={open} onClose={onClose} title="Publish Contract" width={520}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
          <div>
            <label className="cc-label">Contract name</label>
            <input
              className="cc-input"
              placeholder="e.g. Summer Season 2025"
              value={state.contractName}
              onChange={(e) => setState({ ...state, contractName: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="cc-label">Valid from</label>
              <input
                type="date"
                className="cc-input"
                value={state.validFrom}
                onChange={(e) => setState({ ...state, validFrom: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="cc-label">Valid to</label>
              <input
                type="date"
                className="cc-input"
                value={state.validTo}
                onChange={(e) => setState({ ...state, validTo: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button className="cc-btn cc-btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="cc-btn cc-btn-primary cc-btn-lg"
              disabled={!state.contractName || !state.validFrom || !state.validTo}
              onClick={() => setPublished(true)}
            >
              Publish Contract
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title=" " width={520}>
      <div style={{ textAlign: "center", padding: "8px 8px 0" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 999, background: "var(--color-accent)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, color: "var(--color-primary)", marginBottom: 16,
        }}>✓</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Congratulations, Your contract "{state.contractName}" has been successfully created.
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
