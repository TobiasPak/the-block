import { useState, useEffect, useCallback, useRef } from 'react';
import type { Vehicle } from '../types/vehicle';

export interface QuickBidState {
  hoveredVehicleId: string | null;
  pendingVehicleId: string | null;
  pendingAmount: number | null;
}

interface UseQuickBidReturn {
  setHoveredVehicle: (vehicle: Vehicle | null) => void;
  quickBidState: QuickBidState;
}

export function useQuickBid(
  onQuickBidInitiate: (vehicle: Vehicle, amount: number) => void,
  onQuickBidConfirm: (vehicle: Vehicle, amount: number) => void,
  getMinBid: (vehicleId: string) => number,
  isSidebarOpen: boolean,
): UseQuickBidReturn {
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null);
  const [pendingAmount, setPendingAmount]       = useState<number | null>(null);

  // Refs so the keydown handler always reads the latest values without re-registering
  const hoveredRef      = useRef<string | null>(null);
  const pendingRef      = useRef<{ vehicleId: string; amount: number } | null>(null);
  const vehiclesRef     = useRef<Map<string, Vehicle>>(new Map());
  const isSidebarRef    = useRef(isSidebarOpen);
  const onInitiateRef   = useRef(onQuickBidInitiate);
  const onConfirmRef    = useRef(onQuickBidConfirm);
  const getMinBidRef    = useRef(getMinBid);

  // Keep refs current on every render
  isSidebarRef.current  = isSidebarOpen;
  onInitiateRef.current = onQuickBidInitiate;
  onConfirmRef.current  = onQuickBidConfirm;
  getMinBidRef.current  = getMinBid;

  const setHoveredVehicle = useCallback((vehicle: Vehicle | null) => {
    hoveredRef.current = vehicle?.id ?? null;
    setHoveredVehicleId(vehicle?.id ?? null);
    if (vehicle) vehiclesRef.current.set(vehicle.id, vehicle);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Skip if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) return;

      // Skip modifier key combos
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      // Notification sidebar handles 1/2 in its own mode
      if (isSidebarRef.current) return;

      if (e.key === '1') {
        const vehicleId = hoveredRef.current;
        if (!vehicleId) return;

        const vehicle = vehiclesRef.current.get(vehicleId);
        if (!vehicle) return;

        const amount = getMinBidRef.current(vehicleId);

        pendingRef.current = { vehicleId, amount };
        setPendingVehicleId(vehicleId);
        setPendingAmount(amount);

        onInitiateRef.current(vehicle, amount);
        e.preventDefault();
      }

      if (e.key === '2') {
        if (!pendingRef.current) return;

        const { vehicleId, amount } = pendingRef.current;

        // Guard — cursor must still be over the same vehicle
        if (hoveredRef.current !== vehicleId) return;

        const vehicle = vehiclesRef.current.get(vehicleId);
        if (!vehicle) return;

        onConfirmRef.current(vehicle, amount);

        pendingRef.current = null;
        setPendingVehicleId(null);
        setPendingAmount(null);
        e.preventDefault();
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // registered once — reads latest values via refs

  return {
    setHoveredVehicle,
    quickBidState: { hoveredVehicleId, pendingVehicleId, pendingAmount },
  };
}
