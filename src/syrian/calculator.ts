import { LifestyleInputs, CostBreakdown, CategoryCosts } from './types';
import { COSTS, getTuitionForChild } from './constants';

export function calculateTotalCost(inputs: LifestyleInputs): CostBreakdown {
  const categories: CategoryCosts = {
    housing: calculateHousing(inputs),
    education: calculateEducation(inputs),
    childcare: calculateChildcare(inputs),
    food: calculateFood(inputs),
    simchas: calculateSimchas(inputs),
    transportation: calculateTransportation(inputs),
    extras: calculateExtras(inputs),
  };

  const totalAnnual = Object.values(categories).reduce((sum, val) => sum + val, 0);

  return {
    totalAnnual,
    totalMonthly: Math.round(totalAnnual / 12),
    categories,
  };
}

function calculateHousing(inputs: LifestyleInputs): number {
  switch (inputs.housing) {
    case 'brooklyn':
      return COSTS.housing.brooklyn;
    case 'deal':
      return COSTS.housing.deal;
    case 'both':
      return COSTS.housing.brooklyn + COSTS.housing.deal;
  }
}

function calculateEducation(inputs: LifestyleInputs): number {
  let total = 0;

  for (const child of inputs.children) {
    // Skip children not in school age (3-17)
    if (child.age < 3 || child.age > 17) continue;

    // Base tuition
    total += getTuitionForChild(child.age, child.school);

    // Additional fees for private schools
    if (child.school !== 'public') {
      total += COSTS.educationExtras.registrationFee;
      total += COSTS.educationExtras.fundraising;
      total += COSTS.educationExtras.suppliesUniforms;

      // Family fee for grades 1-12 (age 6+)
      if (child.age >= 6) {
        total += COSTS.educationExtras.familyFee;
      }
    }
  }

  return total;
}

function calculateChildcare(inputs: LifestyleInputs): number {
  // Household help costs
  return COSTS.help[inputs.helpLevel];
}

function calculateFood(inputs: LifestyleInputs): number {
  // Base grocery cost for family
  let total = COSTS.food.grocery[inputs.groceryStyle];

  // Add per-child adjustment (baseline assumes 2 adults + 2 kids)
  const extraChildren = Math.max(0, inputs.children.length - 2);
  total += extraChildren * COSTS.food.groceryPerChild;

  // Shabbat hosting costs
  const hostingEvents = COSTS.food.hostingFrequency[inputs.shabbatHosting] || 0;
  total += hostingEvents * COSTS.food.shabbatHosting;

  return total;
}

function calculateSimchas(inputs: LifestyleInputs): number {
  // Annual gift-giving for attending others' simchas
  let total = COSTS.simchas.annualGifts;

  // Amortize future simcha costs over the years until they happen
  // For simplicity in Quick Mode, we estimate annual "saving" needed
  for (const child of inputs.children) {
    // Bar/Bat Mitzvah: assume happens at age 13, amortize from now
    const yearsToBarMitzvah = Math.max(1, 13 - child.age);
    if (child.age < 13) {
      const barMitzvahCost = COSTS.simchas.barMitzvah[inputs.simchaStyle];
      total += Math.round(barMitzvahCost / yearsToBarMitzvah);
    }

    // Wedding: assume happens at age 25, amortize from now
    const yearsToWedding = Math.max(1, 25 - child.age);
    if (child.age < 25) {
      const weddingCost =
        child.gender === 'girl'
          ? COSTS.simchas.weddingGirl[inputs.simchaStyle]
          : COSTS.simchas.weddingBoy[inputs.simchaStyle];
      total += Math.round(weddingCost / yearsToWedding);
    }
  }

  // If planning more children, add estimate for future kids
  if (inputs.planningMore) {
    // Assume one more child, amortize bar mitzvah over 13 years, wedding over 25
    const barMitzvahCost = COSTS.simchas.barMitzvah[inputs.simchaStyle];
    const avgWeddingCost =
      (COSTS.simchas.weddingGirl[inputs.simchaStyle] + COSTS.simchas.weddingBoy[inputs.simchaStyle]) / 2;
    total += Math.round(barMitzvahCost / 13) + Math.round(avgWeddingCost / 25);
  }

  return total;
}

function calculateTransportation(inputs: LifestyleInputs): number {
  const vehicleCost = COSTS.transportation.vehicle[inputs.vehicleType];
  const perCarCosts = COSTS.transportation.insurancePerCar + COSTS.transportation.gasMaintenancePerCar;

  return inputs.vehicleCount * (vehicleCost + perCarCosts);
}

function calculateExtras(inputs: LifestyleInputs): number {
  let total = 0;

  // Pesach program
  if (inputs.pesachAway) {
    total += COSTS.extras.pesachProgram;
  }

  // Sleepaway camp for eligible children (ages 8-16)
  if (inputs.sleepawaycamp) {
    const campAgeKids = inputs.children.filter((c) => c.age >= 8 && c.age <= 16).length;
    total += campAgeKids * COSTS.extras.sleepawaycamp;

    // Day camp for younger kids (4-7)
    const daycampKids = inputs.children.filter((c) => c.age >= 4 && c.age <= 7).length;
    total += daycampKids * COSTS.extras.daycamp;
  }

  // Club membership
  if (inputs.clubMembership) {
    total += COSTS.extras.clubMembership;
  }

  return total;
}

// Format currency for display
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export function formatCurrencyFull(amount: number): string {
  return `$${amount.toLocaleString()}`;
}
