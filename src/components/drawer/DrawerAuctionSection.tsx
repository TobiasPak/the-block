import { useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency, normalizeAuctionStart } from '../../utils/format';
import { useCountdown } from '../../hooks/useCountdown';
import { useBidStore } from '../../store/useBidStore';
import type { BidEntry } from '../../store/useBidStore';
import { BidPanel } from '../bidding/BidPanel';
import { STRINGS } from '../../config/strings';

type ActiveLayer = 'normal' | 'buynow' | 'bid';

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
  entry: BidEntry | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function BuyNowConfirmPanel({ vehicle, entry, onConfirm, onCancel }: BuyNowConfirmPanelProps) {
  const displayBid    = entry?.currentBid ?? vehicle.current_bid ?? vehicle.starting_bid;
  const isStartingBid = (entry?.currentBid ?? vehicle.current_bid) === null;
  const bidCount      = entry?.bidCount ?? vehicle.bid_count;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Row 1: current bid context */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-bid-label text-text-muted uppercase">
            {isStartingBid ? STRINGS.vehicle.startingAt : STRINGS.vehicle.currentBid}
          </span>
          <span className="text-bid-amount text-text-primary leading-none">
            {formatCurrency(displayBid)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-card-count text-text-muted">{STRINGS.vehicle.bids(bidCount)}</span>
          <CountdownDisplay auctionStart={vehicle.auction_start} />
        </div>
      </div>

      {/* Row 2: buy now price card */}
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

      {/* Row 3: buttons */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-border-default text-text-secondary hover:text-text-primary hover:border-border-active text-sm font-medium transition-colors active:opacity-70"
        >
          {STRINGS.bidding.cancel}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-text-inverse text-sm font-semibold transition-colors active:opacity-70"
        >
          {STRINGS.bidding.confirmBuyNow}
        </button>
      </div>
    </div>
  );
}

interface DrawerAuctionSectionProps {
  vehicle: Vehicle;
}

export function DrawerAuctionSection({ vehicle }: DrawerAuctionSectionProps) {
  const { getBidEntry, buyNow } = useBidStore();
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('normal');

  // Refs for measuring each layer's natural height
  const layerARef = useRef<HTMLDivElement>(null);
  const layerBRef = useRef<HTMLDivElement>(null);
  const layerCRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | 'auto'>('auto');

  const entry = getBidEntry(vehicle.id);

  useEffect(() => {
    setActiveLayer('normal');
  }, [vehicle.id]);

  // Seed height from Layer A on first render
  useEffect(() => {
    const h = layerARef.current?.scrollHeight;
    if (h) setContainerHeight(h);
  }, []);

  // Update container height whenever the active layer changes
  useEffect(() => {
    const h =
      activeLayer === 'normal'  ? layerARef.current?.scrollHeight :
      activeLayer === 'buynow'  ? layerBRef.current?.scrollHeight :
                                   layerCRef.current?.scrollHeight;
    if (h) setContainerHeight(h);
  }, [activeLayer]);

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
    setActiveLayer('normal');
  }

  return (
    <div className="bg-bg-surface border-t border-border-default shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      {/* Clip container — no overflow-hidden; height animates to match active layer */}
      <div
        className="relative transition-[height] duration-250 ease-out"
        style={{ height: containerHeight === 'auto' ? undefined : `${containerHeight}px` }}
      >

        {/* Layer A — normal footer; slides down when sub-panel is active */}
        <div
          ref={layerARef}
          className={`px-4 pt-4 pb-safe flex flex-col gap-3 transition-transform duration-250 ease-out ${activeLayer !== 'normal' ? 'translate-y-full' : 'translate-y-0'}`}
        >
          {/* Bid info row */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-bid-label text-text-muted uppercase">{bidLabel}</span>
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
              {entry?.myBid && !isWon && (
                <span className="text-card-meta text-status-clean">
                  {STRINGS.bidding.yourBid}: {formatCurrency(entry.myBid)}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-card-count text-text-muted">{STRINGS.vehicle.bids(bidCount)}</span>
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

          {/* Won banner */}
          {isWon && (
            <div className="bg-brand-subtle border border-brand/30 rounded-xl px-4 py-3 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-brand flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-semibold text-brand">{STRINGS.bidding.wonHeading}</span>
              </div>
              <p className="text-card-meta text-text-secondary pl-6">{STRINGS.bidding.wonSubtext}</p>
            </div>
          )}

          {/* Buy Now banner */}
          {vehicle.buy_now_price !== null && !isWon && (
            <button
              onClick={() => setActiveLayer('buynow')}
              className="w-full flex items-center justify-between bg-brand-subtle border border-brand/30 rounded-xl px-4 py-3 hover:bg-brand-subtle/80 transition-colors cursor-pointer active:opacity-70"
            >
              <span className="text-sm font-medium text-brand">{STRINGS.drawer.buyNowAvailable}</span>
              <span className="text-sm font-bold text-brand">{formatCurrency(vehicle.buy_now_price)}</span>
            </button>
          )}

          {/* Place / Raise Bid */}
          {!isWon && (
            <button
              onClick={() => setActiveLayer('bid')}
              className="w-full bg-brand hover:bg-brand-hover active:opacity-80 text-text-inverse font-semibold py-3 rounded-xl text-base transition-colors"
            >
              {isWinning ? STRINGS.bidding.raiseBid : STRINGS.bidding.placeBid}
            </button>
          )}
        </div>

        {/* Layer B — buy now confirm; padding on inner wrapper so scrollHeight is accurate */}
        <div className={`absolute bottom-0 left-0 right-0 bg-bg-surface transition-transform duration-250 ease-out ${activeLayer === 'buynow' ? 'translate-y-0' : 'translate-y-full'}`}>
          <div ref={layerBRef} className="px-4 pt-4 pb-safe">
            <BuyNowConfirmPanel
              vehicle={vehicle}
              entry={entry}
              onConfirm={handleConfirmBuyNow}
              onCancel={() => setActiveLayer('normal')}
            />
          </div>
        </div>

        {/* Layer C — bid panel; BidPanel carries its own px-4 py-4 */}
        <div className={`absolute bottom-0 left-0 right-0 transition-transform duration-250 ease-out ${activeLayer === 'bid' ? 'translate-y-0' : 'translate-y-full'}`}>
          <div ref={layerCRef}>
            <BidPanel
              vehicle={vehicle}
              onClose={() => setActiveLayer('normal')}
              isActive={activeLayer === 'bid'}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
