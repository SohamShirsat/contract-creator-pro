import { useState } from "react";
import { useContract, type MealPlan, type Season, type Room, type PriceCell, type SeasonInterval } from "@/lib/contract";
import { Modal } from "./Modal";

const SEASON_TYPES: Season["type"][] = ["Peak", "Shoulder", "Low", "Off"];

export function Step2Pricing() {
  const { state, setState, uid } = useContract();
  const [seasonModal, setSeasonModal] = useState<{ open: boolean; editing?: Season }>({ open: false });
  const [draftSeason, setDraftSeason] = useState<Season>({ id: "", name: "", type: "Peak", dateIntervals: [] });

  const activeSeason = state.seasons.find((s) => s.id === state.activeSeasonId)!;
  const childTiers = state.childTiers;
  const tier1 = childTiers[0];
  const tier2 = childTiers[1];

  const setPriceCell = (roomId: string, meal: MealPlan, patch: Partial<PriceCell>) => {
    setState((s) => {
      const sid = s.activeSeasonId;
      const next = { ...s.pricing };
      next[sid] = { ...(next[sid] || {}) };
      next[sid][roomId] = { ...(next[sid][roomId] || {}) };
      next[sid][roomId][meal] = { ...(next[sid][roomId][meal] || {}), ...patch };
      return { ...s, pricing: next };
    });
  };

  const getCell = (roomId: string, meal: MealPlan): PriceCell =>
    state.pricing[state.activeSeasonId]?.[roomId]?.[meal] || {};

  const removeRoom = (roomId: string) =>
    setState((s) => ({ ...s, rooms: s.rooms.filter((r) => r.id !== roomId) }));

  const addRoom = () =>
    setState((s) => ({
      ...s,
      rooms: [...s.rooms, { id: uid(), name: "New Room", maxAdult: 2, maxChild: 2 }],
    }));

  const openAddSeason = () => {
    setDraftSeason({ id: "", name: "", type: "Peak", dateIntervals: [{ id: uid(), from: "", to: "" }] });
    setSeasonModal({ open: true });
  };
  const openEditSeason = (s: Season) => {
    setDraftSeason({ ...s, dateIntervals: s.dateIntervals.length ? s.dateIntervals : [{ id: uid(), from: "", to: "" }] });
    setSeasonModal({ open: true, editing: s });
  };
  const saveSeason = () => {
    if (seasonModal.editing) {
      setState((s) => ({ ...s, seasons: s.seasons.map((x) => (x.id === draftSeason.id ? draftSeason : x)) }));
    } else {
      const newSeason = { ...draftSeason, id: uid() };
      setState((s) => ({ ...s, seasons: [...s.seasons, newSeason], activeSeasonId: newSeason.id }));
    }
    setSeasonModal({ open: false });
  };

  const addInterval = () =>
    setDraftSeason((d) => ({ ...d, dateIntervals: [...d.dateIntervals, { id: uid(), from: "", to: "" }] }));
  const removeInterval = (id: string) =>
    setDraftSeason((d) => ({ ...d, dateIntervals: d.dateIntervals.filter((i) => i.id !== id) }));
  const updateInterval = (id: string, patch: Partial<SeasonInterval>) =>
    setDraftSeason((d) => ({ ...d, dateIntervals: d.dateIntervals.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

  const formatSeasonDates = (s: Season) => {
    if (!s.dateIntervals.length) return "No dates";
    const first = s.dateIntervals[0];
    const extra = s.dateIntervals.length > 1 ? ` +${s.dateIntervals.length - 1} more` : "";
    if (!first.from && !first.to) return "No dates";
    return `${first.from || "—"} → ${first.to || "—"}${extra}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Season */}
      <div className="cc-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 className="cc-section-title" style={{ marginBottom: 0 }}>Season</h3>
          <button className="cc-btn cc-btn-outline" onClick={openAddSeason}>+ Add Season</button>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {state.seasons.map((s) => (
            <button
              key={s.id}
              onClick={() => setState((p) => ({ ...p, activeSeasonId: s.id }))}
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: `1.5px solid ${s.id === state.activeSeasonId ? "var(--color-primary)" : "var(--color-border)"}`,
                background: s.id === state.activeSeasonId ? "var(--color-accent)" : "white",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                alignItems: "flex-start",
                fontWeight: 500,
                minWidth: 160,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <span>{s.name}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); openEditSeason(s); }}
                  style={{ fontSize: 13, color: "var(--color-muted-foreground)", marginLeft: "auto" }}
                >
                  ✎
                </span>
              </div>
              <span style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontWeight: 400 }}>{formatSeasonDates(s)}</span>
            </button>
          ))}
        </div>

        {/* Active season interval editor */}
        {activeSeason && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              Date intervals for <span style={{ color: "var(--color-primary)" }}>{activeSeason.name}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeSeason.dateIntervals.map((interval, idx) => (
                <div key={interval.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--color-muted-foreground)", minWidth: 70 }}>Interval {idx + 1}</span>
                  <input
                    type="date"
                    className="cc-input"
                    style={{ width: 180 }}
                    value={interval.from}
                    onChange={(e) => {
                      const val = e.target.value;
                      setState((s) => ({
                        ...s,
                        seasons: s.seasons.map((sea) =>
                          sea.id === activeSeason.id
                            ? { ...sea, dateIntervals: sea.dateIntervals.map((i) => i.id === interval.id ? { ...i, from: val } : i) }
                            : sea
                        ),
                      }));
                    }}
                  />
                  <span style={{ color: "var(--color-muted-foreground)" }}>→</span>
                  <input
                    type="date"
                    className="cc-input"
                    style={{ width: 180 }}
                    value={interval.to}
                    onChange={(e) => {
                      const val = e.target.value;
                      setState((s) => ({
                        ...s,
                        seasons: s.seasons.map((sea) =>
                          sea.id === activeSeason.id
                            ? { ...sea, dateIntervals: sea.dateIntervals.map((i) => i.id === interval.id ? { ...i, to: val } : i) }
                            : sea
                        ),
                      }));
                    }}
                  />
                  {activeSeason.dateIntervals.length > 1 && (
                    <button className="cc-icon-btn" onClick={() => {
                      setState((s) => ({
                        ...s,
                        seasons: s.seasons.map((sea) =>
                          sea.id === activeSeason.id
                            ? { ...sea, dateIntervals: sea.dateIntervals.filter((i) => i.id !== interval.id) }
                            : sea
                        ),
                      }));
                    }}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="cc-btn cc-btn-outline"
              style={{ marginTop: 8 }}
              onClick={() => {
                setState((s) => ({
                  ...s,
                  seasons: s.seasons.map((sea) =>
                    sea.id === activeSeason.id
                      ? { ...sea, dateIntervals: [...sea.dateIntervals, { id: uid(), from: "", to: "" }] }
                      : sea
                  ),
                }));
              }}
            >
              + Add date interval
            </button>
          </div>
        )}
      </div>

      {/* Pricing table */}
      <div className="cc-card">
        <h3 className="cc-section-title">
          Room pricing for {activeSeason.name} (per {state.pricingBasis === "PerRoom" ? "room" : "person"} / per night)
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 13 }}>Apply bulk price to:</span>
          <select className="cc-input" style={{ width: 200 }}>
            {state.seasons.map((s) => <option key={s.id}>{s.name}</option>)}
          </select>
          <button className="cc-btn cc-btn-outline">Apply</button>
        </div>

        {state.pricingBasis === "PerRoom" ? (
          <PerRoomTable
            rooms={state.rooms}
            mealPlans={state.mealPlans}
            getCell={getCell}
            setCell={setPriceCell}
            removeRoom={removeRoom}
            tier1={tier1}
            tier2={tier2}
          />
        ) : (
          <PerPersonTable
            rooms={state.rooms}
            mealPlans={state.mealPlans}
            getCell={getCell}
            setCell={setPriceCell}
            removeRoom={removeRoom}
          />
        )}

        <button className="cc-btn cc-btn-outline" style={{ marginTop: 12 }} onClick={addRoom}>
          + Add Room Type
        </button>
      </div>

      {/* BAR */}
      <div className="cc-card">
        <h3 className="cc-section-title">BAR (Best Available Rates) discount</h3>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 16, padding: "8px 12px", background: "oklch(0.97 0.01 220)", borderRadius: 8, border: "1px solid oklch(0.85 0.04 220)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.1 220)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <span style={{ fontSize: 12, color: "oklch(0.4 0.08 220)", lineHeight: 1.5 }}>
            Prices will be updated directly from PMS in real time and below discount will be applicable on rates.
          </span>
        </div>
        <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
          <label className="cc-radio-row">
            <input type="radio" checked={state.barType === "Flat"} onChange={() => setState({ ...state, barType: "Flat" })} />
            Flat
          </label>
          <label className="cc-radio-row">
            <input type="radio" checked={state.barType === "Room type based"} onChange={() => setState({ ...state, barType: "Room type based" })} />
            Room type based
          </label>
        </div>

        {state.barType === "Flat" ? (
          <div style={{ maxWidth: 200 }}>
            <label className="cc-label">Discount (%)</label>
            <input className="cc-input" value={state.barFlat} onChange={(e) => setState({ ...state, barFlat: e.target.value })} />
          </div>
        ) : (
          <table className="cc-table cc-table-compact">
            <thead><tr><th>Room type</th><th>Discount (%)</th></tr></thead>
            <tbody>
              {state.rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    <input
                      className="cc-input"
                      style={{ width: 120 }}
                      value={state.barRoomDiscounts[r.id] || ""}
                      onChange={(e) => setState((s) => ({ ...s, barRoomDiscounts: { ...s.barRoomDiscounts, [r.id]: e.target.value } }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginTop: 12 }}>
          Note: We can add Floor pricing in BAR.
        </p>
      </div>

      {/* Season modal */}
      <Modal
        open={seasonModal.open}
        onClose={() => setSeasonModal({ open: false })}
        title={seasonModal.editing ? "Update season" : "Add season"}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label className="cc-label">Season name</label>
            <input className="cc-input" value={draftSeason.name} onChange={(e) => setDraftSeason({ ...draftSeason, name: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Type</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8 }}>
              {SEASON_TYPES.map((t) => (
                <span
                  key={t}
                  className={`cc-chip ${draftSeason.type === t ? "cc-chip-active" : ""}`}
                  onClick={() => setDraftSeason({ ...draftSeason, type: t })}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="cc-label">Date intervals</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {draftSeason.dateIntervals.map((interval, idx) => (
              <div key={interval.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--color-muted-foreground)", minWidth: 60 }}>Interval {idx + 1}</span>
                <input type="date" className="cc-input" style={{ width: 160 }} value={interval.from} onChange={(e) => updateInterval(interval.id, { from: e.target.value })} />
                <span>→</span>
                <input type="date" className="cc-input" style={{ width: 160 }} value={interval.to} onChange={(e) => updateInterval(interval.id, { to: e.target.value })} />
                {draftSeason.dateIntervals.length > 1 && (
                  <button className="cc-icon-btn" onClick={() => removeInterval(interval.id)}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button className="cc-btn cc-btn-outline" style={{ marginTop: 8 }} onClick={addInterval}>+ Add interval</button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
          <button className="cc-btn cc-btn-ghost" onClick={() => setSeasonModal({ open: false })}>Cancel</button>
          <button className="cc-btn cc-btn-primary" onClick={saveSeason}>
            {seasonModal.editing ? "Update" : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function MealRow({
  meal,
  cell,
  setCell,
  isBase,
  baseValue,
  childCols,
  occCols,
}: {
  meal: MealPlan;
  cell: PriceCell;
  setCell: (p: Partial<PriceCell>) => void;
  isBase: boolean;
  baseValue?: string;
  childCols: { key: keyof PriceCell; label: string }[];
  occCols: { key: keyof PriceCell; label: string; disabled?: boolean }[];
}) {
  const calc = (() => {
    const b = parseFloat(baseValue || "0");
    const a = parseFloat(cell.addonPrice || "0");
    return isNaN(b + a) ? "" : `= ₹${b + a}`;
  })();
  return (
    <tr>
      <td style={{ paddingLeft: 32, fontSize: 13, fontWeight: 500 }}>{meal}</td>
      <td>
        {isBase ? (
          <input className="cc-input" style={{ width: 110 }} value={cell.base || ""} onChange={(e) => setCell({ base: e.target.value })} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={!!cell.enabled} onChange={(e) => setCell({ enabled: e.target.checked })} style={{ accentColor: "var(--color-primary)" }} />
            <input className="cc-input" style={{ width: 90 }} disabled={!cell.enabled} value={cell.addonPrice || ""} onChange={(e) => setCell({ addonPrice: e.target.value })} />
            {cell.enabled && <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>{calc}</span>}
          </div>
        )}
      </td>
      {/* AWEB column */}
      <td>
        <input className="cc-input" style={{ width: 90 }} value={cell.aweb || ""} onChange={(e) => setCell({ aweb: e.target.value })} />
      </td>
      {childCols.map((c) => (
        <td key={c.key}>
          <input
            className="cc-input"
            style={{ width: 90 }}
            value={(cell[c.key] as string) || ""}
            onChange={(e) => setCell({ [c.key]: e.target.value } as Partial<PriceCell>)}
          />
        </td>
      ))}
      {occCols.map((c) => (
        <td key={c.key}>
          <input
            className="cc-input"
            style={{ width: 80, opacity: c.disabled ? 0.4 : 1 }}
            disabled={c.disabled}
            value={(cell[c.key] as string) || ""}
            onChange={(e) => setCell({ [c.key]: e.target.value } as Partial<PriceCell>)}
          />
        </td>
      ))}
    </tr>
  );
}

function PerRoomTable({
  rooms, mealPlans, getCell, setCell, removeRoom, tier1, tier2,
}: {
  rooms: Room[];
  mealPlans: MealPlan[];
  getCell: (rid: string, m: MealPlan) => PriceCell;
  setCell: (rid: string, m: MealPlan, p: Partial<PriceCell>) => void;
  removeRoom: (rid: string) => void;
  tier1?: { ageFrom: number; ageTo: number };
  tier2?: { ageFrom: number; ageTo: number };
}) {
  const childCols = [
    tier1 && { key: "cweb1" as const, label: `CWEB(${tier1.ageFrom}y–${tier1.ageTo}y)` },
    tier1 && { key: "cnb1" as const, label: `CNB(${tier1.ageFrom}y–${tier1.ageTo}y)` },
    tier2 && { key: "cweb2" as const, label: `CWEB(${tier2.ageFrom}y–${tier2.ageTo}y)` },
    tier2 && { key: "cnb2" as const, label: `CNB(${tier2.ageFrom}y–${tier2.ageTo}y)` },
  ].filter(Boolean) as { key: keyof PriceCell; label: string }[];

  const allOccCols: { key: keyof PriceCell; label: string }[] = [
    { key: "p1", label: "1P" },
    { key: "p2", label: "2P" },
    { key: "p3", label: "3P" },
    { key: "p4", label: "4P" },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="cc-table">
        <thead>
          <tr>
            <th>Room type & Meal</th>
            <th>Base</th>
            <th>AWEB</th>
            {childCols.map((c) => <th key={c.key}>{c.label}</th>)}
            {allOccCols.map((c) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => {
            // disable cols where pax >= maxAdult (base = maxAdult pax; above maxAdult = can't fit)
            const occCols = allOccCols.map((c) => {
              const paxNum = parseInt(c.key.slice(1)); // p1→1, p2→2, p3→3, p4→4
              return { ...c, disabled: paxNum >= r.maxAdult };
            });
            return (
              <FragmentRoom
                key={r.id}
                room={r}
                colSpan={3 + childCols.length + allOccCols.length}
                onRemove={() => removeRoom(r.id)}
              >
                {mealPlans.map((m) => (
                  <MealRow
                    key={m}
                    meal={m}
                    cell={getCell(r.id, m)}
                    setCell={(p) => setCell(r.id, m, p)}
                    isBase={m === "EP"}
                    baseValue={getCell(r.id, "EP").base}
                    childCols={childCols}
                    occCols={occCols}
                  />
                ))}
              </FragmentRoom>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PerPersonTable({
  rooms, mealPlans, getCell, setCell, removeRoom,
}: {
  rooms: Room[];
  mealPlans: MealPlan[];
  getCell: (rid: string, m: MealPlan) => PriceCell;
  setCell: (rid: string, m: MealPlan, p: Partial<PriceCell>) => void;
  removeRoom: (rid: string) => void;
}) {
  const occCols = [
    { key: "p1" as const, label: "Single occupancy (1P)" },
    { key: "p2" as const, label: "Per person sharing (2P)" },
    { key: "p3" as const, label: "Third Adult (3P)" },
  ];
  const childCols = [
    { key: "cweb1" as const, label: "CWEB" },
    { key: "cnb1" as const, label: "CNB" },
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="cc-table">
        <thead>
          <tr>
            <th>Room type & Meal</th>
            <th>Base</th>
            {occCols.map((c) => <th key={c.key}>{c.label}</th>)}
            {childCols.map((c) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <FragmentRoom
              key={r.id}
              room={r}
              colSpan={2 + occCols.length + childCols.length}
              onRemove={() => removeRoom(r.id)}
            >
              {mealPlans.map((m) => (
                <MealRow
                  key={m}
                  meal={m}
                  cell={getCell(r.id, m)}
                  setCell={(p) => setCell(r.id, m, p)}
                  isBase={m === "EP"}
                  baseValue={getCell(r.id, "EP").base}
                  childCols={childCols}
                  occCols={occCols}
                />
              ))}
            </FragmentRoom>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRoom({ room, colSpan, onRemove, children }: { room: Room; colSpan: number; onRemove: () => void; children: React.ReactNode }) {
  return (
    <>
      <tr style={{ background: "var(--color-muted)" }}>
        <td colSpan={colSpan} style={{ height: 50 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <strong>{room.name}</strong>
              <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                Max adult: {room.maxAdult} · Max child: {room.maxChild} · Base: {room.maxAdult} pax
              </span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-primary)", color: "white" }}>
                {room.maxAdult} pax base
              </span>
            </div>
            <button onClick={onRemove} style={{ background: "none", border: 0, color: "var(--color-destructive)", cursor: "pointer", fontSize: 13 }}>
              Remove
            </button>
          </div>
        </td>
      </tr>
      {children}
    </>
  );
}
