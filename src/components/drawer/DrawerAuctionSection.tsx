import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency, normalizeAuctionStart } from '../../utils/format';
import { useCountdown } from '../../hooks/useCountdown';
import { useBidStore } from '../../store/useBidStore';
import { STRINGS } from '../../config/strings';

function CountdownDisplay({ auctionStart }: { auctionStart: string }) {
  const target = normalizeAuctionStart(auctionStart);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);

  if (isExpired) return <span className="text-card-meta text-text-muted">{STRINGS.vehicle.ended}</span>;

  const urgency =
    days === 0 && hours < 1
      ? 'text-status-salvage'
      : days === 0
        ? 'text-status-rebuilt'
        : 'text-text-secondary';

  const label =
    days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  return <span className={`text-card-meta font-medium tabular-nums ${urgency}`}>{label}</span>;
}

interface BuyNowConfirmPanelProps {
  vehicle: Vehicle;
  onConfirm: () => void;
  onCancel: () => void;
}

function BuyNowConfirmPanel({ vehicle, onConfirm, onCancel }: BuyNowConfirmPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-bg-elevated border border-border-default rounded-xl px-3 py-2.5 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-bid-label text-text-muted uppercase">{STRINGS.bidding.buyNowPrice}</span>
          <span className="text-bid-amount text-text-primary leading-none">
            {formatCurrency(vehicle.buy_now_price!)}
          </span>
        </div>
        <div className="text-right flex flex-col gap-0.5">
          <span className="text-card-meta text-text-muted">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
          <span className="text-card-meta text-text-muted">
            {STRINGS.bidding.lotLabel} {vehicle.lot}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-border-default text-text-secondary hover:text-text-primary hover:border-border-active text-sm font-medium transition-colors"
        >
          {STRINGS.bidding.cancel}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-text-inverse text-sm font-semibold transition-colors"
        >
          {STRINGS.bidding.confirmBuyNow}
        </button>
      </div>
    </div>
  );
}

interface DrawerAuctionSectionProps {
  vehicle: Vehicle;
  onPlaceBid: () => void;
}

export function DrawerAuctionSection({ vehicle, onPlaceBid }: DrawerAuctionSectionProps) {
  const { getBidEntry, buyNow } = useBidStore();
  const [showBuyNowConfirm, setShowBuyNowConfirm] = useState(false);

  const entry = getBidEntry(vehicle.id);

  useEffect(() => {
    setShowBuyNowConfirm(false);
  }, [vehicle.id]);

  const currentBid = entry?.currentBid ?? vehicle.current_bid;
  const bidCount   = entry?.bidCount   ?? vehicle.bid_count;
  const isWinning  = entry?.status === 'winning';
  const isWon      = entry?.status === 'won';
  const displayBid = currentBid ?? vehicle.starting_bid;

  const bidLabel = isWon
    ? STRINGS.bidding.amountPaid
    : currentBid !== null
      ? STRINGS.bidding.currentBid
      : STRINGS.vehicle.startingAt;

  function handleConfirmBuyNow() {
    if (!vehicle.buy_now_price) return;
    buyNow(vehicle.id, vehicle.buy_now_price, bidCount);
    setShowBuyNowConfirm(false);
  }

  return (
    <div className="bg-bg-surface border-t border-border-default px-4 py-3 flex flex-col gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      {/* Compact single-row bid summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-drawer-bid-amount text-text-primary leading-none">
            {formatCurrency(displayBid)}
          </span>
          {isWinning && (
            <>
              <span className="text-bid-dot text-status-clean leading-none select-none" aria-hidden="true">·</span>
              <span className="text-bid-winning text-status-clean leading-none uppercase">{STRINGS.bidding.winning}</span>
            </>
          )}
          {isWon && (
            <>
              <span className="text-bid-dot text-brand leading-none select-none" aria-hidden="true">·</span>
              <span className="text-bid-winning text-brand leading-none uppercase">{STRINGS.bidding.won}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-card-count text-text-muted">{STRINGS.vehicle.bids(bidCount)}</span>
          <span className="text-text-muted text-card-meta select-none" aria-hidden="true">·</span>
          {isWon ? (
            <span className="text-card-meta text-text-secondary">
              {entry?.purchaseMethod === 'buy_now'
                ? STRINGS.bidding.purchasedViaBuyNow
                : STRINGS.bidding.purchasedViaAuction}
            </span>
          ) : (
            <CountdownDisplay auctionStart={vehicle.auction_start} />
          )}
        </div>
      </div>

      {/* Action area */}
      {isWon ? (
        <div className="bg-brand-subtle border border-brand/30 rounded-xl px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-brand flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-brand">{STRINGS.bidding.wonHeading}</span>
          </div>
          <p className="text-card-meta text-text-secondary pl-6">{STRINGS.bidding.wonSubtext}</p>
        </div>
      ) : (
        <div className="relative overflow-hidden">
          <div className={`transition-transform duration-250 ease-out ${showBuyNowConfirm ? '-translate-y-full' : 'translate-y-0'}`}>
            {vehicle.buy_now_price !== null && (
              <button
                onClick={() => setShowBuyNowConfirm(true)}
                className="w-full flex items-center justify-between bg-brand-subtle border border-brand/30 rounded-xl px-4 py-2.5 mb-2 hover:bg-brand-subtle/80 transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-brand">{STRINGS.drawer.buyNowAvailable}</span>
                <span className="text-sm font-bold text-brand">{formatCurrency(vehicle.buy_now_price)}</span>
              </button>
            )}
            <button
              onClick={onPlaceBid}
              className="w-full bg-brand hover:bg-brand-hover text-text-inverse font-semibold py-2.5 rounded-xl text-base transition-colors"
            >
              {isWinning ? STRINGS.bidding.raiseBid : STRINGS.bidding.placeBid}
            </button>
          </div>

          <div className={`absolute inset-0 transition-transform duration-250 ease-out ${showBuyNowConfirm ? 'translate-y-0' : 'translate-y-full'}`}>
            <BuyNowConfirmPanel
              vehicle={vehicle}
              onConfirm={handleConfirmBuyNow}
              onCancel={() => setShowBuyNowConfirm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
