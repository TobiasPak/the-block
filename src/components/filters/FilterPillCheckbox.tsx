import { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { STRINGS } from '../../config/strings';

interface FilterPillCheckboxProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  dropdownAlign?: 'left' | 'right';
}

export function FilterPillCheckbox({
  label,
  options,
  selected,
  onChange,
  isOpen,
  onOpen,
  onClose,
  dropdownAlign = 'left',
}: FilterPillCheckboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSelection = selected.length > 0;

  function toggle(opt: string) {
    const lower = opt.toLowerCase();
    if (selected.some((s) => s.toLowerCase() === lower)) {
      onChange(selected.filter((s) => s.toLowerCase() !== lower));
    } else {
      onChange([...selected, opt]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={isOpen ? onClose : onOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap ${
          hasSelection
            ? 'bg-brand-subtle border border-border-active text-text-primary'
            : 'bg-bg-surface border border-border-default text-text-secondary hover:border-border-active hover:text-text-primary'
        }`}
      >
        {label}
        {hasSelection && (
          <span className="text-text-link font-semibold">· {selected.length}</span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <FilterDropdown
        isOpen={isOpen}
        onClose={onClose}
        containerRef={containerRef}
        width="w-56"
        align={dropdownAlign}
      >
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              {label}
            </span>
            {hasSelection && (
              <button
                onClick={() => onChange([])}
                className="text-xs text-text-link hover:text-brand transition-colors cursor-pointer"
              >
                {STRINGS.filters.clear}
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-bg-elevated text-sm text-text-secondary hover:text-text-primary"
              >
                <input
                  type="checkbox"
                  checked={selected.some((s) => s.toLowerCase() === opt.toLowerCase())}
                  onChange={() => toggle(opt)}
                  className="accent-brand w-4 h-4 rounded cursor-pointer"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </FilterDropdown>
    </div>
  );
}
