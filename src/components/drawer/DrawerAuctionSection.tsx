import type { Vehicle } from '../../types/vehicle';
import { formatCurrency, normalizeAuctionStart } from '../../utils/format';
import { useCountdown } from '../../hooks/useCountdown';
import { useBidStore } from '../../store/useBidStore';
import { STRINGS } from '../../config/strings';

function CountdownDisplay({ auctionStart }: { auctionStart: string }) {
  const target = normalizeAuctionStart(auctionStart);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);

  if (isExpired) return <span className="text-text-muted text-sm">{STRINGS.vehicle.ended}</span>;

  const urgency =
    days === 0 && hours < 1
      ? 'text-status-salvage'
      : days === 0
        ? 'text-status-rebuilt'
        : 'text-text-secondary';

  const label =
    days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  return <span className={`text-sm font-medium tabular-nums ${urgency}`}>{label}</span>;
}

interface DrawerAuctionSectionProps {
  vehicle: Vehicle;
  onPlaceBid: () => void;
  onBuyNow: () => void;
}

export function DrawerAuctionSection({ vehicle, onPlaceBid, onBuyNow }: DrawerAuctionSectionProps) {
  const { getBidEntry } = useBidStore();
  const entry = getBidEntry(vehicle.id);

  const currentBid  = entry?.currentBid ?? vehicle.current_bid;
  const bidCount    = entry?.bidCount   ?? vehicle.bid_count;
  const myBid       = entry?.myBid      ?? null;
  const isWinning   = entry?.status === 'winning';

  const bidLabel = currentBid !== null ? STRINGS.bidding.currentBid : STRINGS.vehicle.startingAt;
  const displayBid = currentBid ?? vehicle.starting_bid;
  const placeBidLabel = isWinning ? STRINGS.bidding.raiseBid : STRINGS.bidding.placeBid;

  return (
    <div className="bg-bg-surface border-t border-border-default px-4 py-4 flex flex-col gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      {/* Bid row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">{bidLabel}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(displayBid)}</p>
            {isWinning && (
              <span className="flex items-center gap-1 text-xs font-medium text-status-clean">
                <span className="w-1.5 h-1.5 rounded-full bg-status-clean" aria-hidden="true" />
                {STRINGS.bidding.winning}
              </span>
            )}
          </div>
          {myBid !== null && (
            <p className="text-xs text-status-clean mt-0.5">
              {STRINGS.bidding.yourBid}: {formatCurrency(myBid)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-text-secondary mb-0.5">{STRINGS.vehicle.bids(bidCount)}</p>
          <CountdownDisplay auctionStart={vehicle.auction_start} />
        </div>
      </div>

      {/* Buy Now banner */}
      {vehicle.buy_now_price !== null && (
        <button
          onClick={onBuyNow}
          className="w-full bg-brand-subtle rounded-lg px-3 py-2 flex items-center justify-between hover:bg-brand-subtle/80 transition-colors"
        >
          <span className="text-sm text-brand font-medium">{STRINGS.drawer.buyNowAvailable}</span>
          <span className="text-sm font-bold text-brand">{formatCurrency(vehicle.buy_now_price)}</span>
        </button>
      )}

      {/* Place / Raise Bid */}
      <button
        onClick={onPlaceBid}
        className="w-full bg-brand hover:bg-brand-hover text-text-inverse font-semibold py-3 rounded-xl text-base transition-colors"
      >
        {placeBidLabel}
      </button>
    </div>
  );
}
