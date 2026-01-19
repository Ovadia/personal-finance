import { RealModeInputs } from '../../types';

interface Props {
  inputs: RealModeInputs;
  updateInput: <K extends keyof RealModeInputs>(field: K, value: RealModeInputs[K]) => void;
}

const assistanceOptions = [
  { value: 0, label: 'Full tuition', description: 'No assistance' },
  { value: 25, label: '75% tuition', description: '25% assistance' },
  { value: 50, label: '50% tuition', description: '50% assistance' },
  { value: 75, label: '25% tuition', description: '75% assistance' },
];

export function EducationDetailsScreen({ inputs, updateInput }: Props) {
  const schoolAgeKids = inputs.children.filter((c) => {
    const age = new Date().getFullYear() - c.birthYear;
    return age >= 2 && age <= 17;
  }).length;

  return (
    <div>
      <h2>Education costs add up.</h2>
      <p>Let's get the details right for your projection.</p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Tuition assistance</div>
        <p style={{ fontSize: '0.9rem', color: '#4a4a4a', marginBottom: '0.75rem' }}>
          Many families receive scholarship or assistance. What do you pay?
        </p>
        <div className="card-grid cols-2">
          {assistanceOptions.map((opt) => (
            <div
              key={opt.value}
              className={`card ${inputs.tuitionAssistance === opt.value ? 'selected' : ''}`}
              onClick={() => updateInput('tuitionAssistance', opt.value)}
              style={{ padding: '1rem' }}
            >
              <div style={{ fontWeight: '600' }}>{opt.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#8a8a8a' }}>{opt.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Tutoring</div>
        <p style={{ fontSize: '0.9rem', color: '#4a4a4a', marginBottom: '0.75rem' }}>
          Do your kids need (or will they need) private tutoring?
        </p>
        <div className="slider-container">
          <div className="slider-label">
            <span>Monthly tutoring cost</span>
            <span className="slider-value">
              {inputs.tutoringMonthly === 0 ? 'None' : `$${inputs.tutoringMonthly}/mo`}
            </span>
          </div>
          <input
            type="range"
            className="slider"
            min={0}
            max={2000}
            step={100}
            value={inputs.tutoringMonthly}
            onChange={(e) => updateInput('tutoringMonthly', parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8a8a8a' }}>
            <span>None</span>
            <span>$2,000/mo</span>
          </div>
        </div>
      </div>

      <div
        className="toggle-container"
        onClick={() => updateInput('includeIsraelTrip', !inputs.includeIsraelTrip)}
        style={{ cursor: 'pointer' }}
      >
        <div className="toggle-label">
          <div className="toggle-title">Include 8th grade Israel trip</div>
          <div className="toggle-cost">~$5,500 per child at age 13</div>
        </div>
        <div className={`toggle-switch ${inputs.includeIsraelTrip ? 'active' : ''}`} />
      </div>

      {schoolAgeKids === 0 && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f5f5f2',
            borderRadius: '12px',
            fontSize: '0.9rem',
            color: '#4a4a4a',
          }}
        >
          No school-age children currently. These settings will apply when they start school.
        </div>
      )}
    </div>
  );
}
