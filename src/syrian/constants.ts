// Cost data based on PRD benchmarks
// All figures are annual costs in today's dollars

export const COSTS = {
  housing: {
    // Brooklyn annual costs
    brooklyn: 90000, // Typical community rent
    // Deal costs (3 months: June-Aug)
    deal: 36000, // Seasonal rental
  },

  // Tuition by school (using grade 1-5 as baseline, will scale by age)
  tuition: {
    'magen-david': 28250,
    hillel: 19775, // ~70% of MD
    barkai: 28250,
    flatbush: 28250,
    'other-private': 25000,
    public: 0,
  },

  // Tuition multipliers by grade level
  tuitionByAge: {
    // Pre-K (age 3-4): ~40% of elementary
    3: 0.42,
    4: 0.42,
    // Kindergarten (age 5): ~80% of elementary
    5: 0.81,
    // Elementary (ages 6-10, grades 1-5): baseline
    6: 1.0,
    7: 1.0,
    8: 1.0,
    9: 1.0,
    10: 1.0,
    // Middle school (ages 11-13, grades 6-8): ~117%
    11: 1.17,
    12: 1.17,
    13: 1.17,
    // High school (ages 14-17, grades 9-12): ~156%
    14: 1.56,
    15: 1.56,
    16: 1.56,
    17: 1.56,
  } as Record<number, number>,

  // Additional education costs per child
  educationExtras: {
    registrationFee: 1500,
    familyFee: 2000, // grades 1-12 only
    fundraising: 1000,
    suppliesUniforms: 750,
  },

  // Household help annual costs
  help: {
    none: 0,
    cleaning: 7200, // Weekly cleaner (~$150/week)
    'day-worker': 31200, // 3 days/week (~$120/day × 260 days ÷ 5 × 3)
    'full-time': 62400, // 5 days/week
    'live-in': 40000, // Including room/board value
  },

  // Food costs (annual, family of 4 baseline)
  food: {
    // Grocery tiers
    grocery: {
      budget: 18000, // Moishes-level
      moderate: 30000, // Pomegranate/Ouris-level
      premium: 48000, // Prime Cut-level
    },
    // Per additional child
    groceryPerChild: 4800,
    // Shabbat hosting cost per event
    shabbatHosting: 350,
    // Events per year by frequency level (0-4)
    hostingFrequency: [0, 12, 26, 52, 104],
  },

  // Simcha costs (amortized annual for bar/bat mitzvah + wedding contributions)
  simchas: {
    // Bar/Bat Mitzvah costs (one-time, we'll amortize)
    barMitzvah: {
      simple: 15000,
      standard: 45000,
      lavish: 120000,
    },
    // Wedding costs - girl's wedding (parents pay full)
    weddingGirl: {
      simple: 175000,
      standard: 300000,
      lavish: 450000,
    },
    // Wedding costs - boy's swenne only
    weddingBoy: {
      simple: 15000,
      standard: 27500,
      lavish: 42500,
    },
    // Annual gift-giving for attending simchas
    annualGifts: 3500,
  },

  // Transportation annual costs (per vehicle)
  transportation: {
    vehicle: {
      economy: 10000, // Camry/Accord level
      suv: 15000, // Highlander/Pilot level
      luxury: 24000, // BMW/Mercedes/Lexus
      'high-end': 36000, // Range Rover/Porsche
    },
    // Fixed costs regardless of vehicle type
    insurancePerCar: 2400,
    gasMaintenancePerCar: 3600,
  },

  // Lifestyle extras (annual)
  extras: {
    pesachProgram: 30000, // Family program
    sleepawaycamp: 9000, // Per child (8 weeks)
    daycamp: 4000, // Per child
    clubMembership: 20000, // Country/beach club average
  },
};

// Helper to get tuition for a specific age and school
export function getTuitionForChild(age: number, school: keyof typeof COSTS.tuition): number {
  if (age < 3 || age > 17) return 0;
  const baseTuition = COSTS.tuition[school];
  const multiplier = COSTS.tuitionByAge[age] || 1.0;
  return Math.round(baseTuition * multiplier);
}

// School display names
export const SCHOOL_NAMES: Record<string, string> = {
  'magen-david': 'Magen David',
  hillel: 'Hillel',
  barkai: 'Barkai',
  flatbush: 'Flatbush',
  'other-private': 'Other Private',
  public: 'Public School',
};
