import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency } from '../../utils/format';
import { useBidStore, getMinimumBid, minimumIncrement } from '../../store/useBidStore';
import { BidIncrementButton } from './BidIncrementButton';
import { BidErrorBanner } from './BidErrorBanner';
import { BidConfirmStep } from './BidConfirmStep';
import { BidSuccessState } from './BidSuccessState';
import { STRINGS } from '../../config/strings';

type BidStep = 'select' | 'confirm' | 'success';

interface BidPanelProps {
  vehicle: Vehicle;
  onClose: () => void;
  initialStep?: BidStep;
  initialAmount?: number;
}

function buildIncrements(currentBid: number | null, startingBid: number) {
  const base = currentBid ?? startingBid;
  const inc  = minimumIncrement(base);
  const minBid = getMinimumBid(currentBid, startingBid);
  return [
    { amount: minBid,              label: STRINGS.bidding.incrementLabel(formatCurrency(inc)) },
    { amount: minBid + inc * 2,    label: STRINGS.bidding.incrementLabel(formatCurrency(inc * 3)) },
    { amount: minBid + inc * 4,    label: STRINGS.bidding.incrementLabel(formatCurrency(inc * 5)) },
  ];
}

export function BidPanel({ vehicle, onClose, initialStep = 'select', initialAmount }: BidPanelProps) {
  const { getBidEntry, placeBid } = useBidStore();
  const entry = getBidEntry(vehicle.id);

  const currentBid = entry?.currentBid ?? vehicle.current_bid;
  const baseBidCount = entry?.bidCount ?? vehicle.bid_count;
  const minimumBid = getMinimumBid(currentBid, vehicle.starting_bid);

  const [step, setStep]           = useState<BidStep>(initialStep);
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount ?? minimumBid);
  const [inputValue, setInputValue]         = useState<string>(String(initialAmount ?? minimumBid));
  const [error, setError]         = useState<string | null>(null);
  const [triedSubmit, setTriedSubmit] = useState(false);

  // Keep inputValue in sync when minimumBid changes (e.g. new vehicle)
  useEffect(() => {
    if (!initialAmount) {
      setSelectedAmount(minimumBid);
      setInputValue(String(minimumBid));
    }
  }, [minimumBid, initialAmount]);

  const increments = buildIncrements(currentBid, vehicle.starting_bid);

  function handleIncrementClick(amount: number) {
    setSelectedAmount(amount);
    setInputValue(String(amount));
    if (triedSubmit) setError(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    setSelectedAmount(-1); // deselect all buttons
    if (triedSubmit) {
      const n = parseFloat(val);
      if (!isNaN(n) && n >= minimumBid) setError(null);
    }
  }

  function validate(n: number): string | null {
    if (isNaN(n) || n <= 0)            return STRINGS.bidding.errorInvalid;
    if (n < minimumBid)                return STRINGS.bidding.errorTooLow(formatCurrency(minimumBid));
    if (vehicle.buy_now_price !== null && n > vehicle.buy_now_price)
                                       return STRINGS.bidding.errorExceedsBuyNow;
    return null;
  }

  function handleReviewBid() {
    setTriedSubmit(true);
    const n = parseFloat(inputValue);
    const err = validate(n);
    if (err) { setError(err); return; }
    setSelectedAmount(n);
    setError(null);
    setStep('confirm');
  }

  function handleConfirm() {
    placeBid(vehicle.id, selectedAmount, baseBidCount);
    setStep('success');
  }

  if (step === 'success') {
    return (
      <BidSuccessState
        vehicle={vehicle}
        bidAmount={selectedAmount}
        mode={initialStep === 'success' ? 'buynow' : 'bid'}
        onClose={onClose}
      />
    );
  }

  if (step === 'confirm') {
    return (
      <BidConfirmStep
        vehicle={vehicle}
        bidAmount={selectedAmount}
        currentBid={currentBid}
        onBack={() => setStep('select')}
        onConfirm={handleConfirm}
      />
    );
  }

  // Select step
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-default">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-elevated transition-colors text-text-secondary hover:text-text-primary"
          aria-label="Back"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="text-sm font-semibold text-text-primary">{STRINGS.bidding.placeBid}</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
        {/* Current bid summary */}
        <div className="bg-bg-elevated rounded-xl px-4 py-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">
                {STRINGS.bidding.currentBid}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(currentBid ?? vehicle.starting_bid)}
              </p>
            </div>
            <p className="text-sm text-text-secondary">{STRINGS.vehicle.bids(baseBidCount)}</p>
          </div>
          <p className="text-xs text-text-muted mt-1">
            {STRINGS.bidding.minimumBid}: {formatCurrency(minimumBid)}
          </p>
        </div>

        {/* Increment buttons */}
        <div className="flex gap-2">
          {increments.map((inc) => (
            <BidIncrementButton
              key={inc.amount}
              label={inc.label}
              amount={inc.amount}
              isSelected={selectedAmount === inc.amount}
              onClick={handleIncrementClick}
            />
          ))}
        </div>

        {/* Custom amount input */}
        <div>
          <label htmlFor="bid-amount-input" className="text-xs text-text-muted uppercase tracking-wide block mb-1.5">
            {STRINGS.bidding.yourBid}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
            <input
              id="bid-amount-input"
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              min={minimumBid}
              className="w-full bg-bg-elevated border border-border-default rounded-lg pl-7 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <BidErrorBanner message={error} />
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border-default">
        <button
          onClick={handleReviewBid}
          className="w-full bg-brand hover:bg-brand-hover text-text-inverse font-semibold py-3 rounded-xl text-base transition-colors"
        >
          {STRINGS.bidding.reviewBid}
        </button>
      </div>
    </div>
  );
}
