import { useState } from 'react';
import { Plus } from 'lucide-react';
import { matchesApi } from '../../services/api';

type Result = 'win' | 'loss' | 'draw';

interface MatchLoggerProps {
  deckId: string;
  token: string | null;
  onLogged: () => void;
}

export function MatchLogger({ deckId, token, onLogged }: MatchLoggerProps) {
  const [result, setResult] = useState<Result>('win');
  const [opponent, setOpponent] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await matchesApi.create({ deck_id: deckId, result, opponent_archetype: opponent, format: '', notes }, token);
      setOpponent('');
      setNotes('');
      setResult('win');
      setOpen(false);
      onLogged();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-amber-400 transition-colors"
      >
        <Plus size={16} />
        Log Match Result
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Result selector */}
          <div className="flex gap-2">
            {(['win', 'loss', 'draw'] as Result[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setResult(r)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors capitalize ${
                  result === r
                    ? r === 'win'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : r === 'loss'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-zinc-700 text-zinc-300 border border-zinc-600'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Opponent archetype */}
          <input
            type="text"
            value={opponent}
            onChange={e => setOpponent(e.target.value)}
            placeholder="Opponent archetype (optional)"
            className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 text-sm text-zinc-100 placeholder-zinc-500 px-3 py-2 rounded-lg outline-none transition-colors"
          />

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 text-sm text-zinc-100 placeholder-zinc-500 px-3 py-2 rounded-lg outline-none transition-colors resize-none"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Log Match'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
