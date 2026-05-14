import { useState } from "react";
import { useContract, type Tax } from "@/lib/contract";
import { Modal } from "./Modal";

export function Step5Tax() {
  const { state, setState, uid } = useContract();
  const [open, setOpen] = useState(false);
  const blank: Tax = { id: "", name: "", type: "Tax", appliesOn: "Room rate", ruleType: "Percentage", minValue: "", maxValue: "", taxValue: "", unit: "%" };
  const [draft, setDraft] = useState<Tax>(blank);

  return (
    <div className="cc-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="cc-section-title" style={{ marginBottom: 0 }}>Surcharges, Fees & Tax</h3>
        <button className="cc-btn cc-btn-primary" onClick={() => { setDraft(blank); setOpen(true); }}>Add</button>
      </div>

      <table className="cc-table cc-table-compact">
        <thead><tr><th>Name</th><th>Type</th><th>Applies on</th><th>Rule type</th><th>Min</th><th>Max</th><th>Tax value</th><th></th></tr></thead>
        <tbody>
          {state.taxes.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td><td>{t.type}</td><td>{t.appliesOn}</td><td>{t.ruleType}</td>
              <td>{t.minValue || "—"}</td><td>{t.maxValue || "—"}</td>
              <td>{t.unit === "%" ? `${t.taxValue}%` : `₹${t.taxValue}`}</td>
              <td><button className="cc-icon-btn" onClick={() => setState((s) => ({ ...s, taxes: s.taxes.filter((x) => x.id !== t.id) }))}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginTop: 12 }}>
        User can set fees and tax from this screen by clicking on the "Add". Then Add popup will open as popover.
      </p>

      <Modal open={open} onClose={() => setOpen(false)} title="Add" width={720}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <div><label className="cc-label">Name</label><input className="cc-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <div><label className="cc-label">Type</label>
            <select className="cc-input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Tax["type"] })}>
              <option>Tax</option><option>Levy</option><option>Fee</option><option>Surcharge</option>
            </select>
          </div>
          <div><label className="cc-label">Applies on</label>
            <select className="cc-input" value={draft.appliesOn} onChange={(e) => setDraft({ ...draft, appliesOn: e.target.value })}>
              <option>Room rate</option><option>Total bill</option><option>Per person</option><option>Per hour</option>
            </select>
          </div>
          <div><label className="cc-label">Rule type</label>
            <select className="cc-input" value={draft.ruleType} onChange={(e) => setDraft({ ...draft, ruleType: e.target.value as Tax["ruleType"] })}>
              <option>Percentage</option><option>Flat</option><option>Slab-based</option>
            </select>
          </div>
          <div><label className="cc-label">Min value</label><input className="cc-input" value={draft.minValue} onChange={(e) => setDraft({ ...draft, minValue: e.target.value })} /></div>
          <div><label className="cc-label">Max value</label><input className="cc-input" value={draft.maxValue} onChange={(e) => setDraft({ ...draft, maxValue: e.target.value })} /></div>
          <div><label className="cc-label">Tax value</label><input className="cc-input" value={draft.taxValue} onChange={(e) => setDraft({ ...draft, taxValue: e.target.value })} /></div>
          <div><label className="cc-label">Unit</label>
            <select className="cc-input" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value as "%" | "₹" })}>
              <option>%</option><option>₹</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <button className="cc-btn cc-btn-primary" onClick={() => {
            setState((s) => ({ ...s, taxes: [...s.taxes, { ...draft, id: uid() }] }));
            setOpen(false);
          }}>Save</button>
        </div>
      </Modal>
    </div>
  );
}
