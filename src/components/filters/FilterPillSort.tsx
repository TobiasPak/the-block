import { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SortBy } from '../../hooks/useInventory';
import { FilterDropdown } from './FilterDropdown';
import { STRINGS } from '../../config/strings';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'auction_start',    label: STRINGS.sort.options.auction_start },
  { value: 'current_bid_asc',  label: STRINGS.sort.options.current_bid_asc },
  { value: 'current_bid_desc', label: STRINGS.sort.options.current_bid_desc },
  { value: 'odometer_asc',     label: STRINGS.sort.options.odometer_asc },
  { value: 'year_desc',        label: STRINGS.sort.options.year_desc },
  { value: 'condition_desc',   label: STRINGS.sort.options.condition_desc },
];

interface FilterPillSortProps {
  sortBy: SortBy;
  onChange: (sort: SortBy) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  dropdownAlign?: 'left' | 'right';
}

export function FilterPillSort({
  sortBy,
  onChange,
  isOpen,
  onOpen,
  onClose,
  dropdownAlign = 'left',
}: FilterPillSortProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? STRINGS.sort.heading;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={isOpen ? onClose : onOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap bg-bg-surface border border-border-default text-text-secondary hover:border-border-active hover:text-text-primary"
      >
        {currentLabel}
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
        width="w-52"
        align={dropdownAlign}
      >
        <div className="p-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                sortBy === opt.value
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-secondary hover:bg-bg-elevated/50 hover:text-text-primary'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  sortBy === opt.value ? 'bg-brand' : 'border border-border-default'
                }`}
                aria-hidden="true"
              />
              {opt.label}
            </button>
          ))}
        </div>
      </FilterDropdown>
    </div>
  );
}
