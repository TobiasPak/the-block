import { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { STRINGS } from '../../config/strings';

interface FilterPillRangeProps {
  label: string;
  min: number | null;
  max: number | null;
  placeholder?: { min: string; max: string };
  onChange: (min: number | null, max: number | null) => void;
  format?: 'currency' | 'number';
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  dropdownAlign?: 'left' | 'right';
}

function short(n: number, format: 'currency' | 'number'): string {
  if (format === 'currency') {
    return n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  }
  return String(n);
}

function pillLabel(
  min: number | null,
  max: number | null,
  format: 'currency' | 'number',
  label: string,
): string {
  if (min === null && max === null) return label;
  if (min !== null && max !== null) return `${short(min, format)}–${short(max, format)}`;
  if (min !== null) return `${short(min, format)}+`;
  return `Up to ${short(max!, format)}`;
}

function parse(val: string): number | null {
  const n = parseFloat(val.replace(/[$,]/g, ''));
  return isNaN(n) ? null : n;
}

export function FilterPillRange({
  label,
  min,
  max,
  placeholder,
  onChange,
  format = 'number',
  isOpen,
  onOpen,
  onClose,
  dropdownAlign = 'left',
}: FilterPillRangeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasValue = min !== null || max !== null;

  const ph =
    placeholder ??
    (format === 'currency' ? STRINGS.range.pricePlaceholder : STRINGS.range.yearPlaceholder);

  function handleMinBlur(e: React.FocusEvent<HTMLInputElement>) {
    onChange(parse(e.target.value), max);
  }
  function handleMinKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onChange(parse(e.currentTarget.value), max);
  }
  function handleMaxBlur(e: React.FocusEvent<HTMLInputElement>) {
    onChange(min, parse(e.target.value));
  }
  function handleMaxKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onChange(min, parse(e.currentTarget.value));
  }

  const minLabel = format === 'currency' ? STRINGS.range.minCurrency : STRINGS.range.min;
  const maxLabel = format === 'currency' ? STRINGS.range.maxCurrency : STRINGS.range.max;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={isOpen ? onClose : onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap ${
          hasValue
            ? 'bg-brand-subtle border border-border-active text-text-primary'
            : 'bg-bg-surface border border-border-default text-text-secondary hover:border-border-active hover:text-text-primary'
        }`}
      >
        {pillLabel(min, max, format, label)}
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <FilterDropdown
        isOpen={isOpen}
        onClose={onClose}
        containerRef={containerRef}
        width="w-64"
        align={dropdownAlign}
      >
        <div className="p-3 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wide block mb-1">
                {minLabel}
              </label>
              <input
                type="number"
                defaultValue={min ?? ''}
                placeholder={ph.min}
                onBlur={handleMinBlur}
                onKeyDown={handleMinKey}
                className="w-full bg-bg-page border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wide block mb-1">
                {maxLabel}
              </label>
              <input
                type="number"
                defaultValue={max ?? ''}
                placeholder={ph.max}
                onBlur={handleMaxBlur}
                onKeyDown={handleMaxKey}
                className="w-full bg-bg-page border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          {hasValue && (
            <button
              onClick={() => onChange(null, null)}
              className="text-xs text-text-link hover:text-brand transition-colors"
            >
              {STRINGS.range.clear}
            </button>
          )}
        </div>
      </FilterDropdown>
    </div>
  );
}
