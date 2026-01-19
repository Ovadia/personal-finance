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
