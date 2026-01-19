import { LifestyleInputs, Child } from '../../types';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
  addChild: () => void;
  removeChild: (id: string) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
}

export function FamilyScreen({ inputs, addChild, removeChild, updateChild, updateInput }: Props) {
  return (
    <div>
      <h2>Who's at the table?</h2>
      <p>Tell us about your family. This helps us estimate education, camps, and simcha costs.</p>

      <div className="family-builder">
        {inputs.children.map((child, index) => (
          <div key={child.id} className="child-row">
            <div className="child-avatar">{child.gender === 'boy' ? '👦' : '👧'}</div>
            <div className="child-info">
              <div className="child-age-input">
                <span>Age:</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={child.age}
                  onChange={(e) => updateChild(child.id, { age: parseInt(e.target.value) || 0 })}
                />
                <span>years old</span>
              </div>
              <div className="child-gender-toggle">
                <button
                  className={`gender-btn ${child.gender === 'boy' ? 'selected' : ''}`}
                  onClick={() => updateChild(child.id, { gender: 'boy' })}
                >
                  Boy
                </button>
                <button
                  className={`gender-btn ${child.gender === 'girl' ? 'selected' : ''}`}
                  onClick={() => updateChild(child.id, { gender: 'girl' })}
                >
                  Girl
                </button>
              </div>
            </div>
            <button className="remove-child" onClick={() => removeChild(child.id)}>
              ×
            </button>
          </div>
        ))}

        <button className="add-child-btn" onClick={addChild}>
          <span>+</span>
          <span>Add a child</span>
        </button>
      </div>

      <div
        className="toggle-container"
        style={{ marginTop: '1.5rem' }}
        onClick={() => updateInput('planningMore', !inputs.planningMore)}
      >
        <div className="toggle-label">
          <div className="toggle-title">Planning more?</div>
          <div className="toggle-cost">We'll factor in future costs</div>
        </div>
        <div className={`toggle-switch ${inputs.planningMore ? 'active' : ''}`} />
      </div>

      {inputs.children.length === 0 && (
        <p style={{ textAlign: 'center', color: '#8a8a8a', marginTop: '1rem' }}>
          No children yet? No problem — we'll still calculate your costs.
        </p>
      )}
    </div>
  );
}
