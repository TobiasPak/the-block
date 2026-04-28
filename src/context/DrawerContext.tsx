import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Vehicle } from '../types/vehicle';
import { useNotificationStore } from '../store/useNotificationStore';

interface DrawerContextValue {
  selectedVehicle: Vehicle | null;
  openDrawer: (vehicle: Vehicle) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { closeSidebar } = useNotificationStore();

  const openDrawer = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    closeSidebar(); // close notification sidebar when drawer opens
  }, [closeSidebar]);

  const closeDrawer = useCallback(() => {
    setSelectedVehicle(null);
  }, []);

  const value = useMemo(
    () => ({ selectedVehicle, openDrawer, closeDrawer }),
    [selectedVehicle, openDrawer, closeDrawer],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
}
