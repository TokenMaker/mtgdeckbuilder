import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { decksApi, matchesApi, type DeckRecord, type MatchRecord } from '../services/api';
import { useAuth } from '../components/auth/AuthProvider';
import { MatchLogger } from '../components/profile/MatchLogger';

export function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const { user, getToken } = useAuth();
  const [deck, setDeck] = useState<DeckRecord | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loadToken = useCallback(async () => {
    const t = await getToken();
    setToken(t);
    return t;
  }, [getToken]);

  const loadDeck = useCallback(async (t: string) => {
    if (!deckId) return;
    try {
      const d = await decksApi.get(deckId, t);
      setDeck(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deck not found');
    }
  }, [deckId]);

  const loadMatches = useCallback(async (t: string) => {
    if (!deckId) return;
    try {
      const m = await matchesApi.list(deckId, t);
      setMatches(m);
    } catch {
      // Ignore
    }
  }, [deckId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const t = await loadToken();
      if (t) {
        await Promise.all([loadDeck(t), loadMatches(t)]);
      }
      setLoading(false);
    };
    init();
  }, [loadToken, loadDeck, loadMatches]);

  const handleDeleteMatch = async (matchId: string) => {
    if (!token) return;
    try {
      await matchesApi.delete(matchId, token);
      setMatches(prev => prev.filter(m => m.id !== matchId));
    } catch {
      // Ignore
    }
  };

  const handleLogged = async () => {
    if (token) await loadMatches(token);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <p>{error || 'Deck not found'}</p>
        <Link to="/" className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5">
          <ArrowLeft size={16} /> Go Home
        </Link>
      </div>
    );
  }

  const wins = matches.filter(m => m.result === 'win').length;
  const losses = matches.filter(m => m.result === 'loss').length;
  const draws = matches.filter(m => m.result === 'draw').length;
  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Home
        </Link>

        {/* Deck header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100 mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
                {deck.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                  {deck.format}
                </span>
                <span>{deck.card_count} cards</span>
              </div>
            </div>
          </div>

          {/* Match stats */}
          {matches.length > 0 && (
            <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-zinc-800">
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Win Rate</p>
                <p className="text-xl font-bold text-amber-400">{winRate}%</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Wins</p>
                <p className="text-xl font-bold text-green-400">{wins}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Losses</p>
                <p className="text-xl font-bold text-red-400">{losses}</p>
              </div>
              {draws > 0 && (
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wider">Draws</p>
                  <p className="text-xl font-bold text-zinc-400">{draws}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Match Logger */}
        {user && token && deckId && deck && (
          <div className="mb-6">
            <MatchLogger
              decks={[{
                id: deck.id,
                name: deck.name,
                format: deck.format,
                card_count: deck.card_count,
                updated_at: deck.updated_at ?? '',
                is_public: false,
                wins: 0,
                losses: 0,
                draws: 0,
              }]}
              token={token}
              onLogged={handleLogged}
            />
          </div>
        )}

        {/* Match log */}
        <div>
          <h2 className="text-xl font-bold text-zinc-100 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
            Match Log
          </h2>
          {matches.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-sm">
              No matches logged yet. Log your first match above!
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map(match => (
                <div
                  key={match.id}
                  className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
                >
                  <span className={`text-sm font-semibold w-12 flex-shrink-0 capitalize ${
                    match.result === 'win' ? 'text-green-400' :
                    match.result === 'loss' ? 'text-red-400' : 'text-zinc-400'
                  }`}>
                    {match.result}
                  </span>
                  <div className="flex-1 min-w-0">
                    {match.opponent_archetype && (
                      <p className="text-sm text-zinc-300 truncate">vs {match.opponent_archetype}</p>
                    )}
                    {match.notes && (
                      <p className="text-xs text-zinc-500 truncate">{match.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-600 flex-shrink-0">
                    {new Date(match.played_at).toLocaleDateString()}
                  </span>
                  {user && (
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
