import React, { useState, useMemo, useEffect } from 'react';

const RetirementSimulator = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // IRS limits 2025
  const IRS_LIMITS = {
    employee401k: 23500,      // Per person
    total401k: 70000,         // Employee + employer per person
    hsaFamily: 8550,
    backdoorRoth: 7000,       // Per person
    megaBackdoor: 46500,      // Rough max per person (70k - 23.5k)
    dependentCareFSA: 5000,
  };
  
  // Tax brackets 2025
  const taxBrackets = {
    federal: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: Infinity, rate: 0.37 },
    ],
    nyc: {
      state: [
        { min: 0, max: 17150, rate: 0.04 },
        { min: 17150, max: 23600, rate: 0.045 },
        { min: 23600, max: 27900, rate: 0.0525 },
        { min: 27900, max: 161550, rate: 0.0585 },
        { min: 161550, max: 323200, rate: 0.0625 },
        { min: 323200, max: 2155350, rate: 0.0685 },
        { min: 2155350, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 },
      ],
      city: [
        { min: 0, max: 12000, rate: 0.03078 },
        { min: 12000, max: 25000, rate: 0.03762 },
        { min: 25000, max: 50000, rate: 0.03819 },
        { min: 50000, max: Infinity, rate: 0.03876 },
      ],
    },
    nj: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 35000, rate: 0.0175 },
      { min: 35000, max: 40000, rate: 0.035 },
      { min: 40000, max: 75000, rate: 0.05525 },
      { min: 75000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
  };
  
  const calcBracketTax = (income, brackets) => {
    let tax = 0;
    let remaining = income;
    for (const bracket of brackets) {
      if (remaining <= 0) break;
      const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
      remaining -= taxableInBracket;
    }
    return tax;
  };
  
  const calcTotalTax = (taxableIncome, grossIncome, location) => {
    // Apply standard deduction (MFJ 2025: ~$30,000)
    const standardDeduction = 30000;
    const federalTaxableIncome = Math.max(0, taxableIncome - standardDeduction);

    // Federal income tax is on income after standard deduction
    const federal = calcBracketTax(federalTaxableIncome, taxBrackets.federal);
    let state = 0;
    let city = 0;

    if (location === 'nyc') {
      // NY standard deduction MFJ ~$16,050
      const nyTaxableIncome = Math.max(0, taxableIncome - 16050);
      state = calcBracketTax(nyTaxableIncome, taxBrackets.nyc.state);
      city = calcBracketTax(nyTaxableIncome, taxBrackets.nyc.city);
    } else if (location === 'nj') {
      // NJ has no standard deduction, but has personal exemptions (~$3,000 MFJ)
      const njTaxableIncome = Math.max(0, taxableIncome - 3000);
      state = calcBracketTax(njTaxableIncome, taxBrackets.nj);
    }

    // FICA is on GROSS wages (not reduced by 401k/HSA)
    // Social Security 6.2% up to $176,100 + Medicare 1.45% + 0.9% additional over $250k MFJ
    const ssLimit = 176100;
    const ss = Math.min(grossIncome, ssLimit) * 0.062;
    const medicare = grossIncome * 0.0145 + Math.max(0, grossIncome - 250000) * 0.009;

    return { federal, state, city, fica: ss + medicare, total: federal + state + city + ss + medicare };
  };
  
  const calcCapGainsTax = (gains, ordinaryIncome, location) => {
    // Federal LTCG brackets (married filing jointly 2025)
    // Rate depends on taxable income including gains
    const totalIncome = ordinaryIncome + gains;
    let federalRate = 0.20; // default high bracket
    if (totalIncome <= 96700) federalRate = 0;
    else if (totalIncome <= 600050) federalRate = 0.15;

    const federal = gains * federalRate;

    // NIIT 3.8% applies to lesser of:
    // (a) net investment income, or
    // (b) MAGI exceeding $250k threshold (MFJ)
    const niitThreshold = 250000;
    const magiExcess = Math.max(0, totalIncome - niitThreshold);
    const niit = Math.min(gains, magiExcess) * 0.038;

    // State taxes cap gains as ordinary income
    let state = 0;
    if (location === 'nyc') {
      // Marginal rate approximation for high earner
      state = gains * 0.0685 + gains * 0.03876; // NY state + NYC
    } else if (location === 'nj') {
      state = gains * 0.0897; // NJ high bracket
    }

    return federal + niit + state;
  };

  // Default inputs
  const defaultInputs = {
    currentAge: 35,
    retirementAge: 60,
    grossIncome: 500000,
    annualSpend: 150000,
    growthRate: 7,
    inflationRate: 3,
    showTodaysDollars: true,
    location: 'nyc', // 'nyc' or 'nj'

    // Account toggles and amounts
    enable401k: true,
    contribution401k: 47000,
    match401k: 10000,
    initial401k: 250000,

    enableHSA: true,
    contributionHSA: 8550,
    initialHSA: 15000,

    enableBackdoorRoth: true,
    contributionBackdoorRoth: 14000,
    initialBackdoorRoth: 30000,

    enableMegaBackdoor: true,
    contributionMegaBackdoor: 50000,
    initialMegaBackdoor: 100000,

    enableDependentCareFSA: true,
    contributionDependentCareFSA: 5000,

    enableCommuter: true,
    commuterEmployerContribution: 1560, // $130/mo x 12 months

    initialTaxable: 150000,
  };

  // Load from localStorage or use defaults
  const [inputs, setInputs] = useState(() => {
    try {
      const saved = localStorage.getItem('retirement-sim-inputs');
      if (saved) {
        return { ...defaultInputs, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return defaultInputs;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('retirement-sim-inputs', JSON.stringify(inputs));
    } catch (e) {}
  }, [inputs]);
  
  const [viewMode, setViewMode] = useState('before');
  const [hoveredYear, setHoveredYear] = useState(null);
  const [selectedYearIndex, setSelectedYearIndex] = useState(null);
  const [mainView, setMainView] = useState('projection'); // 'projection' or 'annual'
  
  const updateInput = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };
  
  const fmt = (n) => {
    if (Math.abs(n) >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
    if (Math.abs(n) >= 1000) return `$${Math.round(n/1000)}k`;
    return `$${Math.round(n)}`;
  };

  // Adjust for inflation - converts future dollars to today's purchasing power
  const toTodaysDollars = (amount, yearsFromNow) => {
    if (!inputs.showTodaysDollars) return amount;
    return amount / Math.pow(1 + inputs.inflationRate / 100, yearsFromNow);
  };
  
  // Calculate derived values
  const calculations = useMemo(() => {
    const totalYears = Math.ceil(inputs.retirementAge - inputs.currentAge);
    const growthRate = inputs.growthRate / 100;
    
    // Annual contributions
    const annual = {
      pretax401k: inputs.enable401k ? inputs.contribution401k : 0,
      match401k: inputs.enable401k ? inputs.match401k : 0,
      hsa: inputs.enableHSA ? inputs.contributionHSA : 0,
      backdoorRoth: inputs.enableBackdoorRoth ? inputs.contributionBackdoorRoth : 0,
      megaBackdoor: inputs.enableMegaBackdoor ? inputs.contributionMegaBackdoor : 0,
      dependentCareFSA: inputs.enableDependentCareFSA ? inputs.contributionDependentCareFSA : 0,
      commuterEmployer: inputs.enableCommuter ? inputs.commuterEmployerContribution : 0, // employer-funded, not from your paycheck
    };
    
    // Initial balances
    const initial = {
      pretax401k: inputs.enable401k ? inputs.initial401k : 0,
      hsa: inputs.enableHSA ? inputs.initialHSA : 0,
      backdoorRoth: inputs.enableBackdoorRoth ? inputs.initialBackdoorRoth : 0,
      megaBackdoor: inputs.enableMegaBackdoor ? inputs.initialMegaBackdoor : 0,
      taxable: inputs.initialTaxable,
    };
    
    // Calculate taxes
    // Pre-tax deductions reduce income tax (but not FICA)
    const preTaxDeductions = annual.pretax401k + annual.hsa + annual.dependentCareFSA;
    const taxableIncome = inputs.grossIncome - preTaxDeductions;
    const taxes = calcTotalTax(taxableIncome, inputs.grossIncome, inputs.location);

    // Cash flow:
    // 1. Gross income
    // 2. Minus pre-tax contributions (401k, HSA, FSA) - these go directly to accounts
    // 3. Minus all taxes (income tax on reduced amount, FICA on gross)
    // 4. = Take-home cash
    // 5. Minus spending (reduced by FSA which covers childcare) = post-tax savings
    const takeHomeCash = inputs.grossIncome - preTaxDeductions - taxes.total;
    // FSA covers part of spending (childcare), so only remaining spending comes from take-home
    const spendFromTakeHome = inputs.annualSpend - annual.dependentCareFSA;
    const totalSavings = Math.max(0, takeHomeCash - spendFromTakeHome);

    // Post-tax contributions come from take-home savings
    // (401k/HSA already deducted from paycheck, so only Roth accounts here)
    const postTaxContributions = annual.backdoorRoth + annual.megaBackdoor;
    const taxable = Math.max(0, totalSavings - postTaxContributions);
    
    // Build year-by-year data
    const years = [];
    
    for (let year = 0; year <= totalYears; year++) {
      const age = inputs.currentAge + year;
      
      let pretax401k = 0;
      let mbdPrincipal = 0, mbdGains = 0;
      let backdoorLocked = 0, backdoorUnlocked = 0, backdoorGains = 0;
      let hsaPrincipal = 0, hsaGains = 0;
      let taxablePrincipal = 0, taxableGains = 0;
      
      // Initial balances grow for full period
      if (year > 0) {
        const initialGrowth = Math.pow(1 + growthRate, year);
        pretax401k += initial.pretax401k * initialGrowth;
        
        // For initial Roth, assume it's all unlocked (been there > 5 years)
        mbdPrincipal += initial.megaBackdoor;
        mbdGains += initial.megaBackdoor * (initialGrowth - 1);
        backdoorUnlocked += initial.backdoorRoth;
        backdoorGains += initial.backdoorRoth * (initialGrowth - 1);
        
        hsaPrincipal += initial.hsa;
        hsaGains += initial.hsa * (initialGrowth - 1);
        
        // For taxable, track cost basis vs gains
        const taxableTotal = initial.taxable * initialGrowth;
        taxablePrincipal += initial.taxable;
        taxableGains += taxableTotal - initial.taxable;
      } else {
        // Year 0 = starting point
        pretax401k = initial.pretax401k;
        mbdPrincipal = initial.megaBackdoor;
        backdoorUnlocked = initial.backdoorRoth;
        hsaPrincipal = initial.hsa;
        taxablePrincipal = initial.taxable;
      }
      
      // Add contributions for each year (assume contributions at start of year)
      for (let cy = 1; cy <= year; cy++) {
        const yg = year - cy + 1; // +1 because contribution at START of year grows for full year
        const gm = Math.pow(1 + growthRate, yg);
        const gainsM = gm - 1;
        
        pretax401k += (annual.pretax401k + annual.match401k) * gm;
        mbdPrincipal += annual.megaBackdoor;
        mbdGains += annual.megaBackdoor * gainsM;
        
        if (yg >= 5) {
          backdoorUnlocked += annual.backdoorRoth;
        } else {
          backdoorLocked += annual.backdoorRoth;
        }
        backdoorGains += annual.backdoorRoth * gainsM;
        
        hsaPrincipal += annual.hsa;
        hsaGains += annual.hsa * gainsM;
        
        taxablePrincipal += taxable;
        taxableGains += taxable * gainsM;
      }
      
      const y = {
        year, age,
        pretax401k: Math.round(pretax401k),
        mbdPrincipal: Math.round(mbdPrincipal),
        mbdGains: Math.round(mbdGains),
        backdoorLocked: Math.round(backdoorLocked),
        backdoorUnlocked: Math.round(backdoorUnlocked),
        backdoorGains: Math.round(backdoorGains),
        hsaPrincipal: Math.round(hsaPrincipal),
        hsaGains: Math.round(hsaGains),
        taxablePrincipal: Math.round(taxablePrincipal),
        taxableGains: Math.round(taxableGains),
      };
      
      y.totalRoth = y.mbdPrincipal + y.mbdGains + y.backdoorLocked + y.backdoorUnlocked + y.backdoorGains;
      y.totalHSA = y.hsaPrincipal + y.hsaGains;
      y.totalTaxable = y.taxablePrincipal + y.taxableGains;
      y.grandTotal = y.pretax401k + y.totalRoth + y.totalHSA + y.totalTaxable;
      
      y.accessibleBefore = y.mbdPrincipal + y.backdoorUnlocked + y.hsaPrincipal + y.taxablePrincipal + y.taxableGains;
      y.lockedBefore = y.pretax401k + y.mbdGains + y.backdoorLocked + y.backdoorGains + y.hsaGains;
      
      // Tax calculations using proper brackets
      // 401k withdrawal taxed as ordinary income (apply standard deductions)
      const fedStdDed = 30000;
      const nyStdDed = 16050;
      const njExemption = 3000;
      const fed401kTaxable = Math.max(0, y.pretax401k - fedStdDed);
      y.tax401k = Math.round(calcBracketTax(fed401kTaxable, taxBrackets.federal) +
        (inputs.location === 'nyc'
          ? calcBracketTax(Math.max(0, y.pretax401k - nyStdDed), taxBrackets.nyc.state) + calcBracketTax(Math.max(0, y.pretax401k - nyStdDed), taxBrackets.nyc.city)
          : calcBracketTax(Math.max(0, y.pretax401k - njExemption), taxBrackets.nj)));
      
      // Cap gains on taxable
      y.taxCapGains = Math.round(calcCapGainsTax(y.taxableGains, 100000, inputs.location)); // assume $100k other income in retirement
      
      y.totalTax = y.tax401k + y.taxCapGains;
      y.afterTax = y.grandTotal - y.totalTax;
      
      years.push(y);
    }
    
    return { years, annual, taxable, taxes, totalSavings, totalYears, initial };
  }, [inputs]);
  
  const { years, annual, taxable, taxes, totalSavings, totalYears, initial } = calculations;
  
  // Chart setup
  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 20, bottom: 50, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Apply inflation adjustment to year data for display
  const adjustedYears = years.map(y => {
    const discount = toTodaysDollars(1, y.year);
    return {
      ...y,
      // Adjusted values for display
      adj_pretax401k: Math.round(y.pretax401k * discount),
      adj_totalRoth: Math.round(y.totalRoth * discount),
      adj_totalHSA: Math.round(y.totalHSA * discount),
      adj_totalTaxable: Math.round(y.totalTaxable * discount),
      adj_grandTotal: Math.round(y.grandTotal * discount),
      adj_afterTax: Math.round(y.afterTax * discount),
      adj_accessibleBefore: Math.round(y.accessibleBefore * discount),
      adj_lockedBefore: Math.round(y.lockedBefore * discount),
      adj_taxablePrincipal: Math.round(y.taxablePrincipal * discount),
      adj_taxableGains: Math.round(y.taxableGains * discount),
      adj_mbdPrincipal: Math.round(y.mbdPrincipal * discount),
      adj_mbdGains: Math.round(y.mbdGains * discount),
      adj_backdoorUnlocked: Math.round(y.backdoorUnlocked * discount),
      adj_backdoorLocked: Math.round(y.backdoorLocked * discount),
      adj_backdoorGains: Math.round(y.backdoorGains * discount),
      adj_hsaPrincipal: Math.round(y.hsaPrincipal * discount),
      adj_hsaGains: Math.round(y.hsaGains * discount),
      adj_tax401k: Math.round(y.tax401k * discount),
      adj_taxCapGains: Math.round(y.taxCapGains * discount),
    };
  });

  const maxValue = Math.max(...adjustedYears.map(y => y.adj_grandTotal), 1);
  const yScale = (v) => chartHeight - (v / maxValue) * chartHeight;
  const xScale = (i) => (i / Math.max(adjustedYears.length - 1, 1)) * chartWidth;

  const stackedData = adjustedYears.map(y => {
    if (viewMode === 'before') {
      return {
        ...y,
        a_taxable: y.adj_taxablePrincipal + y.adj_taxableGains,
        a_hsa: y.adj_taxablePrincipal + y.adj_taxableGains + y.adj_hsaPrincipal,
        a_roth: y.adj_taxablePrincipal + y.adj_taxableGains + y.adj_hsaPrincipal + y.adj_mbdPrincipal + y.adj_backdoorUnlocked,
        l_start: y.adj_accessibleBefore,
        l_rothLock: y.adj_accessibleBefore + y.adj_backdoorLocked + y.adj_mbdGains + y.adj_backdoorGains,
        l_hsa: y.adj_accessibleBefore + y.adj_backdoorLocked + y.adj_mbdGains + y.adj_backdoorGains + y.adj_hsaGains,
        l_401k: y.adj_grandTotal,
      };
    } else {
      return {
        ...y,
        s_taxable: y.adj_totalTaxable,
        s_hsa: y.adj_totalTaxable + y.adj_totalHSA,
        s_roth: y.adj_totalTaxable + y.adj_totalHSA + y.adj_totalRoth,
        s_401k: y.adj_grandTotal,
      };
    }
  });
  
  const areaPath = (data, y0Key, y1Key) => {
    if (data.length === 0) return '';
    const points = data.map((d, i) => ({
      x: xScale(i),
      y0: yScale(typeof y0Key === 'function' ? y0Key(d) : (d[y0Key] || 0)),
      y1: yScale(typeof y1Key === 'function' ? y1Key(d) : (d[y1Key] || 0))
    }));
    const top = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y1}`).join(' ');
    const bottom = [...points].reverse().map((p) => `L ${p.x} ${p.y0}`).join(' ');
    return `${top} ${bottom} Z`;
  };
  
  // On mobile: use tapped selection; on desktop: hover takes priority, fall back to tapped
  const effectiveYearIndex = hoveredYear !== null
    ? hoveredYear
    : (selectedYearIndex !== null ? selectedYearIndex : adjustedYears.length - 1);
  const selectedYear = adjustedYears[effectiveYearIndex];
  const colors = {
    pretax: '#f97316',
    roth: '#4ade80',
    hsa: '#a855f7',
    taxable: '#38bdf8',
  };
  
  const InputSlider = ({ label, value, onChange, min, max, step = 1, format = (v) => v, suffix = '' }) => {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    const parseInput = (str) => {
      // Remove $, commas, spaces
      let clean = str.replace(/[$,\s]/g, '');
      // Handle k/K (thousands) and m/M (millions)
      if (/k$/i.test(clean)) {
        return parseFloat(clean) * 1000;
      }
      if (/m$/i.test(clean)) {
        return parseFloat(clean) * 1000000;
      }
      return parseFloat(clean);
    };

    const handleClick = () => {
      // Show raw number for editing
      setEditValue(value.toLocaleString());
      setEditing(true);
    };

    const handleBlur = () => {
      const num = parseInput(editValue);
      if (!isNaN(num)) {
        // Round to step
        const rounded = Math.round(num / step) * step;
        onChange(Math.min(max, Math.max(min, rounded)));
      }
      setEditing(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.target.blur();
      }
      if (e.key === 'Escape') {
        setEditing(false);
      }
    };

    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label style={{ color: '#94a3b8', fontSize: '10px' }}>{label}</label>
          {editing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              onFocus={(e) => e.target.select()}
              placeholder="e.g. 500k"
              style={{
                width: '100px',
                background: '#1e293b',
                border: '2px solid #4ade80',
                borderRadius: '4px',
                color: '#f8fafc',
                fontSize: '12px',
                fontFamily: 'monospace',
                padding: '4px 8px',
                textAlign: 'right',
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={handleClick}
              style={{
                color: '#f8fafc',
                fontSize: '11px',
                fontFamily: 'monospace',
                cursor: 'pointer',
                padding: '3px 6px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              title="Click to edit"
            >
              {format(value)}{suffix}
            </span>
          )}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#4ade80',
            height: '6px',
            touchAction: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
    );
  };
  
  const Toggle = ({ label, checked, onChange, color = '#4ade80' }) => (
    <div onClick={() => onChange(!checked)} style={{ 
      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '5px 8px',
      background: checked ? `${color}15` : 'rgba(255,255,255,0.02)', borderRadius: '5px',
      border: `1px solid ${checked ? color : 'rgba(255,255,255,0.1)'}`,
    }}>
      <div style={{
        width: '12px', height: '12px', borderRadius: '3px',
        background: checked ? color : 'transparent', border: `2px solid ${checked ? color : '#64748b'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ color: '#000', fontSize: '8px', fontWeight: 'bold' }}>✓</span>}
      </div>
      <span style={{ color: checked ? '#f8fafc' : '#64748b', fontSize: '10px' }}>{label}</span>
    </div>
  );
  
  const LimitWarning = ({ value, limit, label }) => {
    if (value <= limit) return null;
    return (
      <div style={{ color: '#ef4444', fontSize: '9px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>⚠️</span> Exceeds IRS limit ({fmt(limit)} {label})
      </div>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0c0f1a 0%, #1a1f35 100%)',
      padding: isMobile ? '12px' : '20px',
      borderRadius: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}>
      <h2 style={{ color: '#f8fafc', marginBottom: '2px', fontWeight: 600, fontSize: '18px' }}>
        Tax-Advantaged Retirement Simulator
      </h2>
      <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '12px' }}>
        Configure your strategy with real tax brackets
      </p>
      
      {/* Main view toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
        <button onClick={() => setMainView('projection')} style={{
          padding: isMobile ? '12px 16px' : '10px 20px', borderRadius: '8px', fontSize: isMobile ? '14px' : '12px', fontWeight: 600, cursor: 'pointer',
          border: mainView === 'projection' ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.15)',
          background: mainView === 'projection' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
          color: mainView === 'projection' ? '#4ade80' : '#94a3b8',
          flex: isMobile ? 'none' : 'initial',
        }}>📈 Long-term Projection</button>
        <button onClick={() => setMainView('annual')} style={{
          padding: isMobile ? '12px 16px' : '10px 20px', borderRadius: '8px', fontSize: isMobile ? '14px' : '12px', fontWeight: 600, cursor: 'pointer',
          border: mainView === 'annual' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
          background: mainView === 'annual' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
          color: mainView === 'annual' ? '#38bdf8' : '#94a3b8',
          flex: isMobile ? 'none' : 'initial',
        }}>💸 Annual Cash Flow</button>
      </div>
      
      {mainView === 'annual' ? (
        <AnnualSankeyView inputs={inputs} taxes={taxes} annual={annual} taxable={taxable} totalSavings={totalSavings} fmt={fmt} isMobile={isMobile} />
      ) : (

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: '16px' }}>
        {/* Left: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: isMobile ? 'none' : '600px', overflowY: isMobile ? 'visible' : 'auto', paddingRight: isMobile ? '0' : '8px' }}>
          {/* Basic Info */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '11px', fontWeight: 600, marginBottom: '10px' }}>BASICS</h3>
            <InputSlider label="Current Age" value={inputs.currentAge} onChange={(v) => updateInput('currentAge', v)} min={20} max={55} />
            <InputSlider label="Retirement Age" value={inputs.retirementAge} onChange={(v) => updateInput('retirementAge', v)} min={40} max={70} step={0.5} />
            <InputSlider label="Gross Income" value={inputs.grossIncome} onChange={(v) => updateInput('grossIncome', v)} min={100000} max={2000000} step={10000} format={fmt} />
            <InputSlider label="Annual Spend" value={inputs.annualSpend} onChange={(v) => updateInput('annualSpend', v)} min={50000} max={500000} step={5000} format={fmt} />
            <InputSlider label="Growth Rate" value={inputs.growthRate} onChange={(v) => updateInput('growthRate', v)} min={3} max={12} step={0.5} suffix="%" />
            <InputSlider label="Inflation Rate" value={inputs.inflationRate} onChange={(v) => updateInput('inflationRate', v)} min={0} max={6} step={0.5} suffix="%" />

            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              <div
                onClick={() => updateInput('showTodaysDollars', !inputs.showTodaysDollars)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px',
                  background: inputs.showTodaysDollars ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  border: `1px solid ${inputs.showTodaysDollars ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <div style={{
                  width: '14px', height: '14px', borderRadius: '3px',
                  background: inputs.showTodaysDollars ? '#4ade80' : 'transparent',
                  border: `2px solid ${inputs.showTodaysDollars ? '#4ade80' : '#64748b'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {inputs.showTodaysDollars && <span style={{ color: '#000', fontSize: '9px', fontWeight: 'bold' }}>✓</span>}
                </div>
                <div>
                  <span style={{ color: inputs.showTodaysDollars ? '#f8fafc' : '#64748b', fontSize: '11px', fontWeight: 500 }}>Show in today's dollars</span>
                  <div style={{ color: '#64748b', fontSize: '9px' }}>Adjust for {inputs.inflationRate}% inflation</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <label style={{ color: '#94a3b8', fontSize: '10px', display: 'block', marginBottom: '4px' }}>Location</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => updateInput('location', 'nyc')} style={{
                  flex: 1, padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                  border: inputs.location === 'nyc' ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                  background: inputs.location === 'nyc' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
                  color: inputs.location === 'nyc' ? '#4ade80' : '#94a3b8',
                }}>NYC</button>
                <button onClick={() => updateInput('location', 'nj')} style={{
                  flex: 1, padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                  border: inputs.location === 'nj' ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                  background: inputs.location === 'nj' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
                  color: inputs.location === 'nj' ? '#4ade80' : '#94a3b8',
                }}>NJ</button>
              </div>
            </div>
          </div>
          
          {/* Account Toggles */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '11px', fontWeight: 600, marginBottom: '10px' }}>ACCOUNTS</h3>
            
            <Toggle label="401k" checked={inputs.enable401k} onChange={(v) => updateInput('enable401k', v)} color={colors.pretax} />
            {inputs.enable401k && (
              <div style={{ marginLeft: '20px', marginTop: '6px', marginBottom: '10px' }}>
                <InputSlider label="Annual Contribution" value={inputs.contribution401k} onChange={(v) => updateInput('contribution401k', v)} min={0} max={IRS_LIMITS.employee401k * 2} step={500} format={fmt} />
                <InputSlider label="Employer Match" value={inputs.match401k} onChange={(v) => updateInput('match401k', v)} min={0} max={30000} step={250} format={fmt} />
                <InputSlider label="Starting Balance" value={inputs.initial401k} onChange={(v) => updateInput('initial401k', v)} min={0} max={2000000} step={10000} format={fmt} />
                <LimitWarning value={inputs.contribution401k} limit={IRS_LIMITS.employee401k * 2} label="for 2 people" />
              </div>
            )}
            
            <Toggle label="HSA (Shoebox)" checked={inputs.enableHSA} onChange={(v) => updateInput('enableHSA', v)} color={colors.hsa} />
            {inputs.enableHSA && (
              <div style={{ marginLeft: '20px', marginTop: '6px', marginBottom: '10px' }}>
                <InputSlider label="Annual Contribution" value={inputs.contributionHSA} onChange={(v) => updateInput('contributionHSA', v)} min={0} max={IRS_LIMITS.hsaFamily} step={50} format={fmt} />
                <LimitWarning value={inputs.contributionHSA} limit={IRS_LIMITS.hsaFamily} label="family" />
                <InputSlider label="Starting Balance" value={inputs.initialHSA} onChange={(v) => updateInput('initialHSA', v)} min={0} max={100000} step={1000} format={fmt} />
              </div>
            )}
            
            <Toggle label="Backdoor Roth IRA" checked={inputs.enableBackdoorRoth} onChange={(v) => updateInput('enableBackdoorRoth', v)} color={colors.roth} />
            {inputs.enableBackdoorRoth && (
              <div style={{ marginLeft: '20px', marginTop: '6px', marginBottom: '10px' }}>
                <InputSlider label="Annual Contribution" value={inputs.contributionBackdoorRoth} onChange={(v) => updateInput('contributionBackdoorRoth', v)} min={0} max={IRS_LIMITS.backdoorRoth * 2} step={500} format={fmt} />
                <LimitWarning value={inputs.contributionBackdoorRoth} limit={IRS_LIMITS.backdoorRoth * 2} label="for 2 people" />
                <InputSlider label="Starting Balance" value={inputs.initialBackdoorRoth} onChange={(v) => updateInput('initialBackdoorRoth', v)} min={0} max={500000} step={5000} format={fmt} />
              </div>
            )}
            
            <Toggle label="Mega Backdoor Roth" checked={inputs.enableMegaBackdoor} onChange={(v) => updateInput('enableMegaBackdoor', v)} color={colors.roth} />
            {inputs.enableMegaBackdoor && (
              <div style={{ marginLeft: '20px', marginTop: '6px', marginBottom: '10px' }}>
                <InputSlider label="Annual Contribution" value={inputs.contributionMegaBackdoor} onChange={(v) => updateInput('contributionMegaBackdoor', v)} min={0} max={Math.max(0, (IRS_LIMITS.total401k * 2) - inputs.contribution401k - inputs.match401k)} step={1000} format={fmt} />
                <LimitWarning value={inputs.contributionMegaBackdoor} limit={Math.max(0, (IRS_LIMITS.total401k * 2) - inputs.contribution401k - inputs.match401k)} label="after 401k+match" />
                <InputSlider label="Starting Balance" value={inputs.initialMegaBackdoor} onChange={(v) => updateInput('initialMegaBackdoor', v)} min={0} max={1000000} step={10000} format={fmt} />
              </div>
            )}
            
            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(56,189,248,0.1)', borderRadius: '6px', borderLeft: `3px solid ${colors.taxable}` }}>
              <label style={{ color: colors.taxable, fontSize: '10px', fontWeight: 600 }}>Taxable Brokerage</label>
              <InputSlider label="Starting Balance" value={inputs.initialTaxable} onChange={(v) => updateInput('initialTaxable', v)} min={0} max={2000000} step={10000} format={fmt} />
            </div>
          </div>
          
          {/* Pre-tax Benefits (use-it-or-lose-it) */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '11px', fontWeight: 600, marginBottom: '10px' }}>PRE-TAX BENEFITS</h3>
            <p style={{ color: '#64748b', fontSize: '9px', marginBottom: '10px' }}>These reduce taxable income but are spent, not invested</p>
            
            <Toggle label="Dependent Care FSA" checked={inputs.enableDependentCareFSA} onChange={(v) => updateInput('enableDependentCareFSA', v)} color="#f472b6" />
            {inputs.enableDependentCareFSA && (
              <div style={{ marginLeft: '20px', marginTop: '6px', marginBottom: '10px' }}>
                <InputSlider label="Annual Contribution" value={inputs.contributionDependentCareFSA} onChange={(v) => updateInput('contributionDependentCareFSA', v)} min={0} max={IRS_LIMITS.dependentCareFSA} step={100} format={fmt} />
                <LimitWarning value={inputs.contributionDependentCareFSA} limit={IRS_LIMITS.dependentCareFSA} label="per household" />
              </div>
            )}
            
            <Toggle label="Commuter (Employer)" checked={inputs.enableCommuter} onChange={(v) => updateInput('enableCommuter', v)} color="#06b6d4" />
            {inputs.enableCommuter && (
              <div style={{ marginLeft: '20px', marginTop: '6px', marginBottom: '10px' }}>
                <InputSlider label="Employer contribution" value={inputs.commuterEmployerContribution} onChange={(v) => updateInput('commuterEmployerContribution', v)} min={0} max={7800} step={120} format={fmt} />
                <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>Free money — doesn't come from your paycheck</div>
              </div>
            )}
          </div>
          
          {/* Annual Summary */}
          <div style={{ background: 'rgba(74,222,128,0.1)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(74,222,128,0.2)' }}>
            <h3 style={{ color: '#4ade80', fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>ANNUAL CASH FLOW</h3>
            <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Gross Income</span>
                <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(inputs.grossIncome)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#f97316' }}>− Pre-tax (401k/HSA/FSA)</span>
                <span style={{ color: '#f97316', fontFamily: 'monospace' }}>−{fmt(annual.pretax401k + annual.hsa + annual.dependentCareFSA)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#ef4444' }}>− Taxes ({inputs.location.toUpperCase()})</span>
                <span style={{ color: '#ef4444', fontFamily: 'monospace' }}>−{fmt(Math.round(taxes.total))}</span>
              </div>
              <div style={{ paddingLeft: '12px', color: '#64748b', fontSize: '9px' }}>
                Fed: {fmt(Math.round(taxes.federal))} | State/City: {fmt(Math.round(taxes.state + taxes.city))} | FICA: {fmt(Math.round(taxes.fica))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3px', marginTop: '2px' }}>
                <span style={{ color: '#94a3b8' }}>= Take-home Cash</span>
                <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(inputs.grossIncome - annual.pretax401k - annual.hsa - annual.dependentCareFSA - Math.round(taxes.total))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fb923c' }}>− Spending (excl FSA)</span>
                <span style={{ color: '#fb923c', fontFamily: 'monospace' }}>−{fmt(inputs.annualSpend - annual.dependentCareFSA)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3px', marginTop: '2px' }}>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>= Post-tax Savings</span>
                <span style={{ color: '#4ade80', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(totalSavings)}</span>
              </div>

              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '9px', color: '#64748b' }}>
                PRE-TAX: 401k {fmt(annual.pretax401k)} + Match {fmt(annual.match401k)} | HSA {fmt(annual.hsa)}
              </div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>
                POST-TAX: Roth {fmt(annual.backdoorRoth + annual.megaBackdoor)} | Taxable {fmt(taxable)}
              </div>
              {taxable < 0 && (
                <div style={{ color: '#ef4444', fontSize: '9px', marginTop: '2px' }}>⚠️ Contributions exceed savings</div>
              )}
            </div>
          </div>
          
          {/* Starting balances summary */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>STARTING BALANCES</h3>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              Total: <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(initial.pretax401k + initial.hsa + initial.backdoorRoth + initial.megaBackdoor + initial.taxable)}</span>
            </div>
          </div>
        </div>
        
        {/* Right: Chart + Results */}
        <div>
          {/* View toggle */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            <button onClick={() => setViewMode('before')} style={{
              padding: '6px 12px', borderRadius: '5px', border: viewMode === 'before' ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', fontSize: '11px', fontWeight: 600,
              background: viewMode === 'before' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)',
              color: viewMode === 'before' ? '#fbbf24' : '#94a3b8',
            }}>Before 59½</button>
            <button onClick={() => setViewMode('at59')} style={{
              padding: '6px 12px', borderRadius: '5px', border: viewMode === 'at59' ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', fontSize: '11px', fontWeight: 600,
              background: viewMode === 'at59' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
              color: viewMode === 'at59' ? '#4ade80' : '#94a3b8',
            }}>At 59½</button>
          </div>
          
          {/* Chart */}
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <g transform={`translate(${padding.left}, ${padding.top})`}>
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <g key={i}>
                  <line x1={0} y1={yScale(pct * maxValue)} x2={chartWidth} y2={yScale(pct * maxValue)} stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />
                  <text x={-8} y={yScale(pct * maxValue)} textAnchor="end" fill="#64748b" fontSize="9" dominantBaseline="middle" fontFamily="monospace">
                    {fmt(pct * maxValue)}
                  </text>
                </g>
              ))}
              
              {viewMode === 'before' ? (
                <>
                  <path d={areaPath(stackedData, () => 0, 'a_taxable')} fill={colors.taxable} opacity="0.8" />
                  {inputs.enableHSA && <path d={areaPath(stackedData, 'a_taxable', 'a_hsa')} fill={colors.hsa} opacity="0.8" />}
                  {(inputs.enableMegaBackdoor || inputs.enableBackdoorRoth) && <path d={areaPath(stackedData, 'a_hsa', 'a_roth')} fill={colors.roth} opacity="0.8" />}
                  {(inputs.enableMegaBackdoor || inputs.enableBackdoorRoth) && <path d={areaPath(stackedData, 'l_start', 'l_rothLock')} fill={colors.roth} opacity="0.4" />}
                  {inputs.enableHSA && <path d={areaPath(stackedData, 'l_rothLock', 'l_hsa')} fill={colors.hsa} opacity="0.4" />}
                  {inputs.enable401k && <path d={areaPath(stackedData, inputs.enableHSA ? 'l_hsa' : (inputs.enableMegaBackdoor || inputs.enableBackdoorRoth ? 'l_rothLock' : 'l_start'), 'l_401k')} fill={colors.pretax} opacity="0.5" />}
                  <path d={stackedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.adj_accessibleBefore)}`).join(' ')}
                    fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,3" opacity="0.8" />
                </>
              ) : (
                <>
                  <path d={areaPath(stackedData, () => 0, 's_taxable')} fill={colors.taxable} opacity="0.8" />
                  {inputs.enableHSA && <path d={areaPath(stackedData, 's_taxable', 's_hsa')} fill={colors.hsa} opacity="0.8" />}
                  {(inputs.enableMegaBackdoor || inputs.enableBackdoorRoth) && <path d={areaPath(stackedData, 's_hsa', 's_roth')} fill={colors.roth} opacity="0.8" />}
                  {inputs.enable401k && <path d={areaPath(stackedData, 's_roth', 's_401k')} fill={colors.pretax} opacity="0.8" />}
                </>
              )}
              
              {/* Net worth milestones */}
              {(() => {
                const milestones = [500000, 1000000, 2000000, 5000000, 10000000, 20000000];
                return milestones.map(m => {
                  if (m > maxValue * 0.95) return null; // Don't show if above chart
                  const hitIndex = adjustedYears.findIndex(y => y.adj_grandTotal >= m);
                  if (hitIndex === -1) return null;
                  const hitYear = adjustedYears[hitIndex];
                  return (
                    <g key={m}>
                      <line
                        x1={0} y1={yScale(m)} x2={chartWidth} y2={yScale(m)}
                        stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"
                      />
                      <circle cx={xScale(hitIndex)} cy={yScale(m)} r="4" fill="#fbbf24" stroke="#0c0f1a" strokeWidth="1.5" />
                      <text x={chartWidth - 4} y={yScale(m) - 4} textAnchor="end" fill="#fbbf24" fontSize="8" opacity="0.8">
                        {fmt(m)} @ {hitYear.age}
                      </text>
                    </g>
                  );
                });
              })()}

              {adjustedYears.filter((_, i) => i % Math.ceil(totalYears / 6) === 0 || i === totalYears).map((y) => (
                <text key={y.year} x={xScale(y.year)} y={chartHeight + 15} textAnchor="middle" fill="#94a3b8" fontSize="9">{y.age}</text>
              ))}
              <text x={chartWidth / 2} y={chartHeight + 32} textAnchor="middle" fill="#64748b" fontSize="10">Age</text>

              {adjustedYears.map((y, i) => (
                <rect key={i} x={xScale(i) - chartWidth / (adjustedYears.length * 2)} y={0} width={chartWidth / Math.max(adjustedYears.length, 1)} height={chartHeight}
                  fill="transparent"
                  onClick={() => setSelectedYearIndex(i)}
                  onMouseEnter={() => !isMobile && setHoveredYear(i)}
                  onMouseLeave={() => !isMobile && setHoveredYear(null)}
                  style={{ cursor: 'pointer' }} />
              ))}
              {(hoveredYear !== null || selectedYearIndex !== null) && (
                <line x1={xScale(effectiveYearIndex)} y1={0} x2={xScale(effectiveYearIndex)} y2={chartHeight} stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
              )}
              {/* Selected year dot marker */}
              {(hoveredYear !== null || selectedYearIndex !== null) && (
                <circle cx={xScale(effectiveYearIndex)} cy={yScale(adjustedYears[effectiveYearIndex]?.adj_grandTotal || 0)} r="5" fill="#4ade80" stroke="#0c0f1a" strokeWidth="2" />
              )}
            </g>
          </svg>

          {/* Age navigation slider */}
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setSelectedYearIndex(Math.max(0, effectiveYearIndex - 1))}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 10px', borderRadius: '6px', fontSize: isMobile ? '12px' : '11px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#f8fafc', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >←</button>
              <input
                type="range"
                min={0}
                max={totalYears}
                value={effectiveYearIndex}
                onChange={(e) => setSelectedYearIndex(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#4ade80' }}
              />
              <button
                onClick={() => setSelectedYearIndex(Math.min(totalYears, effectiveYearIndex + 1))}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 10px', borderRadius: '6px', fontSize: isMobile ? '12px' : '11px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#f8fafc', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >→</button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>Age {selectedYear.age}</span>
              <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>({effectiveYearIndex} of {totalYears} years)</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            {viewMode === 'before' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', background: 'rgba(251,191,36,0.1)', borderRadius: '4px' }}>
                <div style={{ width: '14px', height: '2px', background: '#fbbf24' }} />
                <span style={{ color: '#fbbf24', fontSize: '9px' }}>Accessible ↓ Locked ↑</span>
              </div>
            )}
            {inputs.enable401k && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: colors.pretax, borderRadius: '2px' }} /><span style={{ color: '#94a3b8', fontSize: '9px' }}>401k</span></div>}
            {(inputs.enableMegaBackdoor || inputs.enableBackdoorRoth) && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: colors.roth, borderRadius: '2px' }} /><span style={{ color: '#94a3b8', fontSize: '9px' }}>Roth</span></div>}
            {inputs.enableHSA && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: colors.hsa, borderRadius: '2px' }} /><span style={{ color: '#94a3b8', fontSize: '9px' }}>HSA</span></div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: colors.taxable, borderRadius: '2px' }} /><span style={{ color: '#94a3b8', fontSize: '9px' }}>Taxable</span></div>
          </div>

          {/* Milestones summary */}
          {(() => {
            const milestones = [500000, 1000000, 2000000, 5000000, 10000000, 20000000];
            const hit = milestones
              .map(m => {
                const idx = adjustedYears.findIndex(y => y.adj_grandTotal >= m);
                return idx >= 0 ? { amount: m, age: adjustedYears[idx].age } : null;
              })
              .filter(Boolean);
            if (hit.length === 0) return null;
            return (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                {hit.map(({ amount, age }) => (
                  <div key={amount} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px', background: 'rgba(251,191,36,0.1)',
                    borderRadius: '4px', border: '1px solid rgba(251,191,36,0.2)'
                  }}>
                    <span style={{ color: '#fbbf24', fontSize: '10px', fontWeight: 600 }}>{fmt(amount)}</span>
                    <span style={{ color: '#64748b', fontSize: '9px' }}>@ {age}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          
          {/* Selected year detail */}
          {selectedYear && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', marginTop: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}>Age {selectedYear.age}</span>
                  {inputs.showTodaysDollars && <span style={{ color: '#64748b', fontSize: '10px', marginLeft: '8px' }}>(today's $)</span>}
                </div>
                <span style={{ color: '#f8fafc', fontSize: '12px' }}>{fmt(selectedYear.adj_grandTotal)} → <span style={{ color: '#4ade80' }}>{fmt(selectedYear.adj_afterTax)} after tax</span></span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? (viewMode === 'before' ? '1fr' : 'repeat(2, 1fr)') : (viewMode === 'before' ? '1fr 1fr' : 'repeat(4, 1fr)'), gap: '8px' }}>
                {viewMode === 'before' ? (
                  <>
                    <div style={{ background: 'rgba(74,222,128,0.1)', borderRadius: '6px', padding: '10px', border: '1px solid rgba(74,222,128,0.2)' }}>
                      <div style={{ color: '#4ade80', fontSize: '10px', fontWeight: 600, marginBottom: '6px' }}>✓ ACCESSIBLE NOW</div>
                      <div style={{ color: '#4ade80', fontSize: '18px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(selectedYear.adj_accessibleBefore)}</div>
                      <div style={{ color: '#64748b', fontSize: '9px', marginBottom: '8px' }}>{Math.round(selectedYear.adj_accessibleBefore / selectedYear.adj_grandTotal * 100)}% of portfolio</div>

                      {/* Mini stacked bar */}
                      <div style={{ height: '16px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '8px' }}>
                        {selectedYear.adj_taxablePrincipal + selectedYear.adj_taxableGains > 0 && (
                          <div style={{
                            width: `${(selectedYear.adj_taxablePrincipal + selectedYear.adj_taxableGains) / selectedYear.adj_accessibleBefore * 100}%`,
                            background: colors.taxable
                          }} />
                        )}
                        {selectedYear.adj_mbdPrincipal + selectedYear.adj_backdoorUnlocked > 0 && (
                          <div style={{
                            width: `${(selectedYear.adj_mbdPrincipal + selectedYear.adj_backdoorUnlocked) / selectedYear.adj_accessibleBefore * 100}%`,
                            background: colors.roth
                          }} />
                        )}
                        {selectedYear.adj_hsaPrincipal > 0 && (
                          <div style={{
                            width: `${selectedYear.adj_hsaPrincipal / selectedYear.adj_accessibleBefore * 100}%`,
                            background: colors.hsa
                          }} />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {selectedYear.adj_taxablePrincipal + selectedYear.adj_taxableGains > 0 && (
                          <div style={{ fontSize: '9px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors.taxable }} />
                                <span style={{ color: '#94a3b8' }}>Taxable</span>
                              </span>
                              <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(selectedYear.adj_taxablePrincipal + selectedYear.adj_taxableGains)}</span>
                            </div>
                            <div style={{ paddingLeft: '12px', color: '#64748b', fontSize: '8px' }}>
                              Basis: {fmt(selectedYear.adj_taxablePrincipal)} | Gains: {fmt(selectedYear.adj_taxableGains)}
                            </div>
                          </div>
                        )}
                        {selectedYear.adj_mbdPrincipal + selectedYear.adj_backdoorUnlocked > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors.roth }} />
                              <span style={{ color: '#94a3b8' }}>Roth principal</span>
                            </span>
                            <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(selectedYear.adj_mbdPrincipal + selectedYear.adj_backdoorUnlocked)}</span>
                          </div>
                        )}
                        {selectedYear.adj_hsaPrincipal > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors.hsa }} />
                              <span style={{ color: '#94a3b8' }}>HSA (shoebox)</span>
                            </span>
                            <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(selectedYear.adj_hsaPrincipal)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '6px', padding: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div style={{ color: '#ef4444', fontSize: '10px', fontWeight: 600, marginBottom: '6px' }}>🔒 LOCKED UNTIL 59½</div>
                      <div style={{ color: '#ef4444', fontSize: '18px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(selectedYear.adj_lockedBefore)}</div>
                      <div style={{ color: '#64748b', fontSize: '9px', marginBottom: '8px' }}>{Math.round(selectedYear.adj_lockedBefore / selectedYear.adj_grandTotal * 100)}% of portfolio</div>

                      {/* Mini stacked bar */}
                      <div style={{ height: '16px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '8px' }}>
                        {selectedYear.adj_pretax401k > 0 && (
                          <div style={{
                            width: `${selectedYear.adj_pretax401k / selectedYear.adj_lockedBefore * 100}%`,
                            background: colors.pretax
                          }} />
                        )}
                        {selectedYear.adj_mbdGains + selectedYear.adj_backdoorGains + selectedYear.adj_backdoorLocked > 0 && (
                          <div style={{
                            width: `${(selectedYear.adj_mbdGains + selectedYear.adj_backdoorGains + selectedYear.adj_backdoorLocked) / selectedYear.adj_lockedBefore * 100}%`,
                            background: colors.roth
                          }} />
                        )}
                        {selectedYear.adj_hsaGains > 0 && (
                          <div style={{
                            width: `${selectedYear.adj_hsaGains / selectedYear.adj_lockedBefore * 100}%`,
                            background: colors.hsa
                          }} />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {selectedYear.adj_pretax401k > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors.pretax }} />
                              <span style={{ color: '#94a3b8' }}>401k</span>
                            </span>
                            <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(selectedYear.adj_pretax401k)}</span>
                          </div>
                        )}
                        {selectedYear.adj_mbdGains + selectedYear.adj_backdoorGains > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors.roth }} />
                              <span style={{ color: '#94a3b8' }}>Roth gains</span>
                            </span>
                            <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(selectedYear.adj_mbdGains + selectedYear.adj_backdoorGains)}</span>
                          </div>
                        )}
                        {selectedYear.adj_backdoorLocked > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors.roth, opacity: 0.6 }} />
                              <span style={{ color: '#94a3b8' }}>Roth (5yr lock)</span>
                            </span>
                            <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(selectedYear.adj_backdoorLocked)}</span>
                          </div>
                        )}
                        {selectedYear.adj_hsaGains > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors.hsa }} />
                              <span style={{ color: '#94a3b8' }}>HSA gains</span>
                            </span>
                            <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{fmt(selectedYear.adj_hsaGains)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Roth callout */}
                    <div style={{ gridColumn: '1 / -1', background: 'rgba(74,222,128,0.05)', borderRadius: '6px', padding: '8px 10px', border: '1px solid rgba(74,222,128,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: colors.roth }} />
                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>Total Roth (principal + gains)</span>
                      </div>
                      <span style={{ color: colors.roth, fontSize: '14px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(selectedYear.adj_totalRoth)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: `${colors.pretax}15`, borderRadius: '5px', padding: '6px', borderLeft: `3px solid ${colors.pretax}` }}>
                      <div style={{ color: '#64748b', fontSize: '8px' }}>401k</div>
                      <div style={{ color: colors.pretax, fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(selectedYear.adj_pretax401k)}</div>
                      <div style={{ color: '#fb923c', fontSize: '8px' }}>−{fmt(selectedYear.adj_tax401k)} tax</div>
                    </div>
                    <div style={{ background: `${colors.roth}15`, borderRadius: '5px', padding: '6px', borderLeft: `3px solid ${colors.roth}` }}>
                      <div style={{ color: '#64748b', fontSize: '8px' }}>Roth</div>
                      <div style={{ color: colors.roth, fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(selectedYear.adj_totalRoth)}</div>
                      <div style={{ color: '#86efac', fontSize: '8px' }}>$0 tax</div>
                    </div>
                    <div style={{ background: `${colors.hsa}15`, borderRadius: '5px', padding: '6px', borderLeft: `3px solid ${colors.hsa}` }}>
                      <div style={{ color: '#64748b', fontSize: '8px' }}>HSA</div>
                      <div style={{ color: colors.hsa, fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(selectedYear.adj_totalHSA)}</div>
                      <div style={{ color: '#c084fc', fontSize: '8px' }}>$0 tax</div>
                    </div>
                    <div style={{ background: `${colors.taxable}15`, borderRadius: '5px', padding: '6px', borderLeft: `3px solid ${colors.taxable}` }}>
                      <div style={{ color: '#64748b', fontSize: '8px' }}>Taxable</div>
                      <div style={{ color: colors.taxable, fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(selectedYear.adj_totalTaxable)}</div>
                      <div style={{ color: '#64748b', fontSize: '7px' }}>Basis: {fmt(selectedYear.adj_taxablePrincipal)}</div>
                      <div style={{ color: '#7dd3fc', fontSize: '8px' }}>−{fmt(selectedYear.adj_taxCapGains)} tax on {fmt(selectedYear.adj_taxableGains)} gains</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Final summary */}
          {adjustedYears.length > 0 && (
            <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(74,222,128,0.1)', borderRadius: '6px', borderLeft: '3px solid #4ade80' }}>
              <span style={{ color: '#f1f5f9', fontSize: '11px' }}>
                <strong style={{ color: '#4ade80' }}>At {inputs.retirementAge}:</strong> {fmt(adjustedYears[adjustedYears.length - 1].adj_grandTotal)} total → {fmt(adjustedYears[adjustedYears.length - 1].adj_afterTax)} after tax
                {inputs.showTodaysDollars && <span style={{ color: '#64748b' }}> (today's $)</span>}
                {'. '}<span style={{ color: '#94a3b8' }}>{fmt(adjustedYears[adjustedYears.length - 1].adj_totalRoth + adjustedYears[adjustedYears.length - 1].adj_totalHSA)} tax-free.</span>
              </span>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

// Annual Cash Flow Sankey Component
const AnnualSankeyView = ({ inputs, taxes, annual, taxable, totalSavings, fmt, isMobile }) => {
  const width = 700;
  const height = 380;
  const nodeWidth = 20;

  const grossIncome = inputs.grossIncome;
  const totalTax = Math.round(taxes.total);
  const match = annual.match401k;
  const fsa = annual.dependentCareFSA;
  const commuterEmployer = annual.commuterEmployer;

  // Total savings = all contributions (pre-tax come from gross, post-tax from take-home, but conceptually it's all "savings")
  const totalInvested = annual.pretax401k + match + annual.hsa + annual.backdoorRoth + annual.megaBackdoor + Math.max(0, taxable);
  // Spending = gross - taxes - savings - FSA (FSA is spent on childcare, not invested)
  const spending = grossIncome - totalTax - totalInvested;

  // Simplified 3-column layout
  const nodes = {
    // Column 0: Income
    gross: { label: 'Gross Income', value: grossIncome, col: 0, color: '#f8fafc' },
    match: { label: 'Employer Match', value: match, col: 0, color: '#fbbf24' },
    // Column 1: Where it goes
    taxes: { label: 'Taxes', value: totalTax, col: 1, color: '#ef4444' },
    spending: { label: 'Net Spending', value: Math.max(0, spending), col: 1, color: '#fb923c' },
    savings: { label: 'Savings', value: totalInvested, col: 1, color: '#4ade80' },
    // Column 2: Investment accounts
    k401: { label: '401k', value: annual.pretax401k + match, col: 2, color: '#f97316' },
    hsa: { label: 'HSA', value: annual.hsa, col: 2, color: '#a855f7' },
    roth: { label: 'Roth', value: annual.backdoorRoth + annual.megaBackdoor, col: 2, color: '#4ade80' },
    taxableAcct: { label: 'Taxable', value: Math.max(0, taxable), col: 2, color: '#38bdf8' },
  };

  // Simplified links
  const links = [
    // Gross income splits
    { source: 'gross', target: 'taxes', value: totalTax },
    { source: 'gross', target: 'spending', value: Math.max(0, spending) },
    { source: 'gross', target: 'savings', value: totalInvested - match }, // exclude match, it comes separately
    // Employer match goes to savings
    { source: 'match', target: 'savings', value: match },
    // Savings to accounts
    { source: 'savings', target: 'k401', value: annual.pretax401k + match },
    { source: 'savings', target: 'hsa', value: annual.hsa },
    { source: 'savings', target: 'roth', value: annual.backdoorRoth + annual.megaBackdoor },
    { source: 'savings', target: 'taxableAcct', value: Math.max(0, taxable) },
  ].filter(l => l.value > 0);

  // 3 columns
  const colX = [50, 300, 550];
  const colHeaders = ['INCOME', 'WHERE IT GOES', 'INVESTED IN'];
  
  // Group nodes by column
  const cols = [[], [], []];
  Object.entries(nodes).forEach(([id, node]) => {
    cols[node.col].push({ id, ...node });
  });
  
  // Position nodes
  const nodePos = {};
  const padding = 50;
  const availHeight = height - padding * 2;
  
  cols.forEach((col, colIdx) => {
    // Filter to nodes with value > 0
    const activeNodes = col.filter(n => n.value > 0);
    const totalVal = activeNodes.reduce((s, n) => s + n.value, 0);
    const scale = availHeight / Math.max(totalVal, grossIncome) * 0.85;
    
    let y = padding;
    activeNodes.forEach(node => {
      const h = Math.max(node.value * scale, 24);
      nodePos[node.id] = { ...node, x: colX[colIdx], y, h };
      y += h + 12;
    });
  });
  
  // Track link offsets
  const sourceOffsets = {};
  const targetOffsets = {};
  
  const linkPaths = links.map(link => {
    const src = nodePos[link.source];
    const tgt = nodePos[link.target];
    if (!src || !tgt) return null;
    
    sourceOffsets[link.source] = sourceOffsets[link.source] || 0;
    targetOffsets[link.target] = targetOffsets[link.target] || 0;
    
    const srcH = (link.value / src.value) * src.h;
    const tgtH = (link.value / tgt.value) * tgt.h;
    
    const x0 = src.x + nodeWidth;
    const y0 = src.y + sourceOffsets[link.source];
    const x1 = tgt.x;
    const y1 = tgt.y + targetOffsets[link.target];
    
    sourceOffsets[link.source] += srcH;
    targetOffsets[link.target] += tgtH;
    
    const mid = (x0 + x1) / 2;
    
    return {
      d: `M${x0},${y0} C${mid},${y0} ${mid},${y1} ${x1},${y1} L${x1},${y1 + tgtH} C${mid},${y1 + tgtH} ${mid},${y0 + srcH} ${x0},${y0 + srcH} Z`,
      color: tgt.color,
      value: link.value,
    };
  }).filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
        <span style={{ color: '#f1f5f9', fontSize: '12px' }}>
          <strong style={{ color: '#38bdf8' }}>Annual view:</strong> Where every dollar of your {fmt(grossIncome)} goes each year
        </span>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
        {/* Column headers */}
        {colHeaders.map((h, i) => (
          <text key={i} x={colX[i] + nodeWidth/2} y={24} fill="#64748b" fontSize="9" fontWeight="600" textAnchor="middle">{h}</text>
        ))}
        
        {/* Links */}
        {linkPaths.map((link, i) => (
          <path key={i} d={link.d} fill={link.color} opacity="0.25" />
        ))}
        
        {/* Nodes */}
        {Object.entries(nodePos).map(([id, node]) => (
          <g key={id}>
            <rect x={node.x} y={node.y} width={nodeWidth} height={node.h} fill={node.color} rx="4" />
            <text x={node.x + nodeWidth + 6} y={node.y + node.h/2 - 6} fill="#f8fafc" fontSize="10" fontWeight="600" dominantBaseline="middle">
              {node.label}
            </text>
            <text x={node.x + nodeWidth + 6} y={node.y + node.h/2 + 7} fill="#94a3b8" fontSize="9" fontFamily="monospace" dominantBaseline="middle">
              {fmt(node.value)}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Summary boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '8px', marginTop: '16px' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #ef4444' }}>
          <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>Taxes</div>
          <div style={{ color: '#ef4444', fontSize: '16px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(totalTax)}</div>
          <div style={{ color: '#64748b', fontSize: '8px', marginTop: '2px' }}>{Math.round(totalTax / grossIncome * 100)}%</div>
        </div>
        
        <div style={{ background: 'rgba(251,146,60,0.1)', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #fb923c' }}>
          <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>Net Spending</div>
          <div style={{ color: '#fb923c', fontSize: '16px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(Math.max(0, spending))}</div>
          <div style={{ color: '#64748b', fontSize: '8px', marginTop: '2px' }}>= income − taxes − savings</div>
        </div>
        
        <div style={{ background: 'rgba(251,191,36,0.1)', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #fbbf24' }}>
          <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>Employer Benefits</div>
          <div style={{ color: '#fbbf24', fontSize: '16px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(match + commuterEmployer)}</div>
          <div style={{ color: '#64748b', fontSize: '8px', marginTop: '2px' }}>Match + Transit</div>
        </div>
        
        <div style={{ background: 'rgba(74,222,128,0.1)', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #4ade80' }}>
          <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>Tax-Advantaged</div>
          <div style={{ color: '#4ade80', fontSize: '16px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(annual.pretax401k + annual.match401k + annual.hsa + annual.backdoorRoth + annual.megaBackdoor)}</div>
          <div style={{ color: '#64748b', fontSize: '8px', marginTop: '2px' }}>Invested</div>
        </div>
        
        <div style={{ background: 'rgba(56,189,248,0.1)', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #38bdf8' }}>
          <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>Taxable</div>
          <div style={{ color: '#38bdf8', fontSize: '16px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(Math.max(0, taxable))}</div>
          <div style={{ color: '#64748b', fontSize: '8px', marginTop: '2px' }}>Brokerage</div>
        </div>
      </div>
      
      {/* Insight */}
      <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(74,222,128,0.1)', borderRadius: '6px', borderLeft: '3px solid #4ade80' }}>
        <span style={{ color: '#f1f5f9', fontSize: '11px' }}>
          <strong style={{ color: '#fbbf24' }}>Free money:</strong> {fmt(match + commuterEmployer)} from employer (401k match + commuter). 
          <strong style={{ color: '#f472b6', marginLeft: '8px' }}>FSA savings:</strong> {fmt(fsa)} pre-tax → saves ~{fmt(Math.round(fsa * 0.45))} in taxes.
        </span>
      </div>
    </div>
  );
};

export default RetirementSimulator;
