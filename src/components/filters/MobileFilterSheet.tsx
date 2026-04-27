import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useFilterContext } from '../../context/FilterContext';
import type { SortBy } from '../../hooks/useInventory';
import { STRINGS } from '../../config/strings';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'auction_start',    label: STRINGS.sort.options.auction_start },
  { value: 'current_bid_asc',  label: STRINGS.sort.options.current_bid_asc },
  { value: 'current_bid_desc', label: STRINGS.sort.options.current_bid_desc },
  { value: 'odometer_asc',     label: STRINGS.sort.options.odometer_asc },
  { value: 'year_desc',        label: STRINGS.sort.options.year_desc },
  { value: 'condition_desc',   label: STRINGS.sort.options.condition_desc },
];

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilterSheet({ isOpen, onClose }: MobileFilterSheetProps) {
  const {
    searchQuery, setSearchQuery,
    filters, setFilters,
    sortBy, setSortBy,
    activeFilterCount, resetFilters,
    availableOptions,
    results,
  } = useFilterContext();

  function toggleCheckbox(
    key: 'make' | 'body_style' | 'fuel_type' | 'title_status' | 'province',
    value: string,
  ) {
    setFilters((p) => {
      const current = p[key] as string[];
      const lower = value.toLowerCase();
      const next = current.some((s) => s.toLowerCase() === lower)
        ? current.filter((s) => s.toLowerCase() !== lower)
        : [...current, value];
      return { ...p, [key]: next };
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col max-h-[92vh] bg-bg-surface rounded-t-2xl overflow-hidden transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label={STRINGS.filters.heading}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border-default" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default flex-shrink-0">
          <span className="text-base font-semibold text-text-primary">{STRINGS.filters.heading}</span>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-brand font-medium active:opacity-70"
              >
                {STRINGS.filters.clearAll}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close filters"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated text-text-secondary active:opacity-70"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Search */}
          <div className="px-4 pt-4 pb-3 border-b border-border-subtle">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-2">
              {STRINGS.search.label}
            </label>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={STRINGS.search.placeholder}
              className="w-full bg-bg-page border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Sort */}
          <Section label={STRINGS.sort.heading}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`flex items-center gap-3 w-full px-2 py-3 rounded-xl text-sm transition-colors active:opacity-70 ${
                  sortBy === opt.value
                    ? 'bg-brand-subtle text-brand font-medium'
                    : 'text-text-secondary'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    sortBy === opt.value ? 'border-brand' : 'border-border-default'
                  }`}
                >
                  {sortBy === opt.value && <span className="w-2 h-2 rounded-full bg-brand" />}
                </span>
                {opt.label}
              </button>
            ))}
          </Section>

          {/* Make */}
          <Section label={STRINGS.filterLabels.make}>
            <CheckboxList
              options={availableOptions.makes}
              selected={filters.make}
              onToggle={(v) => toggleCheckbox('make', v)}
            />
          </Section>

          {/* Body Style */}
          <Section label={STRINGS.filterLabels.bodyStyle}>
            <CheckboxList
              options={[...STRINGS.bodyOptions]}
              selected={filters.body_style}
              onToggle={(v) => toggleCheckbox('body_style', v)}
            />
          </Section>

          {/* Fuel Type */}
          <Section label={STRINGS.filterLabels.fuelType}>
            <CheckboxList
              options={[...STRINGS.fuelOptions]}
              selected={filters.fuel_type}
              onToggle={(v) => toggleCheckbox('fuel_type', v)}
            />
          </Section>

          {/* Title Status */}
          <Section label={STRINGS.filterLabels.titleStatus}>
            <CheckboxList
              options={[...STRINGS.titleOptions]}
              selected={filters.title_status}
              onToggle={(v) => toggleCheckbox('title_status', v)}
            />
          </Section>

          {/* Province */}
          {availableOptions.provinces.length > 0 && (
            <Section label={STRINGS.filterLabels.province}>
              <CheckboxList
                options={availableOptions.provinces}
                selected={filters.province}
                onToggle={(v) => toggleCheckbox('province', v)}
              />
            </Section>
          )}

          {/* Price */}
          <Section label={STRINGS.filterLabels.price}>
            <RangeInputs
              min={filters.priceMin}
              max={filters.priceMax}
              format="currency"
              onChange={(min, max) => setFilters((p) => ({ ...p, priceMin: min, priceMax: max }))}
            />
          </Section>

          {/* Year */}
          <Section label={STRINGS.filterLabels.year}>
            <RangeInputs
              min={filters.yearMin}
              max={filters.yearMax}
              format="number"
              onChange={(min, max) => setFilters((p) => ({ ...p, yearMin: min, yearMax: max }))}
            />
          </Section>

          <div className="h-4" />
        </div>

        {/* Footer CTA */}
        <div className="px-4 pt-3 pb-safe border-t border-border-default flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-brand hover:bg-brand-hover active:opacity-80 text-text-inverse font-semibold py-3.5 rounded-xl text-base transition-colors"
          >
            Show {results.length} {results.length === 1 ? 'Result' : 'Results'}
          </button>
        </div>
      </div>
    </>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-3 border-b border-border-subtle last:border-0">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}

function CheckboxList({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {options.map((opt) => {
        const isChecked = selected.some((s) => s.toLowerCase() === opt.toLowerCase());
        return (
          <label
            key={opt}
            className="flex items-center gap-3 py-3 text-sm text-text-secondary cursor-pointer active:opacity-70"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggle(opt)}
              className="accent-brand w-4 h-4 rounded cursor-pointer flex-shrink-0"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function parse(val: string): number | null {
  const n = parseFloat(val.replace(/[$,]/g, ''));
  return isNaN(n) ? null : n;
}

function RangeInputs({
  min,
  max,
  format,
  onChange,
}: {
  min: number | null;
  max: number | null;
  format: 'currency' | 'number';
  onChange: (min: number | null, max: number | null) => void;
}) {
  const ph = format === 'currency' ? STRINGS.range.pricePlaceholder : STRINGS.range.yearPlaceholder;
  const minLabel = format === 'currency' ? STRINGS.range.minCurrency : STRINGS.range.min;
  const maxLabel = format === 'currency' ? STRINGS.range.maxCurrency : STRINGS.range.max;

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <label className="text-[10px] text-text-muted uppercase tracking-wide block mb-1.5">
          {minLabel}
        </label>
        <input
          type="number"
          defaultValue={min ?? ''}
          placeholder={ph.min}
          onBlur={(e) => onChange(parse(e.target.value), max)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onChange(parse(e.currentTarget.value), max);
          }}
          className="w-full bg-bg-page border border-border-default rounded-xl px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
      <div className="flex-1">
        <label className="text-[10px] text-text-muted uppercase tracking-wide block mb-1.5">
          {maxLabel}
        </label>
        <input
          type="number"
          defaultValue={max ?? ''}
          placeholder={ph.max}
          onBlur={(e) => onChange(min, parse(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onChange(min, parse(e.currentTarget.value));
          }}
          className="w-full bg-bg-page border border-border-default rounded-xl px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
    </div>
  );
}
