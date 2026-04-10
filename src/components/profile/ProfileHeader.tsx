interface ProfileStats {
  totalDecks: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  favoriteFormat: string;
}

interface ProfileHeaderProps {
  username: string;
  joinedAt: string;
  stats: ProfileStats;
}

export function ProfileHeader({ username, joinedAt, stats }: ProfileHeaderProps) {
  const winRate = stats.totalMatches > 0
    ? Math.round((stats.wins / stats.totalMatches) * 100)
    : 0;

  const joined = new Date(joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-400 font-bold text-xl" style={{ fontFamily: 'Capriola, sans-serif' }}>
            {initials}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-zinc-100" style={{ fontFamily: 'Capriola, sans-serif' }}>
            {username}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Joined {joined}</p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Stat label="Decks" value={stats.totalDecks} />
            <Stat label="Matches" value={stats.totalMatches} />
            <Stat label="Win Rate" value={`${winRate}%`} highlight />
            <Stat label="Wins" value={stats.wins} />
            <Stat label="Losses" value={stats.losses} />
            <Stat label="Draws" value={stats.draws} />
            {stats.favoriteFormat && (
              <Stat label="Favorite Format" value={stats.favoriteFormat} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-amber-400' : 'text-zinc-100'}`}>{value}</p>
    </div>
  );
}
