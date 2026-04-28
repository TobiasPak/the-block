import { useState, useEffect } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { formatCurrency, normalizeAuctionStart } from '../../utils/format';
import { useCountdown } from '../../hooks/useCountdown';
import { useBidStore, getMinimumBid, minimumIncrement } from '../../store/useBidStore';
import { BidIncrementButton } from './BidIncrementButton';
import { BidErrorBanner } from './BidErrorBanner';
import { STRINGS } from '../../config/strings';

type BidStep = 'select' | 'confirm';

interface BidPanelProps {
  vehicle: Vehicle;
  onClose: () => void;
  isActive: boolean;
  initialAmount?: number;
}

function BidCountdown({ auctionStart }: { auctionStart: string }) {
  const target = normalizeAuctionStart(auctionStart);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(target);
  if (isExpired) return <span className="text-card-meta text-text-muted">{STRINGS.vehicle.ended}</span>;
  const urgency = days === 0 && hours < 1 ? 'text-status-salvage' : days === 0 ? 'text-status-rebuilt' : 'text-text-secondary';
  const label = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
  return <span className={`text-card-meta font-medium tabular-nums ${urgency}`}>{label}</span>;
}

function buildIncrements(currentBid: number | null, startingBid: number) {
  const base   = currentBid ?? startingBid;
  const inc    = minimumIncrement(base);
  const minBid = getMinimumBid(currentBid, startingBid);
  return [
    { amount: minBid,           label: STRINGS.bidding.incrementLabel(formatCurrency(inc)) },
    { amount: minBid + inc * 2, label: STRINGS.bidding.incrementLabel(formatCurrency(inc * 3)) },
    { amount: minBid + inc * 4, label: STRINGS.bidding.incrementLabel(formatCurrency(inc * 5)) },
  ];
}

export function BidPanel({ vehicle, onClose, isActive, initialAmount }: BidPanelProps) {
  const { getBidEntry, placeBid } = useBidStore();
  const entry = getBidEntry(vehicle.id);

  const currentBid    = entry?.currentBid ?? vehicle.current_bid;
  const baseBidCount  = entry?.bidCount   ?? vehicle.bid_count;
  const minimumBid    = getMinimumBid(currentBid, vehicle.starting_bid);
  const displayBid    = currentBid ?? vehicle.starting_bid;
  const isStartingBid = currentBid === null;

  const [step, setStep]                     = useState<BidStep>('select');
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount ?? minimumBid);
  const [inputValue, setInputValue]         = useState<string>(String(initialAmount ?? minimumBid));
  const [error, setError]                   = useState<string | null>(null);
  const [triedSubmit, setTriedSubmit]       = useState(false);

  useEffect(() => {
    if (!initialAmount) {
      setSelectedAmount(minimumBid);
      setInputValue(String(minimumBid));
    }
  }, [minimumBid, initialAmount]);

  useEffect(() => {
    if (isActive) {
      setStep('select');
      setSelectedAmount(minimumBid);
      setInputValue(String(minimumBid));
      setError(null);
      setTriedSubmit(false);
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const increments = buildIncrements(currentBid, vehicle.starting_bid);

  function handleIncrementClick(amount: number) {
    setSelectedAmount(amount);
    setInputValue(String(amount));
    if (triedSubmit) setError(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    setSelectedAmount(-1);
    if (triedSubmit) {
      const n = parseFloat(val);
      if (!isNaN(n) && n >= minimumBid) setError(null);
    }
  }

  function validate(n: number): string | null {
    if (isNaN(n) || n <= 0)   return STRINGS.bidding.errorInvalid;
    if (n < minimumBid)        return STRINGS.bidding.errorTooLow(formatCurrency(minimumBid));
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
    onClose();
  }

  return (
    <div className="bg-bg-surface border-t border-border-default px-4 py-4 flex flex-col gap-2.5">

      {/* ── Select ──────────────────────────────────────────────────────── */}
      {step === 'select' && (
        <div className="flex flex-col gap-2.5">
          {/* Info card */}
          <div className="bg-bg-elevated border border-border-default rounded-xl px-3 py-2.5">
            {/* Top row: current bid + bid count/countdown */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-bid-label text-text-muted uppercase tracking-wide">
                  {isStartingBid ? STRINGS.vehicle.startingAt : STRINGS.vehicle.currentBid}
                </span>
                <span className="text-bid-amount text-text-primary leading-none">
                  {formatCurrency(displayBid)}
                </span>
                <span className="text-card-meta text-text-muted mt-0.5">
                  {STRINGS.bidding.minimumBid}: {formatCurrency(minimumBid)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-card-count text-text-muted">{STRINGS.vehicle.bids(baseBidCount)}</span>
                <BidCountdown auctionStart={vehicle.auction_start} />
              </div>
            </div>

            <div className="border-t border-border-subtle mb-2" />

            {/* Increment pills */}
            <div className="flex gap-2 mb-2">
              {increments.map((inc) => (
                <BidIncrementButton
                  key={inc.amount}
                  label={inc.label}
                  amount={inc.amount}
                  isSelected={selectedAmount === inc.amount}
                  onClick={handleIncrementClick}
                  className="flex-1"
                />
              ))}
            </div>

            {/* Your Bid input */}
            <div className="flex flex-col gap-1">
              <span className="text-bid-label text-text-muted uppercase tracking-wide">
                {STRINGS.bidding.yourBid}
              </span>
              <div className="flex items-center gap-2 border border-border-default rounded-lg px-3 py-2 bg-bg-surface focus-within:border-border-active transition-colors">
                <span className="text-text-muted text-sm font-medium select-none">$</span>
                <input
                  type="number"
                  value={inputValue}
                  onChange={handleInputChange}
                  min={minimumBid}
                  aria-label={STRINGS.bidding.yourBid}
                  className="flex-1 bg-transparent text-text-primary text-sm font-semibold outline-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              {error && <BidErrorBanner message={error} />}
            </div>
          </div>

          {/* Two-button row */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border-default text-text-secondary hover:text-text-primary hover:border-border-active text-sm font-medium transition-colors active:opacity-70"
            >
              {STRINGS.bidding.cancel}
            </button>
            <button
              onClick={handleReviewBid}
              className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-text-inverse text-sm font-semibold transition-colors active:opacity-70"
            >
              {STRINGS.bidding.reviewBid}
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm ─────────────────────────────────────────────────────── */}
      {step === 'confirm' && (
        <div className="flex flex-col gap-2.5">
          {/* Summary card */}
          <div className="bg-bg-elevated border border-border-default rounded-xl px-3 py-2.5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-bid-label text-text-muted uppercase tracking-wide">
                  {STRINGS.bidding.yourBid}
                </span>
                <span className="text-bid-amount text-text-primary leading-none">
                  {formatCurrency(selectedAmount)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-card-meta text-text-muted">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </span>
                <span className="text-card-meta text-text-muted">
                  {STRINGS.bidding.lotLabel} {vehicle.lot}
                </span>
              </div>
            </div>

            <div className="border-t border-border-subtle mt-2 pt-2 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-bid-label text-text-muted uppercase tracking-wide">
                  {STRINGS.vehicle.currentBid}
                </span>
                <span className="text-card-meta text-text-secondary">{formatCurrency(displayBid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-bid-label text-text-muted uppercase tracking-wide">
                  {STRINGS.bidding.minimumBid}
                </span>
                <span className="text-card-meta text-text-secondary">{formatCurrency(minimumBid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-bid-label text-text-muted uppercase tracking-wide">
                  {STRINGS.bidding.reserve}
                </span>
                <span className="text-card-meta text-text-secondary">{STRINGS.bidding.reserveHidden}</span>
              </div>
            </div>
          </div>

          <p className="text-card-meta text-text-muted text-center px-1">
            {STRINGS.bidding.confirmTerms}
          </p>

          {/* Two-button row */}
          <div className="flex gap-2">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-2.5 rounded-xl border border-border-default text-text-secondary hover:text-text-primary hover:border-border-active text-sm font-medium transition-colors active:opacity-70"
            >
              {STRINGS.bidding.back}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-text-inverse text-sm font-semibold transition-colors active:opacity-70"
            >
              {STRINGS.bidding.confirmBid}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
