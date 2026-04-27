import type { Vehicle } from '../../types/vehicle';
import { formatCurrency } from '../../utils/format';
import { useBidStore } from '../../store/useBidStore';
import { STRINGS } from '../../config/strings';

interface BidSuccessStateProps {
  vehicle: Vehicle;
  bidAmount: number;
  mode: 'bid' | 'buynow';
  onClose: () => void;
}

export function BidSuccessState({ vehicle, bidAmount, mode, onClose }: BidSuccessStateProps) {
  const { getBidEntry } = useBidStore();
  const entry = getBidEntry(vehicle.id);
  const bidCount = entry?.bidCount ?? vehicle.bid_count + 1;

  const headline = mode === 'buynow' ? STRINGS.bidding.youBoughtIt : STRINGS.bidding.bidPlaced;
  const subtext  = mode === 'buynow' ? STRINGS.bidding.boughtIt   : STRINGS.bidding.currentlyWinning;

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 gap-5 text-center">
      {/* Animated checkmark */}
      <svg
        viewBox="0 0 64 64"
        className="w-16 h-16 text-status-clean"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="3"
          pathLength="100"
          className="animate-draw-circle"
        />
        <path
          d="M20 33 L28 41 L44 25"
          stroke="currentColor"
          strokeWidth="3"
          pathLength="100"
          className="animate-draw-tick"
        />
      </svg>

      <div>
        <h2 className="text-xl font-bold text-text-primary">{headline}</h2>
        <p className="text-sm text-text-secondary mt-1">{subtext}</p>
      </div>

      <div className="bg-bg-elevated rounded-xl px-5 py-4 w-full space-y-1 text-left">
        <p className="text-sm text-text-muted">{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</p>
        <p className="text-xl font-bold text-text-primary">{formatCurrency(bidAmount)}</p>
        <p className="text-xs text-text-muted">{STRINGS.vehicle.bids(bidCount)}</p>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-brand hover:bg-brand-hover text-text-inverse font-semibold py-3 rounded-xl text-base transition-colors"
      >
        {STRINGS.bidding.continueBrowsing}
      </button>
    </div>
  );
}
