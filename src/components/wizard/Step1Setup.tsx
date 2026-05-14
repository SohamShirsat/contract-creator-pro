import { useState } from "react";
import { useContract, type MealPlan, type ChildTier } from "@/lib/contract";

const MEAL_PLANS: { v: MealPlan; label: string }[] = [
  { v: "EP", label: "EP (Room only)" },
  { v: "CP", label: "CP (Room + breakfast)" },
  { v: "MAP", label: "MAP (Room + 2 meals)" },
  { v: "AP", label: "AP (Room + all meals)" },
];

const HOTEL_OPTIONS = [
  "The Grand Summit",
  "Hotel Royal Palace",
  "The Mountain View Resort",
  "Heritage Hotels Group",
  "Riverside Boutique Hotel",
];

const CURRENCIES = [
  { v: "INR" as const, label: "INR (₹)" },
  { v: "USD" as const, label: "USD ($)" },
  { v: "AED" as const, label: "AED (د.إ)" },
];

function HotelMultiSelect({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((x) => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cc-input"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
          height: 46,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected.length === 0 ? "Select hotel properties…" : selected.join(", ")}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "white", border: "1.5px solid var(--color-border)", borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 100, padding: 4,
          }}>
            {HOTEL_OPTIONS.map((opt) => (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", cursor: "pointer", borderRadius: 6, fontSize: 14 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }} />
                {opt}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Step1Setup() {
  const { state, setState, uid, fillDummy } = useContract();

  const updateTier = (id: string, patch: Partial<ChildTier>) =>
    setState((s) => ({ ...s, childTiers: s.childTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  const removeTier = (id: string) =>
    setState((s) => ({ ...s, childTiers: s.childTiers.filter((t) => t.id !== id) }));

  const addTier = () =>
    setState((s) => ({
      ...s,
      childTiers: [
        ...s.childTiers,
        { id: uid(), ageFrom: s.childRangeFrom, ageTo: s.childRangeTo, occupancy: "Sharing with adults", bedding: "No Bed", pricingType: "Free", value: "0" },
      ],
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Fill dummy data */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="cc-btn cc-btn-outline"
          onClick={fillDummy}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
            <path d="M7 7h.01" />
          </svg>
          Fill dummy data
        </button>
      </div>

      {/* Basic settings */}
      <div className="cc-card">
        <h3 className="cc-section-title">Basic contract settings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label className="cc-label">Contract name</label>
            <input className="cc-input" value={state.contractName} onChange={(e) => setState({ ...state, contractName: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Hotel / property name</label>
            <HotelMultiSelect
              selected={state.hotelProperties}
              onChange={(v) => setState({ ...state, hotelProperties: v, hotelName: v[0] || "" })}
            />
          </div>
          <div>
            <label className="cc-label">Currency</label>
            <select className="cc-input" value={state.currency} onChange={(e) => setState({ ...state, currency: e.target.value as "INR" | "USD" | "AED" })}>
              {CURRENCIES.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label className="cc-label">Room pricing will be based on?</label>
          <div style={{ display: "flex", gap: 24 }}>
            <label className="cc-radio-row">
              <input type="radio" checked={state.pricingBasis === "PerRoom"} onChange={() => setState({ ...state, pricingBasis: "PerRoom" })} />
              Per Room
            </label>
            <label className="cc-radio-row">
              <input type="radio" checked={state.pricingBasis === "PerPersonSharing"} onChange={() => setState({ ...state, pricingBasis: "PerPersonSharing" })} />
              Per Person Sharing
            </label>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label className="cc-label">Supported meal plans</label>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {MEAL_PLANS.map((m) => (
              <label key={m.v} className="cc-radio-row">
                <input
                  type="checkbox"
                  checked={state.mealPlans.includes(m.v)}
                  onChange={(e) => {
                    setState((s) => ({
                      ...s,
                      mealPlans: e.target.checked ? [...s.mealPlans, m.v] : s.mealPlans.filter((x) => x !== m.v),
                    }));
                  }}
                />
                {m.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Child */}
      <div className="cc-card">
        <h3 className="cc-section-title">Child</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 13 }}>Enter child range</span>
          <input
            className="cc-input"
            style={{ width: 80 }}
            type="number"
            value={state.childRangeFrom}
            onChange={(e) => setState({ ...state, childRangeFrom: +e.target.value })}
          />
          <span>–</span>
          <input
            className="cc-input"
            style={{ width: 80 }}
            type="number"
            value={state.childRangeTo}
            onChange={(e) => setState({ ...state, childRangeTo: +e.target.value })}
          />
          <span style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>years</span>
        </div>

        {/* Complementary info */}
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 12, padding: "8px 12px", background: "oklch(0.97 0.01 220)", borderRadius: 8, border: "1px solid oklch(0.85 0.04 220)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.1 220)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <span style={{ fontSize: 12, color: "oklch(0.4 0.08 220)", lineHeight: 1.5 }}>
            Below {state.childRangeFrom}y child will be considered as complimentary.
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="cc-table">
            <thead>
              <tr>
                <th>Age from</th>
                <th>Age to</th>
                <th>Occupancy condition</th>
                <th>Bedding</th>
                <th>Pricing type</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state.childTiers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <input
                      className="cc-input"
                      type="number"
                      value={t.ageFrom}
                      min={state.childRangeFrom}
                      onChange={(e) => updateTier(t.id, { ageFrom: Math.max(state.childRangeFrom, +e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      className="cc-input"
                      type="number"
                      value={t.ageTo}
                      max={state.childRangeTo}
                      onChange={(e) => updateTier(t.id, { ageTo: Math.min(state.childRangeTo, +e.target.value) })}
                    />
                  </td>
                  <td>
                    <select className="cc-input" value={t.occupancy} onChange={(e) => updateTier(t.id, { occupancy: e.target.value as ChildTier["occupancy"] })}>
                      <option>Sharing with adults</option>
                      <option>Own room</option>
                    </select>
                  </td>
                  <td>
                    <select className="cc-input" value={t.bedding} onChange={(e) => updateTier(t.id, { bedding: e.target.value as ChildTier["bedding"] })}>
                      <option>No Bed</option>
                      <option>Without Bed</option>
                      <option>With Bed</option>
                      <option>Bed Included</option>
                    </select>
                  </td>
                  <td>
                    <select className="cc-input" value={t.pricingType} onChange={(e) => updateTier(t.id, { pricingType: e.target.value as ChildTier["pricingType"] })}>
                      <option>Free</option>
                      <option>% Adult rate</option>
                      <option>Fixed</option>
                    </select>
                  </td>
                  <td>
                    <input className="cc-input" value={t.value} onChange={(e) => updateTier(t.id, { value: e.target.value })} />
                  </td>
                  <td>
                    <button className="cc-icon-btn" onClick={() => removeTier(t.id)} aria-label="delete">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="cc-btn cc-btn-outline" style={{ marginTop: 12 }} onClick={addTier}>
          + Add row
        </button>

        {/* Info messages */}
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <InfoMsg text="This rate will be overridden by room/date specific CWeB and CNB." />
          <InfoMsg text={`Decimal ages are treated as the next whole number. Example: 5.1 years will be treated as 6 years.`} />
        </div>
      </div>

      {/* Rates will be */}
      <div className="cc-card">
        <h3 className="cc-section-title">Rates will be</h3>
        <div style={{ display: "flex", gap: 24 }}>
          <label className="cc-radio-row">
            <input type="radio" checked={state.ratesType === "Net"} onChange={() => setState({ ...state, ratesType: "Net" })} />
            Net
          </label>
          <label className="cc-radio-row">
            <input type="radio" checked={state.ratesType === "Commissionable rates"} onChange={() => setState({ ...state, ratesType: "Commissionable rates" })} />
            Commissionable rates
          </label>
        </div>

        {state.ratesType === "Commissionable rates" && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 14 }}>
            Sold more than
            <input className="cc-input" style={{ width: 90 }} value={state.thresholdRooms} onChange={(e) => setState({ ...state, thresholdRooms: e.target.value })} />
            rooms in a
            <select className="cc-input" style={{ width: 110 }} value={state.thresholdPeriod} onChange={(e) => setState({ ...state, thresholdPeriod: e.target.value as "Month" | "Week" })}>
              <option>Month</option>
              <option>Week</option>
            </select>
            , You get
            <input className="cc-input" style={{ width: 80 }} value={state.thresholdCommission} onChange={(e) => setState({ ...state, thresholdCommission: e.target.value })} />
            % commission of the total booking amount.
          </div>
        )}
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginTop: 12 }}>
          Note: We can add Floor pricing in BAR (Best Available Rates).
        </p>
      </div>
    </div>
  );
}

function InfoMsg({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "7px 10px", background: "oklch(0.97 0.01 220)", borderRadius: 6, border: "1px solid oklch(0.88 0.03 220)" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.1 220)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
      </svg>
      <span style={{ fontSize: 12, color: "oklch(0.4 0.08 220)", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}
