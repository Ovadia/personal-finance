import { LifestyleInputs, HelpLevel } from '../../types';
import { COSTS } from '../../constants';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
}

const helpLevels: { value: HelpLevel; label: string; description: string }[] = [
  { value: 'none', label: 'Just us', description: 'We handle it ourselves' },
  { value: 'cleaning', label: '1 day/week', description: '$125/day × 52 weeks' },
  { value: 'day-worker', label: '3 days/week', description: '$125/day × 3 × 52 weeks' },
  { value: 'full-time', label: '5 days/week', description: '$125/day × 5 × 52 weeks' },
  { value: 'live-in', label: 'Live-in', description: 'Full-time live-in help' },
];

export function HelpScreen({ inputs, updateInput }: Props) {
  const currentIndex = helpLevels.findIndex((h) => h.value === inputs.helpLevel);

  return (
    <div>
      <h2>Running a household takes a village.</h2>
      <p>How much help do you have at home?</p>

      <div className="spectrum-slider">
        <div className="spectrum-labels">
          {helpLevels.map((level, i) => (
            <div key={level.value} className={`spectrum-label ${i === currentIndex ? 'active' : ''}`}>
              {level.label}
            </div>
          ))}
        </div>

        <input
          type="range"
          className="slider"
          min={0}
          max={helpLevels.length - 1}
          value={currentIndex}
          onChange={(e) => updateInput('helpLevel', helpLevels[parseInt(e.target.value)].value)}
        />
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'white',
          borderRadius: '12px',
          border: '2px solid #e5e5e0',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{helpLevels[currentIndex].label}</div>
        <div style={{ fontSize: '0.9rem', color: '#4a4a4a', marginBottom: '0.5rem' }}>
          {helpLevels[currentIndex].description}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e07a5f' }}>
          {inputs.helpLevel === 'none' ? '$0' : `${formatCurrency(COSTS.help[inputs.helpLevel])}/year`}
        </div>
      </div>
    </div>
  );
}
