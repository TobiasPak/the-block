import { memo } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency, formatOdometer, normalizeAuctionStart } from '../../utils/format';
import { useCountdown } from '../../hooks/useCountdown';
import { useDrawer } from '../../context/DrawerContext';
import { useBidStore } from '../../store/useBidStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useQuickBidContext } from '../../context/QuickBidContext';
import { LikeButton } from './LikeButton';
import { STRINGS } from '../../config/strings';
import { THEME } from '../../config/theme';

function CountdownBadge({ auctionStart }: { auctionStart: string }) {
  const target = normalizeAuctionStart(auctionStart);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);

  if (isExpired) return <span className="text-card-count text-text-muted">{STRINGS.vehicle.ended}</span>;

  const urgency =
    days === 0 && hours < 2
      ? 'text-status-salvage'
      : days === 0
        ? 'text-status-rebuilt'
        : 'text-text-secondary';

  const label =
    days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  return <span className={`text-card-count font-medium tabular-nums ${urgency}`}>{label}</span>;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard = memo(function VehicleCard({ vehicle }: VehicleCardProps) {
  const { openDrawer } = useDrawer();
  const { getBidEntry } = useBidStore();
  const { urgentVehicleIds } = useNotificationStore();
  const hasUrgent = urgentVehicleIds.has(vehicle.id);
  const { setHoveredVehicle, quickBidState } = useQuickBidContext();
  const isPending = quickBidState.pendingVehicleId === vehicle.id;

  const entry     = getBidEntry(vehicle.id);
  const displayBid = entry?.currentBid ?? vehicle.current_bid ?? vehicle.starting_bid;
  const bidCount   = entry?.bidCount   ?? vehicle.bid_count;
  const isWinning       = entry?.status === 'winning';
  const isWon           = entry?.status === 'won';
  const isReserveNotMet = entry?.status === 'reserve_not_met';
  const bidLabel   = isWon || isReserveNotMet
    ? STRINGS.bidding.yourBid
    : (entry?.currentBid ?? vehicle.current_bid) !== null
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
      onMouseEnter={() => setHoveredVehicle(vehicle)}
      onMouseLeave={() => setHoveredVehicle(null)}
      role="button"
      tabIndex={0}
      aria-label={`${STRINGS.drawer.viewDetails}: ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      className={`group bg-bg-surface border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover active:scale-[0.98] transition-[shadow,transform] duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        isPending
          ? 'border-brand ring-2 ring-brand/30'
          : isWinning
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
        {hasUrgent && (
          <span className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-status-salvage animate-pulse z-10" aria-hidden="true" />
        )}
        {/* Quick bid pending overlay */}
        {isPending && (
          <div className="absolute bottom-0 left-0 right-0 bg-brand/90 px-3 py-2 flex items-center justify-between z-10">
            <span className="text-text-inverse text-xs font-semibold">
              Quick Bid {formatCurrency(quickBidState.pendingAmount ?? 0)}
            </span>
            <span className="text-text-inverse/70 text-xs">2 to confirm</span>
          </div>
        )}
        <div className={`absolute top-2 ${hasUrgent ? 'left-6' : 'left-2'}`}>
          <span className={`px-1.5 py-0.5 rounded text-card-label font-bold uppercase ${THEME.titleStatusBadge[vehicle.title_status]}`}>
            {vehicle.title_status}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full bg-black/60 text-text-secondary text-card-label font-mono">
            {vehicle.lot}
          </span>
        </div>
        {vehicle.buy_now_price !== null && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 rounded bg-brand/90 text-text-primary text-card-label font-medium">
              {STRINGS.vehicle.buyNow(formatCurrency(vehicle.buy_now_price))}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <h3 className="text-card-title text-text-primary leading-tight truncate min-w-0">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h3>
            <p className="text-card-meta text-text-secondary truncate capitalize mt-0.5">
              {formatOdometer(vehicle.odometer_km)} · {vehicle.body_style} · {vehicle.fuel_type}
            </p>
          </div>
          <LikeButton vehicleId={vehicle.id} className="flex-shrink-0 mt-0.5" />
        </div>
        <p className={`text-card-meta font-medium ${THEME.conditionColor(vehicle.condition_grade)}`}>
          {STRINGS.vehicle.condition(vehicle.condition_grade)}
        </p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-2 border-t border-border-default">
        <div className="flex flex-col gap-0.5">

          {/* Row 1: bid label (left) + bid count (right) */}
          <div className="flex items-center justify-between">
            <span className="text-bid-label text-text-muted uppercase">{bidLabel}</span>
            <span className="text-card-count text-text-muted flex-shrink-0">
              {STRINGS.vehicle.bids(bidCount)}
            </span>
          </div>

          {/* Row 2: bid amount (left) + countdown (right) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-bid-amount text-text-primary leading-none">
              {formatCurrency(displayBid)}
            </span>
            <span className="flex-shrink-0">
              <CountdownBadge auctionStart={vehicle.auction_start} />
            </span>
          </div>

          {/* Row 3: status label — own line, only when active */}
          {(isWinning || isWon || isReserveNotMet) && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-bid-dot leading-none select-none ${
                  isWinning ? 'text-status-clean' : isWon ? 'text-brand' : 'text-status-rebuilt'
                }`}
                aria-hidden="true"
              >·</span>
              <span
                className={`text-bid-winning leading-none uppercase ${
                  isWinning ? 'text-status-clean' : isWon ? 'text-brand' : 'text-status-rebuilt'
                }`}
              >
                {isWinning
                  ? STRINGS.bidding.winning
                  : isWon
                    ? STRINGS.bidding.won
                    : STRINGS.bidding.reserveNotMetShort}
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
});
