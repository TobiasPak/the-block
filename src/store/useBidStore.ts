import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface BidEntry {
  currentBid: number;
  bidCount: number;
  myBid: number | null;
  status: 'idle' | 'winning' | 'outbid' | 'won' | 'reserve_not_met';
  purchaseMethod: 'buy_now' | 'auction' | null;
}

interface BidState {
  bids: Record<string, BidEntry>;
}

type BidAction =
  | { type: 'PLACE_BID';      vehicleId: string; amount: number; baseBidCount?: number }
  | { type: 'BUY_NOW';        vehicleId: string; amount: number; baseBidCount: number }
  | { type: 'AUCTION_END';    vehicleId: string; reservePrice: number | null }
  | { type: 'OUTBID';         vehicleId: string; newCurrentBid: number }
  | { type: 'RESET_VEHICLE';  vehicleId: string }
  | { type: 'RESET_ALL' };

const STORAGE_KEY = 'the-block:bids';

function loadInitialState(): BidState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BidState;
  } catch {}
  return { bids: {} };
}

function baseReducer(state: BidState, action: BidAction): BidState {
  switch (action.type) {
    case 'PLACE_BID': {
      const existing = state.bids[action.vehicleId];
      return {
        ...state,
        bids: {
          ...state.bids,
          [action.vehicleId]: {
            currentBid:     action.amount,
            bidCount:       (existing?.bidCount ?? (action.baseBidCount ?? 0)) + 1,
            myBid:          action.amount,
            status:         'winning',
            purchaseMethod: null,
          },
        },
      };
    }
    case 'BUY_NOW': {
      const existing = state.bids[action.vehicleId];
      return {
        ...state,
        bids: {
          ...state.bids,
          [action.vehicleId]: {
            currentBid:     action.amount,
            bidCount:       (existing?.bidCount ?? action.baseBidCount) + 1,
            myBid:          action.amount,
            status:         'won',
            purchaseMethod: 'buy_now',
          },
        },
      };
    }
    case 'AUCTION_END': {
      const entry = state.bids[action.vehicleId];
      if (!entry || entry.status !== 'winning') return state;
      const meetsReserve =
        action.reservePrice === null || (entry.myBid ?? 0) >= action.reservePrice;
      return {
        ...state,
        bids: {
          ...state.bids,
          [action.vehicleId]: {
            ...entry,
            status:         meetsReserve ? 'won' : 'reserve_not_met',
            purchaseMethod: meetsReserve ? 'auction' : null,
          },
        },
      };
    }
    case 'OUTBID': {
      const existing = state.bids[action.vehicleId];
      if (!existing) return state;
      return {
        ...state,
        bids: {
          ...state.bids,
          [action.vehicleId]: {
            ...existing,
            currentBid: action.newCurrentBid,
            bidCount:   (existing.bidCount ?? 0) + 1,
            status:     'outbid',
          },
        },
      };
    }
    case 'RESET_VEHICLE': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.vehicleId]: _removed, ...rest } = state.bids;
      return { ...state, bids: rest };
    }
    case 'RESET_ALL': {
      return { bids: {} };
    }
    default:
      return state;
  }
}

function persistingReducer(state: BidState, action: BidAction): BidState {
  const next = baseReducer(state, action);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  return next;
}

// ── Exported utilities ──────────────────────────────────────────────────────

export function minimumIncrement(currentBid: number): number {
  if (currentBid < 5_000)  return 250;
  if (currentBid < 10_000) return 500;
  if (currentBid < 25_000) return 1_000;
  if (currentBid < 50_000) return 2_500;
  return 5_000;
}

export function getMinimumBid(currentBid: number | null, startingBid: number): number {
  if (currentBid === null) return startingBid;
  return currentBid + minimumIncrement(currentBid);
}

// ── Context ─────────────────────────────────────────────────────────────────

interface BidStoreContextValue {
  bidEntries:        Record<string, BidEntry>;
  getBidEntry:       (vehicleId: string) => BidEntry | null;
  getBiddedVehicles: () => string[];
  getWonVehicles:    () => string[];
  placeBid:   (vehicleId: string, amount: number, baseBidCount: number) => void;
  auctionEnd: (vehicleId: string, reservePrice: number | null) => void;
  buyNow:     (vehicleId: string, amount: number, baseBidCount: number) => void;
}

const BidStoreContext = createContext<BidStoreContextValue | null>(null);

export function BidStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(persistingReducer, undefined, loadInitialState);

  // Expose raw store to DevTools console in dev mode only
  useEffect(() => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__bidStore = { getState: () => state, dispatch };
    }
  }, [state, dispatch]);

  const getBidEntry = useCallback(
    (vehicleId: string): BidEntry | null => state.bids[vehicleId] ?? null,
    [state],
  );

  const getBiddedVehicles = useCallback(
    () =>
      Object.entries(state.bids)
        .filter(([, e]) => e.status === 'winning' || e.status === 'outbid')
        .map(([id]) => id),
    [state],
  );

  const getWonVehicles = useCallback(
    () =>
      Object.entries(state.bids)
        .filter(([, e]) => e.status === 'won' || e.status === 'reserve_not_met')
        .map(([id]) => id),
    [state],
  );

  const placeBid = useCallback(
    (vehicleId: string, amount: number, baseBidCount: number) =>
      dispatch({ type: 'PLACE_BID', vehicleId, amount, baseBidCount }),
    [],
  );

  const auctionEnd = useCallback(
    (vehicleId: string, reservePrice: number | null) =>
      dispatch({ type: 'AUCTION_END', vehicleId, reservePrice }),
    [],
  );

  const buyNow = useCallback(
    (vehicleId: string, amount: number, baseBidCount: number) =>
      dispatch({ type: 'BUY_NOW', vehicleId, amount, baseBidCount }),
    [],
  );

  const value = useMemo(
    () => ({ bidEntries: state.bids, getBidEntry, getBiddedVehicles, getWonVehicles, placeBid, auctionEnd, buyNow }),
    [state.bids, getBidEntry, getBiddedVehicles, getWonVehicles, placeBid, auctionEnd, buyNow],
  );

  return React.createElement(BidStoreContext.Provider, { value }, children);
}

export function useBidStore(): BidStoreContextValue {
  const ctx = useContext(BidStoreContext);
  if (!ctx) throw new Error('useBidStore must be used within BidStoreProvider');
  return ctx;
}
