import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UseInventoryReturn } from '../hooks/useInventory';

const FilterContext = createContext<UseInventoryReturn | null>(null);

export function FilterProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: UseInventoryReturn;
}) {
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterContext(): UseInventoryReturn {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilterContext must be used inside FilterProvider');
  return ctx;
}
