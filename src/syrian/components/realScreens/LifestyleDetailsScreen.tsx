import { RealModeInputs, PesachStyle, HelpLevel, SimchaStyle } from '../../types';
import { COSTS } from '../../constants';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: RealModeInputs;
  updateInput: <K extends keyof RealModeInputs>(field: K, value: RealModeInputs[K]) => void;
}

const pesachOptions: { value: PesachStyle; label: string; cost: number }[] = [
  { value: 'home', label: 'Home (self-catered)', cost: 2000 },
  { value: 'catered', label: 'Home (catered)', cost: 8000 },
  { value: 'hotel', label: 'Hotel program', cost: 30000 },
  { value: 'travel', label: 'Travel (Israel, etc.)', cost: 25000 },
];

const helpLevels: { value: HelpLevel; label: string }[] = [
  { value: 'none', label: 'No regular help' },
  { value: 'cleaning', label: '1 day/week ($6.5K/yr)' },
  { value: 'day-worker', label: '3 days/week ($19.5K/yr)' },
  { value: 'full-time', label: '5 days/week ($32.5K/yr)' },
  { value: 'live-in', label: 'Live-in ($40K/yr)' },
];

const simchaStyles: { value: SimchaStyle; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'standard', label: 'Standard' },
  { value: 'lavish', label: 'Lavish' },
];

const hostingLabels = ['Never', 'Monthly', 'Bi-weekly', 'Weekly', 'Multiple/week'];

export function LifestyleDetailsScreen({ inputs, updateInput }: Props) {
  return (
    <div>
      <h2>Lifestyle & day-to-day.</h2>
      <p>These recurring costs shape your annual budget.</p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Weekly groceries</div>
        <div className="slider-container">
          <div className="slider-label">
            <span>Weekly spend</span>
            <span className="slider-value">${inputs.weeklyGroceries}/week</span>
          </div>
          <input
            type="range"
            className="slider"
            min={200}
            max={1500}
            step={50}
            value={inputs.weeklyGroceries}
            onChange={(e) => updateInput('weeklyGroceries', parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8a8a8a' }}>
            <span>$200/wk</span>
            <span>$1,500/wk</span>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#8a8a8a', marginTop: '0.25rem' }}>
          = {formatCurrency(inputs.weeklyGroceries * 52)}/year
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Dining out & takeout</div>
        <div className="slider-container">
          <div className="slider-label">
            <span>Monthly spend</span>
            <span className="slider-value">${inputs.diningOutMonthly}/month</span>
          </div>
          <input
            type="range"
            className="slider"
            min={0}
            max={3000}
            step={100}
            value={inputs.diningOutMonthly}
            onChange={(e) => updateInput('diningOutMonthly', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Shabbat hosting</div>
        <div className="slider-container">
          <div className="slider-label">
            <span>{hostingLabels[inputs.shabbatHosting]}</span>
            <span className="slider-value">
              {COSTS.food.hostingFrequency[inputs.shabbatHosting]} times/year
            </span>
          </div>
          <input
            type="range"
            className="slider"
            min={0}
            max={4}
            value={inputs.shabbatHosting}
            onChange={(e) => updateInput('shabbatHosting', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Pesach</div>
        <div className="card-grid cols-2">
          {pesachOptions.map((opt) => (
            <div
              key={opt.value}
              className={`card ${inputs.pesachStyle === opt.value ? 'selected' : ''}`}
              onClick={() => {
                updateInput('pesachStyle', opt.value);
                updateInput('pesachCost', opt.cost);
              }}
              style={{ padding: '0.75rem' }}
            >
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{opt.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#8a8a8a' }}>~{formatCurrency(opt.cost)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Annual vacation budget</div>
        <p style={{ fontSize: '0.85rem', color: '#4a4a4a', marginBottom: '0.5rem' }}>
          Beyond Pesach and Deal - winter trips, other travel
        </p>
        <div className="slider-container">
          <div className="slider-label">
            <span>Annual budget</span>
            <span className="slider-value">{formatCurrency(inputs.annualVacationBudget)}</span>
          </div>
          <input
            type="range"
            className="slider"
            min={0}
            max={50000}
            step={1000}
            value={inputs.annualVacationBudget}
            onChange={(e) => updateInput('annualVacationBudget', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Nanny / Childcare</div>
        <div
          className={`toggle-container ${inputs.hasNanny ? 'active' : ''}`}
          onClick={() => updateInput('hasNanny', !inputs.hasNanny)}
          style={{ cursor: 'pointer', marginBottom: inputs.hasNanny ? '0.75rem' : 0 }}
        >
          <div className="toggle-label">
            <div className="toggle-title">Have a nanny?</div>
            <div className="toggle-cost">Cost scales down as kids get older</div>
          </div>
          <div className={`toggle-switch ${inputs.hasNanny ? 'active' : ''}`} />
        </div>

        {inputs.hasNanny && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              Annual nanny cost (when kids are young)
            </label>
            <input
              type="number"
              value={inputs.nannyCost}
              onChange={(e) => updateInput('nannyCost', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '2px solid #e5e5e0',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
              placeholder="60000"
            />
            <div style={{ fontSize: '0.8rem', color: '#8a8a8a', marginTop: '0.25rem' }}>
              100% until youngest is 5 → 75% ages 5-7 → 50% ages 8-12 → 0% at 13+
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Household help (cleaning)</div>
        <select
          value={inputs.helpLevel}
          onChange={(e) => updateInput('helpLevel', e.target.value as HelpLevel)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e5e0',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'white',
          }}
        >
          {helpLevels.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Simcha style</div>
        <div className="card-grid cols-3">
          {simchaStyles.map((opt) => (
            <div
              key={opt.value}
              className={`card ${inputs.simchaStyle === opt.value ? 'selected' : ''}`}
              onClick={() => updateInput('simchaStyle', opt.value)}
              style={{ padding: '0.75rem' }}
            >
              <div style={{ fontWeight: '600' }}>{opt.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div
          className={`toggle-container ${inputs.sleepawaycamp ? 'active' : ''}`}
          onClick={() => updateInput('sleepawaycamp', !inputs.sleepawaycamp)}
          style={{ cursor: 'pointer' }}
        >
          <div className="toggle-label">
            <div className="toggle-title">Sleepaway camp</div>
            <div className="toggle-cost">$9K/child (ages 8-16)</div>
          </div>
          <div className={`toggle-switch ${inputs.sleepawaycamp ? 'active' : ''}`} />
        </div>

        <div
          className={`toggle-container ${inputs.clubMembership ? 'active' : ''}`}
          onClick={() => updateInput('clubMembership', !inputs.clubMembership)}
          style={{ cursor: 'pointer' }}
        >
          <div className="toggle-label">
            <div className="toggle-title">Club membership</div>
            <div className="toggle-cost">~$20K/year</div>
          </div>
          <div className={`toggle-switch ${inputs.clubMembership ? 'active' : ''}`} />
        </div>
      </div>
    </div>
  );
}
