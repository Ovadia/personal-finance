import {
  RealModeInputs,
  RealModeOutput,
  ProjectionYear,
  RealModeCategoryCosts,
  LifeEvent,
  RealModeChild,
  INCOME_MIDPOINTS,
} from './types';
import { COSTS, getTuitionForChild } from './constants';

const CURRENT_YEAR = new Date().getFullYear();

export function generate30YearProjection(inputs: RealModeInputs): RealModeOutput {
  const projection: ProjectionYear[] = [];

  for (let year = 0; year < 30; year++) {
    const costs = calculateYearCosts(inputs, year);
    const events = getEventsForYear(inputs, year);

    projection.push({
      year,
      yearLabel: `Year ${year + 1}`,
      costs,
      totalAnnual: sumCosts(costs),
      events,
    });
  }

  const totals = projection.map((p) => p.totalAnnual);
  const thirtyYearTotal = totals.reduce((sum, t) => sum + t, 0);
  const peakIdx = totals.indexOf(Math.max(...totals));
  const lowestIdx = totals.indexOf(Math.min(...totals));

  const income = INCOME_MIDPOINTS[inputs.incomeRange] + inputs.annualSupport;
  const currentExpenses = projection[0].totalAnnual;

  return {
    projection,
    thirtyYearTotal,
    peakYear: { year: peakIdx, amount: totals[peakIdx] },
    lowestYear: { year: lowestIdx, amount: totals[lowestIdx] },
    insights: generateInsights(projection, inputs),
    incomeGap: income - currentExpenses,
  };
}

function calculateYearCosts(inputs: RealModeInputs, year: number): RealModeCategoryCosts {
  return {
    housing: calculateHousingForYear(inputs, year),
    education: calculateEducationForYear(inputs, year),
    childcare: calculateChildcareForYear(inputs, year),
    food: calculateFoodForYear(inputs, year),
    simchas: calculateSimchasForYear(inputs, year),
    transportation: calculateTransportForYear(inputs, year),
    insurance: calculateInsuranceForYear(inputs, year),
    tzedakah: calculateTzedakahForYear(inputs, year),
    extras: calculateExtrasForYear(inputs, year),
  };
}

function sumCosts(costs: RealModeCategoryCosts): number {
  return Object.values(costs).reduce((sum, val) => sum + val, 0);
}

// ============ HOUSING ============

function calculateHousingForYear(inputs: RealModeInputs, year: number): number {
  let total = 0;
  const calendarYear = CURRENT_YEAR + year;

  // Brooklyn
  if (inputs.brooklynSituation !== 'none') {
    // Check if planning to buy and if this year is after purchase
    if (inputs.brooklynSituation === 'rent' && inputs.brooklynPlanToBuy && calendarYear >= inputs.brooklynPurchaseYear) {
      // After purchase: use post-purchase mortgage cost
      total += inputs.brooklynPostPurchaseMonthlyCost * 12;
    } else {
      // Before purchase or not planning to buy: use current cost
      total += inputs.brooklynMonthlyCost * 12;
    }
  }

  // Deal (seasonal)
  if (inputs.dealSituation !== 'none') {
    // Check if planning to buy and if this year is after purchase
    if (inputs.dealSituation === 'rent' && inputs.dealPlanToBuy && calendarYear >= inputs.dealPurchaseYear) {
      // After purchase: use post-purchase cost
      total += inputs.dealPostPurchaseCost;
    } else {
      // Before purchase or not planning to buy: use current cost
      total += inputs.dealSeasonalCost;
    }
  }

  return total;
}

// ============ EDUCATION ============

function calculateEducationForYear(inputs: RealModeInputs, year: number): number {
  let total = 0;
  const assistanceMultiplier = (100 - inputs.tuitionAssistance) / 100;

  for (const child of inputs.children) {
    const childAge = getChildAgeInYear(child, year);

    // School age: 2-17
    if (childAge >= 2 && childAge <= 17) {
      const baseTuition = getTuitionForChild(childAge, child.school);
      total += baseTuition * assistanceMultiplier;

      // Additional fees for private schools
      if (child.school !== 'public') {
        total += COSTS.educationExtras.registrationFee;
        total += COSTS.educationExtras.fundraising;
        total += COSTS.educationExtras.suppliesUniforms;

        if (childAge >= 6) {
          total += COSTS.educationExtras.familyFee;
        }
      }

      // 8th grade Israel trip (age 13)
      if (childAge === 13 && inputs.includeIsraelTrip && child.school !== 'public') {
        total += 5500;
      }
    }
  }

  // Tutoring
  total += inputs.tutoringMonthly * 12;

  return total;
}

// ============ CHILDCARE ============

function calculateChildcareForYear(inputs: RealModeInputs, year: number): number {
  let total = 0;

  // Household help (cleaning, day worker, etc.) - static
  total += COSTS.help[inputs.helpLevel];

  // Nanny costs - dynamic based on children's ages
  if (inputs.hasNanny && inputs.children.length > 0) {
    // Find youngest child's age this year
    const childAges = inputs.children.map((c) => getChildAgeInYear(c, year)).filter((age) => age >= 0);

    if (childAges.length > 0) {
      const youngestAge = Math.min(...childAges);

      // Full nanny cost when youngest is under 5 (not in full-day school)
      if (youngestAge < 5) {
        total += inputs.nannyCost;
      }
      // 75% cost when youngest is 5-7 (in school but needs after-school care)
      else if (youngestAge < 8) {
        total += Math.round(inputs.nannyCost * 0.75);
      }
      // 50% cost when youngest is 8-12 (some after-school help)
      else if (youngestAge < 13) {
        total += Math.round(inputs.nannyCost * 0.5);
      }
      // No nanny needed once youngest is 13+
    }
  }

  return total;
}

// ============ FOOD ============

function calculateFoodForYear(inputs: RealModeInputs, year: number): number {
  // Weekly groceries
  let total = inputs.weeklyGroceries * 52;

  // Dining out
  total += inputs.diningOutMonthly * 12;

  // Shabbat hosting
  const hostingEvents = COSTS.food.hostingFrequency[inputs.shabbatHosting] || 0;
  total += hostingEvents * COSTS.food.shabbatHosting;

  // Pesach
  total += inputs.pesachCost;

  return total;
}

// ============ SIMCHAS ============

function calculateSimchasForYear(inputs: RealModeInputs, year: number): number {
  let total = COSTS.simchas.annualGifts; // Base gift-giving

  for (const child of inputs.children) {
    const childAge = getChildAgeInYear(child, year);

    // Bar/Bat Mitzvah at age 13
    if (childAge === 13) {
      total += COSTS.simchas.barMitzvah[inputs.simchaStyle];
    }

    // Wedding at expected age
    if (childAge === child.expectedWeddingAge) {
      if (child.gender === 'girl') {
        total += COSTS.simchas.weddingGirl[inputs.simchaStyle];
      } else {
        total += COSTS.simchas.weddingBoy[inputs.simchaStyle];
      }
    }
  }

  return total;
}

// ============ TRANSPORTATION ============

function calculateTransportForYear(inputs: RealModeInputs, year: number): number {
  let total = 0;

  for (const vehicle of inputs.vehicles) {
    // Monthly payment (if not paid off)
    if (!vehicle.paidOff) {
      total += vehicle.monthlyPayment * 12;
    }

    // Insurance + gas/maintenance per car
    total += COSTS.transportation.insurancePerCar;
    total += COSTS.transportation.gasMaintenancePerCar;
  }

  return total;
}

// ============ INSURANCE ============

function calculateInsuranceForYear(inputs: RealModeInputs, year: number): number {
  let total = 0;

  // Health insurance
  total += inputs.healthInsuranceMonthly * 12;

  // Other insurance (life, disability, umbrella)
  total += inputs.otherInsuranceAnnual;

  return total;
}

// ============ TZEDAKAH ============

function calculateTzedakahForYear(inputs: RealModeInputs, year: number): number {
  const income = INCOME_MIDPOINTS[inputs.incomeRange] + inputs.annualSupport;
  return Math.round(income * (inputs.tzedakahPercent / 100));
}

// ============ EXTRAS ============

function calculateExtrasForYear(inputs: RealModeInputs, year: number): number {
  let total = 0;

  // Vacations (beyond Deal)
  total += inputs.annualVacationBudget;

  // Sleepaway camp
  if (inputs.sleepawaycamp) {
    for (const child of inputs.children) {
      const childAge = getChildAgeInYear(child, year);
      if (childAge >= 8 && childAge <= 16) {
        total += COSTS.extras.sleepawaycamp;
      } else if (childAge >= 4 && childAge <= 7) {
        total += COSTS.extras.daycamp;
      }
    }
  }

  // Club membership
  if (inputs.clubMembership) {
    total += COSTS.extras.clubMembership;
  }

  return total;
}

// ============ LIFE EVENTS ============

function getEventsForYear(inputs: RealModeInputs, year: number): LifeEvent[] {
  const events: LifeEvent[] = [];
  const calendarYear = CURRENT_YEAR + year;

  // House purchase events
  if (inputs.brooklynSituation === 'rent' && inputs.brooklynPlanToBuy && calendarYear === inputs.brooklynPurchaseYear) {
    events.push({
      type: 'house-purchase',
      description: 'Buy Brooklyn home',
    });
  }

  if (inputs.dealSituation === 'rent' && inputs.dealPlanToBuy && calendarYear === inputs.dealPurchaseYear) {
    events.push({
      type: 'house-purchase',
      description: 'Buy Deal home',
    });
  }

  for (const child of inputs.children) {
    const childAge = getChildAgeInYear(child, year);
    const childName = `Child ${inputs.children.indexOf(child) + 1}`;

    // Birth (for planned children)
    if (childAge === 0) {
      events.push({
        type: 'birth',
        childId: child.id,
        childName,
        description: `${childName} is born`,
      });
    }

    // School start (age 2 - Atideinu)
    if (childAge === 2) {
      events.push({
        type: 'school-start',
        childId: child.id,
        childName,
        description: `${childName} starts school`,
      });
    }

    // High school (age 14)
    if (childAge === 14) {
      events.push({
        type: 'high-school',
        childId: child.id,
        childName,
        description: `${childName} starts high school`,
      });
    }

    // Bar/Bat Mitzvah (age 13)
    if (childAge === 13) {
      events.push({
        type: 'bar-mitzvah',
        childId: child.id,
        childName,
        description: `${childName}'s ${child.gender === 'boy' ? 'Bar' : 'Bat'} Mitzvah`,
      });
    }

    // Graduation (age 18)
    if (childAge === 18) {
      events.push({
        type: 'graduation',
        childId: child.id,
        childName,
        description: `${childName} graduates high school`,
      });
    }

    // Wedding
    if (childAge === child.expectedWeddingAge) {
      events.push({
        type: 'wedding',
        childId: child.id,
        childName,
        description: `${childName}'s wedding`,
      });
    }
  }

  return events;
}

// ============ INSIGHTS ============

function generateInsights(projection: ProjectionYear[], inputs: RealModeInputs): string[] {
  const insights: string[] = [];
  const income = INCOME_MIDPOINTS[inputs.incomeRange] + inputs.annualSupport;

  // Peak years
  const peakYears = projection
    .filter((p) => p.totalAnnual > income * 1.1)
    .map((p) => p.year + 1);

  if (peakYears.length > 0) {
    const range =
      peakYears.length > 2
        ? `Years ${peakYears[0]}-${peakYears[peakYears.length - 1]}`
        : `Year ${peakYears.join(' and ')}`;
    insights.push(`${range} will be your tightest period - expenses exceed income.`);
  }

  // House purchase insights
  if (inputs.brooklynPlanToBuy && inputs.brooklynSituation === 'rent') {
    const purchaseYear = inputs.brooklynPurchaseYear - CURRENT_YEAR + 1;
    if (purchaseYear > 0 && purchaseYear <= 30) {
      const costDiff = inputs.brooklynPostPurchaseMonthlyCost - inputs.brooklynMonthlyCost;
      if (costDiff > 0) {
        insights.push(`Housing costs increase by $${Math.round(costDiff/1000)}K/mo in Year ${purchaseYear} when you buy in Brooklyn.`);
      } else if (costDiff < 0) {
        insights.push(`Housing costs decrease by $${Math.round(-costDiff/1000)}K/mo in Year ${purchaseYear} when you buy in Brooklyn.`);
      }
    }
  }

  // Planned children insight
  const plannedChildren = inputs.children.filter((c) => c.birthYear > CURRENT_YEAR);
  if (plannedChildren.length > 0) {
    const years = plannedChildren.map((c) => c.birthYear - CURRENT_YEAR + 1);
    insights.push(`Planned ${plannedChildren.length === 1 ? 'child arrives' : 'children arrive'} in Year ${years.join(' and ')}.`);
  }

  // Multiple children in school
  const maxKidsInSchool = Math.max(
    ...projection.map((p) => {
      return inputs.children.filter((c) => {
        const age = getChildAgeInYear(c, p.year);
        return age >= 2 && age <= 17;
      }).length;
    })
  );

  if (maxKidsInSchool >= 3) {
    insights.push(`You'll have ${maxKidsInSchool} children in school simultaneously at peak.`);
  }

  // Wedding costs for girls
  const girlCount = inputs.children.filter((c) => c.gender === 'girl').length;
  const boyCount = inputs.children.filter((c) => c.gender === 'boy').length;

  if (girlCount > 0) {
    const weddingCost = girlCount * COSTS.simchas.weddingGirl[inputs.simchaStyle];
    insights.push(
      `Wedding costs for ${girlCount} daughter${girlCount > 1 ? 's' : ''}: ~$${Math.round(weddingCost / 1000)}K total.`
    );
  }

  if (boyCount > 0 && girlCount > 0) {
    const swenneCost = boyCount * COSTS.simchas.weddingBoy[inputs.simchaStyle];
    insights.push(
      `Swenne costs for ${boyCount} son${boyCount > 1 ? 's' : ''}: ~$${Math.round(swenneCost / 1000)}K total.`
    );
  }

  // Empty nest
  const lastChildGradYear = Math.max(
    ...inputs.children.map((c) => {
      const currentAge = CURRENT_YEAR - c.birthYear;
      return 18 - currentAge;
    }),
    0
  );

  if (lastChildGradYear > 0 && lastChildGradYear < 30) {
    insights.push(`After Year ${lastChildGradYear}, education costs drop as kids graduate.`);
  }

  return insights.slice(0, 4); // Max 4 insights
}

// ============ HELPERS ============

function getChildAgeInYear(child: RealModeChild, year: number): number {
  const currentAge = CURRENT_YEAR - child.birthYear;
  return currentAge + year;
}

// Convert Quick Mode inputs to Real Mode
export function prefillFromQuickMode(quick: {
  housing: string;
  children: Array<{ id: string; age: number; gender: 'boy' | 'girl'; school: string }>;
  helpLevel: string;
  groceryStyle: string;
  shabbatHosting: number;
  simchaStyle: string;
  vehicleType: string;
  vehicleCount: number;
  pesachAway: boolean;
  sleepawaycamp: boolean;
  clubMembership: boolean;
}): Partial<RealModeInputs> {
  const groceryMap: Record<string, number> = {
    budget: 400,
    moderate: 600,
    premium: 900,
  };

  return {
    // Housing (default to rent, user will specify)
    brooklynSituation: quick.housing === 'deal' ? 'none' : 'rent',
    brooklynMonthlyCost: quick.housing === 'deal' ? 0 : 5000,
    dealSituation: quick.housing === 'brooklyn' ? 'none' : 'rent',
    dealSeasonalCost: quick.housing === 'brooklyn' ? 0 : 36000,

    // Children (convert ages to birth years)
    children: quick.children.map((c) => ({
      ...c,
      birthYear: CURRENT_YEAR - c.age,
      expectedWeddingAge: 25,
      school: c.school as any,
    })),

    // Direct carry-over
    helpLevel: quick.helpLevel as any,
    simchaStyle: quick.simchaStyle as any,
    clubMembership: quick.clubMembership,
    sleepawaycamp: quick.sleepawaycamp,
    shabbatHosting: quick.shabbatHosting,

    // Expand from Quick Mode choices
    weeklyGroceries: groceryMap[quick.groceryStyle] || 600,
    pesachStyle: quick.pesachAway ? 'hotel' : 'home',
    pesachCost: quick.pesachAway ? 30000 : 2000,

    // Vehicles
    vehicles:
      quick.vehicleCount > 0
        ? Array.from({ length: quick.vehicleCount }, (_, i) => ({
            id: crypto.randomUUID(),
            type: quick.vehicleType as any,
            monthlyPayment: 500,
            paidOff: false,
          }))
        : [],
  };
}
