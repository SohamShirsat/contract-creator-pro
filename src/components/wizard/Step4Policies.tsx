import { useState } from "react";
import { useContract, type CancelRule, type MinLOS, type Holding, type Blackout } from "@/lib/contract";
import { Modal } from "./Modal";

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="cc-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="cc-section-title" style={{ marginBottom: 0 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Step4Policies() {
  const { state, setState, uid } = useContract();
  const [cancelModal, setCancelModal] = useState<{ open: boolean; type: "before" | "after" }>({ open: false, type: "before" });
  const [minlosModal, setMinlosModal] = useState(false);
  const [draftCancel, setDraftCancel] = useState<CancelRule>({ id: "", condition: "", type: "Days range", from: "", to: "", penalty: "", processingFees: "" });
  const [draftMinlos, setDraftMinlos] = useState<MinLOS>({ id: "", restrictionType: "Minimum stay", appliesToFrom: "", appliesToTo: "", minNights: "", roomType: "All rooms" });

  const updateCancel = (key: "cancelBefore" | "cancelAfter", id: string, patch: Partial<CancelRule>) =>
    setState((s) => ({ ...s, [key]: s[key].map((r) => (r.id === id ? { ...r, ...patch } : r)) } as never));
  const removeCancel = (key: "cancelBefore" | "cancelAfter", id: string) =>
    setState((s) => ({ ...s, [key]: s[key].filter((r) => r.id !== id) } as never));

  const saveCancel = () => {
    const key = cancelModal.type === "before" ? "cancelBefore" : "cancelAfter";
    setState((s) => ({ ...s, [key]: [...s[key], { ...draftCancel, id: uid() }] } as never));
    setCancelModal({ open: false, type: cancelModal.type });
    setDraftCancel({ id: "", condition: "", type: "Days range", from: "", to: "", penalty: "", processingFees: "" });
  };

  const updateBlackout = (key: "blackouts" | "stopSale", id: string, patch: Partial<Blackout>) =>
    setState((s) => ({ ...s, [key]: s[key].map((r) => (r.id === id ? { ...r, ...patch } : r)) } as never));
  const removeBlackout = (key: "blackouts" | "stopSale", id: string) =>
    setState((s) => ({ ...s, [key]: s[key].filter((r) => r.id !== id) } as never));
  const addBlackout = (key: "blackouts" | "stopSale") =>
    setState((s) => ({ ...s, [key]: [...s[key], { id: uid(), roomType: "All rooms", from: "", to: "" }] } as never));

  const freeSale = state.inventoryMode === "Free Sale";

  const PAYMENT_OPTIONS = [
    "Pay full amount in advance",
    "Pay at month end",
    "Pay full amount at check-in",
    "Pay full amount at check-out",
    "Collect in installments",
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* No show */}
      <Card title="No show policy">
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <input
            className="cc-input"
            style={{ width: 120 }}
            value={state.noShowPenalty}
            onChange={(e) => setState({ ...state, noShowPenalty: e.target.value })}
          />
          <span style={{ fontSize: 14, color: "var(--color-foreground)" }}>
            % of booking value as No show policy penalty.
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["10", "25", "50", "100"].map((v) => (
            <span key={v} className={`cc-chip ${state.noShowPenalty === v ? "cc-chip-active" : ""}`} onClick={() => setState({ ...state, noShowPenalty: v })}>
              {v}%
            </span>
          ))}
        </div>
      </Card>

      {/* Cancellation before */}
      <Card
        title="Before check-in — Cancellation policy"
        action={<button className="cc-btn cc-btn-outline" onClick={() => setCancelModal({ open: true, type: "before" })}>+ Add rule</button>}
      >
        <table className="cc-table">
          <thead>
            <tr>
              <th>Condition</th><th>Type</th><th>Applies when (days range)</th><th>Penalty</th><th>Processing fees</th><th></th>
            </tr>
          </thead>
          <tbody>
            {state.cancelBefore.map((r) => (
              <tr key={r.id}>
                <td>
                  <select className="cc-input" value={r.condition} onChange={(e) => updateCancel("cancelBefore", r.id, { condition: e.target.value })}>
                    <option value="">Select</option>
                    <option>Before Check-in</option>
                    <option>Partial cancellation</option>
                  </select>
                </td>
                <td>
                  <select className="cc-input" style={{ width: 140 }} value={r.type} onChange={(e) => updateCancel("cancelBefore", r.id, { type: e.target.value as CancelRule["type"] })}>
                    <option>Days range</option>
                    <option>Fixed charges</option>
                  </select>
                </td>
                <td>
                  {r.type === "Days range" ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input className="cc-input" style={{ width: 70 }} placeholder="From" value={r.from} onChange={(e) => updateCancel("cancelBefore", r.id, { from: e.target.value })} />
                      <span>–</span>
                      <input className="cc-input" style={{ width: 70 }} placeholder="To" value={r.to} onChange={(e) => updateCancel("cancelBefore", r.id, { to: e.target.value })} />
                      <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>days</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>—</span>
                  )}
                </td>
                <td><input className="cc-input" value={r.penalty} onChange={(e) => updateCancel("cancelBefore", r.id, { penalty: e.target.value })} /></td>
                <td><input className="cc-input" placeholder="Optional" value={r.processingFees || ""} onChange={(e) => updateCancel("cancelBefore", r.id, { processingFees: e.target.value })} /></td>
                <td><button className="cc-icon-btn" onClick={() => removeCancel("cancelBefore", r.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Cancellation after */}
      <Card
        title="After check-in — Cancellation policy"
        action={<button className="cc-btn cc-btn-outline" onClick={() => setCancelModal({ open: true, type: "after" })}>+ Add rule</button>}
      >
        <table className="cc-table">
          <thead>
            <tr>
              <th>Condition</th><th>Type</th><th>Charges</th><th>Penalty</th><th>Processing fees</th><th></th>
            </tr>
          </thead>
          <tbody>
            {state.cancelAfter.map((r) => (
              <tr key={r.id}>
                <td>
                  <select className="cc-input" value={r.condition} onChange={(e) => updateCancel("cancelAfter", r.id, { condition: e.target.value })}>
                    <option value="">Select</option>
                    <option>Early departure</option>
                    <option>Partial cancellation</option>
                  </select>
                </td>
                <td>
                  <select className="cc-input" style={{ width: 140 }} value={r.type} onChange={(e) => updateCancel("cancelAfter", r.id, { type: e.target.value as CancelRule["type"] })}>
                    <option>Days range</option>
                    <option>Fixed charges</option>
                  </select>
                </td>
                <td>
                  {r.type === "Days range" ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input className="cc-input" style={{ width: 70 }} placeholder="From" value={r.from} onChange={(e) => updateCancel("cancelAfter", r.id, { from: e.target.value })} />
                      <span>–</span>
                      <input className="cc-input" style={{ width: 70 }} placeholder="To" value={r.to} onChange={(e) => updateCancel("cancelAfter", r.id, { to: e.target.value })} />
                      <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>days</span>
                    </div>
                  ) : (
                    <input className="cc-input" style={{ width: 130 }} placeholder="Fixed amount" value={r.from} onChange={(e) => updateCancel("cancelAfter", r.id, { from: e.target.value })} />
                  )}
                </td>
                <td><input className="cc-input" value={r.penalty} onChange={(e) => updateCancel("cancelAfter", r.id, { penalty: e.target.value })} /></td>
                <td><input className="cc-input" placeholder="Optional" value={r.processingFees || ""} onChange={(e) => updateCancel("cancelAfter", r.id, { processingFees: e.target.value })} /></td>
                <td><button className="cc-icon-btn" onClick={() => removeCancel("cancelAfter", r.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modification */}
      <Card title="Modification charges">
        <div style={{ display: "flex", gap: 24 }}>
          {(["Applicable", "Not applicable"] as const).map((v) => (
            <label key={v} className="cc-radio-row">
              <input type="radio" checked={state.modificationCharges === v} onChange={() => setState({ ...state, modificationCharges: v })} />
              {v}
            </label>
          ))}
        </div>
        {state.modificationCharges === "Applicable" && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input className="cc-input" placeholder="Charge type" />
                <input className="cc-input" placeholder="Applies when" />
                <input className="cc-input" placeholder="Value" style={{ width: 100 }} />
                <span>+</span>
                <input className="cc-input" placeholder="Additional" style={{ width: 100 }} />
                <select className="cc-input" style={{ width: 90 }}>
                  <option>%</option><option>₹</option>
                </select>
              </div>
            ))}
            <button className="cc-btn cc-btn-outline" style={{ alignSelf: "flex-start" }}>+ Add</button>
          </div>
        )}
      </Card>

      {/* Payment */}
      <Card title="Payment policy">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PAYMENT_OPTIONS.map((v) => (
            <label key={v} className="cc-radio-row">
              <input type="radio" checked={state.paymentPolicy === v} onChange={() => setState({ ...state, paymentPolicy: v })} />
              {v}
            </label>
          ))}
        </div>

        {state.paymentPolicy === "Collect in installments" && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {state.installments.map((inst, i) => (
              <div key={inst.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 13, minWidth: 100 }}>Installment {i + 1}</span>
                <input
                  className="cc-input"
                  style={{ width: 100 }}
                  placeholder="Amount %"
                  value={inst.amount}
                  onChange={(e) => setState((s) => ({ ...s, installments: s.installments.map((x) => x.id === inst.id ? { ...x, amount: e.target.value } : x) }))}
                />
                <select
                  className="cc-input"
                  style={{ width: 200 }}
                  value={inst.when}
                  onChange={(e) => setState((s) => ({ ...s, installments: s.installments.map((x) => x.id === inst.id ? { ...x, when: e.target.value as typeof inst.when } : x) }))}
                >
                  <option value="Before check-in">Before check-in</option>
                  <option value="After check-out within">After check-out within</option>
                </select>
                <input
                  className="cc-input"
                  style={{ width: 80 }}
                  placeholder="Days"
                  value={inst.days}
                  onChange={(e) => setState((s) => ({ ...s, installments: s.installments.map((x) => x.id === inst.id ? { ...x, days: e.target.value } : x) }))}
                />
                <span style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>days</span>
                <button className="cc-icon-btn" onClick={() => setState((s) => ({ ...s, installments: s.installments.filter((x) => x.id !== inst.id) }))}>✕</button>
              </div>
            ))}
            <button className="cc-btn cc-btn-outline" style={{ alignSelf: "flex-start" }} onClick={() => setState((s) => ({ ...s, installments: [...s.installments, { id: uid(), amount: "", when: "Before check-in", days: "" }] }))}>+ Add installment</button>
          </div>
        )}

        {/* Payment details checkbox */}
        <div style={{ marginTop: 16 }}>
          <label className="cc-radio-row">
            <input type="checkbox" checked={state.paymentDetails} onChange={(e) => setState({ ...state, paymentDetails: e.target.checked })} />
            Add payment details
          </label>
          {state.paymentDetails && (
            <textarea
              className="cc-input"
              rows={4}
              style={{ marginTop: 10, fontFamily: "monospace" }}
              placeholder="Payment details (markdown supported)..."
              value={state.paymentDetailsContent}
              onChange={(e) => setState({ ...state, paymentDetailsContent: e.target.value })}
            />
          )}
        </div>
      </Card>

      {/* Blackouts */}
      <Card title="Blackout dates">
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 12 }}>
          Static rates will not be valid — use dynamic pricing from PMS or call hotel directly.
        </p>
        <label className="cc-radio-row" style={{ marginBottom: 12 }}>
          <input type="checkbox" checked={state.blackoutAll} onChange={(e) => setState({ ...state, blackoutAll: e.target.checked })} />
          Apply blackout to all room types
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {state.blackouts.map((b) => (
            <div key={b.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select className="cc-input" style={{ width: 200 }} value={b.roomType} onChange={(e) => updateBlackout("blackouts", b.id, { roomType: e.target.value })}>
                <option>All rooms</option>
                {state.rooms.map((r) => <option key={r.id}>{r.name}</option>)}
              </select>
              <input type="date" className="cc-input" value={b.from} onChange={(e) => updateBlackout("blackouts", b.id, { from: e.target.value })} />
              <input type="date" className="cc-input" value={b.to} onChange={(e) => updateBlackout("blackouts", b.id, { to: e.target.value })} />
              <input className="cc-input" placeholder="Reason" value={b.reason || ""} onChange={(e) => updateBlackout("blackouts", b.id, { reason: e.target.value })} />
              <button className="cc-icon-btn" onClick={() => removeBlackout("blackouts", b.id)}>✕</button>
            </div>
          ))}
        </div>
        <button className="cc-btn cc-btn-outline" style={{ marginTop: 12 }} onClick={() => addBlackout("blackouts")}>+ Add row</button>
      </Card>

      {/* Stop Sale */}
      <Card title="Stop sale">
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 12 }}>
          Rooms under stop sale are not available for booking in the specified date range.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {state.stopSale.map((b) => (
            <div key={b.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select className="cc-input" style={{ width: 200 }} value={b.roomType} onChange={(e) => updateBlackout("stopSale", b.id, { roomType: e.target.value })}>
                <option>All rooms</option>
                {state.rooms.map((r) => <option key={r.id}>{r.name}</option>)}
              </select>
              <input type="date" className="cc-input" value={b.from} onChange={(e) => updateBlackout("stopSale", b.id, { from: e.target.value })} />
              <input type="date" className="cc-input" value={b.to} onChange={(e) => updateBlackout("stopSale", b.id, { to: e.target.value })} />
              <input className="cc-input" placeholder="Reason" value={b.reason || ""} onChange={(e) => updateBlackout("stopSale", b.id, { reason: e.target.value })} />
              <button className="cc-icon-btn" onClick={() => removeBlackout("stopSale", b.id)}>✕</button>
            </div>
          ))}
        </div>
        <button className="cc-btn cc-btn-outline" style={{ marginTop: 12 }} onClick={() => addBlackout("stopSale")}>+ Add row</button>
      </Card>

      {/* MinLOS */}
      <Card title="Minimum Length of Stay (MinLOS)" action={
        <button className="cc-btn cc-btn-outline" onClick={() => { setDraftMinlos({ id: "", restrictionType: "Minimum stay", appliesToFrom: "", appliesToTo: "", minNights: "", roomType: "All rooms" }); setMinlosModal(true); }}>+ Add</button>
      }>
        <table className="cc-table cc-table-compact">
          <thead>
            <tr><th>Restriction type</th><th>Applies to (date range)</th><th>Minimum nights</th><th>Room type</th><th></th></tr>
          </thead>
          <tbody>
            {state.minLOS.map((m) => (
              <tr key={m.id}>
                <td>{m.restrictionType}</td>
                <td>{m.appliesToFrom} → {m.appliesToTo}</td>
                <td>{m.minNights}</td>
                <td>{m.roomType}</td>
                <td><button className="cc-icon-btn" onClick={() => setState((s) => ({ ...s, minLOS: s.minLOS.filter((x) => x.id !== m.id) }))}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* FOC */}
      <Card title="FOC Policy">
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 12 }}>Configure complimentary rooms or benefits for group bookings.</p>
        <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
          {(["Applicable", "Not applicable"] as const).map((v) => (
            <label key={v} className="cc-radio-row">
              <input type="radio" checked={state.focPolicy === v} onChange={() => setState({ ...state, focPolicy: v })} />
              {v}
            </label>
          ))}
        </div>
        {state.focPolicy === "Applicable" && (
          <>
            {state.focTiers.map((t) => (
              <div key={t.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13 }}>Sell</span>
                <input className="cc-input" style={{ width: 80 }} value={t.from} onChange={(e) => setState((s) => ({ ...s, focTiers: s.focTiers.map((x) => x.id === t.id ? { ...x, from: e.target.value } : x) }))} />
                <span>to</span>
                <input className="cc-input" style={{ width: 80 }} value={t.to} onChange={(e) => setState((s) => ({ ...s, focTiers: s.focTiers.map((x) => x.id === t.id ? { ...x, to: e.target.value } : x) }))} />
                <span>paid rooms, get 1 free in</span>
                <select className="cc-input" style={{ width: 180 }} value={t.roomType} onChange={(e) => setState((s) => ({ ...s, focTiers: s.focTiers.map((x) => x.id === t.id ? { ...x, roomType: e.target.value } : x) }))}>
                  <option>All rooms</option>
                  {state.rooms.map((r) => <option key={r.id}>{r.name}</option>)}
                </select>
                <select className="cc-input" style={{ width: 120 }} value={t.mealPlan} onChange={(e) => setState((s) => ({ ...s, focTiers: s.focTiers.map((x) => x.id === t.id ? { ...x, mealPlan: e.target.value } : x) }))}>
                  <option>Any meal plan</option>
                  {state.mealPlans.map((m) => <option key={m}>{m}</option>)}
                </select>
                <button className="cc-icon-btn" onClick={() => setState((s) => ({ ...s, focTiers: s.focTiers.filter((x) => x.id !== t.id) }))}>✕</button>
              </div>
            ))}
            <button className="cc-btn cc-btn-outline" onClick={() => setState((s) => ({ ...s, focTiers: [...s.focTiers, { id: uid(), from: "", to: "", roomType: "", mealPlan: "" }] }))}>+ Add</button>
          </>
        )}
      </Card>

      {/* Early bird */}
      <Card title="Early bird offer">
        <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
          {(["Applicable", "Not applicable"] as const).map((v) => (
            <label key={v} className="cc-radio-row">
              <input type="radio" checked={state.earlyBird === v} onChange={() => setState({ ...state, earlyBird: v })} />
              {v}
            </label>
          ))}
        </div>
        {state.earlyBird === "Applicable" && (
          <>
            {state.earlyBirdRules.map((r) => (
              <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13 }}>Book</span>
                <input className="cc-input" style={{ width: 80 }} value={r.days} onChange={(e) => setState((s) => ({ ...s, earlyBirdRules: s.earlyBirdRules.map((x) => x.id === r.id ? { ...x, days: e.target.value } : x) }))} />
                <span>days before, get</span>
                <input className="cc-input" style={{ width: 80 }} value={r.discount} onChange={(e) => setState((s) => ({ ...s, earlyBirdRules: s.earlyBirdRules.map((x) => x.id === r.id ? { ...x, discount: e.target.value } : x) }))} />
                <select className="cc-input" style={{ width: 80 }} value={r.unit} onChange={(e) => setState((s) => ({ ...s, earlyBirdRules: s.earlyBirdRules.map((x) => x.id === r.id ? { ...x, unit: e.target.value as "%" | "₹" } : x) }))}>
                  <option>%</option><option>₹</option>
                </select>
                <span>off on</span>
                <select className="cc-input" style={{ width: 180 }} value={r.roomType} onChange={(e) => setState((s) => ({ ...s, earlyBirdRules: s.earlyBirdRules.map((x) => x.id === r.id ? { ...x, roomType: e.target.value } : x) }))}>
                  <option>All rooms</option>
                  {state.rooms.map((rm) => <option key={rm.id}>{rm.name}</option>)}
                </select>
                <button className="cc-icon-btn" onClick={() => setState((s) => ({ ...s, earlyBirdRules: s.earlyBirdRules.filter((x) => x.id !== r.id) }))}>✕</button>
              </div>
            ))}
            <button className="cc-btn cc-btn-outline" onClick={() => setState((s) => ({ ...s, earlyBirdRules: [...s.earlyBirdRules, { id: uid(), days: "", discount: "", unit: "%", roomType: "All rooms" }] }))}>+ Add</button>
          </>
        )}
      </Card>

      {/* Check-in restrictions */}
      <Card title="Check-in restrictions">
        <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
          {(["Applicable", "Not applicable"] as const).map((v) => (
            <label key={v} className="cc-radio-row">
              <input type="radio" checked={state.checkInRestrictions === v} onChange={() => setState({ ...state, checkInRestrictions: v })} />
              {v}
            </label>
          ))}
        </div>
        {state.checkInRestrictions === "Applicable" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: "var(--color-muted-foreground)", fontWeight: 600 }}>
              <span style={{ width: 160 }}>Check-in from</span>
              <span style={{ width: 160 }}>Check-in to</span>
              <span style={{ width: 160 }}>Room type</span>
              <span style={{ flex: 1 }}>Reason</span>
            </div>
            {state.checkInRules.map((r) => (
              <div key={r.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input type="date" className="cc-input" style={{ width: 160 }} value={r.dateFrom} onChange={(e) => setState((s) => ({ ...s, checkInRules: s.checkInRules.map((x) => x.id === r.id ? { ...x, dateFrom: e.target.value } : x) }))} />
                <input type="date" className="cc-input" style={{ width: 160 }} value={r.dateTo} onChange={(e) => setState((s) => ({ ...s, checkInRules: s.checkInRules.map((x) => x.id === r.id ? { ...x, dateTo: e.target.value } : x) }))} />
                <select className="cc-input" style={{ width: 160 }} value={r.roomType} onChange={(e) => setState((s) => ({ ...s, checkInRules: s.checkInRules.map((x) => x.id === r.id ? { ...x, roomType: e.target.value } : x) }))}>
                  <option>All rooms</option>
                  {state.rooms.map((rm) => <option key={rm.id}>{rm.name}</option>)}
                </select>
                <input className="cc-input" style={{ flex: 1 }} placeholder="Reason" value={r.reason} onChange={(e) => setState((s) => ({ ...s, checkInRules: s.checkInRules.map((x) => x.id === r.id ? { ...x, reason: e.target.value } : x) }))} />
                <button className="cc-icon-btn" onClick={() => setState((s) => ({ ...s, checkInRules: s.checkInRules.filter((x) => x.id !== r.id) }))}>✕</button>
              </div>
            ))}
            <button className="cc-btn cc-btn-outline" onClick={() => setState((s) => ({ ...s, checkInRules: [...s.checkInRules, { id: uid(), dateFrom: "", dateTo: "", roomType: "All rooms", reason: "" }] }))}>+ Add row</button>
          </>
        )}
      </Card>

      {/* Inventory */}
      <Card title="Room inventory configuration">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {(["Allotment", "Free Sale"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setState({ ...state, inventoryMode: v })}
              style={{
                padding: 16,
                borderRadius: 12,
                border: `1.5px solid ${state.inventoryMode === v ? "var(--color-primary)" : "var(--color-border)"}`,
                background: state.inventoryMode === v ? "var(--color-accent)" : "white",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                {v === "Allotment" ? "Hotel allocates fixed inventory blocks." : "Sell freely from PMS inventory."}
              </div>
            </button>
          ))}
        </div>
        <table className="cc-table cc-table-compact">
          <thead>
            <tr>
              <th>Room type</th>
              <th>PMS inventory</th>
              <th>Rooms allocated</th>
              <th>Release</th>
            </tr>
          </thead>
          <tbody>
            {state.rooms.map((r) => {
              const inv = state.inventory.find((i) => i.roomId === r.id) || { roomId: r.id, pms: "", allocated: "", release: "" };
              const upd = (patch: Partial<typeof inv>) => setState((s) => {
                const exists = s.inventory.find((i) => i.roomId === r.id);
                return { ...s, inventory: exists ? s.inventory.map((i) => i.roomId === r.id ? { ...i, ...patch } : i) : [...s.inventory, { ...inv, ...patch }] };
              });
              return (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td><input className="cc-input" style={{ width: 100 }} value={inv.pms} onChange={(e) => upd({ pms: e.target.value })} /></td>
                  <td>
                    <input
                      className="cc-input"
                      style={{ width: 100, opacity: freeSale ? 0.4 : 1 }}
                      disabled={freeSale}
                      value={inv.allocated}
                      onChange={(e) => upd({ allocated: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="cc-input"
                      style={{ width: 100, opacity: freeSale ? 0.4 : 1 }}
                      disabled={freeSale}
                      value={inv.release}
                      onChange={(e) => upd({ release: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Holding */}
      <Card title="Holding auto release rules" action={
        <button className="cc-btn cc-btn-outline" onClick={() => setState((s) => ({ ...s, holding: [...s.holding, { id: uid(), policyType: "Tentative hold", value: "", unit: "Days", trigger: "" }] }))}>+ Add</button>
      }>
        <table className="cc-table cc-table-compact">
          <thead><tr><th>Policy type</th><th>Value</th><th>Unit</th><th>Trigger</th><th></th></tr></thead>
          <tbody>
            {state.holding.map((h) => (
              <tr key={h.id}>
                <td>
                  <select className="cc-input" value={h.policyType} onChange={(e) => setState((s) => ({ ...s, holding: s.holding.map((x) => x.id === h.id ? { ...x, policyType: e.target.value as Holding["policyType"] } : x) }))}>
                    <option>Tentative hold</option><option>Release period</option><option>Payment deadline</option>
                  </select>
                </td>
                <td><input className="cc-input" style={{ width: 100 }} value={h.value} onChange={(e) => setState((s) => ({ ...s, holding: s.holding.map((x) => x.id === h.id ? { ...x, value: e.target.value } : x) }))} /></td>
                <td>
                  <select className="cc-input" style={{ width: 110 }} value={h.unit} onChange={(e) => setState((s) => ({ ...s, holding: s.holding.map((x) => x.id === h.id ? { ...x, unit: e.target.value as Holding["unit"] } : x) }))}>
                    <option>Hours</option><option>Days</option><option>Weeks</option>
                  </select>
                </td>
                <td><input className="cc-input" value={h.trigger} onChange={(e) => setState((s) => ({ ...s, holding: s.holding.map((x) => x.id === h.id ? { ...x, trigger: e.target.value } : x) }))} /></td>
                <td><button className="cc-icon-btn" onClick={() => setState((s) => ({ ...s, holding: s.holding.filter((x) => x.id !== h.id) }))}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Additional info */}
      <Card title="Policies additional information">
        <textarea className="cc-input" rows={5} value={state.policiesAdditionalInfo} onChange={(e) => setState({ ...state, policiesAdditionalInfo: e.target.value })} />
      </Card>

      {/* Cancel modal */}
      <Modal
        open={cancelModal.open}
        onClose={() => setCancelModal({ ...cancelModal, open: false })}
        title={cancelModal.type === "before" ? "Before check-in — Add rule" : "After check-in — Add rule"}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label className="cc-label">Condition</label>
            <select className="cc-input" value={draftCancel.condition} onChange={(e) => setDraftCancel({ ...draftCancel, condition: e.target.value })}>
              <option value="">Select</option>
              {(cancelModal.type === "before" ? ["Before Check-in", "Partial cancellation"] : ["Early departure", "Partial cancellation"]).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="cc-label">Type</label>
            <select className="cc-input" value={draftCancel.type} onChange={(e) => setDraftCancel({ ...draftCancel, type: e.target.value as CancelRule["type"] })}>
              <option>Days range</option>
              <option>Fixed charges</option>
            </select>
          </div>

          {draftCancel.type === "Days range" ? (
            <>
              <div>
                <label className="cc-label">From (days)</label>
                <input className="cc-input" placeholder="e.g. 30" value={draftCancel.from} onChange={(e) => setDraftCancel({ ...draftCancel, from: e.target.value })} />
              </div>
              <div>
                <label className="cc-label">To (days)</label>
                <input className="cc-input" placeholder="e.g. 60" value={draftCancel.to} onChange={(e) => setDraftCancel({ ...draftCancel, to: e.target.value })} />
              </div>
            </>
          ) : (
            <div>
              <label className="cc-label">Fixed charges amount</label>
              <input className="cc-input" placeholder="e.g. 500" value={draftCancel.from} onChange={(e) => setDraftCancel({ ...draftCancel, from: e.target.value })} />
            </div>
          )}

          <div>
            <label className="cc-label">Penalty (%)</label>
            <input className="cc-input" value={draftCancel.penalty} onChange={(e) => setDraftCancel({ ...draftCancel, penalty: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Processing fees (optional)</label>
            <input className="cc-input" placeholder="Optional" value={draftCancel.processingFees || ""} onChange={(e) => setDraftCancel({ ...draftCancel, processingFees: e.target.value })} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, gap: 8 }}>
          <button className="cc-btn cc-btn-ghost" onClick={() => setCancelModal({ ...cancelModal, open: false })}>Cancel</button>
          <button className="cc-btn cc-btn-primary" onClick={saveCancel}>Save</button>
        </div>
      </Modal>

      {/* MinLOS modal */}
      <Modal open={minlosModal} onClose={() => setMinlosModal(false)} title="Minimum Length of Stay (MinLOS)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label className="cc-label">Restriction type</label>
            <select className="cc-input" value={draftMinlos.restrictionType} onChange={(e) => setDraftMinlos({ ...draftMinlos, restrictionType: e.target.value })}>
              <option>Minimum stay</option>
            </select>
          </div>
          <div>
            <label className="cc-label">Applies from</label>
            <input type="date" className="cc-input" value={draftMinlos.appliesToFrom} onChange={(e) => setDraftMinlos({ ...draftMinlos, appliesToFrom: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Applies to</label>
            <input type="date" className="cc-input" value={draftMinlos.appliesToTo} onChange={(e) => setDraftMinlos({ ...draftMinlos, appliesToTo: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Minimum nights</label>
            <input className="cc-input" value={draftMinlos.minNights} onChange={(e) => setDraftMinlos({ ...draftMinlos, minNights: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Room type</label>
            <select className="cc-input" value={draftMinlos.roomType} onChange={(e) => setDraftMinlos({ ...draftMinlos, roomType: e.target.value })}>
              <option>All rooms</option>
              {state.rooms.map((r) => <option key={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <button className="cc-btn cc-btn-primary" onClick={() => {
            setState((s) => ({ ...s, minLOS: [...s.minLOS, { ...draftMinlos, id: uid() }] }));
            setMinlosModal(false);
          }}>Save</button>
        </div>
      </Modal>
    </div>
  );
}
