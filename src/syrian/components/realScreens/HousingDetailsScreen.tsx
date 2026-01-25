import { RealModeInputs, BrooklynSituation, DealSituation, MortgageDetails } from '../../types';
import { calculateMonthlyMortgage, getAnnualHousingCost } from '../../realCalculator';
import { formatCurrency } from '../../calculator';

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

interface MortgageInputProps {
  mortgage: MortgageDetails;
  onChange: (mortgage: MortgageDetails) => void;
  label: string;
}

function MortgageInput({ mortgage, onChange, label }: MortgageInputProps) {
  const monthlyPI = calculateMonthlyMortgage(mortgage);
  const annualTotal = getAnnualHousingCost(mortgage);
  const monthlyTotal = Math.round(annualTotal / 12);

  const update = (field: keyof MortgageDetails, value: number | null) => {
    onChange({ ...mortgage, [field]: value });
  };

  return (
    <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '8px', border: '2px solid #e5e5e0' }}>
      <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>{label}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#666' }}>
            Home Price
          </label>
          <input
            type="number"
            value={mortgage.homePrice}
            onChange={(e) => update('homePrice', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.95rem',
              border: '2px solid #e5e5e0',
              borderRadius: '6px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#666' }}>
            Down Payment %
          </label>
          <input
            type="number"
            value={mortgage.downPayment}
            onChange={(e) => update('downPayment', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.95rem',
              border: '2px solid #e5e5e0',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#666' }}>
            Interest Rate %
          </label>
          <input
            type="number"
            step="0.125"
            value={mortgage.interestRate}
            onChange={(e) => update('interestRate', parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.95rem',
              border: '2px solid #e5e5e0',
              borderRadius: '6px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#666' }}>
            Term (years)
          </label>
          <select
            value={mortgage.termYears}
            onChange={(e) => update('termYears', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.95rem',
              border: '2px solid #e5e5e0',
              borderRadius: '6px',
              background: 'white',
            }}
          >
            <option value={15}>15 years</option>
            <option value={20}>20 years</option>
            <option value={30}>30 years</option>
          </select>
        </div>
      </div>

      <div
        style={{
          background: '#e0f2fe',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '0.75rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: '#0369a1' }}>Calculated P&I</div>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0369a1' }}>
          {formatCurrency(monthlyPI)}/mo
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Additional annual costs:</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', color: '#888' }}>
            Property Tax
          </label>
          <input
            type="number"
            value={mortgage.propertyTax}
            onChange={(e) => update('propertyTax', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.4rem',
              fontSize: '0.85rem',
              border: '2px solid #e5e5e0',
              borderRadius: '6px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', color: '#888' }}>
            Insurance
          </label>
          <input
            type="number"
            value={mortgage.insurance}
            onChange={(e) => update('insurance', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.4rem',
              fontSize: '0.85rem',
              border: '2px solid #e5e5e0',
              borderRadius: '6px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', color: '#888' }}>
            Maintenance
          </label>
          <input
            type="number"
            value={mortgage.maintenance}
            onChange={(e) => update('maintenance', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.4rem',
              fontSize: '0.85rem',
              border: '2px solid #e5e5e0',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: '#f0fdf4',
          padding: '0.75rem',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: '#166534' }}>Total Housing Cost</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#166534' }}>
            {formatCurrency(monthlyTotal)}/mo • {formatCurrency(annualTotal)}/yr
          </div>
        </div>
      </div>
    </div>
  );
}

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

        {inputs.brooklynSituation === 'rent' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Monthly rent ($)
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

        {(inputs.brooklynSituation === 'mortgage' || inputs.brooklynSituation === 'paid-off') && (
          <div style={{ marginTop: '1rem' }}>
            <MortgageInput
              mortgage={inputs.brooklynMortgage}
              onChange={(m) => updateInput('brooklynMortgage', m)}
              label={inputs.brooklynSituation === 'paid-off' ? 'Property Details' : 'Mortgage Details'}
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
              <div>
                <div style={{ marginBottom: '1rem' }}>
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
                <MortgageInput
                  mortgage={inputs.brooklynFutureMortgage}
                  onChange={(m) => updateInput('brooklynFutureMortgage', m)}
                  label="Expected Mortgage"
                />
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

        {inputs.dealSituation === 'rent' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Seasonal rental cost ($)
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
              placeholder="36000"
            />
          </div>
        )}

        {(inputs.dealSituation === 'own-mortgage' || inputs.dealSituation === 'own-paid') && (
          <div style={{ marginTop: '1rem' }}>
            <MortgageInput
              mortgage={inputs.dealMortgage}
              onChange={(m) => updateInput('dealMortgage', m)}
              label={inputs.dealSituation === 'own-paid' ? 'Property Details' : 'Mortgage Details'}
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
              <div>
                <div style={{ marginBottom: '1rem' }}>
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
                <MortgageInput
                  mortgage={inputs.dealFutureMortgage}
                  onChange={(m) => updateInput('dealFutureMortgage', m)}
                  label="Expected Mortgage"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
