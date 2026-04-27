import type { ReactNode } from 'react';

interface NavIconButtonProps {
  icon: ReactNode;
  label: string;
  badge?: number;
  isActive: boolean;
  onClick: () => void;
}

export function NavIconButton({ icon, label, badge, isActive, onClick }: NavIconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 border ${
        isActive
          ? 'text-brand bg-brand-subtle border-brand'
          : 'text-text-muted border-transparent hover:text-text-primary hover:bg-bg-elevated'
      }`}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-text-inverse text-[10px] font-bold leading-4 text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
