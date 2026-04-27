import { ArrowUp } from 'lucide-react';
import { type RefObject } from 'react';
import { useScrollVisibility } from '../../hooks/useScrollVisibility';
import { useDrawer } from '../../context/DrawerContext';
import { STRINGS } from '../../config/strings';

// Keep in sync with the drawer's w-[440px] + 12px clearance
const DRAWER_WIDTH = 440;
const BUTTON_GAP = 12;

interface ScrollToTopButtonProps {
  scrollRef: RefObject<HTMLElement | null>;
}

export function ScrollToTopButton({ scrollRef }: ScrollToTopButtonProps) {
  const visible = useScrollVisibility(800, scrollRef);
  const { selectedVehicle } = useDrawer();
  const drawerOpen = selectedVehicle !== null;

  function handleClick() {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      onClick={handleClick}
      aria-label={STRINGS.ui.scrollToTop}
      style={{
        right: drawerOpen ? `${DRAWER_WIDTH + BUTTON_GAP}px` : '24px',
        transition: 'right 300ms ease-out, opacity 300ms ease-out, transform 300ms ease-out',
      }}
      className={`
        fixed bottom-6 z-40
        w-8 h-8
        flex items-center justify-center
        rounded-full
        bg-bg-surface border border-border-default
        text-text-muted hover:text-text-primary
        shadow-card hover:shadow-card-hover
        ${visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'}
      `}
    >
      <ArrowUp size={14} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
