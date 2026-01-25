export type HousingChoice = 'brooklyn' | 'deal' | 'both';
export type SchoolChoice = 'magen-david' | 'hillel' | 'barkai' | 'flatbush' | 'other-private' | 'public';
export type HelpLevel = 'none' | 'cleaning' | 'day-worker' | 'full-time' | 'live-in';
export type GroceryStyle = 'budget' | 'moderate' | 'premium';
export type SimchaStyle = 'simple' | 'standard' | 'lavish';
export type VehicleType = 'economy' | 'suv' | 'luxury' | 'high-end';

export interface Child {
  id: string;
  age: number;
  gender: 'boy' | 'girl';
  school: SchoolChoice;
}

export interface LifestyleInputs {
  // Screen 1: Housing
  housing: HousingChoice;

  // Screen 2: Family
  children: Child[];
  planningMore: boolean;

  // Screen 3: Education (stored in children array)

  // Screen 4: Household Help
  helpLevel: HelpLevel;

  // Screen 5: Food & Shabbat
  groceryStyle: GroceryStyle;
  shabbatHosting: number; // 0-4: never, monthly, biweekly, weekly, multiple

  // Screen 6: Simcha Style
  simchaStyle: SimchaStyle;

  // Screen 7: Transportation
  vehicleType: VehicleType;
  vehicleCount: number;

  // Screen 8: Lifestyle Extras
  pesachAway: boolean;
  sleepawaycamp: boolean;
  clubMembership: boolean;
}

export interface CategoryCosts {
  housing: number;
  education: number;
  childcare: number;
  food: number;
  simchas: number;
  transportation: number;
  extras: number;
}

export interface CostBreakdown {
  totalAnnual: number;
  totalMonthly: number;
  categories: CategoryCosts;
}

// ============ REAL MODE TYPES ============

export type BrooklynSituation = 'mortgage' | 'paid-off' | 'rent' | 'family' | 'none';
export type DealSituation = 'own-mortgage' | 'own-paid' | 'rent' | 'family' | 'none';
export type IncomeRange = 'under-150k' | '150k-250k' | '250k-400k' | '400k-600k' | '600k-1m' | 'over-1m';
export type FamilySupport = 'ongoing' | 'occasional' | 'none';
export type PesachStyle = 'home' | 'catered' | 'hotel' | 'travel';

export interface RealModeChild extends Child {
  birthYear: number;
  expectedWeddingAge: number;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  monthlyPayment: number;
  paidOff: boolean;
}

export interface RealModeInputs {
  // Housing
  brooklynSituation: BrooklynSituation;
  brooklynMonthlyCost: number;
  brooklynPlanToBuy: boolean;
  brooklynPurchaseYear: number;
  brooklynPostPurchaseMonthlyCost: number;
  dealSituation: DealSituation;
  dealSeasonalCost: number;
  dealPlanToBuy: boolean;
  dealPurchaseYear: number;
  dealPostPurchaseCost: number;

  // Income
  incomeRange: IncomeRange;
  familySupport: FamilySupport;
  annualSupport: number;

  // Children (enhanced)
  children: RealModeChild[];

  // Education
  tuitionAssistance: number; // 0-100
  tutoringMonthly: number;
  includeIsraelTrip: boolean;

  // Lifestyle
  weeklyGroceries: number;
  diningOutMonthly: number;
  shabbatHosting: number;
  pesachStyle: PesachStyle;
  pesachCost: number;
  annualVacationBudget: number;
  sleepawaycamp: boolean;
  clubMembership: boolean;

  // Transport & Insurance
  vehicles: Vehicle[];
  healthInsuranceMonthly: number;
  otherInsuranceAnnual: number;
  tzedakahPercent: number;

  // Carry forward
  helpLevel: HelpLevel;
  simchaStyle: SimchaStyle;
}

export interface LifeEvent {
  type: 'birth' | 'school-start' | 'bar-mitzvah' | 'high-school' | 'graduation' | 'wedding' | 'house-purchase';
  childId?: string;
  childName?: string;
  description: string;
}

export interface ProjectionYear {
  year: number;
  yearLabel: string; // "Year 1", "Year 2", etc.
  costs: RealModeCategoryCosts;
  totalAnnual: number;
  events: LifeEvent[];
}

export interface RealModeCategoryCosts {
  housing: number;
  education: number;
  childcare: number;
  food: number;
  simchas: number;
  transportation: number;
  insurance: number;
  tzedakah: number;
  extras: number;
}

export interface RealModeOutput {
  projection: ProjectionYear[];
  thirtyYearTotal: number;
  peakYear: { year: number; amount: number };
  lowestYear: { year: number; amount: number };
  insights: string[];
  incomeGap: number; // positive = surplus, negative = deficit
}

export const INCOME_MIDPOINTS: Record<IncomeRange, number> = {
  'under-150k': 125000,
  '150k-250k': 200000,
  '250k-400k': 325000,
  '400k-600k': 500000,
  '600k-1m': 800000,
  'over-1m': 1500000,
};

export const defaultRealModeInputs: RealModeInputs = {
  brooklynSituation: 'rent',
  brooklynMonthlyCost: 5000,
  brooklynPlanToBuy: false,
  brooklynPurchaseYear: new Date().getFullYear() + 3,
  brooklynPostPurchaseMonthlyCost: 8000,
  dealSituation: 'none',
  dealSeasonalCost: 0,
  dealPlanToBuy: false,
  dealPurchaseYear: new Date().getFullYear() + 5,
  dealPostPurchaseCost: 25000,
  incomeRange: '250k-400k',
  familySupport: 'none',
  annualSupport: 0,
  children: [],
  tuitionAssistance: 0,
  tutoringMonthly: 0,
  includeIsraelTrip: true,
  weeklyGroceries: 600,
  diningOutMonthly: 800,
  shabbatHosting: 2,
  pesachStyle: 'home',
  pesachCost: 2000,
  annualVacationBudget: 10000,
  sleepawaycamp: false,
  clubMembership: false,
  vehicles: [],
  healthInsuranceMonthly: 0,
  otherInsuranceAnnual: 0,
  tzedakahPercent: 10,
  helpLevel: 'none',
  simchaStyle: 'standard',
};

// ============ QUICK MODE DEFAULTS ============

export const defaultInputs: LifestyleInputs = {
  housing: 'brooklyn',
  children: [],
  planningMore: false,
  helpLevel: 'none',
  groceryStyle: 'moderate',
  shabbatHosting: 2,
  simchaStyle: 'standard',
  vehicleType: 'suv',
  vehicleCount: 1,
  pesachAway: false,
  sleepawaycamp: false,
  clubMembership: false,
};
