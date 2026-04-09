import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface CardSearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function CardSearchBar({ onSearch, loading }: CardSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
      <div className="flex-1 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search cards... (e.g. lightning bolt, t:creature c:r)"
          className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 text-sm text-zinc-100 placeholder-zinc-500 pl-8 pr-8 py-2 rounded-lg outline-none transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!query.trim() || loading}
        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          'Search'
        )}
      </button>
    </form>
  );
}
