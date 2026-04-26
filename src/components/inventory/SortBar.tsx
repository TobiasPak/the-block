import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import type { SortBy } from '../../hooks/useInventory';

interface SortBarProps {
  totalCount: number;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (v: 'grid' | 'list') => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'auction_start', label: 'Ending Soon' },
  { value: 'current_bid_asc', label: 'Bid: Low → High' },
  { value: 'current_bid_desc', label: 'Bid: High → Low' },
  { value: 'odometer_asc', label: 'Odometer: Low → High' },
  { value: 'year_desc', label: 'Newest Year' },
  { value: 'condition_desc', label: 'Best Condition' },
];

export function SortBar({
  totalCount,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  activeFilterCount,
  onOpenFilters,
}: SortBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
      <button
        onClick={onOpenFilters}
        className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:text-white transition-colors relative"
        aria-label="Open filters"
      >
        <SlidersHorizontal size={14} aria-hidden="true" />
        Filters
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      <span className="text-sm text-slate-400 mr-auto">
        <span className="font-semibold text-slate-200">{totalCount.toLocaleString()}</span> vehicles
      </span>

      <label htmlFor="sort-select" className="sr-only">Sort by</label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortBy)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1 border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
          className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          <LayoutGrid size={16} aria-hidden="true" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          aria-label="List view"
          className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          <List size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
