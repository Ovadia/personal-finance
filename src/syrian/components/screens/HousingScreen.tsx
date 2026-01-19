import { LifestyleInputs, HousingChoice } from '../../types';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
}

const housingOptions: { value: HousingChoice; icon: string; title: string; subtitle: string }[] = [
  { value: 'brooklyn', icon: '🏘️', title: 'Brooklyn', subtitle: 'Year-round in the city' },
  { value: 'deal', icon: '🏖️', title: 'Deal', subtitle: 'Beach life all summer' },
  { value: 'both', icon: '🏠', title: 'Both', subtitle: 'Best of both worlds' },
];

export function HousingScreen({ inputs, updateInput }: Props) {
  return (
    <div>
      <h2>Where's home?</h2>
      <p>Most families split time between Brooklyn and Deal. Where does yours spend the year?</p>

      <div className="card-grid cols-3">
        {housingOptions.map((option) => (
          <div
            key={option.value}
            className={`card ${inputs.housing === option.value ? 'selected' : ''}`}
            onClick={() => updateInput('housing', option.value)}
          >
            <div className="card-icon">{option.icon}</div>
            <div className="card-title">{option.title}</div>
            <div className="card-subtitle">{option.subtitle}</div>
          </div>
        ))}
      </div>

      {inputs.housing === 'both' && (
        <div className="slider-container" style={{ marginTop: '1.5rem' }}>
          <div className="slider-label">
            <span>Months in Deal</span>
            <span className="slider-value">{inputs.dealMonths} months</span>
          </div>
          <input
            type="range"
            className="slider"
            min={1}
            max={6}
            value={inputs.dealMonths}
            onChange={(e) => updateInput('dealMonths', parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8a8a8a' }}>
            <span>June only</span>
            <span>Memorial Day - Labor Day</span>
          </div>
        </div>
      )}
    </div>
  );
}
