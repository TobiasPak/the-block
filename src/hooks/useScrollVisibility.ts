import { useState, useEffect, type RefObject } from 'react';

export function useScrollVisibility(
  threshold = 800,
  scrollRef?: RefObject<HTMLElement | null>,
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = scrollRef?.current
          ? scrollRef.current.scrollTop
          : window.scrollY;
        setVisible(scrollTop > threshold);
        ticking = false;
      });
    };

    const target = scrollRef?.current ?? window;
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [threshold, scrollRef]);

  return visible;
}
