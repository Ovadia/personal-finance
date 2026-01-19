import { LifestyleInputs, HelpLevel } from '../../types';
import { COSTS } from '../../constants';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
}

const helpLevels: { value: HelpLevel; label: string; description: string }[] = [
  { value: 'none', label: 'Just us', description: 'We handle it ourselves' },
  { value: 'cleaning', label: 'Weekly cleaner', description: 'Someone comes once a week' },
  { value: 'day-worker', label: 'Part-time help', description: '2-3 days a week' },
  { value: 'full-time', label: 'Full-time help', description: '5 days a week' },
  { value: 'live-in', label: 'Live-in', description: 'Around when needed' },
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
