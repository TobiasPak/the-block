import { useRef, useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(val), 300);
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-4">
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xl font-bold tracking-tight text-white">THE BLOCK</span>
        <span className="w-2 h-2 rounded-full bg-orange-500 mb-3" aria-hidden="true" />
      </div>

      <div className="flex-1 max-w-xl mx-auto">
        <label htmlFor="global-search" className="sr-only">
          Search make, model, VIN
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={16}
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            value={inputValue}
            onChange={handleChange}
            placeholder="Search make, model, VIN…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center" aria-label="Account">
        <span className="text-xs font-semibold text-slate-300">TB</span>
      </div>
    </header>
  );
}
