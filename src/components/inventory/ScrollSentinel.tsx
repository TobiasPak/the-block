import { forwardRef } from 'react';
import { STRINGS } from '../../config/strings';

interface ScrollSentinelProps {
  isLoadingMore: boolean;
  hasMore: boolean;
}

export const ScrollSentinel = forwardRef<HTMLDivElement, ScrollSentinelProps>(
  ({ isLoadingMore, hasMore }, ref) => {
    if (!hasMore) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <div className="w-8 h-px bg-border-default" />
          <p className="text-text-muted text-sm">{STRINGS.inventory.allLoaded}</p>
          <div className="w-8 h-px bg-border-default" />
        </div>
      );
    }

    return (
      <div ref={ref} className="flex items-center justify-center py-8">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            <span>{STRINGS.inventory.loadingMore}</span>
          </div>
        )}
      </div>
    );
  },
);

ScrollSentinel.displayName = 'ScrollSentinel';
