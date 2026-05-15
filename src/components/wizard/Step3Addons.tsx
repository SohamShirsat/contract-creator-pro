import { useContract, type Addon } from "@/lib/contract";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";

export function Step3Addons() {
  const { state, setState, uid } = useContract();

  const update = (id: string, patch: Partial<Addon>) =>
    setState((s) => ({ ...s, addons: s.addons.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  const remove = (id: string) => setState((s) => ({ ...s, addons: s.addons.filter((a) => a.id !== id) }));
  const add = () =>
    setState((s) => ({
      ...s,
      addons: [
        ...s.addons,
        {
          id: uid(),
          name: "",
          validOn: "All dates",
          pricingBasis: "Per Person",
          adultPrice: "",
          childPrice: "",
          sameAsAdult: false,
          applicableOn: "All rooms",
          mandatory: false,
        },
      ],
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button className="cc-btn cc-btn-primary" onClick={add} style={{ height: 36, fontSize: 13 }}>+ Add Add-on</button>
      </div>

      {state.addons.map((a) => {
        const isPerPerson = a.pricingBasis === "Per Person" || a.pricingBasis === "Per Person Per Night";
        const validChips = ["All dates", ...state.seasons.map((s) => s.name), "Only on weekends", "Date range"];
        return (
          <div key={a.id} className="cc-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="cc-label">Add-on name</label>
                <input className="cc-input" value={a.name} onChange={(e) => update(a.id, { name: e.target.value })} />
              </div>
              <button className="cc-icon-btn" onClick={() => remove(a.id)} style={{ marginTop: 22 }}>✕</button>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="cc-label">Valid on:</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {validChips.map((c) => (
                  <span
                    key={c}
                    className={`cc-chip ${a.validOn === c ? "cc-chip-active" : ""}`}
                    onClick={() => update(a.id, { validOn: c })}
                  >
                    {c}
                  </span>
                ))}
              </div>
              {a.validOn === "Date range" && (
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <input type="date" className="cc-input" style={{ width: 180 }} value={a.dateFrom || ""} onChange={(e) => update(a.id, { dateFrom: e.target.value })} />
                  <input type="date" className="cc-input" style={{ width: 180 }} value={a.dateTo || ""} onChange={(e) => update(a.id, { dateTo: e.target.value })} />
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label className="cc-label">Pricing basis</label>
                <select className="cc-input" value={a.pricingBasis} onChange={(e) => update(a.id, { pricingBasis: e.target.value as Addon["pricingBasis"] })}>
                  <option>Per Person</option>
                  <option>Per Person Per Night</option>
                  <option>Per Room</option>
                  <option>Per Room Per Night</option>
                </select>
              </div>
              {isPerPerson ? (
                <>
                  <div>
                    <label className="cc-label">Adult price (₹)</label>
                    <input className="cc-input" value={a.adultPrice || ""} onChange={(e) => update(a.id, { adultPrice: e.target.value })} />
                  </div>
                  <div>
                    <label className="cc-label">Child price (₹)</label>
                    <input
                      className="cc-input"
                      value={a.sameAsAdult ? (a.adultPrice || "") : (a.childPrice || "")}
                      disabled={!!a.sameAsAdult}
                      onChange={(e) => update(a.id, { childPrice: e.target.value })}
                    />
                    <label className="cc-radio-row" style={{ marginTop: 6, fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={!!a.sameAsAdult}
                        onChange={(e) => update(a.id, { sameAsAdult: e.target.checked })}
                      />
                      Same as adult
                    </label>
                  </div>
                </>
              ) : (
                <div>
                  <label className="cc-label">Price (₹)</label>
                  <input className="cc-input" value={a.roomPrice || ""} onChange={(e) => update(a.id, { roomPrice: e.target.value })} />
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
              {/* Applicable on — shown for all add-ons */}
              <div style={{ minWidth: 200 }}>
                <label className="cc-label">Applicable on</label>
                <MultiSelectDropdown 
                  options={["All rooms", ...state.rooms.map(r => r.name)]} 
                  value={a.applicableOn || "All rooms"} 
                  onChange={(val) => update(a.id, { applicableOn: val })} 
                />
              </div>
              <label className="cc-radio-row">
                <input type="checkbox" checked={a.mandatory} onChange={(e) => update(a.id, { mandatory: e.target.checked })} />
                Mandatory
              </label>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="cc-label">Additional information</label>
                <input className="cc-input" value={a.additionalInfo || ""} onChange={(e) => update(a.id, { additionalInfo: e.target.value })} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
