import { SearchX } from 'lucide-react';
import { STRINGS } from '../../config/strings';
import { useFilterContext } from '../../context/FilterContext';

export function EmptyState() {
  const { resetFilters: onClear } = useFilterContext();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <SearchX size={48} className="text-text-muted" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-text-secondary">{STRINGS.filters.noResults}</h2>
      <p className="text-text-muted text-sm">{STRINGS.filters.noResultsHint}</p>
      <button
        onClick={onClear}
        className="mt-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-text-primary text-sm font-medium transition-colors"
      >
        {STRINGS.filters.clearFilters}
      </button>
    </div>
  );
}
