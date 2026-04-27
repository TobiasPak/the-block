import { memo } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency, formatOdometer, normalizeAuctionStart } from '../../utils/format';
import { useCountdown } from '../../hooks/useCountdown';
import { useDrawer } from '../../context/DrawerContext';
import { useBidStore } from '../../store/useBidStore';
import { LikeButton } from './LikeButton';
import { STRINGS } from '../../config/strings';
import { THEME } from '../../config/theme';

function CountdownBadge({ auctionStart }: { auctionStart: string }) {
  const target = normalizeAuctionStart(auctionStart);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);

  if (isExpired) return <span className="text-text-muted text-xs">{STRINGS.vehicle.ended}</span>;

  const urgency =
    days === 0 && hours < 2
      ? 'text-status-salvage'
      : days === 0
        ? 'text-status-rebuilt'
        : 'text-text-secondary';

  const label =
    days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  return <span className={`text-xs font-medium tabular-nums ${urgency}`}>{label}</span>;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard = memo(function VehicleCard({ vehicle }: VehicleCardProps) {
  const { openDrawer } = useDrawer();
  const { getBidEntry } = useBidStore();

  const entry = getBidEntry(vehicle.id);
  const displayBid  = entry?.currentBid ?? vehicle.current_bid ?? vehicle.starting_bid;
  const bidCount    = entry?.bidCount   ?? vehicle.bid_count;
  const isWinning   = entry?.status === 'winning';
  const bidLabel    = (entry?.currentBid ?? vehicle.current_bid) !== null
    ? STRINGS.vehicle.currentBid
    : STRINGS.vehicle.startingAt;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDrawer(vehicle);
    }
  }

  return (
    <div
      onClick={() => openDrawer(vehicle)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${STRINGS.drawer.viewDetails}: ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      className={`group bg-bg-surface border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        isWinning
          ? 'border-status-clean/40 ring-1 ring-status-clean/20'
          : 'border-border-subtle'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-video bg-bg-elevated overflow-hidden">
        <img
          src={vehicle.images[0]}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${THEME.titleStatusBadge[vehicle.title_status]}`}>
            {vehicle.title_status}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full bg-black/60 text-text-secondary text-[10px] font-mono">
            {vehicle.lot}
          </span>
        </div>
        {vehicle.buy_now_price !== null && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 rounded bg-brand/90 text-text-primary text-[10px] font-medium">
              {STRINGS.vehicle.buyNow(formatCurrency(vehicle.buy_now_price))}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className="font-semibold text-text-primary text-sm leading-tight truncate">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h3>
            <p className="text-xs text-text-secondary truncate capitalize mt-0.5">
              {formatOdometer(vehicle.odometer_km)} · {vehicle.body_style} · {vehicle.fuel_type}
            </p>
          </div>
          <LikeButton vehicleId={vehicle.id} className="flex-shrink-0 mt-0.5" />
        </div>
        <p className={`text-xs font-medium ${THEME.conditionColor(vehicle.condition_grade)}`}>
          {STRINGS.vehicle.condition(vehicle.condition_grade)}
        </p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-border-default flex items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-text-muted tracking-wide">{bidLabel}</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-text-primary leading-none">
              {formatCurrency(displayBid)}
            </span>
            {isWinning && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-status-clean leading-none pb-0.5">
                {STRINGS.bidding.winning}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] text-text-muted">{STRINGS.vehicle.bids(bidCount)}</span>
          <CountdownBadge auctionStart={vehicle.auction_start} />
        </div>
      </div>
    </div>
  );
});
