import { LifestyleInputs, VehicleType } from '../../types';
import { COSTS } from '../../constants';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: LifestyleInputs;
  updateInput: <K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => void;
}

const vehicleOptions: { value: VehicleType; icon: string; title: string; examples: string }[] = [
  { value: 'economy', icon: '🚗', title: 'Economy', examples: 'Camry, Accord, Corolla' },
  { value: 'suv', icon: '🚙', title: 'Family SUV', examples: 'Highlander, Pilot, Sienna' },
  { value: 'luxury', icon: '🚘', title: 'Luxury', examples: 'BMW, Mercedes, Lexus' },
  { value: 'high-end', icon: '🏎️', title: 'High-end', examples: 'Range Rover, Porsche, G-Wagon' },
];

export function TransportScreen({ inputs, updateInput }: Props) {
  const totalCost =
    inputs.vehicleCount *
    (COSTS.transportation.vehicle[inputs.vehicleType] +
      COSTS.transportation.insurancePerCar +
      COSTS.transportation.gasMaintenancePerCar);

  return (
    <div>
      <h2>How does your family get around?</h2>
      <p>Cars are a big expense — payments, insurance, gas, and maintenance add up.</p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>What kind of car?</div>
        <div className="card-grid cols-2">
          {vehicleOptions.map((option) => (
            <div
              key={option.value}
              className={`card ${inputs.vehicleType === option.value ? 'selected' : ''}`}
              onClick={() => updateInput('vehicleType', option.value)}
            >
              <div className="card-icon">{option.icon}</div>
              <div className="card-title">{option.title}</div>
              <div className="card-subtitle">{option.examples}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>How many cars?</div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[0, 1, 2, 3].map((count) => (
            <button
              key={count}
              className={`card ${inputs.vehicleCount === count ? 'selected' : ''}`}
              onClick={() => updateInput('vehicleCount', count)}
              style={{ flex: 1, padding: '1rem' }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{count}</div>
              <div style={{ fontSize: '0.8rem', color: '#8a8a8a' }}>{count === 1 ? 'car' : 'cars'}</div>
            </button>
          ))}
        </div>
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
        <div style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: '0.25rem' }}>
          Total transportation cost
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#e07a5f' }}>
          {inputs.vehicleCount === 0 ? '$0' : `${formatCurrency(totalCost)}/year`}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#8a8a8a', marginTop: '0.25rem' }}>
          Includes payments, insurance, gas & maintenance
        </div>
      </div>
    </div>
  );
}
