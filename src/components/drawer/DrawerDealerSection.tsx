import { Building2, MapPin } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { STRINGS } from '../../config/strings';
import { THEME } from '../../config/theme';

interface DrawerDealerSectionProps {
  vehicle: Vehicle;
}

export function DrawerDealerSection({ vehicle }: DrawerDealerSectionProps) {
  const { selling_dealership, city, province, vin, lot, title_status } = vehicle;

  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
        {STRINGS.drawer.dealership}
      </p>

      <div className="bg-bg-elevated rounded-lg px-4 py-3 space-y-2">
        {/* Dealership name + title status badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <Building2 size={14} className="text-text-muted flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-text-primary">{selling_dealership}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${THEME.titleStatusBadge[title_status]}`}>
            {title_status.charAt(0).toUpperCase() + title_status.slice(1)}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-text-muted flex-shrink-0" aria-hidden="true" />
          <span className="text-sm text-text-secondary">{city}, {province}</span>
        </div>

        {/* VIN */}
        <div className="flex items-start gap-2 pt-1 border-t border-border-subtle">
          <span className="text-xs text-text-muted w-6 flex-shrink-0 pt-0.5">VIN</span>
          <span className="font-mono text-xs text-text-secondary break-all">{vin}</span>
        </div>

        {/* Lot */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted w-6 flex-shrink-0">{STRINGS.vehicle.lot}</span>
          <span className="text-xs text-text-secondary">{lot}</span>
        </div>
      </div>
    </div>
  );
}
