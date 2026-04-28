import { useState, useRef } from 'react';
import { Gavel, Trophy, Heart, LayoutGrid, SlidersHorizontal, Search, X } from 'lucide-react';
import { useFilterContext } from '../../context/FilterContext';
import { useBidStore } from '../../store/useBidStore';
import { useLikeStore } from '../../store/useLikeStore';
import { FilterBar } from '../filters/FilterBar';
import { ActiveFilterChips } from '../filters/ActiveFilterChips';
import { MobileFilterSheet } from '../filters/MobileFilterSheet';
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const mobileSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileInputValue, setMobileInputValue] = useState(searchQuery);

  function handleMobileSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setMobileInputValue(val);
    if (mobileSearchRef.current) clearTimeout(mobileSearchRef.current);
    mobileSearchRef.current = setTimeout(() => setSearchQuery(val), 300);
  }

  function clearMobileSearch() {
    setMobileInputValue('');
    setSearchQuery('');
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-bg-surface border-b border-border-default shrink-0">
        {/* Row 1: Logo + right controls */}
        <div className="flex items-center px-4 md:px-6 h-14 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xl font-bold tracking-tight text-text-primary">
              {STRINGS.app.name}
            </span>
            <span className="w-2 h-2 rounded-full bg-brand mb-3" aria-hidden="true" />
          </div>

          <div className="flex-1" />

          {/* Mobile: nav buttons + filter trigger + avatar */}
          <div className="flex md:hidden items-center gap-1 min-h-0">
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

            <div className="w-px h-4 bg-border-default mx-0.5" aria-hidden="true" />

            <NavIconButton
              icon={<LayoutGrid size={16} aria-hidden="true" />}
              label={STRINGS.nav.allInventory}
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />

            <div className="w-px h-4 bg-border-default mx-0.5" aria-hidden="true" />

            <button
              onClick={() => setMobileFilterOpen(true)}
              aria-label={STRINGS.filters.openAriaLabel}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-border-default text-text-secondary active:opacity-70 transition-opacity"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-text-inverse text-[10px] font-bold leading-4 flex items-center justify-center">
                  {activeFilterCount > 9 ? '9+' : activeFilterCount}
                </span>
              )}
            </button>

            <div
              className="w-8 h-8 rounded-full bg-brand flex items-center justify-center ml-1"
              aria-label={STRINGS.app.avatarAriaLabel}
            >
              <span className="text-xs font-bold text-text-inverse">
                {STRINGS.app.avatarInitials}
              </span>
            </div>
          </div>

          {/* Desktop: avatar only (nav buttons are in row 2) */}
          <div
            className="hidden md:flex w-8 h-8 rounded-full bg-bg-elevated items-center justify-center"
            aria-label={STRINGS.app.avatarAriaLabel}
          >
            <span className="text-xs font-semibold text-text-secondary">
              {STRINGS.app.avatarInitials}
            </span>
          </div>
        </div>

        {/* Mobile Row 2: Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              size={14}
              aria-hidden="true"
            />
            <label htmlFor="mobile-search" className="sr-only">{STRINGS.search.label}</label>
            <input
              id="mobile-search"
              type="search"
              value={mobileInputValue}
              onChange={handleMobileSearch}
              placeholder={STRINGS.search.placeholder}
              className="w-full bg-bg-page border border-border-default rounded-full pl-8 pr-8 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {mobileInputValue && (
              <button
                onClick={clearMobileSearch}
                aria-label={STRINGS.search.clearAriaLabel}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-text-muted active:opacity-70"
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Row 2: Filter bar + nav icons */}
        <div className="hidden md:flex px-6 pb-3 pt-1 items-center gap-3">
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

        {/* Desktop Row 3: Active filter chips */}
        {showChips && (
          <div className="hidden md:block px-6 pb-2">
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

      {/* Mobile filter sheet — rendered outside header to avoid z-index issues */}
      <MobileFilterSheet isOpen={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} />
    </>
  );
}
