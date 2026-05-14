import { useState, type ReactNode } from "react";
import { useContract } from "@/lib/contract";

function PriceTooltip({ total, tip }: { total: string; tip: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: "relative", cursor: "default" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {total}
      {show && (
        <span style={{
          position: "absolute",
          bottom: "calc(100% + 6px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1e1e2e",
          color: "#fff",
          fontSize: 11,
          padding: "4px 8px",
          borderRadius: 6,
          whiteSpace: "nowrap",
          zIndex: 50,
          pointerEvents: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}>
          {tip}
          <span style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            borderWidth: 4,
            borderStyle: "solid",
            borderColor: "#1e1e2e transparent transparent transparent",
          }} />
        </span>
      )}
    </span>
  );
}

function EditIcon({ step, onEdit }: { step: number; onEdit: (step: number) => void }) {
  return (
    <button
      onClick={() => onEdit(step)}
      title={`Edit step ${step}`}
      style={{
        background: "none",
        border: "1px solid var(--color-border)",
        borderRadius: 6,
        padding: "4px 8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        color: "var(--color-muted-foreground)",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      Edit
    </button>
  );
}

function Section({ title, step, onEdit, children }: { title: string; step?: number; onEdit?: (step: number) => void; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="cc-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: open ? 16 : 0 }}>
        <button
          onClick={() => setOpen(!open)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: 0, cursor: "pointer", padding: 0 }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <span style={{ fontSize: 14, color: "var(--color-muted-foreground)" }}>{open ? "▾" : "▸"}</span>
        </button>
        {step && onEdit && <EditIcon step={step} onEdit={onEdit} />}
      </div>
      {open && children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>{k}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{v}</span>
    </div>
  );
}

const FACILITIES = ["Swimming Pool", "WiFi", "Gym", "Spa", "Restaurant", "Parking", "Bar", "Conference room"];

export function Step7Preview() {
  const { state, setStep } = useContract();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Section title="Setup" step={1} onEdit={setStep}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <KV k="Hotel properties" v={state.hotelProperties.join(", ") || "—"} />
          <KV k="Currency" v={state.currency} />
          <KV k="Pricing basis" v={state.pricingBasis === "PerRoom" ? "Per Room" : "Per Person Sharing"} />
          <KV k="Meal plans" v={state.mealPlans.join(", ")} />
          <KV k="Rates" v={state.ratesType} />
        </div>
        <div style={{ marginTop: 16, padding: 16, background: "var(--color-muted)", borderRadius: 8 }}>
          <strong style={{ fontSize: 13 }}>Child</strong>
          <div style={{ fontSize: 13, marginTop: 4 }}>Range: {state.childRangeFrom}y – {state.childRangeTo}y</div>
          {state.childTiers.map((t) => (
            <div key={t.id} style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>
              {t.ageFrom}–{t.ageTo}y · {t.occupancy} · {t.bedding} · {t.pricingType} {t.value}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Season & Room pricing" step={2} onEdit={setStep}>
        {state.seasons.map((s) => (
          <div key={s.id} style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>📅 {s.name}</div>
            <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 8 }}>
              {s.dateIntervals.map((i) => `${i.from} → ${i.to}`).join(" | ")}
            </div>
            <table className="cc-table cc-table-compact">
              <thead>
                <tr>
                  <th>Room & Meal</th><th>Base</th><th>AWEB</th><th>1P</th><th>2P</th><th>3P</th><th>4P</th>
                </tr>
              </thead>
              <tbody>
                {state.rooms.map((r) => (
                  <PriceRows key={r.id} seasonId={s.id} roomId={r.id} roomName={r.name} />
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </Section>

      <Section title="Add-ons" step={3} onEdit={setStep}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {state.addons.map((a) => (
            <div key={a.id} style={{ padding: 16, background: "var(--color-muted)", borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{a.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontSize: 13 }}>
                <div><strong>Valid on:</strong> {a.validOn}{a.validOn === "Date range" && a.dateFrom ? ` (${a.dateFrom} → ${a.dateTo})` : ""}</div>
                <div><strong>Pricing:</strong> {a.pricingBasis}</div>
                <div><strong>Applicable on:</strong> {a.applicableOn || "—"}</div>
                {a.adultPrice && <div><strong>Adult:</strong> ₹{a.adultPrice}</div>}
                {a.childPrice && <div><strong>Child:</strong> ₹{a.childPrice}{a.sameAsAdult ? " (same as adult)" : ""}</div>}
                {a.roomPrice && <div><strong>Price:</strong> ₹{a.roomPrice}</div>}
                <div><strong>Mandatory:</strong> {a.mandatory ? "Yes" : "No"}</div>
                {a.additionalInfo && <div style={{ gridColumn: "1 / -1" }}><strong>Info:</strong> {a.additionalInfo}</div>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Policies" step={4} onEdit={setStep}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
          <KV k="No show penalty" v={`${state.noShowPenalty}% of booking value`} />
          
          <KV k="Payment policy" v={state.paymentPolicy} />
          {state.paymentPolicy === "Collect in installments" && state.installments.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Installments</div>
              <table className="cc-table cc-table-compact">
                <thead><tr><th>Amount</th><th>When</th><th>Days</th></tr></thead>
                <tbody>
                  {state.installments.map((i) => (
                    <tr key={i.id}>
                      <td>{i.amount}%</td>
                      <td>{i.when}</td>
                      <td>{i.days} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {state.paymentDetails && state.paymentDetailsContent && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Payment details</div>
              <div style={{ padding: 12, background: "var(--color-muted)", borderRadius: 6, whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 12 }}>
                {state.paymentDetailsContent}
              </div>
            </div>
          )}

          <KV k="Modification charges" v={state.modificationCharges} />
          {state.modificationCharges === "Applicable" && (state.modificationRules || []).length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Modification rules</div>
              <table className="cc-table cc-table-compact">
                <thead><tr><th>Charge type</th><th>Applies when</th><th>Value</th><th>Additional</th><th>Unit</th></tr></thead>
                <tbody>
                  {(state.modificationRules || []).map((r) => (
                    <tr key={r.id}>
                      <td>{r.chargeType || "—"}</td>
                      <td>{r.appliesWhen || "—"}</td>
                      <td>{r.value || "—"}</td>
                      <td>{r.additional ? `+${r.additional}` : "—"}</td>
                      <td>{r.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <KV k="FOC Policy" v={state.focPolicy} />
          {state.focPolicy === "Applicable" && state.focTiers.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>FOC Tiers</div>
              <table className="cc-table cc-table-compact">
                <thead><tr><th>Condition</th><th>Free room</th><th>Meal plan</th></tr></thead>
                <tbody>
                  {state.focTiers.map((t) => (
                    <tr key={t.id}>
                      <td>Book {t.from} to {t.to} paid rooms</td>
                      <td>1 free in {t.roomType}</td>
                      <td>{t.mealPlan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <KV k="Early bird" v={state.earlyBird} />
          {state.earlyBird === "Applicable" && state.earlyBirdRules.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Early bird offers</div>
              <table className="cc-table cc-table-compact">
                <thead><tr><th>Booking window</th><th>Discount</th><th>Room type</th></tr></thead>
                <tbody>
                  {state.earlyBirdRules.map((r) => (
                    <tr key={r.id}>
                      <td>{r.days} {r.daysTo ? `to ${r.daysTo}` : ""} days before</td>
                      <td>{r.unit === "%" ? `${r.discount}%` : `₹${r.discount}`}</td>
                      <td>{r.roomType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <KV k="Check-in restrictions" v={state.checkInRestrictions} />
          {state.checkInRestrictions === "Applicable" && state.checkInRules.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Check-in rules</div>
              <table className="cc-table cc-table-compact">
                <thead><tr><th>Date range</th><th>Room type</th><th>Reason</th></tr></thead>
                <tbody>
                  {state.checkInRules.map((r) => (
                    <tr key={r.id}>
                      <td>{r.dateFrom} → {r.dateTo}</td>
                      <td>{r.roomType}</td>
                      <td>{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Cancellation (before check-in)</div>
            <table className="cc-table cc-table-compact">
              <thead><tr><th>Condition</th><th>Type</th><th>Range</th><th>Penalty</th><th>Fees</th></tr></thead>
              <tbody>
                {state.cancelBefore.map((r) => (
                  <tr key={r.id}>
                    <td>{r.condition}</td>
                    <td>{r.type}</td>
                    <td>{r.type === "Days range" ? `${r.from} – ${r.to} days` : `₹${r.from}`}</td>
                    <td>{r.penaltyUnit === "₹" ? `₹${r.penalty}` : `${r.penalty}%`}</td>
                    <td>{r.processingFees ? `${r.processingFees}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Cancellation (after check-in)</div>
            <table className="cc-table cc-table-compact">
              <thead><tr><th>Condition</th><th>Type</th><th>Charges</th><th>Penalty</th></tr></thead>
              <tbody>
                {state.cancelAfter.map((r) => (
                  <tr key={r.id}>
                    <td>{r.condition}</td>
                    <td>{r.type}</td>
                    <td>{r.type === "Days range" ? `${r.from} – ${r.to} days` : `₹${r.from}`}</td>
                    <td>{r.penaltyUnit === "₹" ? `₹${r.penalty}` : `${r.penalty}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <KV k="Inventory mode" v={state.inventoryMode} />
          
          {state.minLOS && state.minLOS.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>MinLOS (Minimum Length of Stay)</div>
              <table className="cc-table cc-table-compact">
                <thead><tr><th>Restriction type</th><th>Date range</th><th>Min nights</th><th>Room type</th></tr></thead>
                <tbody>
                  {state.minLOS.map((m) => (
                    <tr key={m.id}>
                      <td>{m.restrictionType}</td>
                      <td>{m.appliesToFrom} → {m.appliesToTo}</td>
                      <td>{m.minNights}</td>
                      <td>{m.roomType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {state.blackouts && state.blackouts.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Blackouts</div>
              <table className="cc-table cc-table-compact">
                <thead><tr><th>Room</th><th>From</th><th>To</th><th>Reason</th></tr></thead>
                <tbody>{state.blackouts.map((b) => <tr key={b.id}><td>{b.roomType}</td><td>{b.from}</td><td>{b.to}</td><td>{b.reason}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          
          {state.stopSale && state.stopSale.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Stop sale</div>
              <table className="cc-table cc-table-compact">
                <thead><tr><th>Room</th><th>From</th><th>To</th><th>Reason</th></tr></thead>
                <tbody>{state.stopSale.map((b) => <tr key={b.id}><td>{b.roomType}</td><td>{b.from}</td><td>{b.to}</td><td>{b.reason}</td></tr>)}</tbody>
              </table>
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Holding rules</div>
            <table className="cc-table cc-table-compact">
              <thead><tr><th>Policy</th><th>Value</th><th>Unit</th><th>Trigger</th></tr></thead>
              <tbody>{state.holding.map((h) => <tr key={h.id}><td>{h.policyType}</td><td>{h.value}</td><td>{h.unit}</td><td>{h.trigger}</td></tr>)}</tbody>
            </table>
          </div>
          {state.policiesAdditionalInfo && <KV k="Additional info" v={state.policiesAdditionalInfo} />}
        </div>
      </Section>

      <Section title="Surcharges, Fees, Tax & Info" step={5} onEdit={setStep}>
        <table className="cc-table cc-table-compact" style={{ marginBottom: 16 }}>
          <thead><tr><th>Name</th><th>Type</th><th>Applies on</th><th>Rule</th><th>Min</th><th>Max</th><th>Value</th></tr></thead>
          <tbody>
            {state.taxes.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td><td>{t.type}</td><td>{t.appliesOn}</td><td>{t.ruleType}</td>
                <td>{t.minValue || "—"}</td><td>{t.maxValue || "—"}</td>
                <td>{t.unit === "%" ? `${t.taxValue}%` : `₹${t.taxValue}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {state.additionalInfo && (
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 4 }}>Additional information</div>
            <p style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", margin: 0 }}>{state.additionalInfo}</p>
          </div>
        )}
      </Section>



      <Section title="Hotel details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <KV k="Hotel name" v={state.hotelName || state.hotelProperties.join(", ")} />
          <KV k="Location" v="Manali, Himachal Pradesh" />
          <KV k="Star category" v="5 Star" />
          <KV k="Contract type" v="Static" />
          <KV k="Currency" v={state.currency} />
          <KV k="Check-in / out" v="2:00 PM / 12:00 PM" />
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Rooms</h4>
        <table className="cc-table cc-table-compact" style={{ marginBottom: 16 }}>
          <thead><tr><th>Room type</th><th>No of rooms</th></tr></thead>
          <tbody>
            <tr><td>Deluxe room</td><td>20</td></tr>
            <tr><td>Suite room</td><td>10</td></tr>
          </tbody>
        </table>

        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Basic facilities</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {FACILITIES.map((f) => <span key={f} className="cc-chip cc-chip-active">{f}</span>)}
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Photo galleries</h4>
        {[3, 2, 2].map((count, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            {Array.from({ length: count }).map((_, j) => (
              <div key={j} style={{ flex: 1, height: 140, background: "var(--color-muted)", borderRadius: 8 }} />
            ))}
          </div>
        ))}
      </Section>


    </div>
  );
}

function PriceRows({ seasonId, roomId, roomName }: { seasonId: string; roomId: string; roomName: string }) {
  const { state } = useContract();
  const cells = state.pricing[seasonId]?.[roomId] || {};
  return (
    <>
      <tr style={{ background: "var(--color-muted)" }}>
        <td colSpan={7} style={{ height: 40, fontWeight: 600 }}>{roomName}</td>
      </tr>
      {state.mealPlans.map((m) => {
        const c = cells[m] || {};
        return (
          <tr key={m}>
            <td style={{ paddingLeft: 24 }}>{m}</td>
            <td>
              {m === "EP"
                ? (c.base ? `₹${c.base}` : "—")
                : c.enabled
                  ? (() => {
                      const epBase = parseFloat((cells["EP"] || {}).base || "0");
                      const addon = parseFloat(c.addonPrice || "0");
                      const total = epBase + addon;
                      return (
                        <PriceTooltip
                          total={`₹${total}`}
                          tip={`₹${epBase} base + ₹${addon} addon`}
                        />
                      );
                    })()
                  : "—"
              }
            </td>
            <td>{c.aweb ? `₹${c.aweb}` : "—"}</td>
            <td>{c.p1 ? `₹${c.p1}` : "—"}</td>
            <td>{c.p2 ? `₹${c.p2}` : "—"}</td>
            <td>{c.p3 ? `₹${c.p3}` : "—"}</td>
            <td>{c.p4 ? `₹${c.p4}` : "—"}</td>
          </tr>
        );
      })}
    </>
  );
}
