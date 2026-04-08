import React from 'react';
import type { DeckCard, ScryfallCard } from '../../utils/formatRules';
import { getDeckColorCounts } from '../../utils/cardGrouping';

interface DeckStatsProps {
  mainboard: Record<string, DeckCard>;
  commander: ScryfallCard | null;
  validationErrors: Array<{ type: 'error' | 'warning'; message: string }>;
}

const COLOR_LABELS: Record<string, string> = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green', C: 'Colorless' };
const COLOR_CLASSES: Record<string, string> = {
  W: 'bg-yellow-100 border-yellow-200',
  U: 'bg-blue-600 border-blue-500',
  B: 'bg-zinc-700 border-zinc-600',
  R: 'bg-red-600 border-red-500',
  G: 'bg-green-700 border-green-600',
  C: 'bg-zinc-500 border-zinc-400',
};
const COLOR_TEXT: Record<string, string> = {
  W: 'text-yellow-900',
  U: 'text-white',
  B: 'text-white',
  R: 'text-white',
  G: 'text-white',
  C: 'text-white',
};

export function DeckStats({ mainboard, commander, validationErrors }: DeckStatsProps) {
  const colorCounts = getDeckColorCounts(mainboard);
  const totalColorCards = Object.values(colorCounts).reduce((s, v) => s + v, 0);
  const hasColors = totalColorCards > 0;

  const errors = validationErrors.filter(e => e.type === 'error');
  const warnings = validationErrors.filter(e => e.type === 'warning');

  return (
    <div className="space-y-3">
      {/* Color identity pips */}
      {hasColors && (
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1.5">Color Distribution</p>
          <div className="flex gap-1 flex-wrap">
            {Object.entries(colorCounts)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([color, count]) => (
                <div
                  key={color}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${COLOR_CLASSES[color]} ${COLOR_TEXT[color]}`}
                  title={`${COLOR_LABELS[color]}: ${count} cards`}
                >
                  <span>{color}</span>
                  <span className="opacity-75">{count}</span>
                </div>
              ))}
          </div>
          {/* Bar chart */}
          <div className="flex gap-0.5 mt-2 h-1.5 rounded-full overflow-hidden">
            {Object.entries(colorCounts)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([color, count]) => (
                <div
                  key={color}
                  style={{ width: `${(count / totalColorCards) * 100}%` }}
                  className={`${COLOR_CLASSES[color].split(' ')[0]} rounded-full`}
                  title={`${color}: ${Math.round((count / totalColorCards) * 100)}%`}
                />
              ))}
          </div>
        </div>
      )}

      {/* Validation warnings & errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((e, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-red-400/10 border border-red-400/20 rounded-lg">
              <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
              <p className="text-xs text-red-300 leading-relaxed">{e.message}</p>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-amber-400/10 border border-amber-400/20 rounded-lg">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">⚠</span>
              <p className="text-xs text-amber-300 leading-relaxed">{w.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
