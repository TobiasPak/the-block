interface BidIncrementButtonProps {
  label: string;
  amount: number;
  isSelected: boolean;
  onClick: (amount: number) => void;
}

export function BidIncrementButton({ label, amount, isSelected, onClick }: BidIncrementButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(amount)}
      className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
        isSelected
          ? 'bg-brand-subtle border border-brand text-brand font-medium'
          : 'bg-bg-elevated border border-border-default text-text-secondary hover:border-brand hover:text-brand'
      }`}
    >
      {label}
    </button>
  );
}
