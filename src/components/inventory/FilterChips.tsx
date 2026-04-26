import { X } from 'lucide-react';
import type { SetStateAction } from 'react';
import type { Filters } from '../../hooks/useInventory';
import { formatCurrency } from '../../utils/format';

interface FilterChipsProps {
  filters: Filters;
  setFilters: (action: SetStateAction<Filters>) => void;
  activeFilterCount: number;
  resetFilters: () => void;
}

interface Chip {
  label: string;
  onRemove: () => void;
}

export function FilterChips({ filters, setFilters, activeFilterCount, resetFilters }: FilterChipsProps) {
  if (activeFilterCount === 0) return null;

  const chips: Chip[] = [];

  filters.make.forEach((m) =>
    chips.push({ label: m, onRemove: () => setFilters((p) => ({ ...p, make: p.make.filter((x) => x !== m) })) }),
  );
  filters.body_style.forEach((bs) =>
    chips.push({ label: bs, onRemove: () => setFilters((p) => ({ ...p, body_style: p.body_style.filter((x) => x !== bs) })) }),
  );
  filters.fuel_type.forEach((ft) =>
    chips.push({ label: ft, onRemove: () => setFilters((p) => ({ ...p, fuel_type: p.fuel_type.filter((x) => x !== ft) })) }),
  );
  filters.title_status.forEach((ts) =>
    chips.push({ label: ts, onRemove: () => setFilters((p) => ({ ...p, title_status: p.title_status.filter((x) => x !== ts) })) }),
  );
  filters.province.forEach((pv) =>
    chips.push({ label: pv, onRemove: () => setFilters((p) => ({ ...p, province: p.province.filter((x) => x !== pv) })) }),
  );
  if (filters.priceMin !== null)
    chips.push({ label: `Min ${formatCurrency(filters.priceMin)}`, onRemove: () => setFilters((p) => ({ ...p, priceMin: null })) });
  if (filters.priceMax !== null)
    chips.push({ label: `Max ${formatCurrency(filters.priceMax)}`, onRemove: () => setFilters((p) => ({ ...p, priceMax: null })) });
  if (filters.yearMin !== null)
    chips.push({ label: `From ${filters.yearMin}`, onRemove: () => setFilters((p) => ({ ...p, yearMin: null })) });
  if (filters.yearMax !== null)
    chips.push({ label: `To ${filters.yearMax}`, onRemove: () => setFilters((p) => ({ ...p, yearMax: null })) });
  if (filters.conditionMin !== null)
    chips.push({ label: `Condition ≥ ${filters.conditionMin}`, onRemove: () => setFilters((p) => ({ ...p, conditionMin: null })) });

  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-none border-b border-slate-700">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-slate-700 text-slate-200 text-xs font-medium"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} filter`}
            className="ml-0.5 text-slate-400 hover:text-white transition-colors"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}

      {chips.length >= 2 && (
        <button
          onClick={resetFilters}
          className="shrink-0 px-2.5 py-1 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
