import { useEffect, useState } from 'react';
import { CostBreakdown, LifestyleInputs, CategoryCosts } from '../../types';
import { formatCurrencyFull, formatCurrency } from '../../calculator';

interface Props {
  breakdown: CostBreakdown;
  inputs: LifestyleInputs;
  onRestart: () => void;
}

const categoryConfig: {
  key: keyof CategoryCosts;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: 'housing', label: 'Housing', icon: '🏠', color: '#e07a5f' },
  { key: 'education', label: 'Education', icon: '📚', color: '#81b29a' },
  { key: 'childcare', label: 'Household Help', icon: '👥', color: '#f2cc8f' },
  { key: 'food', label: 'Food & Shabbat', icon: '🍽️', color: '#3d405b' },
  { key: 'simchas', label: 'Simchas & Gifts', icon: '🎉', color: '#e07a5f99' },
  { key: 'transportation', label: 'Transportation', icon: '🚗', color: '#81b29a99' },
  { key: 'extras', label: 'Lifestyle Extras', icon: '✨', color: '#f2cc8f99' },
];

function DonutChart({ categories, total }: { categories: CategoryCosts; total: number }) {
  const size = 200;
  const strokeWidth = 35;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentOffset = 0;
  const segments = categoryConfig
    .map((cat) => {
      const value = categories[cat.key];
      if (value === 0) return null;
      const percentage = value / total;
      const length = percentage * circumference;
      const offset = currentOffset;
      currentOffset += length;
      return { ...cat, value, percentage, length, offset };
    })
    .filter(Boolean);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e5e0" strokeWidth={strokeWidth} />

      {/* Segments */}
      {segments.map((seg, i) => (
        <circle
          key={seg!.key}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={seg!.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${seg!.length} ${circumference}`}
          strokeDashoffset={-seg!.offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      ))}

      {/* Center text */}
      <text x={center} y={center - 8} textAnchor="middle" fontSize="12" fill="#8a8a8a">
        Annual
      </text>
      <text x={center} y={center + 12} textAnchor="middle" fontSize="16" fontWeight="600" fill="#1a1a1a">
        {formatCurrency(total)}
      </text>
    </svg>
  );
}

export function ResultsScreen({ breakdown, inputs, onRestart }: Props) {
  const [displayTotal, setDisplayTotal] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Animate the number counting up
  useEffect(() => {
    const target = breakdown.totalAnnual;
    const duration = 1500; // ms
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplayTotal(current);

      if (step >= steps) {
        clearInterval(timer);
        setAnimationComplete(true);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [breakdown.totalAnnual]);

  const handleShare = async () => {
    const text = `It costs ${formatCurrencyFull(breakdown.totalAnnual)}/year to live my Syrian life. Calculate yours at [URL]`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      } catch (e) {
        // Clipboard failed
      }
    }
  };

  return (
    <div className="results-container">
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Your Syrian life costs roughly</p>
        <div className={`big-number ${animationComplete ? 'count-up' : ''}`}>
          {formatCurrencyFull(displayTotal)}
          <span style={{ fontSize: '1.5rem' }}>/year</span>
        </div>
        <div className="big-number-monthly">{formatCurrencyFull(breakdown.totalMonthly)}/month</div>
      </div>

      <div className="donut-container">
        <div className="donut-chart">
          <DonutChart categories={breakdown.categories} total={breakdown.totalAnnual} />
        </div>

        <div className="donut-legend">
          {categoryConfig.map((cat) => {
            const value = breakdown.categories[cat.key];
            if (value === 0) return null;
            const pct = Math.round((value / breakdown.totalAnnual) * 100);
            return (
              <div key={cat.key} className="legend-item">
                <div className="legend-color" style={{ background: cat.color }} />
                <span>
                  {cat.label} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="breakdown-list">
        {categoryConfig.map((cat) => {
          const value = breakdown.categories[cat.key];
          // Always show education, hide others if $0
          if (value === 0 && cat.key !== 'education') return null;
          return (
            <div key={cat.key} className="breakdown-item">
              <div className="breakdown-category">
                <span className="breakdown-icon">{cat.icon}</span>
                <span className="breakdown-name">{cat.label}</span>
              </div>
              <span className="breakdown-amount">
                {value === 0 ? 'No kids added' : formatCurrencyFull(value)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="share-section">
        <button className="share-btn" onClick={handleShare}>
          <span>📤</span>
          <span>Share Your Results</span>
        </button>

        <div className="real-mode-cta">
          <p>This is a rough estimate based on community averages.</p>
          <p>
            <strong>Want exact numbers?</strong> Real Mode coming soon with 30-year projections.
          </p>
        </div>

        <button
          onClick={onRestart}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.75rem',
            background: 'transparent',
            border: '2px solid #e5e5e0',
            borderRadius: '12px',
            color: '#4a4a4a',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
