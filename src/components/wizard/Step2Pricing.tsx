import { useState } from "react";
import { useContract, type MealPlan, type Season, type Room, type PriceCell } from "@/lib/contract";
import { Modal } from "./Modal";

const SEASON_TYPES: Season["type"][] = ["Peak", "Shoulder", "Low", "Off"];

export function Step2Pricing() {
  const { state, setState, uid } = useContract();
  const [seasonModal, setSeasonModal] = useState<{ open: boolean; editing?: Season }>({ open: false });
  const [draftSeason, setDraftSeason] = useState<Season>({ id: "", name: "", type: "Peak", from: "", to: "" });

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
    setDraftSeason({ id: "", name: "", type: "Peak", from: "", to: "" });
    setSeasonModal({ open: true });
  };
  const openEditSeason = (s: Season) => {
    setDraftSeason(s);
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
                gap: 12,
                alignItems: "center",
                fontWeight: 500,
              }}
            >
              {s.name}
              <span
                onClick={(e) => { e.stopPropagation(); openEditSeason(s); }}
                style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}
              >
                ✎
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, maxWidth: 600 }}>
          <div>
            <label className="cc-label">Date from</label>
            <input
              type="date"
              className="cc-input"
              value={activeSeason.from}
              onChange={(e) => setState((s) => ({ ...s, seasons: s.seasons.map((x) => (x.id === activeSeason.id ? { ...x, from: e.target.value } : x)) }))}
            />
          </div>
          <div>
            <label className="cc-label">Date to</label>
            <input
              type="date"
              className="cc-input"
              value={activeSeason.to}
              onChange={(e) => setState((s) => ({ ...s, seasons: s.seasons.map((x) => (x.id === activeSeason.id ? { ...x, to: e.target.value } : x)) }))}
            />
          </div>
        </div>
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
          <div>
            <label className="cc-label">Date from</label>
            <input type="date" className="cc-input" value={draftSeason.from} onChange={(e) => setDraftSeason({ ...draftSeason, from: e.target.value })} />
          </div>
          <div>
            <label className="cc-label">Date to</label>
            <input type="date" className="cc-input" value={draftSeason.to} onChange={(e) => setDraftSeason({ ...draftSeason, to: e.target.value })} />
          </div>
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
  disabledCols,
}: {
  meal: MealPlan;
  cell: PriceCell;
  setCell: (p: Partial<PriceCell>) => void;
  isBase: boolean;
  baseValue?: string;
  childCols: { key: keyof PriceCell; label: string }[];
  occCols?: { key: keyof PriceCell; label: string; disabled?: boolean }[];
  disabledCols?: string[];
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
            <input
              type="checkbox"
              checked={!!cell.enabled}
              onChange={(e) => setCell({ enabled: e.target.checked })}
              style={{ accentColor: "var(--color-primary)" }}
            />
            <input
              className="cc-input"
              style={{ width: 90 }}
              disabled={!cell.enabled}
              value={cell.addonPrice || ""}
              onChange={(e) => setCell({ addonPrice: e.target.value })}
            />
            {cell.enabled && <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>{calc}</span>}
          </div>
        )}
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
      {occCols?.map((c) => (
        <td key={c.key}>
          <input
            className="cc-input"
            style={{ width: 80 }}
            disabled={c.disabled || disabledCols?.includes(c.key as string)}
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
  const occCols = [
    { key: "p1" as const, label: "1 P" },
    { key: "p2" as const, label: "2 P" },
    { key: "p3" as const, label: "3 P" },
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="cc-table">
        <thead>
          <tr>
            <th>Room type & Meal</th>
            <th>Base</th>
            {childCols.map((c) => <th key={c.key}>{c.label}</th>)}
            {occCols.map((c) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => {
            const maxGuest = r.maxAdult + r.maxChild;
            const disabled: string[] = [];
            if (maxGuest < 2) disabled.push("p2");
            if (maxGuest < 3) disabled.push("p3");
            return (
              <FragmentRoom
                key={r.id}
                room={r}
                colSpan={2 + childCols.length + occCols.length}
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
                    occCols={occCols.map((c) => ({ ...c, disabled: disabled.includes(c.key) }))}
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
                Max adult allowed: {room.maxAdult}, Max child allowed: {room.maxChild}, Max guest: {room.maxAdult + room.maxChild}
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--color-primary)",
                  color: "white",
                }}
              >
                {room.maxAdult + room.maxChild} pax
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
