import { useRef } from 'react';
import { FilterProvider } from '../context/FilterContext';
import { Header } from '../components/layout/Header';
import { VehicleGrid } from '../components/inventory/VehicleGrid';
import { ScrollToTopButton } from '../components/ui/ScrollToTopButton';
import { useInventory } from '../hooks/useInventory';
import { vehicles } from '../data/vehicles';

export function InventoryPage() {
  const inventory = useInventory(vehicles);
  const mainRef = useRef<HTMLElement>(null);

  return (
    <FilterProvider value={inventory}>
      <div className="flex flex-col h-screen bg-bg-page">
        <Header />
        <main ref={mainRef} className="flex-1 overflow-y-auto px-6 py-4">
          <VehicleGrid results={inventory.results} />
        </main>
        <ScrollToTopButton scrollRef={mainRef} />
      </div>
    </FilterProvider>
  );
}
