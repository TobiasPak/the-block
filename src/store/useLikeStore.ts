import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

interface LikeState {
  likedIds: Set<string>;
}

type LikeAction =
  | { type: 'LIKE';   vehicleId: string }
  | { type: 'UNLIKE'; vehicleId: string };

const STORAGE_KEY = 'the-block:likes';

function loadInitialState(): LikeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { likedIds: new Set(JSON.parse(raw) as string[]) };
  } catch {}
  return { likedIds: new Set() };
}

function baseReducer(state: LikeState, action: LikeAction): LikeState {
  const next = new Set(state.likedIds);
  if (action.type === 'LIKE')   next.add(action.vehicleId);
  if (action.type === 'UNLIKE') next.delete(action.vehicleId);
  return { likedIds: next };
}

function persistingReducer(state: LikeState, action: LikeAction): LikeState {
  const next = baseReducer(state, action);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next.likedIds))); } catch {}
  return next;
}

// ── Context ─────────────────────────────────────────────────────────────────

interface LikeStoreContextValue {
  isLiked:     (vehicleId: string) => boolean;
  getLikedIds: () => string[];
  toggleLike:  (vehicleId: string) => void;
  likeCount:   number;
}

const LikeStoreContext = createContext<LikeStoreContextValue | null>(null);

export function LikeStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(persistingReducer, undefined, loadInitialState);

  const isLiked = useCallback(
    (vehicleId: string) => state.likedIds.has(vehicleId),
    [state],
  );

  const getLikedIds = useCallback(
    () => Array.from(state.likedIds),
    [state],
  );

  const toggleLike = useCallback((vehicleId: string) => {
    dispatch(state.likedIds.has(vehicleId)
      ? { type: 'UNLIKE', vehicleId }
      : { type: 'LIKE',   vehicleId });
  }, [state.likedIds]);

  const likeCount = state.likedIds.size;

  const value = useMemo(
    () => ({ isLiked, getLikedIds, toggleLike, likeCount }),
    [isLiked, getLikedIds, toggleLike, likeCount],
  );

  return React.createElement(LikeStoreContext.Provider, { value }, children);
}

export function useLikeStore(): LikeStoreContextValue {
  const ctx = useContext(LikeStoreContext);
  if (!ctx) throw new Error('useLikeStore must be used within LikeStoreProvider');
  return ctx;
}
