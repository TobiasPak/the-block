import type { Vehicle } from '../../types/vehicle';
import { formatOdometer } from '../../utils/format';
import { STRINGS } from '../../config/strings';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface DrawerSpecsGridProps {
  vehicle: Vehicle;
}

export function DrawerSpecsGrid({ vehicle }: DrawerSpecsGridProps) {
  const specs = [
    { label: STRINGS.specs.year,         value: String(vehicle.year) },
    { label: STRINGS.specs.make,         value: vehicle.make },
    { label: STRINGS.specs.model,        value: vehicle.model },
    { label: STRINGS.specs.trim,         value: vehicle.trim },
    { label: STRINGS.specs.engine,       value: vehicle.engine },
    { label: STRINGS.specs.transmission, value: capitalize(vehicle.transmission) },
    { label: STRINGS.specs.drivetrain,   value: vehicle.drivetrain },
    { label: STRINGS.specs.fuelType,     value: capitalize(vehicle.fuel_type) },
    { label: STRINGS.specs.odometer,     value: formatOdometer(vehicle.odometer_km) },
    { label: STRINGS.specs.bodyStyle,    value: capitalize(vehicle.body_style) },
    { label: STRINGS.specs.extColor,     value: vehicle.exterior_color },
    { label: STRINGS.specs.intColor,     value: vehicle.interior_color },
  ];

  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
        {STRINGS.drawer.specifications}
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {specs.map((s) => (
          <div key={s.label}>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">{s.label}</p>
            <p className="text-sm font-medium text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
