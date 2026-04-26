import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { VehicleCard } from './VehicleCard';
import { VehicleCardList } from './VehicleCardList';
import { EmptyState } from './EmptyState';

interface VehicleGridProps {
  vehicles: Vehicle[];
  viewMode: 'grid' | 'list';
  totalCount: number;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  onReset: () => void;
}

export function VehicleGrid({ vehicles, viewMode, totalCount, page, pageSize, setPage, onReset }: VehicleGridProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (vehicles.length === 0) return <EmptyState onClear={onReset} />;

  return (
    <div className="p-4 space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vehicles.map((v) => (
            <VehicleCardList key={v.id} vehicle={v} />
          ))}
        </div>
      )}

      {totalCount > pageSize && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className="text-sm text-slate-400">
            Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
