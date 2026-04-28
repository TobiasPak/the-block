import { useRef, useEffect } from 'react';
import { FilterProvider } from '../context/FilterContext';
import { Header } from '../components/layout/Header';
import { VehicleGrid } from '../components/inventory/VehicleGrid';
import { VehicleDrawer } from '../components/drawer/VehicleDrawer';
import { ScrollToTopButton } from '../components/ui/ScrollToTopButton';
import { useInventory } from '../hooks/useInventory';
import { vehicles } from '../data/vehicles';

export function InventoryPage() {
  const inventory = useInventory(vehicles);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__vehicles = vehicles;
    }
  }, []);

  return (
    <FilterProvider value={inventory}>
      <div className="flex flex-col h-screen bg-bg-page">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto px-3 py-3 md:px-6 md:py-4">
            <VehicleGrid results={inventory.results} />
          </main>
          <VehicleDrawer />
        </div>
        <ScrollToTopButton scrollRef={mainRef} />
      </div>
    </FilterProvider>
  );
}
