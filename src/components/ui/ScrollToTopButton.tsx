import { ArrowUp } from 'lucide-react';
import { type RefObject } from 'react';
import { useScrollVisibility } from '../../hooks/useScrollVisibility';
import { STRINGS } from '../../config/strings';

interface ScrollToTopButtonProps {
  scrollRef: RefObject<HTMLElement | null>;
}

export function ScrollToTopButton({ scrollRef }: ScrollToTopButtonProps) {
  const visible = useScrollVisibility(800, scrollRef);

  function handleClick() {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={STRINGS.ui.scrollToTop}
      className={`
        fixed bottom-6 right-6 z-40
        w-8 h-8
        flex items-center justify-center
        rounded-full
        bg-bg-surface border border-border-default
        text-text-muted hover:text-text-primary
        shadow-card hover:shadow-card-hover
        transition-all duration-300 ease-out
        ${visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'}
      `}
    >
      <ArrowUp size={14} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
