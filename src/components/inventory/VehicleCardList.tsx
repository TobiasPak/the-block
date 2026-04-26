import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency, formatOdometer, formatConditionGrade, normalizeAuctionStart } from '../../utils/format';
import { useCountdown } from '../../hooks/useCountdown';

function titleStatusDot(status: Vehicle['title_status']) {
  const map = { clean: 'bg-emerald-500', rebuilt: 'bg-amber-400', salvage: 'bg-red-500' };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400">
      <span className={`w-2 h-2 rounded-full ${map[status]}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function conditionColor(grade: number) {
  if (grade >= 4) return 'text-emerald-400';
  if (grade >= 3) return 'text-amber-400';
  return 'text-red-400';
}

function CountdownCell({ auctionStart }: { auctionStart: string }) {
  const target = normalizeAuctionStart(auctionStart);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);

  if (isExpired) return <span className="text-slate-500 text-xs">Ended</span>;

  const urgency = days === 0 && hours < 2 ? 'text-red-400' : days === 0 ? 'text-amber-400' : 'text-slate-300';
  const label = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  return <span className={`text-sm font-medium tabular-nums ${urgency}`}>{label}</span>;
}

interface VehicleCardListProps {
  vehicle: Vehicle;
}

export const VehicleCardList = memo(function VehicleCardList({ vehicle }: VehicleCardListProps) {
  const bidLabel = vehicle.current_bid !== null ? 'Current bid' : 'Starting at';
  const bidValue = vehicle.current_bid ?? vehicle.starting_bid;

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="flex flex-col sm:flex-row gap-3 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/30 transition-shadow duration-200 p-3"
      aria-label={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
    >
      {/* Image */}
      <div className="w-full sm:w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-700">
        <img
          src={vehicle.images[0]}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-semibold text-slate-100 text-sm truncate">
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
        </h3>
        <p className="text-xs text-slate-400 capitalize">
          {formatOdometer(vehicle.odometer_km)} · {vehicle.body_style} · {vehicle.fuel_type}
        </p>
        <p className={`text-xs font-medium ${conditionColor(vehicle.condition_grade)}`}>
          {formatConditionGrade(vehicle.condition_grade)} — {vehicle.city}, {vehicle.province}
        </p>
        <p className="text-xs text-slate-500 truncate">{vehicle.selling_dealership}</p>
        <div className="pt-0.5">{titleStatusDot(vehicle.title_status)}</div>
      </div>

      {/* Bid + timer */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
        <div className="sm:text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{bidLabel}</p>
          <p className="text-base font-bold text-white">{formatCurrency(bidValue)}</p>
          <p className="text-xs text-slate-500">{vehicle.bid_count} bids</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <CountdownCell auctionStart={vehicle.auction_start} />
          {vehicle.buy_now_price !== null && (
            <span className="px-2 py-0.5 rounded border border-blue-500 text-blue-400 text-xs font-medium whitespace-nowrap">
              Buy Now {formatCurrency(vehicle.buy_now_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});
