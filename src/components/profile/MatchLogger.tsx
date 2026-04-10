import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { matchesApi } from '../../services/api';
import type { ProfileDeck } from '../../services/api';

type Result = 'win' | 'loss' | 'draw';

interface MatchLoggerProps {
  decks: ProfileDeck[];
  token: string | null;
  onLogged: () => void;
}

export function MatchLogger({ decks, token, onLogged }: MatchLoggerProps) {
  const [open, setOpen] = useState(false);
  const [deckId, setDeckId] = useState(decks[0]?.id ?? '');
  const [result, setResult] = useState<Result>('win');
  const [opponent, setOpponent] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token || decks.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId) return;
    setLoading(true);
    try {
      const deck = decks.find(d => d.id === deckId);
      await matchesApi.create({
        deck_id: deckId,
        result,
        opponent_archetype: opponent,
        format: deck?.format ?? '',
        notes,
      }, token);
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

  return (
    <div className="bg-[#1e1f27] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-zinc-300 hover:text-amber-300 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Plus size={15} />
          Log Match Result
        </span>
        {open && <X size={14} className="text-zinc-500" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3 border-t border-[#292931]">
          {/* Deck selector */}
          <div className="pt-4">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Deck</label>
            <select
              value={deckId}
              onChange={e => setDeckId(e.target.value)}
              className="w-full bg-[#0d0e15] text-zinc-200 text-sm rounded-xl px-3 py-2.5 outline-none border border-[#4f4633]/20 focus:border-amber-500/40 transition-colors"
            >
              {decks.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Result */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Result</label>
            <div className="flex gap-2">
              {(['win', 'loss', 'draw'] as Result[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors capitalize ${
                    result === r
                      ? r === 'win'
                        ? 'bg-green-500/20 text-green-300'
                        : r === 'loss'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-[#292931] text-zinc-300'
                      : 'bg-[#0d0e15] text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Opponent */}
          <input
            type="text"
            value={opponent}
            onChange={e => setOpponent(e.target.value)}
            placeholder="Opponent archetype (optional)"
            className="w-full bg-[#0d0e15] border border-[#4f4633]/20 focus:border-amber-500/40 text-sm text-zinc-200 placeholder-zinc-600 px-3 py-2.5 rounded-xl outline-none transition-colors"
          />

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full bg-[#0d0e15] border border-[#4f4633]/20 focus:border-amber-500/40 text-sm text-zinc-200 placeholder-zinc-600 px-3 py-2.5 rounded-xl outline-none transition-colors resize-none"
          />

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-200 to-amber-500 text-zinc-900 hover:from-amber-100 hover:to-amber-400 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : 'Log Match'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-300 bg-[#0d0e15] rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
