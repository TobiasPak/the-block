import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency, formatOdometer, formatConditionGrade, normalizeAuctionStart } from '../../utils/format';
import { useCountdown } from '../../hooks/useCountdown';

function titleStatusBadge(status: Vehicle['title_status']) {
  const map = { clean: 'bg-emerald-600', rebuilt: 'bg-amber-500', salvage: 'bg-red-600' };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase text-white ${map[status]}`}>
      {status}
    </span>
  );
}

function conditionColor(grade: number) {
  if (grade >= 4) return 'text-emerald-400';
  if (grade >= 3) return 'text-amber-400';
  return 'text-red-400';
}

function CountdownBadge({ auctionStart }: { auctionStart: string }) {
  const target = normalizeAuctionStart(auctionStart);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);

  if (isExpired) return <span className="text-slate-500 text-xs">Ended</span>;

  const urgency =
    days === 0 && hours < 2
      ? 'text-red-400'
      : days === 0
        ? 'text-amber-400'
        : 'text-slate-300';

  const label =
    days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  return <span className={`text-xs font-medium tabular-nums ${urgency}`}>{label}</span>;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard = memo(function VehicleCard({ vehicle }: VehicleCardProps) {
  const bidLabel = vehicle.current_bid !== null ? 'Current bid' : 'Starting at';
  const bidValue = vehicle.current_bid ?? vehicle.starting_bid;

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group block bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/30 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
      aria-label={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
    >
      {/* Image */}
      <div className="relative aspect-video bg-slate-700 overflow-hidden">
        <img
          src={vehicle.images[0]}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">{titleStatusBadge(vehicle.title_status)}</div>
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full bg-black/60 text-slate-300 text-[10px] font-mono">
            {vehicle.lot}
          </span>
        </div>
        {vehicle.buy_now_price !== null && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 rounded bg-blue-600/90 text-white text-[10px] font-medium">
              Buy Now {formatCurrency(vehicle.buy_now_price)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-slate-100 text-sm leading-tight truncate">
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
        </h3>
        <p className="text-xs text-slate-400 truncate capitalize">
          {formatOdometer(vehicle.odometer_km)} · {vehicle.body_style} · {vehicle.fuel_type}
        </p>
        <p className={`text-xs font-medium ${conditionColor(vehicle.condition_grade)}`}>
          {formatConditionGrade(vehicle.condition_grade)} condition
        </p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-slate-700 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{bidLabel}</p>
          <p className="text-base font-bold text-white">{formatCurrency(bidValue)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">{vehicle.bid_count} bids</p>
          <CountdownBadge auctionStart={vehicle.auction_start} />
        </div>
      </div>
    </Link>
  );
});
