import { LifestyleInputs, GroceryStyle } from '../../types';
import { COSTS } from '../../constants';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
}

const groceryOptions: { value: GroceryStyle; icon: string; title: string; subtitle: string }[] = [
  { value: 'budget', icon: '🛒', title: 'Budget-conscious', subtitle: 'Moishes, sales, bulk buying' },
  { value: 'moderate', icon: '🛍️', title: 'Moderate', subtitle: 'Pomegranate, Ouris, mix of stores' },
  { value: 'premium', icon: '✨', title: 'Premium', subtitle: 'Prime Cut, top of the line' },
];

const hostingLabels = ['Never', 'Monthly', 'Bi-weekly', 'Weekly', 'Multiple/week'];

export function FoodScreen({ inputs, updateInput }: Props) {
  return (
    <div>
      <h2>How do you Shabbat?</h2>
      <p>Food is a big part of community life. Let's see how you eat.</p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Where do you shop?</div>
        <div className="card-grid cols-3">
          {groceryOptions.map((option) => (
            <div
              key={option.value}
              className={`card ${inputs.groceryStyle === option.value ? 'selected' : ''}`}
              onClick={() => updateInput('groceryStyle', option.value)}
            >
              <div className="card-icon">{option.icon}</div>
              <div className="card-title">{option.title}</div>
              <div className="card-subtitle">{option.subtitle}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#8a8a8a', fontSize: '0.85rem' }}>
          ~{formatCurrency(COSTS.food.grocery[inputs.groceryStyle])}/year on groceries
        </div>
      </div>

      <div>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>How often do you host for Shabbat?</div>
        <div className="slider-container">
          <div className="slider-label">
            <span>{hostingLabels[inputs.shabbatHosting]}</span>
            <span className="slider-value">
              {inputs.shabbatHosting === 0
                ? 'Quiet family meals'
                : `~${COSTS.food.hostingFrequency[inputs.shabbatHosting]} Shabbatot/year`}
            </span>
          </div>
          <input
            type="range"
            className="slider"
            min={0}
            max={4}
            value={inputs.shabbatHosting}
            onChange={(e) => updateInput('shabbatHosting', parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8a8a8a' }}>
            <span>Just family</span>
            <span>Always have guests</span>
          </div>
        </div>
      </div>
    </div>
  );
}
