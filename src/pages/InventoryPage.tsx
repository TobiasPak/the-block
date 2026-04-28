import { useRef, useEffect, useCallback } from 'react';
import { FilterProvider } from '../context/FilterContext';
import { QuickBidProvider } from '../context/QuickBidContext';
import { Header } from '../components/layout/Header';
import { VehicleGrid } from '../components/inventory/VehicleGrid';
import { VehicleDrawer } from '../components/drawer/VehicleDrawer';
import { ScrollToTopButton } from '../components/ui/ScrollToTopButton';
import { NotificationSidebar } from '../components/notifications/NotificationSidebar';
import { NotificationToastQueue } from '../components/notifications/NotificationToastQueue';
import { useInventory } from '../hooks/useInventory';
import { useNotificationEngine } from '../hooks/useNotificationEngine';
import { useNotificationStore } from '../store/useNotificationStore';
import { useBidStore, getMinimumBid } from '../store/useBidStore';
import { useDrawer } from '../context/DrawerContext';
import { useQuickBid } from '../hooks/useQuickBid';
import type { Vehicle } from '../types/vehicle';
import { vehicles } from '../data/vehicles';

export function InventoryPage() {
  const inventory = useInventory(vehicles);
  const mainRef   = useRef<HTMLElement>(null);

  // Expose vehicles for dev console
  useEffect(() => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__vehicles = vehicles;
    }
  }, []);

  // Mount notification engine (single instance)
  useNotificationEngine();

  // Quick-bid keyboard hooks (1 = stage vehicle bid, 2 = confirm while hovering)
  const { openDrawer } = useDrawer();
  const { placeBid, getBidEntry } = useBidStore();
  const { isSidebarOpen } = useNotificationStore();

  const handleQuickBidInitiate = useCallback((vehicle: Vehicle) => {
    openDrawer(vehicle);
  }, [openDrawer]);

  const handleQuickBidConfirm = useCallback((vehicle: Vehicle, amount: number) => {
    placeBid(vehicle.id, amount, vehicle.bid_count);
  }, [placeBid]);

  const getMinBid = useCallback((vehicleId: string): number => {
    const v = vehicles.find((v) => v.id === vehicleId);
    if (!v) return 0;
    const entry = getBidEntry(vehicleId);
    return getMinimumBid(entry?.currentBid ?? v.current_bid, v.starting_bid);
  }, [getBidEntry]);

  const { setHoveredVehicle, quickBidState } = useQuickBid(
    handleQuickBidInitiate,
    handleQuickBidConfirm,
    getMinBid,
    isSidebarOpen,
  );

  return (
    <FilterProvider value={inventory}>
      <QuickBidProvider value={{ setHoveredVehicle, quickBidState }}>
        <div className="flex flex-col h-screen bg-bg-page">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto px-3 py-3 md:px-6 md:py-4">
              <VehicleGrid results={inventory.results} />
            </main>
            {/* Push panels — only one open at a time */}
            <VehicleDrawer />
            <NotificationSidebar />
          </div>
          <ScrollToTopButton scrollRef={mainRef} />
        </div>

        {/* Toast queue — fixed overlay, always on top */}
        <NotificationToastQueue />
      </QuickBidProvider>
    </FilterProvider>
  );
}
