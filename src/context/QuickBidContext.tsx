import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Vehicle } from '../types/vehicle';
import type { QuickBidState } from '../hooks/useQuickBid';

interface QuickBidContextValue {
  setHoveredVehicle: (vehicle: Vehicle | null) => void;
  quickBidState: QuickBidState;
}

const QuickBidContext = createContext<QuickBidContextValue | null>(null);

export function QuickBidProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: QuickBidContextValue;
}) {
  return <QuickBidContext.Provider value={value}>{children}</QuickBidContext.Provider>;
}

export function useQuickBidContext(): QuickBidContextValue {
  const ctx = useContext(QuickBidContext);
  if (!ctx) throw new Error('useQuickBidContext must be used within QuickBidProvider');
  return ctx;
}
