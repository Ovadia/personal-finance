import { LifestyleInputs, Child, SchoolChoice } from '../../types';
import { SCHOOL_NAMES, COSTS } from '../../constants';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: LifestyleInputs;
  updateChild: (id: string, updates: Partial<Child>) => void;
}

const schoolOptions: { value: SchoolChoice; icon: string }[] = [
  { value: 'magen-david', icon: '🔷' },
  { value: 'hillel', icon: '🟢' },
  { value: 'barkai', icon: '🟡' },
  { value: 'flatbush', icon: '🔵' },
  { value: 'other-private', icon: '📚' },
  { value: 'public', icon: '🏫' },
];

export function EducationScreen({ inputs, updateChild }: Props) {
  const schoolAgeChildren = inputs.children.filter((c) => c.age >= 2 && c.age <= 17);

  if (schoolAgeChildren.length === 0) {
    return (
      <div>
        <h2>Where will they learn?</h2>
        <p style={{ textAlign: 'center', color: '#8a8a8a' }}>
          No school-age children yet. We'll skip this for now.
        </p>
      </div>
    );
  }

  // If only one child, show simple selection
  if (schoolAgeChildren.length === 1) {
    const child = schoolAgeChildren[0];
    return (
      <div>
        <h2>Where will they learn?</h2>
        <p>Education is often the biggest expense for families in the community.</p>

        <div className="card-grid cols-2">
          {schoolOptions.map((option) => (
            <div
              key={option.value}
              className={`card ${child.school === option.value ? 'selected' : ''}`}
              onClick={() => updateChild(child.id, { school: option.value })}
            >
              <div className="card-icon">{option.icon}</div>
              <div className="card-title">{SCHOOL_NAMES[option.value]}</div>
              <div className="card-subtitle">
                {option.value === 'public' ? 'Free' : `~${formatCurrency(COSTS.tuition[option.value])}/yr`}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Multiple children - show per-child selection
  return (
    <div>
      <h2>Where will they learn?</h2>
      <p>Select a school for each child.</p>

      {schoolAgeChildren.map((child) => (
        <div key={child.id} style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{child.gender === 'boy' ? '👦' : '👧'}</span>
            <span style={{ fontWeight: '600' }}>
              {child.age} year old {child.gender}
            </span>
          </div>

          <div className="card-grid cols-3">
            {schoolOptions.map((option) => (
              <div
                key={option.value}
                className={`card ${child.school === option.value ? 'selected' : ''}`}
                onClick={() => updateChild(child.id, { school: option.value })}
                style={{ padding: '0.75rem' }}
              >
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{option.icon}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{SCHOOL_NAMES[option.value]}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
