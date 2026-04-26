import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { FilterSidebar } from '../components/inventory/FilterSidebar';
import { FilterChips } from '../components/inventory/FilterChips';
import { SortBar } from '../components/inventory/SortBar';
import { VehicleGrid } from '../components/inventory/VehicleGrid';
import { useInventory } from '../hooks/useInventory';
import { vehicles } from '../data/vehicles';

export function InventoryPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    results,
    totalCount,
    activeFilterCount,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    page,
    setPage,
    pageSize,
    resetFilters,
    availableOptions,
  } = useInventory(vehicles);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <FilterChips
        filters={filters}
        setFilters={setFilters}
        activeFilterCount={activeFilterCount}
        resetFilters={resetFilters}
      />

      <SortBar
        totalCount={totalCount}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeFilterCount={activeFilterCount}
        onOpenFilters={() => setIsFilterOpen(true)}
      />

      <div className="flex flex-1 relative">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          availableOptions={availableOptions}
          activeFilterCount={activeFilterCount}
          resetFilters={resetFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <main className="flex-1 min-w-0">
          <VehicleGrid
            vehicles={results}
            viewMode={viewMode}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            onReset={resetFilters}
          />
        </main>
      </div>
    </div>
  );
}
