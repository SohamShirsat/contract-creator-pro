import { createContext, useContext, useState, type ReactNode } from "react";

export type MealPlan = "EP" | "CP" | "MAP" | "AP";
export type PricingBasis = "PerRoom" | "PerPersonSharing";

export interface ChildTier {
  id: string;
  ageFrom: number;
  ageTo: number;
  occupancy: "Sharing with adults" | "Own room";
  bedding: "No Bed" | "Without Bed" | "With Bed" | "Bed Included";
  pricingType: "Free" | "% Adult rate" | "Fixed";
  value: string;
}

export interface SeasonInterval {
  id: string;
  from: string;
  to: string;
}

export interface Season {
  id: string;
  name: string;
  type: "Peak" | "Shoulder" | "Low" | "Off";
  dateIntervals: SeasonInterval[];
}

export interface Room {
  id: string;
  name: string;
  maxAdult: number;
  maxChild: number;
}

// pricing[seasonId][roomId][meal] = { base, aweb, addon, enabled, cweb1, cnb1, cweb2, cnb2, p1, p2, p3, p4 }
export interface PriceCell {
  base?: string;
  aweb?: string;
  addonPrice?: string;
  enabled?: boolean;
  cweb1?: string;
  cnb1?: string;
  cweb2?: string;
  cnb2?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
}

export interface Addon {
  id: string;
  name: string;
  validOn: string;
  dateFrom?: string;
  dateTo?: string;
  pricingBasis: "Per Person" | "Per Person Per Night" | "Per Room" | "Per Room Per Night";
  adultPrice?: string;
  childPrice?: string;
  sameAsAdult?: boolean;
  roomPrice?: string;
  applicableOn?: string;
  mandatory: boolean;
  additionalInfo?: string;
}

export interface CancelRule {
  id: string;
  condition: string;
  type: "Days range" | "Fixed charges";
  from: string;
  to: string;
  penalty: string;
  penaltyUnit: "%" | "₹";
  processingFees?: string;
}

export interface Blackout {
  id: string;
  roomType: string;
  from: string;
  to: string;
  reason?: string;
}

export interface Holding {
  id: string;
  policyType: "Tentative hold" | "Release period" | "Payment deadline";
  value: string;
  unit: "Hours" | "Days" | "Weeks";
  trigger: string;
}

export interface MinLOS {
  id: string;
  restrictionType: string;
  appliesToFrom: string;
  appliesToTo: string;
  minNights: string;
  roomType: string;
}

export interface Inventory {
  roomId: string;
  pms: string;
  allocated: string;
  release: string;
}

export interface Tax {
  id: string;
  name: string;
  type: "Tax" | "Levy" | "Fee" | "Surcharge";
  appliesOn: string;
  ruleType: "Percentage" | "Flat" | "Slab-based";
  minValue: string;
  maxValue: string;
  taxValue: string;
  unit: "%" | "₹";
}

export interface Installment {
  id: string;
  amount: string;
  when: "Before check-in" | "After check-out within";
  days: string;
}

export interface ModificationRule {
  id: string;
  chargeType: string;
  appliesWhen: string;
  value: string;
  additional: string;
  unit: "%" | "₹";
}

export interface ContractState {
  // step1
  contractName: string;
  hotelName: string;
  hotelProperties: string[];
  currency: "INR" | "USD" | "AED";
  pricingBasis: PricingBasis;
  mealPlans: MealPlan[];
  childRangeFrom: number;
  childRangeTo: number;
  childTiers: ChildTier[];
  ratesType: "Net" | "Commissionable rates";
  thresholdRooms: string;
  thresholdPeriod: "Month" | "Week";
  thresholdCommission: string;
  // step2
  seasons: Season[];
  activeSeasonId: string;
  rooms: Room[];
  pricing: Record<string, Record<string, Partial<Record<MealPlan, PriceCell>>>>;
  barType: "Flat" | "Room type based";
  barFlat: string;
  barRoomDiscounts: Record<string, string>;
  // step3
  addons: Addon[];
  // step4
  noShowPenalty: string;
  cancelBefore: CancelRule[];
  cancelAfter: CancelRule[];
  modificationCharges: "Applicable" | "Not applicable";
  modificationRules: ModificationRule[];
  paymentPolicy: "Pay full amount in advance" | "Pay at month end" | "Pay full amount at check-in" | "Pay full amount at check-out" | "Collect in installments";
  installments: Installment[];
  paymentDetails: boolean;
  paymentDetailsContent: string;
  blackoutAll: boolean;
  blackouts: Blackout[];
  stopSale: Blackout[];
  minLOS: MinLOS[];
  focPolicy: "Applicable" | "Not applicable";
  focTiers: { id: string; from: string; to: string; roomType: string; mealPlan: string }[];
  earlyBird: "Applicable" | "Not applicable";
  earlyBirdRules: { id: string; days: string; daysTo: string; discount: string; unit: "%" | "₹"; roomType: string }[];
  checkInRestrictions: "Applicable" | "Not applicable";
  checkInRules: { id: string; dateFrom: string; dateTo: string; roomType: string; reason: string }[];
  inventoryMode: "Allotment" | "Free Sale";
  inventory: Inventory[];
  holding: Holding[];
  policiesAdditionalInfo: string;
  // step5
  taxes: Tax[];
  // step6
  additionalInfo: string;
  validFrom: string;
  validTo: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const initial: ContractState = {
  contractName: "Summit Hotels – Season 2025–26",
  hotelName: "The Grand Summit",
  hotelProperties: ["The Grand Summit"],
  currency: "INR",
  pricingBasis: "PerRoom",
  mealPlans: ["EP", "CP", "MAP"],
  childRangeFrom: 5,
  childRangeTo: 13,
  childTiers: [
    { id: uid(), ageFrom: 5, ageTo: 8, occupancy: "Sharing with adults", bedding: "No Bed", pricingType: "% Adult rate", value: "50" },
    { id: uid(), ageFrom: 9, ageTo: 13, occupancy: "Own room", bedding: "With Bed", pricingType: "% Adult rate", value: "75" },
  ],
  ratesType: "Net",
  thresholdRooms: "10",
  thresholdPeriod: "Month",
  thresholdCommission: "5",
  seasons: [
    { id: "s1", name: "Peak Season", type: "Peak", dateIntervals: [{ id: uid(), from: "2025-12-01", to: "2026-02-28" }] },
    { id: "s2", name: "Low Season", type: "Low", dateIntervals: [{ id: uid(), from: "2026-03-01", to: "2026-11-30" }] },
  ],
  activeSeasonId: "s1",
  rooms: [
    { id: "r1", name: "Standard Room", maxAdult: 2, maxChild: 2 },
    { id: "r2", name: "Suite Room", maxAdult: 4, maxChild: 4 },
  ],
  pricing: {
    s1: {
      r1: { EP: { base: "2000" }, CP: { addonPrice: "200", enabled: true }, MAP: { addonPrice: "400", enabled: true } },
      r2: { EP: { base: "10000" }, CP: { addonPrice: "1200", enabled: true }, MAP: { addonPrice: "2000", enabled: true } },
    },
    s2: {},
  },
  barType: "Flat",
  barFlat: "10",
  barRoomDiscounts: {},
  addons: [
    { id: uid(), name: "Christmas Dinner", validOn: "Date range", dateFrom: "2025-12-25", dateTo: "2025-12-25", pricingBasis: "Per Person", adultPrice: "3000", childPrice: "3000", sameAsAdult: true, applicableOn: "All rooms", mandatory: true },
    { id: uid(), name: "New Year Eve Dinner", validOn: "Date range", dateFrom: "2025-12-31", dateTo: "2025-12-31", pricingBasis: "Per Person", adultPrice: "3500", childPrice: "3000", sameAsAdult: false, applicableOn: "All rooms", mandatory: true },
    { id: uid(), name: "Honeymoon Package", validOn: "All dates", pricingBasis: "Per Room", roomPrice: "4500", applicableOn: "Suite Room", mandatory: false, additionalInfo: "Candle light dinner, Honeymoon cake, Flower Bed, Fruit basket, Badam Milk" },
    { id: uid(), name: "Breakfast", validOn: "All dates", pricingBasis: "Per Person", adultPrice: "500", childPrice: "300", sameAsAdult: false, applicableOn: "All rooms", mandatory: false, additionalInfo: "For child below the age of 12 years." },
  ],
  noShowPenalty: "100",
  cancelBefore: [
    { id: uid(), condition: "Before Check-in", type: "Days range", from: "30", to: "999", penalty: "0", penaltyUnit: "%", processingFees: "" },
    { id: uid(), condition: "Partial cancellation", type: "Days range", from: "15", to: "30", penalty: "25", penaltyUnit: "%", processingFees: "5" },
  ],
  cancelAfter: [
    { id: uid(), condition: "Early departure", type: "Fixed charges", from: "", to: "", penalty: "50", penaltyUnit: "%", processingFees: "10" },
    { id: uid(), condition: "Partial cancellation", type: "Fixed charges", from: "", to: "", penalty: "100", penaltyUnit: "%", processingFees: "5" },
  ],
  modificationCharges: "Not applicable",
  modificationRules: [
    { id: uid(), chargeType: "Date change", appliesWhen: "Within 15 days", value: "1000", additional: "0", unit: "₹" },
  ],
  paymentPolicy: "Pay at month end",
  installments: [
    { id: uid(), amount: "50", when: "Before check-in", days: "30" },
    { id: uid(), amount: "50", when: "Before check-in", days: "7" },
  ],
  paymentDetails: false,
  paymentDetailsContent: "",
  blackoutAll: false,
  blackouts: [
    { id: uid(), roomType: "Standard Room", from: "2026-02-01", to: "2026-02-01", reason: "Festival" },
    { id: uid(), roomType: "Standard Room", from: "2026-02-15", to: "2026-02-25", reason: "Yearly maintenance" },
  ],
  stopSale: [],
  minLOS: [
    { id: uid(), restrictionType: "Minimum stay", appliesToFrom: "2025-12-01", appliesToTo: "2026-02-28", minNights: "3", roomType: "All rooms" },
  ],
  focPolicy: "Not applicable",
  focTiers: [{ id: uid(), from: "10", to: "15", roomType: "Standard Room", mealPlan: "EP" }],
  earlyBird: "Not applicable",
  earlyBirdRules: [{ id: uid(), days: "60", daysTo: "50", discount: "10", unit: "%", roomType: "All rooms" }],
  checkInRestrictions: "Not applicable",
  checkInRules: [{ id: uid(), dateFrom: "", dateTo: "", roomType: "All rooms", reason: "" }],
  inventoryMode: "Allotment",
  inventory: [
    { roomId: "r1", pms: "20", allocated: "10", release: "30" },
    { roomId: "r2", pms: "10", allocated: "5", release: "30" },
  ],
  holding: [
    { id: uid(), policyType: "Release period", value: "30", unit: "Days", trigger: "Arrival date" },
    { id: uid(), policyType: "Payment deadline", value: "48", unit: "Hours", trigger: "After booking confirmation" },
  ],
  policiesAdditionalInfo: "",
  taxes: [
    { id: uid(), name: "GST", type: "Tax", appliesOn: "Room rate", ruleType: "Percentage", minValue: "0", maxValue: "7500", taxValue: "12", unit: "%" },
    { id: uid(), name: "Tourism development levy", type: "Levy", appliesOn: "Total bill", ruleType: "Flat", minValue: "", maxValue: "", taxValue: "100", unit: "₹" },
    { id: uid(), name: "Late checkout fees", type: "Fee", appliesOn: "Per hour", ruleType: "Flat", minValue: "", maxValue: "", taxValue: "500", unit: "₹" },
  ],
  additionalInfo: "All rates are net non-commissionable unless stated. Hotel reserves the right to adjust pricing with 30 days written notice. Child policy applies to children aged 5–13 years.",
  validFrom: "2025-12-01",
  validTo: "2026-11-30",
};

interface Ctx {
  state: ContractState;
  setState: React.Dispatch<React.SetStateAction<ContractState>>;
  step: number;
  setStep: (n: number) => void;
  uid: () => string;
  fillDummy: () => void;
}

const ContractCtx = createContext<Ctx | null>(null);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContractState>(initial);
  const [step, setStep] = useState(1);
  const fillDummy = () => setState(initial);
  return (
    <ContractCtx.Provider value={{ state, setState, step, setStep, uid, fillDummy }}>
      {children}
    </ContractCtx.Provider>
  );
}

export function useContract() {
  const ctx = useContext(ContractCtx);
  if (!ctx) throw new Error("useContract outside provider");
  return ctx;
}
