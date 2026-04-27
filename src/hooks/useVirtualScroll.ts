import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVirtualScrollOptions {
  totalCount: number;
  initialBatch?: number;
  batchSize?: number;
  rootMargin?: string;
}

export interface UseVirtualScrollReturn {
  visibleCount: number;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isLoadingMore: boolean;
  hasMore: boolean;
  reset: () => void;
}

export function useVirtualScroll({
  totalCount,
  initialBatch = 24,
  batchSize = 20,
  rootMargin = '400px',
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const [visibleCount, setVisibleCount] = useState(initialBatch);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = visibleCount < totalCount;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    requestAnimationFrame(() => {
      setVisibleCount((prev) => Math.min(prev + batchSize, totalCount));
      setIsLoadingMore(false);
    });
  }, [isLoadingMore, hasMore, batchSize, totalCount]);

  const reset = useCallback(() => {
    setVisibleCount(initialBatch);
    setIsLoadingMore(false);
  }, [initialBatch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: null, rootMargin, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return { visibleCount, sentinelRef, isLoadingMore, hasMore, reset };
}
