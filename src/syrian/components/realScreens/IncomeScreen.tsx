import { RealModeInputs, IncomeRange, FamilySupport, INCOME_MIDPOINTS } from '../../types';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: RealModeInputs;
  updateInput: <K extends keyof RealModeInputs>(field: K, value: RealModeInputs[K]) => void;
}

const incomeOptions: { value: IncomeRange; label: string }[] = [
  { value: 'under-150k', label: 'Under $150K' },
  { value: '150k-250k', label: '$150K - $250K' },
  { value: '250k-400k', label: '$250K - $400K' },
  { value: '400k-600k', label: '$400K - $600K' },
  { value: '600k-1m', label: '$600K - $1M' },
  { value: 'over-1m', label: '$1M+' },
];

const supportOptions: { value: FamilySupport; label: string; description: string }[] = [
  { value: 'ongoing', label: 'Yes, ongoing support', description: 'Regular help from family' },
  { value: 'occasional', label: 'Occasional help', description: 'Big purchases, tuition help' },
  { value: 'none', label: 'No', description: 'We cover it ourselves' },
];

export function IncomeScreen({ inputs, updateInput }: Props) {
  return (
    <div>
      <h2>What's your financial picture?</h2>
      <p>This helps us show how expenses compare to income. Nothing is stored.</p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Household income</div>
        <div className="card-grid cols-2">
          {incomeOptions.map((opt) => (
            <div
              key={opt.value}
              className={`card ${inputs.incomeRange === opt.value ? 'selected' : ''}`}
              onClick={() => updateInput('incomeRange', opt.value)}
              style={{ padding: '1rem' }}
            >
              <div style={{ fontWeight: '600' }}>{opt.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Do you receive family support?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {supportOptions.map((opt) => (
            <div
              key={opt.value}
              className={`toggle-container ${inputs.familySupport === opt.value ? 'active' : ''}`}
              onClick={() => updateInput('familySupport', opt.value)}
              style={{ cursor: 'pointer' }}
            >
              <div className="toggle-label">
                <div className="toggle-title">{opt.label}</div>
                <div className="toggle-cost">{opt.description}</div>
              </div>
              <div className={`toggle-switch ${inputs.familySupport === opt.value ? 'active' : ''}`} />
            </div>
          ))}
        </div>

        {inputs.familySupport === 'ongoing' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Roughly how much annually? ($)
            </label>
            <input
              type="number"
              value={inputs.annualSupport}
              onChange={(e) => updateInput('annualSupport', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e5e0',
                borderRadius: '8px',
              }}
              placeholder="50000"
            />
          </div>
        )}
      </div>

      <div
        style={{
          padding: '1rem',
          background: '#f5f5f2',
          borderRadius: '12px',
          fontSize: '0.9rem',
          color: '#4a4a4a',
        }}
      >
        <strong>Your effective income:</strong>{' '}
        {formatCurrency(INCOME_MIDPOINTS[inputs.incomeRange] + inputs.annualSupport)}/year
      </div>
    </div>
  );
}
