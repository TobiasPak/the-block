import { SearchX, Gavel, Trophy, Heart } from 'lucide-react';
import type { ComponentType } from 'react';
import { STRINGS } from '../../config/strings';
import { useFilterContext } from '../../context/FilterContext';
import type { InventoryViewMode } from '../../hooks/useInventory';

interface Message {
  Icon: ComponentType<{ size: number; className: string }>;
  heading: string;
  hint: string;
}

const MESSAGES: Record<InventoryViewMode, Message> = {
  all:   { Icon: SearchX, heading: STRINGS.empty.noResults,  hint: STRINGS.empty.noResultsHint },
  bids:  { Icon: Gavel,   heading: STRINGS.empty.bids,       hint: STRINGS.empty.bidsHint },
  won:   { Icon: Trophy,  heading: STRINGS.empty.won,        hint: STRINGS.empty.wonHint },
  liked: { Icon: Heart,   heading: STRINGS.empty.liked,      hint: STRINGS.empty.likedHint },
};

export function EmptyState() {
  const { resetFilters, viewMode, toggleViewMode } = useFilterContext();

  const { Icon, heading, hint } = MESSAGES[viewMode];

  function handleClear() {
    if (viewMode !== 'all') toggleViewMode(viewMode);
    else resetFilters();
  }

  const buttonLabel = viewMode !== 'all' ? STRINGS.nav.clearView : STRINGS.filters.clearFilters;

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <Icon size={48} className="text-text-muted" />
      <h2 className="text-xl font-semibold text-text-secondary">{heading}</h2>
      <p className="text-text-muted text-sm">{hint}</p>
      <button
        onClick={handleClear}
        className="mt-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-text-primary text-sm font-medium transition-colors"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
