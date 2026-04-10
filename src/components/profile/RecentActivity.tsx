import type { RecentMatch } from '../../services/api';

interface RecentActivityProps {
  matches: RecentMatch[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const RESULT_CONFIG = {
  win: { dot: 'bg-green-400', label: 'Won', text: 'text-green-400' },
  loss: { dot: 'bg-red-400', label: 'Lost', text: 'text-red-400' },
  draw: { dot: 'bg-zinc-400', label: 'Drew', text: 'text-zinc-400' },
};

export function RecentActivity({ matches }: RecentActivityProps) {
  if (matches.length === 0) {
    return (
      <div className="bg-[#1e1f27] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-4" style={{ fontFamily: 'Capriola, sans-serif' }}>
          Recent Activity
        </h3>
        <p className="text-sm text-zinc-600 text-center py-6">
          No matches logged yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e1f27] rounded-2xl p-5">
      <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-4" style={{ fontFamily: 'Capriola, sans-serif' }}>
        Recent Activity
      </h3>
      <div className="space-y-1">
        {matches.slice(0, 8).map(match => {
          const cfg = RESULT_CONFIG[match.result];
          return (
            <div
              key={match.id}
              className="flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-[#292931] transition-colors group"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 leading-snug">
                  <span className={`font-semibold ${cfg.text}`}>{cfg.label}</span>
                  {' with '}
                  <span className="text-[#d3c5ac] font-medium truncate">{match.deck_name}</span>
                  {match.opponent_archetype && (
                    <span className="text-zinc-500"> vs {match.opponent_archetype}</span>
                  )}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">{timeAgo(match.played_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
