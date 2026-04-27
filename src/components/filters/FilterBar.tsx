import { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { SetStateAction } from 'react';
import type { Filters, SortBy, AvailableOptions } from '../../hooks/useInventory';
import { FilterPillSort } from './FilterPillSort';
import { FilterPillCheckbox } from './FilterPillCheckbox';
import { FilterPillRange } from './FilterPillRange';
import { STRINGS } from '../../config/strings';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filters: Filters;
  setFilters: (action: SetStateAction<Filters>) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  activeFilterCount: number;
  resetFilters: () => void;
  availableOptions: AvailableOptions;
}

type DropdownId =
  | 'sort'
  | 'make'
  | 'body_style'
  | 'fuel_type'
  | 'title_status'
  | 'price'
  | 'year'
  | 'province';

export function FilterBar({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  activeFilterCount,
  resetFilters,
  availableOptions,
}: FilterBarProps) {
  const [open, setOpen] = useState<DropdownId | null>(null);
  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openDropdown(id: DropdownId) { setOpen(id); }
  function closeDropdown() { setOpen(null); }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 300);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          size={14}
          aria-hidden="true"
        />
        <label htmlFor="filter-bar-search" className="sr-only">
          {STRINGS.search.label}
        </label>
        <input
          id="filter-bar-search"
          type="search"
          value={inputValue}
          onChange={handleSearchChange}
          placeholder={STRINGS.search.placeholder}
          className="w-full bg-bg-surface border border-border-default rounded-full pl-8 pr-4 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <FilterPillSort
        sortBy={sortBy}
        onChange={setSortBy}
        isOpen={open === 'sort'}
        onOpen={() => openDropdown('sort')}
        onClose={closeDropdown}
      />

      <FilterPillCheckbox
        label={STRINGS.filterLabels.make}
        options={availableOptions.makes}
        selected={filters.make}
        onChange={(values) => setFilters((p) => ({ ...p, make: values }))}
        isOpen={open === 'make'}
        onOpen={() => openDropdown('make')}
        onClose={closeDropdown}
      />

      <FilterPillCheckbox
        label={STRINGS.filterLabels.bodyStyle}
        options={[...STRINGS.bodyOptions]}
        selected={filters.body_style}
        onChange={(values) => setFilters((p) => ({ ...p, body_style: values }))}
        isOpen={open === 'body_style'}
        onOpen={() => openDropdown('body_style')}
        onClose={closeDropdown}
      />

      <FilterPillCheckbox
        label={STRINGS.filterLabels.fuelType}
        options={[...STRINGS.fuelOptions]}
        selected={filters.fuel_type}
        onChange={(values) => setFilters((p) => ({ ...p, fuel_type: values }))}
        isOpen={open === 'fuel_type'}
        onOpen={() => openDropdown('fuel_type')}
        onClose={closeDropdown}
      />

      <FilterPillCheckbox
        label={STRINGS.filterLabels.titleStatus}
        options={[...STRINGS.titleOptions]}
        selected={filters.title_status}
        onChange={(values) => setFilters((p) => ({ ...p, title_status: values }))}
        isOpen={open === 'title_status'}
        onOpen={() => openDropdown('title_status')}
        onClose={closeDropdown}
      />

      <FilterPillRange
        label={STRINGS.filterLabels.price}
        min={filters.priceMin}
        max={filters.priceMax}
        format="currency"
        onChange={(min, max) => setFilters((p) => ({ ...p, priceMin: min, priceMax: max }))}
        isOpen={open === 'price'}
        onOpen={() => openDropdown('price')}
        onClose={closeDropdown}
      />

      <FilterPillRange
        label={STRINGS.filterLabels.year}
        min={filters.yearMin}
        max={filters.yearMax}
        format="number"
        onChange={(min, max) => setFilters((p) => ({ ...p, yearMin: min, yearMax: max }))}
        isOpen={open === 'year'}
        onOpen={() => openDropdown('year')}
        onClose={closeDropdown}
        dropdownAlign="right"
      />

      <FilterPillCheckbox
        label={STRINGS.filterLabels.province}
        options={availableOptions.provinces}
        selected={filters.province}
        onChange={(values) => setFilters((p) => ({ ...p, province: values }))}
        isOpen={open === 'province'}
        onOpen={() => openDropdown('province')}
        onClose={closeDropdown}
        dropdownAlign="right"
      />

      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap ml-1"
          aria-label={STRINGS.filters.clearAll}
        >
          <X size={14} aria-hidden="true" />
          {STRINGS.filters.clearAll}
        </button>
      )}
    </div>
  );
}
