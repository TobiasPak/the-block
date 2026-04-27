import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

export interface BidEntry {
  currentBid: number;
  bidCount: number;
  myBid: number | null;
  status: 'idle' | 'winning' | 'outbid' | 'won';
  purchaseMethod: 'buy_now' | 'auction' | null;
}

interface BidState {
  bids: Record<string, BidEntry>;
}

type BidAction =
  | { type: 'PLACE_BID'; vehicleId: string; amount: number; baseBidCount: number }
  | { type: 'BUY_NOW';   vehicleId: string; amount: number; baseBidCount: number };

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
            bidCount:       (existing?.bidCount ?? action.baseBidCount) + 1,
            myBid:          action.amount,
            status:         'winning',
            purchaseMethod: 'auction',
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
  getBidEntry:       (vehicleId: string) => BidEntry | null;
  getBiddedVehicles: () => string[];
  getWonVehicles:    () => string[];
  placeBid: (vehicleId: string, amount: number, baseBidCount: number) => void;
  buyNow:   (vehicleId: string, amount: number, baseBidCount: number) => void;
}

const BidStoreContext = createContext<BidStoreContextValue | null>(null);

export function BidStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(persistingReducer, undefined, loadInitialState);

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
        .filter(([, e]) => e.status === 'won')
        .map(([id]) => id),
    [state],
  );

  const placeBid = useCallback(
    (vehicleId: string, amount: number, baseBidCount: number) =>
      dispatch({ type: 'PLACE_BID', vehicleId, amount, baseBidCount }),
    [],
  );

  const buyNow = useCallback(
    (vehicleId: string, amount: number, baseBidCount: number) =>
      dispatch({ type: 'BUY_NOW', vehicleId, amount, baseBidCount }),
    [],
  );

  const value = useMemo(
    () => ({ getBidEntry, getBiddedVehicles, getWonVehicles, placeBid, buyNow }),
    [getBidEntry, getBiddedVehicles, getWonVehicles, placeBid, buyNow],
  );

  return React.createElement(BidStoreContext.Provider, { value }, children);
}

export function useBidStore(): BidStoreContextValue {
  const ctx = useContext(BidStoreContext);
  if (!ctx) throw new Error('useBidStore must be used within BidStoreProvider');
  return ctx;
}
