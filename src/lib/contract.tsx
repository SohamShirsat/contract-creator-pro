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
  daysSelection: "All days" | "Exclude weekends" | "Only weekends" | "Manual";
  selectedDays: string[];
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
  [key: string]: string | boolean | undefined;
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
  barType: "Flat" | "Room type based" | "Not allowed";
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
  contractName: "",
  hotelName: "",
  hotelProperties: [],
  currency: "INR",
  pricingBasis: "PerRoom",
  mealPlans: ["EP"],
  childRangeFrom: 5,
  childRangeTo: 13,
  childTiers: [],
  ratesType: "Net",
  thresholdRooms: "",
  thresholdPeriod: "Month",
  thresholdCommission: "",
  seasons: [],
  activeSeasonId: "",
  rooms: [],
  pricing: {},
  barType: "Flat",
  barFlat: "",
  barRoomDiscounts: {},
  addons: [],
  noShowPenalty: "100",
  cancelBefore: [],
  cancelAfter: [],
  modificationCharges: "Not applicable",
  modificationRules: [],
  paymentPolicy: "Direct payment" as any,
  installments: [],
  paymentDetails: false,
  paymentDetailsContent: "",
  blackoutAll: false,
  blackouts: [],
  stopSale: [],
  minLOS: [],
  focPolicy: "Not applicable",
  focTiers: [],
  earlyBird: "Not applicable",
  earlyBirdRules: [],
  checkInRestrictions: "Not applicable",
  checkInRules: [],
  inventoryMode: "Allotment",
  inventory: [],
  holding: [],
  policiesAdditionalInfo: "",
  taxes: [],
  additionalInfo: "",
  validFrom: "",
  validTo: "",
};

const DUMMY_SETS: ContractState[] = [
  {
    ...initial,
    contractName: "Summit Hotels – Season 2025–26",
    hotelName: "The Grand Summit",
    hotelProperties: ["The Grand Summit"],
    currency: "INR",
    pricingBasis: "PerRoom",
    mealPlans: ["EP", "CP", "MAP"],
    childTiers: [
      { id: uid(), ageFrom: 5, ageTo: 8, occupancy: "Sharing with adults", bedding: "No Bed", pricingType: "% Adult rate", value: "50" },
      { id: uid(), ageFrom: 9, ageTo: 13, occupancy: "Own room", bedding: "With Bed", pricingType: "% Adult rate", value: "75" },
    ],
    seasons: [
      { id: "s1", name: "Peak Season", type: "Peak", dateIntervals: [{ id: uid(), from: "2025-12-01", to: "2026-02-28", daysSelection: "All days", selectedDays: [] }] },
      { id: "s2", name: "Low Season", type: "Low", dateIntervals: [{ id: uid(), from: "2026-03-01", to: "2026-11-30", daysSelection: "All days", selectedDays: [] }] },
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
      s2: {
        r1: { EP: { base: "1500" }, CP: { addonPrice: "150", enabled: true }, MAP: { addonPrice: "300", enabled: true } },
        r2: { EP: { base: "8000" }, CP: { addonPrice: "1000", enabled: true }, MAP: { addonPrice: "1500", enabled: true } },
      },
    },
    addons: [
      { id: uid(), name: "Christmas Dinner", validOn: "Date range", dateFrom: "2025-12-25", dateTo: "2025-12-25", pricingBasis: "Per Person", adultPrice: "3000", childPrice: "3000", sameAsAdult: true, applicableOn: "All rooms", mandatory: true },
    ],
    cancelBefore: [{ id: uid(), condition: "Before Check-in", type: "Days range", from: "30", to: "999", penalty: "0", penaltyUnit: "%", processingFees: "" }],
    paymentPolicy: "Pay at month end",
    taxes: [{ id: uid(), name: "GST", type: "Tax", appliesOn: "Room rate", ruleType: "Percentage", minValue: "0", maxValue: "7500", taxValue: "12", unit: "%" }],
  },
  {
    ...initial,
    contractName: "Azure Bay Resort – Luxury 2026",
    hotelName: "Azure Bay Resort",
    hotelProperties: ["Azure Bay Resort"],
    currency: "USD",
    pricingBasis: "PerPersonSharing",
    mealPlans: ["EP", "CP", "MAP", "AP"],
    childTiers: [{ id: uid(), ageFrom: 3, ageTo: 12, occupancy: "Sharing with adults", bedding: "With Bed", pricingType: "Fixed", value: "150" }],
    seasons: [{ id: "s1", name: "Summer Retreat", type: "Peak", dateIntervals: [{ id: uid(), from: "2026-06-01", to: "2026-08-31", daysSelection: "All days", selectedDays: [] }] }],
    activeSeasonId: "s1",
    rooms: [
      { id: "r1", name: "Ocean View Villa", maxAdult: 2, maxChild: 1 },
      { id: "r2", name: "Presidential Beachfront", maxAdult: 6, maxChild: 4 },
    ],
    pricing: {
      s1: {
        r1: { EP: { base: "450" }, CP: { addonPrice: "40", enabled: true }, MAP: { addonPrice: "90", enabled: true }, AP: { addonPrice: "140", enabled: true } },
        r2: { EP: { base: "2500" }, CP: { addonPrice: "200", enabled: true }, MAP: { addonPrice: "450", enabled: true }, AP: { addonPrice: "700", enabled: true } },
      },
    },
    paymentPolicy: "Pay full amount in advance",
  },
  {
    ...initial,
    contractName: "Urban Elite – Business Suites 2026",
    hotelName: "Urban Elite Suites",
    hotelProperties: ["Urban Elite Suites"],
    currency: "AED",
    pricingBasis: "PerRoom",
    mealPlans: ["EP", "CP"],
    seasons: [{ id: "s1", name: "Business Year", type: "Peak", dateIntervals: [{ id: uid(), from: "2026-01-01", to: "2026-12-31", daysSelection: "Exclude weekends", selectedDays: [] }] }],
    activeSeasonId: "s1",
    rooms: [{ id: "r1", name: "Executive Suite", maxAdult: 2, maxChild: 0 }],
    pricing: { s1: { r1: { EP: { base: "800" }, CP: { addonPrice: "100", enabled: true } } } },
    paymentPolicy: "Pay full amount at check-out",
  }
];

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
  const [state, setState] = useState<ContractState>(DUMMY_SETS[0]);
  const [step, setStep] = useState(1);
  const fillDummy = () => {
    setState(DUMMY_SETS[0]);
  };
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
