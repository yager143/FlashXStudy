import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  large?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search decks or study sets…',
  large = false,
}: SearchBarProps) {
  return (
    <div
      className={`w-full flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 shadow-sm transition-all duration-200 ${
        large
          ? 'px-5 py-3.5 rounded-xl'
          : 'px-4 py-2.5 rounded-lg'
      }`}
    >
      <Search
        size={large ? 20 : 18}
        className="text-[var(--text-muted)] shrink-0 select-none pointer-events-none"
      />
      <input
        id="deck-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent outline-none border-none text-[var(--text)] placeholder-[var(--text-muted)] ${
          large ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
        }`}
      />
    </div>
  );
}
