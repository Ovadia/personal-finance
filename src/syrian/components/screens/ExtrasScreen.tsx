import { LifestyleInputs } from '../../types';
import { COSTS } from '../../constants';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
}

const extras: {
  field: keyof Pick<LifestyleInputs, 'pesachAway' | 'sleepawaycamp' | 'clubMembership'>;
  icon: string;
  title: string;
  cost: string;
  description: string;
}[] = [
  {
    field: 'pesachAway',
    icon: '✈️',
    title: 'Pesach program',
    cost: formatCurrency(COSTS.extras.pesachProgram),
    description: 'Hotel or travel for Pesach',
  },
  {
    field: 'sleepawaycamp',
    icon: '🏕️',
    title: 'Sleepaway camp',
    cost: `${formatCurrency(COSTS.extras.sleepawaycamp)}/child`,
    description: 'Summer camp for the kids',
  },
  {
    field: 'clubMembership',
    icon: '🏊',
    title: 'Club membership',
    cost: formatCurrency(COSTS.extras.clubMembership),
    description: 'Country club or beach club',
  },
];

export function ExtrasScreen({ inputs, updateInput }: Props) {
  return (
    <div>
      <h2>The extras</h2>
      <p>These are the things that make life a little sweeter — but they add up.</p>

      <div>
        {extras.map((extra) => (
          <div
            key={extra.field}
            className={`toggle-container ${inputs[extra.field] ? 'active' : ''}`}
            onClick={() => updateInput(extra.field, !inputs[extra.field])}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{extra.icon}</span>
              <div className="toggle-label">
                <div className="toggle-title">{extra.title}</div>
                <div className="toggle-cost">
                  {extra.cost}/year • {extra.description}
                </div>
              </div>
            </div>
            <div className={`toggle-switch ${inputs[extra.field] ? 'active' : ''}`} />
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f5f5f2',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: '#4a4a4a',
          textAlign: 'center',
        }}
      >
        Almost done! Hit "See My Results" to get your total.
      </div>
    </div>
  );
}
