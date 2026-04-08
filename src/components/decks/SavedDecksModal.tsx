import React, { useEffect, useState } from 'react';
import { X, FolderOpen, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useDeckContext } from '../../context/DeckContext';
import { decksApi } from '../../services/api';
import type { DeckRecord } from '../../services/api';
import type { Format } from '../../utils/formatRules';

interface SavedDecksModalProps {
  onClose: () => void;
}

export function SavedDecksModal({ onClose }: SavedDecksModalProps) {
  const { getToken, user } = useAuth();
  const { loadDeck } = useDeckContext();
  const [decks, setDecks] = useState<DeckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const data = await decksApi.list(token);
      setDecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (deck: DeckRecord) => {
    try {
      const token = await getToken();
      if (!token) return;
      const full = await decksApi.get(deck.id, token);
      loadDeck({
        name: full.name,
        format: full.format as Format,
        mainboard: (full.mainboard || {}) as any,
        sideboard: (full.sideboard || {}) as any,
        commander: full.commander as any || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deck');
    }
  };

  const handleDelete = async (deckId: string) => {
    setDeleting(deckId);
    try {
      const token = await getToken();
      if (!token) return;
      await decksApi.delete(deckId, token);
      setDecks(prev => prev.filter(d => d.id !== deckId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deck');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-zinc-100" style={{ fontFamily: 'Cinzel, serif' }}>My Decks</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-sm text-red-300 mb-4">
              {error}
            </div>
          )}

          {!loading && decks.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No saved decks yet</p>
              <p className="text-zinc-600 text-xs mt-1">Build a deck and save it to see it here</p>
            </div>
          )}

          {!loading && decks.length > 0 && (
            <div className="space-y-2">
              {decks.map(deck => (
                <div
                  key={deck.id}
                  className="group flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl transition-colors cursor-pointer"
                  onClick={() => handleLoad(deck)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{deck.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-amber-500/70 font-medium">{deck.format}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-xs text-zinc-500">{deck.card_count} cards</span>
                      <span className="text-zinc-700">·</span>
                      <div className="flex items-center gap-1 text-xs text-zinc-600">
                        <Clock size={10} />
                        {formatDate(deck.updated_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(deck.id); }}
                    disabled={deleting === deck.id}
                    className="flex-shrink-0 p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {deleting === deck.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
