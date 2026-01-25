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

        {inputs.brooklynSituation === 'rent' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #bbf7d0' }}>
            <div
              className={`toggle-container ${inputs.brooklynPlanToBuy ? 'active' : ''}`}
              onClick={() => updateInput('brooklynPlanToBuy', !inputs.brooklynPlanToBuy)}
              style={{ cursor: 'pointer', background: 'white', marginBottom: inputs.brooklynPlanToBuy ? '1rem' : 0 }}
            >
              <div className="toggle-label">
                <div className="toggle-title">Planning to buy?</div>
                <div className="toggle-cost">We'll adjust the projection when you do</div>
              </div>
              <div className={`toggle-switch ${inputs.brooklynPlanToBuy ? 'active' : ''}`} />
            </div>

            {inputs.brooklynPlanToBuy && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    Purchase year
                  </label>
                  <input
                    type="number"
                    value={inputs.brooklynPurchaseYear}
                    onChange={(e) => updateInput('brooklynPurchaseYear', parseInt(e.target.value) || new Date().getFullYear() + 3)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '1rem',
                      border: '2px solid #e5e5e0',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    Expected mortgage/mo
                  </label>
                  <input
                    type="number"
                    value={inputs.brooklynPostPurchaseMonthlyCost}
                    onChange={(e) => updateInput('brooklynPostPurchaseMonthlyCost', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '1rem',
                      border: '2px solid #e5e5e0',
                      borderRadius: '8px',
                    }}
                    placeholder="8000"
                  />
                </div>
              </div>
            )}
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

        {inputs.dealSituation === 'rent' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #bbf7d0' }}>
            <div
              className={`toggle-container ${inputs.dealPlanToBuy ? 'active' : ''}`}
              onClick={() => updateInput('dealPlanToBuy', !inputs.dealPlanToBuy)}
              style={{ cursor: 'pointer', background: 'white', marginBottom: inputs.dealPlanToBuy ? '1rem' : 0 }}
            >
              <div className="toggle-label">
                <div className="toggle-title">Planning to buy in Deal?</div>
                <div className="toggle-cost">We'll switch from rent to ownership costs</div>
              </div>
              <div className={`toggle-switch ${inputs.dealPlanToBuy ? 'active' : ''}`} />
            </div>

            {inputs.dealPlanToBuy && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    Purchase year
                  </label>
                  <input
                    type="number"
                    value={inputs.dealPurchaseYear}
                    onChange={(e) => updateInput('dealPurchaseYear', parseInt(e.target.value) || new Date().getFullYear() + 5)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '1rem',
                      border: '2px solid #e5e5e0',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    Annual cost after
                  </label>
                  <input
                    type="number"
                    value={inputs.dealPostPurchaseCost}
                    onChange={(e) => updateInput('dealPostPurchaseCost', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '1rem',
                      border: '2px solid #e5e5e0',
                      borderRadius: '8px',
                    }}
                    placeholder="25000"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
