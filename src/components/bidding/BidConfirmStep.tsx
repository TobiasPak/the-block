import { ChevronLeft } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency } from '../../utils/format';
import { getMinimumBid } from '../../store/useBidStore';
import { STRINGS } from '../../config/strings';

interface BidConfirmStepProps {
  vehicle: Vehicle;
  bidAmount: number;
  currentBid: number | null;
  onBack: () => void;
  onConfirm: () => void;
}

export function BidConfirmStep({ vehicle, bidAmount, currentBid, onBack, onConfirm }: BidConfirmStepProps) {
  const minimumBid = getMinimumBid(currentBid, vehicle.starting_bid);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-default">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-elevated transition-colors text-text-secondary hover:text-text-primary"
          aria-label="Back"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="text-sm font-semibold text-text-primary">{STRINGS.bidding.confirmBid}</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5 min-h-0">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
          <p className="text-sm text-text-secondary">{STRINGS.vehicle.lot} {vehicle.lot}</p>
        </div>

        <div className="bg-bg-elevated rounded-xl overflow-hidden divide-y divide-border-default">
          <Row label={STRINGS.bidding.yourBid}    value={formatCurrency(bidAmount)} highlight />
          <Row label={STRINGS.bidding.currentBid} value={currentBid ? formatCurrency(currentBid) : formatCurrency(vehicle.starting_bid)} />
          <Row label={STRINGS.bidding.minimumBid} value={formatCurrency(minimumBid)} />
          <Row label={STRINGS.bidding.reserve}    value={STRINGS.bidding.reserveHidden} />
        </div>

        <p className="text-xs text-text-muted leading-relaxed">{STRINGS.bidding.confirmTerms}</p>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border-default">
        <button
          onClick={onConfirm}
          className="w-full bg-brand hover:bg-brand-hover text-text-inverse font-semibold py-3 rounded-xl text-base transition-colors"
        >
          {STRINGS.bidding.confirmBid}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-text-primary' : 'text-text-secondary'}`}>
        {value}
      </span>
    </div>
  );
}
