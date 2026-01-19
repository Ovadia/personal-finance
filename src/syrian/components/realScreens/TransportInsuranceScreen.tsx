import { RealModeInputs, Vehicle, VehicleType } from '../../types';
import { COSTS } from '../../constants';
import { formatCurrency } from '../../calculator';

interface Props {
  inputs: RealModeInputs;
  updateInput: <K extends keyof RealModeInputs>(field: K, value: RealModeInputs[K]) => void;
  addVehicle: () => void;
  removeVehicle: (id: string) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
}

const vehicleTypes: { value: VehicleType; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'high-end', label: 'High-end' },
];

export function TransportInsuranceScreen({
  inputs,
  updateInput,
  addVehicle,
  removeVehicle,
  updateVehicle,
}: Props) {
  const totalTransport = inputs.vehicles.reduce((sum, v) => {
    const payment = v.paidOff ? 0 : v.monthlyPayment * 12;
    const fixed = COSTS.transportation.insurancePerCar + COSTS.transportation.gasMaintenancePerCar;
    return sum + payment + fixed;
  }, 0);

  return (
    <div>
      <h2>Transportation & insurance.</h2>
      <p>Let's capture the full picture of these recurring costs.</p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Vehicles</div>

        {inputs.vehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            style={{
              padding: '1rem',
              background: 'white',
              border: '2px solid #e5e5e0',
              borderRadius: '12px',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: '600' }}>Vehicle {index + 1}</span>
              <button className="remove-child" onClick={() => removeVehicle(vehicle.id)}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8a8a8a', marginBottom: '0.25rem' }}>
                  Type
                </label>
                <select
                  value={vehicle.type}
                  onChange={(e) => updateVehicle(vehicle.id, { type: e.target.value as VehicleType })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid #e5e5e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white',
                  }}
                >
                  {vehicleTypes.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8a8a8a', marginBottom: '0.25rem' }}>
                  Monthly payment
                </label>
                <input
                  type="number"
                  value={vehicle.paidOff ? 0 : vehicle.monthlyPayment}
                  onChange={(e) => updateVehicle(vehicle.id, { monthlyPayment: parseInt(e.target.value) || 0 })}
                  disabled={vehicle.paidOff}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid #e5e5e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    opacity: vehicle.paidOff ? 0.5 : 1,
                  }}
                />
              </div>
            </div>

            <div
              style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              onClick={() => updateVehicle(vehicle.id, { paidOff: !vehicle.paidOff })}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #e5e5e0',
                  borderRadius: '4px',
                  background: vehicle.paidOff ? '#e07a5f' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem',
                }}
              >
                {vehicle.paidOff && '✓'}
              </div>
              <span style={{ fontSize: '0.9rem' }}>Paid off (no monthly payment)</span>
            </div>
          </div>
        ))}

        <button className="add-child-btn" onClick={addVehicle}>
          <span>+</span>
          <span>Add a vehicle</span>
        </button>

        {inputs.vehicles.length > 0 && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#4a4a4a' }}>
            Total transportation: {formatCurrency(totalTransport)}/year (includes insurance & gas)
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Health insurance</div>
        <p style={{ fontSize: '0.85rem', color: '#4a4a4a', marginBottom: '0.5rem' }}>
          If employer-provided at no cost, enter $0
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>$</span>
          <input
            type="number"
            value={inputs.healthInsuranceMonthly}
            onChange={(e) => updateInput('healthInsuranceMonthly', parseInt(e.target.value) || 0)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e5e5e0',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
            placeholder="0"
          />
          <span>/month</span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Other insurance</div>
        <p style={{ fontSize: '0.85rem', color: '#4a4a4a', marginBottom: '0.5rem' }}>
          Life, disability, umbrella - total annual premium
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>$</span>
          <input
            type="number"
            value={inputs.otherInsuranceAnnual}
            onChange={(e) => updateInput('otherInsuranceAnnual', parseInt(e.target.value) || 0)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e5e5e0',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
            placeholder="3000"
          />
          <span>/year</span>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Tzedakah</div>
        <p style={{ fontSize: '0.85rem', color: '#4a4a4a', marginBottom: '0.5rem' }}>
          Including synagogue dues, school donations, charitable giving
        </p>
        <div className="slider-container">
          <div className="slider-label">
            <span>Percentage of income</span>
            <span className="slider-value">{inputs.tzedakahPercent}%</span>
          </div>
          <input
            type="range"
            className="slider"
            min={0}
            max={25}
            step={1}
            value={inputs.tzedakahPercent}
            onChange={(e) => updateInput('tzedakahPercent', parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8a8a8a' }}>
            <span>0%</span>
            <span>10% (ma'aser)</span>
            <span>25%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
