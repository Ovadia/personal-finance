import { RealModeInputs, RealModeChild } from '../../types';
import { SCHOOL_NAMES } from '../../constants';

interface Props {
  inputs: RealModeInputs;
  updateInput: <K extends keyof RealModeInputs>(field: K, value: RealModeInputs[K]) => void;
  addChild: () => void;
  removeChild: (id: string) => void;
  updateChild: (id: string, updates: Partial<RealModeChild>) => void;
}

const currentYear = new Date().getFullYear();

export function ChildrenTimelineScreen({
  inputs,
  addChild,
  removeChild,
  updateChild,
}: Props) {
  const getTimelinePreview = (child: RealModeChild) => {
    const age = currentYear - child.birthYear;
    const events: string[] = [];

    if (age < 13) {
      const yearsToBarMitzvah = 13 - age;
      events.push(`${child.gender === 'boy' ? 'Bar' : 'Bat'} Mitzvah in ${yearsToBarMitzvah} years`);
    }

    if (age < 18) {
      const yearsToGrad = 18 - age;
      events.push(`Graduates in ${yearsToGrad} years`);
    }

    if (age < child.expectedWeddingAge) {
      const yearsToWedding = child.expectedWeddingAge - age;
      events.push(`Wedding in ~${yearsToWedding} years`);
    }

    return events.join(' • ');
  };

  return (
    <div>
      <h2>Let's map out your family timeline.</h2>
      <p>Birth years help us project exactly when major expenses will hit.</p>

      <div className="family-builder">
        {inputs.children.map((child, index) => (
          <div
            key={child.id}
            style={{
              padding: '1rem',
              background: 'white',
              border: '2px solid #e5e5e0',
              borderRadius: '12px',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{child.gender === 'boy' ? '👦' : '👧'}</span>
                <span style={{ fontWeight: '600' }}>Child {index + 1}</span>
              </div>
              <button className="remove-child" onClick={() => removeChild(child.id)}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8a8a8a', marginBottom: '0.25rem' }}>
                  Birth Year
                </label>
                <input
                  type="number"
                  value={child.birthYear}
                  onChange={(e) => {
                    const birthYear = parseInt(e.target.value) || currentYear - 5;
                    updateChild(child.id, { birthYear, age: currentYear - birthYear });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid #e5e5e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8a8a8a', marginBottom: '0.25rem' }}>
                  Gender
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`gender-btn ${child.gender === 'boy' ? 'selected' : ''}`}
                    onClick={() => updateChild(child.id, { gender: 'boy' })}
                    style={{ flex: 1 }}
                  >
                    Boy
                  </button>
                  <button
                    className={`gender-btn ${child.gender === 'girl' ? 'selected' : ''}`}
                    onClick={() => updateChild(child.id, { gender: 'girl' })}
                    style={{ flex: 1 }}
                  >
                    Girl
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#8a8a8a', marginBottom: '0.25rem' }}>
                School
              </label>
              <select
                value={child.school}
                onChange={(e) => updateChild(child.id, { school: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid #e5e5e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'white',
                }}
              >
                {Object.entries(SCHOOL_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                padding: '0.5rem',
                background: '#f5f5f2',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#4a4a4a',
              }}
            >
              {getTimelinePreview(child)}
            </div>
          </div>
        ))}

        <button className="add-child-btn" onClick={addChild}>
          <span>+</span>
          <span>Add a child</span>
        </button>
      </div>

      {inputs.children.length === 0 && (
        <p style={{ textAlign: 'center', color: '#8a8a8a', marginTop: '1rem' }}>
          No children? We'll still project your other costs over 30 years.
        </p>
      )}
    </div>
  );
}
