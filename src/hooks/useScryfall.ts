import { useState, useCallback } from 'react';
import type { ScryfallCard } from '../utils/formatRules';
import { scryfallApi } from '../services/api';

interface UseScryfallReturn {
  cards: ScryfallCard[];
  loading: boolean;
  error: string | null;
  totalCards: number;
  hasMore: boolean;
  search: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  setCards: React.Dispatch<React.SetStateAction<ScryfallCard[]>>;
  clearResults: () => void;
}

export function useScryfall(): UseScryfallReturn {
  const [cards, setCards] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCards, setTotalCards] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    setCurrentPage(1);

    try {
      const data = await scryfallApi.search(query, 1);
      setCards(data.data || []);
      setTotalCards(data.total_cards || 0);
      setHasMore(data.has_more || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!currentQuery || !hasMore || loading) return;

    const nextPage = currentPage + 1;
    setLoading(true);

    try {
      const data = await scryfallApi.search(currentQuery, nextPage);
      setCards(prev => [...prev, ...(data.data || [])]);
      setHasMore(data.has_more || false);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoading(false);
    }
  }, [currentQuery, hasMore, loading, currentPage]);

  const clearResults = useCallback(() => {
    setCards([]);
    setError(null);
    setTotalCards(0);
    setHasMore(false);
    setCurrentQuery('');
  }, []);

  return {
    cards,
    loading,
    error,
    totalCards,
    hasMore,
    search,
    loadMore,
    setCards,
    clearResults,
  };
}
