import { useState, useMemo, useCallback } from 'react';
import type { SetStateAction } from 'react';
import type { Vehicle } from '../types/vehicle';
import { normalizeAuctionStart } from '../utils/format';
import { useBidStore } from '../store/useBidStore';
import { useLikeStore } from '../store/useLikeStore';

export type SortBy =
  | 'auction_start'
  | 'current_bid_asc'
  | 'current_bid_desc'
  | 'odometer_asc'
  | 'year_desc'
  | 'condition_desc';

export type InventoryViewMode = 'all' | 'bids' | 'won' | 'liked';

export interface Filters {
  make: string[];
  body_style: string[];
  fuel_type: string[];
  title_status: string[];
  province: string[];
  priceMin: number | null;
  priceMax: number | null;
  yearMin: number | null;
  yearMax: number | null;
  conditionMin: number | null;
}

export interface AvailableOptions {
  makes: string[];
  body_styles: string[];
  provinces: string[];
}

export interface UseInventoryReturn {
  results: Vehicle[];
  totalCount: number;
  activeFilterCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filters: Filters;
  setFilters: (action: SetStateAction<Filters>) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  resetFilters: () => void;
  availableOptions: AvailableOptions;
  viewMode: InventoryViewMode;
  setViewMode: (mode: InventoryViewMode) => void;
  toggleViewMode: (mode: InventoryViewMode) => void;
}

const DEFAULT_FILTERS: Filters = {
  make: [],
  body_style: [],
  fuel_type: [],
  title_status: [],
  province: [],
  priceMin: null,
  priceMax: null,
  yearMin: null,
  yearMax: null,
  conditionMin: null,
};

const DEFAULT_SORT: SortBy = 'auction_start';

export function useInventory(allVehicles: Vehicle[]): UseInventoryReturn {
  const { getBiddedVehicles, getWonVehicles } = useBidStore();
  const { getLikedIds } = useLikeStore();

  const [searchQuery, setSearchQueryRaw] = useState('');
  const [filters, setFiltersRaw] = useState<Filters>(DEFAULT_FILTERS);
  const [sortBy, setSortByRaw] = useState<SortBy>(DEFAULT_SORT);
  const [viewMode, setViewModeRaw] = useState<InventoryViewMode>('all');

  const setSearchQuery = useCallback((q: string) => { setSearchQueryRaw(q); }, []);
  const setFilters = useCallback((action: SetStateAction<Filters>) => { setFiltersRaw(action); }, []);
  const setSortBy  = useCallback((s: SortBy) => { setSortByRaw(s); }, []);

  const setViewMode = useCallback((mode: InventoryViewMode) => {
    setViewModeRaw(mode);
  }, []);

  const toggleViewMode = useCallback((mode: InventoryViewMode) => {
    setViewModeRaw((prev) => (prev === mode ? 'all' : mode));
  }, []);

  const availableOptions = useMemo<AvailableOptions>(
    () => ({
      makes:       [...new Set(allVehicles.map((v) => v.make))].sort(),
      body_styles: [...new Set(allVehicles.map((v) => v.body_style))].sort(),
      provinces:   [...new Set(allVehicles.map((v) => v.province))].sort(),
    }),
    [allVehicles],
  );

  const viewFiltered = useMemo(() => {
    if (viewMode === 'all')   { const wonIds = new Set(getWonVehicles()); return allVehicles.filter((v) => !wonIds.has(v.id)); }
    if (viewMode === 'bids')  { const ids = new Set(getBiddedVehicles()); return allVehicles.filter((v) => ids.has(v.id)); }
    if (viewMode === 'won')   { const ids = new Set(getWonVehicles());    return allVehicles.filter((v) => ids.has(v.id)); }
    if (viewMode === 'liked') { const ids = new Set(getLikedIds());       return allVehicles.filter((v) => ids.has(v.id)); }
    return allVehicles;
  }, [allVehicles, viewMode, getBiddedVehicles, getWonVehicles, getLikedIds]);

  const filtered = useMemo(() => {
    let list = viewFiltered;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.trim.toLowerCase().includes(q) ||
          String(v.year).includes(q) ||
          v.vin.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.province.toLowerCase().includes(q) ||
          v.selling_dealership.toLowerCase().includes(q),
      );
    }

    if (filters.make.length > 0)         list = list.filter((v) => filters.make.includes(v.make));
    if (filters.body_style.length > 0)   list = list.filter((v) => filters.body_style.some((bs) => bs.toLowerCase() === v.body_style.toLowerCase()));
    if (filters.fuel_type.length > 0)    list = list.filter((v) => filters.fuel_type.some((ft) => ft.toLowerCase() === v.fuel_type.toLowerCase()));
    if (filters.title_status.length > 0) list = list.filter((v) => filters.title_status.some((ts) => ts.toLowerCase() === v.title_status.toLowerCase()));
    if (filters.province.length > 0)     list = list.filter((v) => filters.province.includes(v.province));
    if (filters.priceMin !== null)  { const min = filters.priceMin; list = list.filter((v) => (v.current_bid ?? v.starting_bid) >= min); }
    if (filters.priceMax !== null)  { const max = filters.priceMax; list = list.filter((v) => (v.current_bid ?? v.starting_bid) <= max); }
    if (filters.yearMin !== null)   { const yr = filters.yearMin;   list = list.filter((v) => v.year >= yr); }
    if (filters.yearMax !== null)   { const yr = filters.yearMax;   list = list.filter((v) => v.year <= yr); }
    if (filters.conditionMin !== null) { const c = filters.conditionMin; list = list.filter((v) => v.condition_grade >= c); }

    return list;
  }, [viewFiltered, searchQuery, filters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case 'auction_start':    return list.sort((a, b) => normalizeAuctionStart(a.auction_start).getTime() - normalizeAuctionStart(b.auction_start).getTime());
      case 'current_bid_asc':  return list.sort((a, b) => (a.current_bid ?? a.starting_bid) - (b.current_bid ?? b.starting_bid));
      case 'current_bid_desc': return list.sort((a, b) => (b.current_bid ?? b.starting_bid) - (a.current_bid ?? a.starting_bid));
      case 'odometer_asc':     return list.sort((a, b) => a.odometer_km - b.odometer_km);
      case 'year_desc':        return list.sort((a, b) => b.year - a.year);
      case 'condition_desc':   return list.sort((a, b) => b.condition_grade - a.condition_grade);
      default:                 return list;
    }
  }, [filtered, sortBy]);

  const totalCount = useMemo(() => sorted.length, [sorted]);
  const results = sorted;

  const activeFilterCount = useMemo(
    () =>
      (sortBy !== DEFAULT_SORT ? 1 : 0) +
      filters.make.length +
      filters.body_style.length +
      filters.fuel_type.length +
      filters.title_status.length +
      filters.province.length +
      (filters.priceMin  !== null ? 1 : 0) +
      (filters.priceMax  !== null ? 1 : 0) +
      (filters.yearMin   !== null ? 1 : 0) +
      (filters.yearMax   !== null ? 1 : 0) +
      (filters.conditionMin !== null ? 1 : 0),
    [filters, sortBy],
  );

  const resetFilters = useCallback(() => {
    setFiltersRaw(DEFAULT_FILTERS);
    setSortByRaw(DEFAULT_SORT);
    setSearchQueryRaw('');
  }, []);

  return {
    results,
    totalCount,
    activeFilterCount,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    resetFilters,
    availableOptions,
    viewMode,
    setViewMode,
    toggleViewMode,
  };
}
