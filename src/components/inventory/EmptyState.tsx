import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <SearchX size={48} className="text-slate-600" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-slate-300">No vehicles found</h2>
      <p className="text-slate-500 text-sm">Try adjusting your filters or search query</p>
      <button
        onClick={onClear}
        className="mt-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}
