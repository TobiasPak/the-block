import { useEffect } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { VehicleCard } from './VehicleCard';
import { ScrollSentinel } from './ScrollSentinel';
import { EmptyState } from './EmptyState';
import { useVirtualScroll } from '../../hooks/useVirtualScroll';
import { useNetworkSpeed } from '../../hooks/useNetworkSpeed';

interface VehicleGridProps {
  results: Vehicle[];
}

export function VehicleGrid({ results }: VehicleGridProps) {
  const rootMargin = useNetworkSpeed();
  const { visibleCount, sentinelRef, isLoadingMore, hasMore, reset } = useVirtualScroll({
    totalCount: results.length,
    initialBatch: 24,
    batchSize: 20,
    rootMargin,
  });

  useEffect(() => {
    reset();
  }, [results, reset]);

  if (results.length === 0) return <EmptyState />;

  const visibleVehicles = results.slice(0, visibleCount);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {visibleVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      <ScrollSentinel ref={sentinelRef} isLoadingMore={isLoadingMore} hasMore={hasMore} />
    </div>
  );
}
