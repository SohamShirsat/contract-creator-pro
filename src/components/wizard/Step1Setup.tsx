import { useContract, type MealPlan, type ChildTier } from "@/lib/contract";

const MEAL_PLANS: { v: MealPlan; label: string }[] = [
  { v: "EP", label: "EP (Room only)" },
  { v: "CP", label: "CP (Room + breakfast)" },
  { v: "MAP", label: "MAP (Room + 2 meals)" },
  { v: "AP", label: "AP (Room + all meals)" },
];

export function Step1Setup() {
  const { state, setState, uid } = useContract();

  const updateTier = (id: string, patch: Partial<ChildTier>) =>
    setState((s) => ({ ...s, childTiers: s.childTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  const removeTier = (id: string) =>
    setState((s) => ({ ...s, childTiers: s.childTiers.filter((t) => t.id !== id) }));

  const addTier = () =>
    setState((s) => ({
      ...s,
      childTiers: [
        ...s.childTiers,
        { id: uid(), ageFrom: 0, ageTo: 0, occupancy: "Sharing with adults", bedding: "No Bed", pricingType: "Free", value: "0" },
      ],
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Setup */}
      <div className="cc-card">
        <h3 className="cc-section-title">Basic contract settings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label className="cc-label">Contract name</label>
            <input className="cc-input" value={state.contractName} onChange={(e) => setState({ ...state, contractName: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Hotel / property name</label>
            <input className="cc-input" value={state.hotelName} onChange={(e) => setState({ ...state, hotelName: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Select hotel / contract period start</label>
            <input className="cc-input" value={state.thirdField} onChange={(e) => setState({ ...state, thirdField: e.target.value })} />
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label className="cc-label">Room pricing will be based on?</label>
          <div style={{ display: "flex", gap: 24 }}>
            <label className="cc-radio-row">
              <input
                type="radio"
                checked={state.pricingBasis === "PerRoom"}
                onChange={() => setState({ ...state, pricingBasis: "PerRoom" })}
              />
              Per Room
            </label>
            <label className="cc-radio-row">
              <input
                type="radio"
                checked={state.pricingBasis === "PerPersonSharing"}
                onChange={() => setState({ ...state, pricingBasis: "PerPersonSharing" })}
              />
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
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
                    <input className="cc-input" type="number" value={t.ageFrom} onChange={(e) => updateTier(t.id, { ageFrom: +e.target.value })} />
                  </td>
                  <td>
                    <input className="cc-input" type="number" value={t.ageTo} onChange={(e) => updateTier(t.id, { ageTo: +e.target.value })} />
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
                    <button className="cc-icon-btn" onClick={() => removeTier(t.id)} aria-label="delete">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="cc-btn cc-btn-outline" style={{ marginTop: 12 }} onClick={addTier}>
          + Add row
        </button>
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginTop: 8 }}>
          Already selected years cannot be selected again.
        </p>
      </div>

      {/* Rates */}
      <div className="cc-card">
        <h3 className="cc-section-title">Rates will be</h3>
        <div style={{ display: "flex", gap: 24 }}>
          <label className="cc-radio-row">
            <input type="radio" checked={state.ratesType === "Flat"} onChange={() => setState({ ...state, ratesType: "Flat" })} />
            Flat
          </label>
          <label className="cc-radio-row">
            <input type="radio" checked={state.ratesType === "Threshold based"} onChange={() => setState({ ...state, ratesType: "Threshold based" })} />
            Threshold based
          </label>
        </div>

        {state.ratesType === "Threshold based" && (
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
