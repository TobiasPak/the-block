import { X } from 'lucide-react';
import type { SetStateAction } from 'react';
import type { Filters, SortBy } from '../../hooks/useInventory';
import { STRINGS } from '../../config/strings';

interface ActiveFilterChipsProps {
  filters: Filters;
  setFilters: (action: SetStateAction<Filters>) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  activeFilterCount: number;
  resetFilters: () => void;
}

function shortCurrency(n: number): string {
  return n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ActiveFilterChips({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  activeFilterCount,
  resetFilters,
}: ActiveFilterChipsProps) {
  const chips: Chip[] = [];

  filters.make.forEach((m) =>
    chips.push({
      key: `make-${m}`,
      label: STRINGS.chips.make(m),
      onRemove: () => setFilters((p) => ({ ...p, make: p.make.filter((x) => x !== m) })),
    }),
  );
  filters.body_style.forEach((bs) =>
    chips.push({
      key: `body-${bs}`,
      label: STRINGS.chips.body(bs),
      onRemove: () =>
        setFilters((p) => ({
          ...p,
          body_style: p.body_style.filter((x) => x.toLowerCase() !== bs.toLowerCase()),
        })),
    }),
  );
  filters.fuel_type.forEach((ft) =>
    chips.push({
      key: `fuel-${ft}`,
      label: STRINGS.chips.fuel(ft),
      onRemove: () =>
        setFilters((p) => ({
          ...p,
          fuel_type: p.fuel_type.filter((x) => x.toLowerCase() !== ft.toLowerCase()),
        })),
    }),
  );
  filters.title_status.forEach((ts) =>
    chips.push({
      key: `title-${ts}`,
      label: STRINGS.chips.title(ts),
      onRemove: () =>
        setFilters((p) => ({
          ...p,
          title_status: p.title_status.filter((x) => x.toLowerCase() !== ts.toLowerCase()),
        })),
    }),
  );
  filters.province.forEach((pv) =>
    chips.push({
      key: `prov-${pv}`,
      label: STRINGS.chips.province(pv),
      onRemove: () => setFilters((p) => ({ ...p, province: p.province.filter((x) => x !== pv) })),
    }),
  );

  if (filters.priceMin !== null || filters.priceMax !== null) {
    const { priceMin: mn, priceMax: mx } = filters;
    const label =
      mn !== null && mx !== null
        ? STRINGS.chips.priceRange(shortCurrency(mn), shortCurrency(mx))
        : mn !== null
          ? STRINGS.chips.priceMin(shortCurrency(mn))
          : STRINGS.chips.priceUpTo(shortCurrency(mx!));
    chips.push({
      key: 'price',
      label,
      onRemove: () => setFilters((p) => ({ ...p, priceMin: null, priceMax: null })),
    });
  }

  if (filters.yearMin !== null || filters.yearMax !== null) {
    const { yearMin: yn, yearMax: yx } = filters;
    const label =
      yn !== null && yx !== null
        ? STRINGS.chips.yearRange(yn, yx)
        : yn !== null
          ? STRINGS.chips.yearMin(yn)
          : STRINGS.chips.yearUpTo(yx!);
    chips.push({
      key: 'year',
      label,
      onRemove: () => setFilters((p) => ({ ...p, yearMin: null, yearMax: null })),
    });
  }

  if (sortBy !== 'auction_start') {
    chips.push({
      key: 'sort',
      label: STRINGS.chips.sort(STRINGS.sort.options[sortBy]),
      onRemove: () => setSortBy('auction_start'),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex items-center gap-1.5 bg-bg-elevated text-sm text-text-primary rounded-full px-3 py-1"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            aria-label={STRINGS.chips.removeAriaLabel(chip.label)}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}
      {activeFilterCount > 1 && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-sm text-text-secondary border border-border-default rounded-full px-3 py-1 hover:text-text-primary hover:border-border-active transition-colors"
        >
          {STRINGS.filters.clearAll}
        </button>
      )}
    </div>
  );
}
