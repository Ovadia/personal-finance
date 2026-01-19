import { RealModeInputs, BrooklynSituation, DealSituation } from '../../types';

interface Props {
  inputs: RealModeInputs;
  updateInput: <K extends keyof RealModeInputs>(field: K, value: RealModeInputs[K]) => void;
}

const brooklynOptions: { value: BrooklynSituation; label: string; description: string }[] = [
  { value: 'mortgage', label: 'Own (mortgage)', description: 'Still paying it off' },
  { value: 'paid-off', label: 'Own (paid off)', description: 'Just maintenance & taxes' },
  { value: 'rent', label: 'Rent', description: 'Monthly rent' },
  { value: 'family', label: 'Family house', description: 'Live with/near family' },
  { value: 'none', label: "Don't live in Brooklyn", description: '' },
];

const dealOptions: { value: DealSituation; label: string; description: string }[] = [
  { value: 'own-mortgage', label: 'Own (mortgage)', description: 'Still paying it off' },
  { value: 'own-paid', label: 'Own (paid off)', description: 'Just maintenance & taxes' },
  { value: 'rent', label: 'Rent for season', description: 'Summer rental' },
  { value: 'family', label: 'Family house', description: 'Use family property' },
  { value: 'none', label: "Don't do Deal", description: '' },
];

export function HousingDetailsScreen({ inputs, updateInput }: Props) {
  return (
    <div>
      <h2>Let's get specific about housing.</h2>
      <p>Your actual costs make a big difference in the projection.</p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Brooklyn situation</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {brooklynOptions.map((opt) => (
            <div
              key={opt.value}
              className={`toggle-container ${inputs.brooklynSituation === opt.value ? 'active' : ''}`}
              onClick={() => updateInput('brooklynSituation', opt.value)}
              style={{ cursor: 'pointer' }}
            >
              <div className="toggle-label">
                <div className="toggle-title">{opt.label}</div>
                {opt.description && <div className="toggle-cost">{opt.description}</div>}
              </div>
              <div className={`toggle-switch ${inputs.brooklynSituation === opt.value ? 'active' : ''}`} />
            </div>
          ))}
        </div>

        {inputs.brooklynSituation !== 'none' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Monthly cost ($)
            </label>
            <input
              type="number"
              value={inputs.brooklynMonthlyCost}
              onChange={(e) => updateInput('brooklynMonthlyCost', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e5e0',
                borderRadius: '8px',
              }}
              placeholder="5000"
            />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Deal situation</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {dealOptions.map((opt) => (
            <div
              key={opt.value}
              className={`toggle-container ${inputs.dealSituation === opt.value ? 'active' : ''}`}
              onClick={() => updateInput('dealSituation', opt.value)}
              style={{ cursor: 'pointer' }}
            >
              <div className="toggle-label">
                <div className="toggle-title">{opt.label}</div>
                {opt.description && <div className="toggle-cost">{opt.description}</div>}
              </div>
              <div className={`toggle-switch ${inputs.dealSituation === opt.value ? 'active' : ''}`} />
            </div>
          ))}
        </div>

        {inputs.dealSituation !== 'none' && inputs.dealSituation !== 'family' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {inputs.dealSituation === 'rent' ? 'Seasonal rental cost ($)' : 'Annual cost (mortgage/taxes) ($)'}
            </label>
            <input
              type="number"
              value={inputs.dealSeasonalCost}
              onChange={(e) => updateInput('dealSeasonalCost', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e5e5e0',
                borderRadius: '8px',
              }}
              placeholder={inputs.dealSituation === 'rent' ? '36000' : '25000'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
