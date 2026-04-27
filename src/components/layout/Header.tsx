import { Gavel, Trophy, Heart, LayoutGrid } from 'lucide-react';
import { useFilterContext } from '../../context/FilterContext';
import { useBidStore } from '../../store/useBidStore';
import { useLikeStore } from '../../store/useLikeStore';
import { FilterBar } from '../filters/FilterBar';
import { ActiveFilterChips } from '../filters/ActiveFilterChips';
import { NavIconButton } from '../ui/NavIconButton';
import { STRINGS } from '../../config/strings';

export function Header() {
  const {
    searchQuery, setSearchQuery, filters, setFilters,
    sortBy, setSortBy, activeFilterCount, resetFilters, availableOptions,
    viewMode, setViewMode, toggleViewMode,
  } = useFilterContext();

  const { getBiddedVehicles, getWonVehicles } = useBidStore();
  const { likeCount } = useLikeStore();

  const bidsCount = getBiddedVehicles().length;
  const wonCount  = getWonVehicles().length;

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

      {/* Row 2: Filter bar + nav icons */}
      <div className="px-6 pb-3 pt-1 flex items-center gap-3">
        <div className="flex-1 min-w-0">
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

        <div className="flex items-center gap-1 flex-shrink-0 border-l border-border-default pl-3">
          <NavIconButton
            icon={<LayoutGrid size={16} aria-hidden="true" />}
            label={STRINGS.nav.allInventory}
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <div className="w-px h-4 bg-border-default mx-1" aria-hidden="true" />
          <NavIconButton
            icon={<Gavel size={16} aria-hidden="true" />}
            label={STRINGS.nav.bids}
            badge={bidsCount}
            isActive={viewMode === 'bids'}
            onClick={() => toggleViewMode('bids')}
          />
          <NavIconButton
            icon={<Trophy size={16} aria-hidden="true" />}
            label={STRINGS.nav.won}
            badge={wonCount}
            isActive={viewMode === 'won'}
            onClick={() => toggleViewMode('won')}
          />
          <NavIconButton
            icon={<Heart size={16} aria-hidden="true" />}
            label={STRINGS.nav.liked}
            badge={likeCount}
            isActive={viewMode === 'liked'}
            onClick={() => toggleViewMode('liked')}
          />
        </div>
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
