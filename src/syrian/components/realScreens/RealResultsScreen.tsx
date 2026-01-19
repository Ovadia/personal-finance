import { useState } from 'react';
import { RealModeOutput, RealModeInputs, RealModeCategoryCosts, INCOME_MIDPOINTS } from '../../types';
import { formatCurrencyFull, formatCurrency } from '../../calculator';

interface Props {
  projection: RealModeOutput;
  inputs: RealModeInputs;
  onRestart: () => void;
}

const categoryConfig: {
  key: keyof RealModeCategoryCosts;
  label: string;
  color: string;
}[] = [
  { key: 'housing', label: 'Housing', color: '#e07a5f' },
  { key: 'education', label: 'Education', color: '#81b29a' },
  { key: 'childcare', label: 'Household Help', color: '#f2cc8f' },
  { key: 'food', label: 'Food & Dining', color: '#3d405b' },
  { key: 'simchas', label: 'Simchas & Gifts', color: '#e07a5f99' },
  { key: 'transportation', label: 'Transportation', color: '#81b29a99' },
  { key: 'insurance', label: 'Insurance', color: '#f2cc8f99' },
  { key: 'tzedakah', label: 'Tzedakah', color: '#8ecae6' },
  { key: 'extras', label: 'Extras', color: '#bc6c25' },
];

function StackedAreaChart({
  projection,
  selectedYear,
  onSelectYear,
}: {
  projection: RealModeOutput;
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
}) {
  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const years = projection.projection;
  const maxTotal = Math.max(...years.map((y) => y.totalAnnual));
  const yScale = (val: number) => chartHeight - (val / maxTotal) * chartHeight;
  const xScale = (year: number) => (year / 29) * chartWidth;

  // Build stacked data
  const stackedData = categoryConfig.map((cat) => {
    return years.map((y, i) => {
      const prevCategories = categoryConfig.slice(0, categoryConfig.indexOf(cat));
      const baseY = prevCategories.reduce((sum, c) => sum + y.costs[c.key], 0);
      const topY = baseY + y.costs[cat.key];
      return {
        year: i,
        baseY,
        topY,
        value: y.costs[cat.key],
      };
    });
  });

  // Create SVG paths for each category
  const paths = stackedData.map((data, catIdx) => {
    const cat = categoryConfig[catIdx];
    if (data.every((d) => d.value === 0)) return null;

    const topLine = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(d.topY)}`).join(' ');
    const bottomLine = data
      .slice()
      .reverse()
      .map((d, i) => `L ${xScale(d.year)} ${yScale(d.baseY)}`)
      .join(' ');

    return (
      <path key={cat.key} d={`${topLine} ${bottomLine} Z`} fill={cat.color} opacity={0.8} />
    );
  });

  // Event markers
  const eventMarkers = years.flatMap((y) =>
    y.events.map((e) => ({
      year: y.year,
      event: e,
      y: y.totalAnnual,
    }))
  );

  // Y-axis labels
  const yTicks = [0, maxTotal * 0.25, maxTotal * 0.5, maxTotal * 0.75, maxTotal];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Y-axis */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={0} y1={yScale(tick)} x2={chartWidth} y2={yScale(tick)} stroke="#e5e5e0" strokeWidth={1} />
            <text x={-10} y={yScale(tick)} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="#8a8a8a">
              {formatCurrency(tick)}
            </text>
          </g>
        ))}

        {/* Stacked areas */}
        {paths}

        {/* Event markers */}
        {eventMarkers.slice(0, 15).map((m, i) => (
          <g key={`${m.year}-${i}`}>
            <line
              x1={xScale(m.year)}
              y1={yScale(m.y)}
              x2={xScale(m.year)}
              y2={chartHeight}
              stroke="#1a1a1a"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.3}
            />
            <circle cx={xScale(m.year)} cy={yScale(m.y) - 5} r={4} fill="#1a1a1a" />
          </g>
        ))}

        {/* X-axis */}
        <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#1a1a1a" strokeWidth={1} />
        {[0, 5, 10, 15, 20, 25, 29].map((year) => (
          <text
            key={year}
            x={xScale(year)}
            y={chartHeight + 20}
            textAnchor="middle"
            fontSize="10"
            fill="#8a8a8a"
          >
            {year === 0 ? 'Now' : `Yr ${year + 1}`}
          </text>
        ))}

        {/* Hover overlay */}
        {years.map((y, i) => (
          <rect
            key={i}
            x={xScale(i) - chartWidth / 60}
            y={0}
            width={chartWidth / 30}
            height={chartHeight}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onSelectYear(i)}
            onMouseLeave={() => onSelectYear(null)}
            onClick={() => onSelectYear(selectedYear === i ? null : i)}
          />
        ))}

        {/* Selected year indicator */}
        {selectedYear !== null && (
          <line
            x1={xScale(selectedYear)}
            y1={0}
            x2={xScale(selectedYear)}
            y2={chartHeight}
            stroke="#e07a5f"
            strokeWidth={2}
          />
        )}
      </g>
    </svg>
  );
}

export function RealResultsScreen({ projection, inputs, onRestart }: Props) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const currentYear = projection.projection[0];
  const displayYear = selectedYear !== null ? projection.projection[selectedYear] : currentYear;
  const income = INCOME_MIDPOINTS[inputs.incomeRange] + inputs.annualSupport;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Your 30-Year Projection</h2>
        <div style={{ fontSize: '2.5rem', fontWeight: '600', color: '#e07a5f' }}>
          {formatCurrencyFull(displayYear.totalAnnual)}
          <span style={{ fontSize: '1rem', color: '#4a4a4a' }}>/year</span>
        </div>
        <div style={{ color: '#4a4a4a' }}>
          {selectedYear !== null ? `Year ${selectedYear + 1}` : 'Current Year'} •{' '}
          {formatCurrencyFull(displayYear.totalAnnual / 12)}/month
        </div>
      </div>

      {/* Cash Flow */}
      <div
        style={{
          padding: '1rem',
          background: projection.incomeGap >= 0 ? '#f0fdf4' : '#fef2f2',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: `2px solid ${projection.incomeGap >= 0 ? '#81b29a' : '#e07a5f'}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Income</span>
          <span style={{ fontWeight: '600' }}>{formatCurrencyFull(income)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Expenses (Year 1)</span>
          <span style={{ fontWeight: '600' }}>{formatCurrencyFull(currentYear.totalAnnual)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            fontWeight: '600',
            color: projection.incomeGap >= 0 ? '#166534' : '#dc2626',
          }}
        >
          <span>{projection.incomeGap >= 0 ? 'Surplus' : 'Gap'}</span>
          <span>
            {projection.incomeGap >= 0 ? '+' : ''}
            {formatCurrencyFull(projection.incomeGap)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>30-Year Cost Projection</div>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1rem',
            border: '2px solid #e5e5e0',
          }}
        >
          <StackedAreaChart projection={projection} selectedYear={selectedYear} onSelectYear={setSelectedYear} />

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' }}>
            {categoryConfig.map((cat) => {
              const hasValue = projection.projection.some((y) => y.costs[cat.key] > 0);
              if (!hasValue) return null;
              return (
                <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: cat.color }} />
                  <span>{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e5e0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#8a8a8a' }}>30-Year Total</div>
          <div style={{ fontWeight: '600', color: '#e07a5f' }}>{formatCurrency(projection.thirtyYearTotal)}</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e5e0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#8a8a8a' }}>Peak Year</div>
          <div style={{ fontWeight: '600' }}>Year {projection.peakYear.year + 1}</div>
          <div style={{ fontSize: '0.75rem', color: '#4a4a4a' }}>{formatCurrency(projection.peakYear.amount)}</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'white', borderRadius: '12px', border: '2px solid #e5e5e0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#8a8a8a' }}>Lowest Year</div>
          <div style={{ fontWeight: '600' }}>Year {projection.lowestYear.year + 1}</div>
          <div style={{ fontSize: '0.75rem', color: '#4a4a4a' }}>{formatCurrency(projection.lowestYear.amount)}</div>
        </div>
      </div>

      {/* Insights */}
      {projection.insights.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Key Insights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {projection.insights.map((insight, i) => (
              <div
                key={i}
                style={{
                  padding: '0.75rem',
                  background: '#fff8f6',
                  borderRadius: '8px',
                  borderLeft: '3px solid #e07a5f',
                  fontSize: '0.9rem',
                }}
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events for selected year */}
      {selectedYear !== null && displayYear.events.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Year {selectedYear + 1} Events</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {displayYear.events.map((event, i) => (
              <div
                key={i}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#f5f5f2',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                }}
              >
                {event.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          {selectedYear !== null ? `Year ${selectedYear + 1}` : 'Current Year'} Breakdown
        </div>
        {categoryConfig.map((cat) => {
          const value = displayYear.costs[cat.key];
          if (value === 0) return null;
          const pct = Math.round((value / displayYear.totalAnnual) * 100);

          return (
            <div
              key={cat.key}
              style={{
                padding: '0.75rem',
                background: 'white',
                borderRadius: '8px',
                border: '2px solid #e5e5e0',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: cat.color }} />
                  <span style={{ fontWeight: '500' }}>{cat.label}</span>
                  <span style={{ fontSize: '0.8rem', color: '#8a8a8a' }}>({pct}%)</span>
                </div>
                <span style={{ fontWeight: '600' }}>{formatCurrencyFull(value)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onRestart}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'white',
            border: '2px solid #e5e5e0',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Start Over
        </button>
        <a
          href="/lifestyle"
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#f5f5f2',
            border: '2px solid #e5e5e0',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#4a4a4a',
            textAlign: 'center',
            fontSize: '0.9rem',
          }}
        >
          Back to Quick Mode
        </a>
      </div>
    </div>
  );
}
