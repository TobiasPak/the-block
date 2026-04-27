import { useFilterContext } from '../../context/FilterContext';
import { FilterBar } from '../filters/FilterBar';
import { ActiveFilterChips } from '../filters/ActiveFilterChips';
import { STRINGS } from '../../config/strings';

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    activeFilterCount,
    resetFilters,
    availableOptions,
  } = useFilterContext();

  const showChips = activeFilterCount > 0 || sortBy !== 'auction_start';

  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-default shrink-0">
      {/* Row 1: Logo + Avatar */}
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold tracking-tight text-text-primary">
            {STRINGS.app.name}
          </span>
          <span className="w-2 h-2 rounded-full bg-brand mb-3" aria-hidden="true" />
        </div>
        <div
          className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center"
          aria-label={STRINGS.app.avatarAriaLabel}
        >
          <span className="text-xs font-semibold text-text-secondary">
            {STRINGS.app.avatarInitials}
          </span>
        </div>
      </div>

      {/* Row 2: Filter bar */}
      <div className="px-6 pb-3 pt-1">
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activeFilterCount={activeFilterCount}
          resetFilters={resetFilters}
          availableOptions={availableOptions}
        />
      </div>

      {/* Row 3: Active filter chips (conditional) */}
      {showChips && (
        <div className="px-6 pb-2">
          <ActiveFilterChips
            filters={filters}
            setFilters={setFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            activeFilterCount={activeFilterCount}
            resetFilters={resetFilters}
          />
        </div>
      )}
    </header>
  );
}
