import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLDivElement>;
  children: ReactNode;
  width?: string;
  align?: 'left' | 'right';
}

export function FilterDropdown({
  isOpen,
  onClose,
  containerRef,
  children,
  width = 'w-56',
  align = 'left',
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen, onClose, containerRef]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`
        absolute top-full mt-2 z-50
        ${align === 'right' ? 'right-0' : 'left-0'}
        ${width}
        bg-bg-surface border border-border-default rounded-xl shadow-dropdown
      `}
    >
      {children}
    </div>
  );
}
