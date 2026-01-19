import { LifestyleInputs, SimchaStyle } from '../../types';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
}

const simchaOptions: { value: SimchaStyle; icon: string; title: string; subtitle: string; details: string }[] = [
  {
    value: 'simple',
    icon: '🏡',
    title: 'Keep it simple',
    subtitle: 'Intimate celebrations',
    details: 'Home or shul, close family & friends',
  },
  {
    value: 'standard',
    icon: '🎊',
    title: 'Standard',
    subtitle: 'Community affair',
    details: 'Nice venue, extended family, community',
  },
  {
    value: 'lavish',
    icon: '✨',
    title: 'Go all out',
    subtitle: 'No expense spared',
    details: 'Top venues, large guest list, premium everything',
  },
];

export function SimchaScreen({ inputs, updateInput }: Props) {
  return (
    <div>
      <h2>Every family celebrates differently.</h2>
      <p>
        How do you approach bar/bat mitzvahs and weddings? This affects both what you'll spend on your own simchas and
        what you'll give as gifts.
      </p>

      <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
        {simchaOptions.map((option) => (
          <div
            key={option.value}
            className={`card ${inputs.simchaStyle === option.value ? 'selected' : ''}`}
            onClick={() => updateInput('simchaStyle', option.value)}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}
          >
            <div style={{ fontSize: '2.5rem' }}>{option.icon}</div>
            <div>
              <div className="card-title">{option.title}</div>
              <div style={{ fontSize: '0.9rem', color: '#4a4a4a' }}>{option.subtitle}</div>
              <div className="card-subtitle">{option.details}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#fff8f6',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: '#4a4a4a',
        }}
      >
        <strong>Note:</strong> Wedding costs vary significantly by gender. For girls, parents typically pay for the full
        wedding. For boys, parents pay for the swenne (engagement party).
      </div>
    </div>
  );
}
