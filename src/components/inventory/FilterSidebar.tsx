import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { SetStateAction } from 'react';
import type { Filters, AvailableOptions } from '../../hooks/useInventory';

interface FilterSidebarProps {
  filters: Filters;
  setFilters: (action: SetStateAction<Filters>) => void;
  availableOptions: AvailableOptions;
  activeFilterCount: number;
  resetFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const BODY_STYLES = ['SUV', 'Sedan', 'Truck', 'Coupe', 'Hatchback'];
const FUEL_TYPES: { value: string; label: string }[] = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
];
const TITLE_STATUSES: { value: string; label: string; dot: string }[] = [
  { value: 'clean', label: 'Clean', dot: 'bg-emerald-500' },
  { value: 'rebuilt', label: 'Rebuilt', dot: 'bg-amber-400' },
  { value: 'salvage', label: 'Salvage', dot: 'bg-red-500' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
        aria-expanded={open}
      >
        {title}
        {open ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function CheckList({
  options,
  selected,
  onToggle,
  renderLabel,
}: {
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  renderLabel?: (val: string) => React.ReactNode;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, 6);

  return (
    <div className="space-y-1.5">
      {visible.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.some((s) => s.toLowerCase() === opt.toLowerCase())}
            onChange={() => onToggle(opt)}
            className="w-3.5 h-3.5 rounded accent-orange-500 cursor-pointer"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            {renderLabel ? renderLabel(opt) : opt}
          </span>
        </label>
      ))}
      {options.length > 6 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="text-xs text-orange-400 hover:text-orange-300 transition-colors mt-1"
        >
          {showAll ? 'Show less' : `Show ${options.length - 6} more`}
        </button>
      )}
    </div>
  );
}

function toggle(arr: string[], val: string): string[] {
  const lower = val.toLowerCase();
  return arr.some((x) => x.toLowerCase() === lower) ? arr.filter((x) => x.toLowerCase() !== lower) : [...arr, val];
}

function NumericRange({
  label,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
  prefix,
}: {
  label: string;
  minVal: number | null;
  maxVal: number | null;
  onMinChange: (v: number | null) => void;
  onMaxChange: (v: number | null) => void;
  prefix?: string;
}) {
  function parse(val: string): number | null {
    const n = parseFloat(val.replace(/,/g, ''));
    return isNaN(n) ? null : n;
  }
  return (
    <div className="space-y-2" aria-label={label}>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">
            Min{prefix ? ` (${prefix})` : ''}
          </label>
          <input
            type="number"
            defaultValue={minVal ?? ''}
            onBlur={(e) => onMinChange(parse(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && onMinChange(parse((e.target as HTMLInputElement).value))}
            placeholder="Any"
            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">Max</label>
          <input
            type="number"
            defaultValue={maxVal ?? ''}
            onBlur={(e) => onMaxChange(parse(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && onMaxChange(parse((e.target as HTMLInputElement).value))}
            placeholder="Any"
            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar({
  filters,
  setFilters,
  availableOptions,
  activeFilterCount,
  resetFilters,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const sidebarContent = (
    <div className="h-full overflow-y-auto bg-slate-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <span className="text-sm font-bold text-slate-100">Filters</span>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
              Clear all
            </button>
          )}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors" aria-label="Close filters">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Section title="Make">
        <CheckList
          options={availableOptions.makes}
          selected={filters.make}
          onToggle={(m) => setFilters((p) => ({ ...p, make: toggle(p.make, m) }))}
        />
      </Section>

      <Section title="Body Style">
        <CheckList
          options={BODY_STYLES}
          selected={filters.body_style}
          onToggle={(bs) => setFilters((p) => ({ ...p, body_style: toggle(p.body_style, bs) }))}
        />
      </Section>

      <Section title="Fuel Type">
        <CheckList
          options={FUEL_TYPES.map((f) => f.value)}
          selected={filters.fuel_type}
          onToggle={(ft) => setFilters((p) => ({ ...p, fuel_type: toggle(p.fuel_type, ft) }))}
          renderLabel={(val) => FUEL_TYPES.find((f) => f.value === val)?.label ?? val}
        />
      </Section>

      <Section title="Title Status">
        <CheckList
          options={TITLE_STATUSES.map((t) => t.value)}
          selected={filters.title_status}
          onToggle={(ts) => setFilters((p) => ({ ...p, title_status: toggle(p.title_status, ts) }))}
          renderLabel={(val) => {
            const t = TITLE_STATUSES.find((s) => s.value === val);
            return (
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${t?.dot}`} aria-hidden="true" />
                {t?.label ?? val}
              </span>
            );
          }}
        />
      </Section>

      <Section title="Province">
        <CheckList
          options={availableOptions.provinces}
          selected={filters.province}
          onToggle={(pv) => setFilters((p) => ({ ...p, province: toggle(p.province, pv) }))}
        />
      </Section>

      <Section title="Price Range">
        <NumericRange
          label="Price range"
          minVal={filters.priceMin}
          maxVal={filters.priceMax}
          onMinChange={(v) => setFilters((p) => ({ ...p, priceMin: v }))}
          onMaxChange={(v) => setFilters((p) => ({ ...p, priceMax: v }))}
          prefix="$"
        />
      </Section>

      <Section title="Year Range">
        <NumericRange
          label="Year range"
          minVal={filters.yearMin}
          maxVal={filters.yearMax}
          onMinChange={(v) => setFilters((p) => ({ ...p, yearMin: v }))}
          onMaxChange={(v) => setFilters((p) => ({ ...p, yearMax: v }))}
        />
      </Section>

      <Section title="Min Condition">
        <div>
          <label htmlFor="condition-min" className="text-xs text-slate-400 block mb-2">
            Minimum grade: {filters.conditionMin ?? 'Any'}
          </label>
          <input
            id="condition-min"
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={filters.conditionMin ?? 1}
            onChange={(e) => setFilters((p) => ({ ...p, conditionMin: parseFloat(e.target.value) === 1 && p.conditionMin === null ? null : parseFloat(e.target.value) }))}
            onDoubleClick={() => setFilters((p) => ({ ...p, conditionMin: null }))}
            className="w-full accent-orange-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>1.0</span><span>5.0</span>
          </div>
          {filters.conditionMin !== null && (
            <button
              onClick={() => setFilters((p) => ({ ...p, conditionMin: null }))}
              className="text-xs text-orange-400 hover:text-orange-300 mt-1 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </Section>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-50
          md:sticky md:z-auto md:translate-x-0 md:shrink-0
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Filters"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
