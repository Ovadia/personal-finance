import { LifestyleInputs, HousingChoice } from '../../types';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
}

const housingOptions: { value: HousingChoice; icon: string; title: string; subtitle: string }[] = [
  { value: 'brooklyn', icon: '🏘️', title: 'Brooklyn', subtitle: 'Year-round in the city' },
  { value: 'deal', icon: '🏖️', title: 'Deal', subtitle: 'Beach life all summer' },
  { value: 'both', icon: '🏠', title: 'Both', subtitle: 'Brooklyn + Deal for the summer' },
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
    </div>
  );
}
