import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, BarChart2, Activity,
  Plus, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { profileApi, type ProfileData } from '../services/api';
import { DeckLibrary } from '../components/profile/DeckLibrary';
import { WinRateChart } from '../components/profile/WinRateChart';
import { PerformanceChart } from '../components/profile/PerformanceChart';
import { RecentActivity } from '../components/profile/RecentActivity';
import { MatchLogger } from '../components/profile/MatchLogger';
import { DeckCard } from '../components/profile/DeckCard';

type Tab = 'overview' | 'decks' | 'stats' | 'activity';

const NAV_ITEMS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'decks', label: 'Decks', Icon: BookOpen },
  { id: 'stats', label: 'Stats', Icon: BarChart2 },
  { id: 'activity', label: 'Activity', Icon: Activity },
];

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [token, setToken] = useState<string | null>(null);

  const isOwnProfile =
    username === 'me' ||
    (!!user && (
      user.email?.split('@')[0] === username ||
      user.user_metadata?.username === username
    ));

  const load = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const t = await getToken();
      setToken(t);

      const data = username === 'me'
        ? (t ? await profileApi.getMe(t) : await Promise.reject(new Error('Not authenticated')))
        : await profileApi.get(username);

      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile not found');
    } finally {
      setLoading(false);
    }
  }, [username, getToken]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12131a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#12131a] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-lg">{error || 'Profile not found'}</p>
        <Link to="/" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors text-sm">
          <ArrowLeft size={15} /> Go Home
        </Link>
      </div>
    );
  }

  const winRate = profile.stats.totalMatches > 0
    ? Math.round((profile.stats.wins / profile.stats.totalMatches) * 100)
    : 0;

  const initials = profile.username.slice(0, 2).toUpperCase();
  const joined = new Date(profile.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const heroImage = profile.decks.find(d => d.commander_image)?.commander_image;
  const recentDecks = profile.decks.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#12131a] text-zinc-100">
      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#0d0e15]/90 backdrop-blur-xl flex items-center px-6"
        style={{ borderBottom: '1px solid rgba(79,70,51,0.2)' }}>
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded flex items-center justify-center bg-gradient-to-br from-amber-200 to-amber-500">
            <span className="text-zinc-900 font-bold text-xs">MTG</span>
          </div>
          <span
            className="font-bold text-amber-300 text-sm tracking-widest uppercase hidden sm:block"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}
          >
            The Archivist
          </span>
        </Link>
        <div className="flex-1" />
        {user && (
          <Link
            to="/builder"
            className="text-sm text-zinc-400 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Builder
          </Link>
        )}
        {!user && (
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft size={14} /> Home
          </Link>
        )}
      </header>

      <div className="flex pt-14">
        {/* Left sidebar */}
        <aside
          className="w-56 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col py-6 px-3 overflow-y-auto"
          style={{ background: '#1e1f27' }}
        >
          <div className="px-3 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-0.5" style={{ fontFamily: 'Cinzel, serif' }}>
              Archivist Profile
            </p>
            <p className="text-xs" style={{ color: '#d3c5ac' }}>{profile.rank}</p>
          </div>

          <nav className="space-y-0.5 flex-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative ${
                  tab === id
                    ? 'bg-amber-500/15 text-amber-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {tab === id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />
                )}
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          {isOwnProfile && (
            <div className="mt-4 px-1">
              <button
                onClick={() => navigate('/builder')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-zinc-900 transition-all"
                style={{ background: 'linear-gradient(to right, #ffe1a7, #fbbf24)' }}
              >
                <Plus size={15} /> New Deck
              </button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Hero banner */}
          <div className="relative h-52 overflow-hidden">
            {heroImage ? (
              <img src={heroImage} alt="" className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a1206 0%, #2a1d08 50%, #12131a 100%)' }} />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(18,19,26,0.9) 80%, #12131a 100%)' }} />

            <div className="absolute bottom-0 left-0 right-0 px-8 pb-6 flex items-end justify-between">
              <div className="flex items-end gap-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
                  style={{ background: '#1e1f27', border: '2px solid rgba(79,70,51,0.4)' }}
                >
                  <span className="text-amber-300 font-bold text-2xl" style={{ fontFamily: 'Cinzel, serif' }}>
                    {initials}
                  </span>
                </div>
                <div className="pb-1">
                  <h1
                    className="text-3xl font-bold text-zinc-100"
                    style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}
                  >
                    {profile.username}
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: '#d3c5ac' }}>
                    {profile.stats.favoriteFormat ? `${profile.stats.favoriteFormat} Specialist` : profile.rank}
                    {' · '}Member since {joined}
                  </p>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex gap-2 pb-1">
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-all"
                    style={{ background: 'rgba(41,41,49,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(79,70,51,0.2)' }}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-900 transition-all"
                    style={{ background: 'linear-gradient(to right, #ffe1a7, #fbbf24)' }}
                  >
                    Share Library
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Decks Built', value: profile.stats.totalDecks.toString(), bar: false },
              { label: 'Overall Win Rate', value: `${winRate}%`, bar: true },
              { label: 'Total Matches', value: profile.stats.totalMatches.toString(), bar: false },
              { label: 'Favorite Format', value: profile.stats.favoriteFormat || '—', bar: false },
            ].map(({ label, value, bar }) => (
              <div key={label} className="rounded-2xl p-4" style={{ background: '#1e1f27' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p
                  className="text-2xl font-bold"
                  style={{ letterSpacing: '-0.02em', color: bar ? '#fde68a' : '#f4f4f5' }}
                >
                  {value}
                </p>
                {bar && profile.stats.totalMatches > 0 && (
                  <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: '#0d0e15' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${winRate}%`, background: 'linear-gradient(to right, #ffe1a7, #fbbf24)' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-8 pb-12">
            {tab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left 2/3 */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Active decks gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300" style={{ fontFamily: 'Cinzel, serif' }}>
                        Active Decks Gallery
                      </h2>
                      {profile.decks.length > 4 && (
                        <button
                          onClick={() => setTab('decks')}
                          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          View All Archives →
                        </button>
                      )}
                    </div>
                    {recentDecks.length === 0 ? (
                      <div className="rounded-2xl p-8 text-center text-zinc-600 text-sm" style={{ background: '#1e1f27' }}>
                        No decks yet.{' '}
                        {isOwnProfile && (
                          <button onClick={() => navigate('/builder')} className="text-amber-400 hover:text-amber-300">
                            Build one →
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recentDecks.map(deck => (
                          <DeckCard key={deck.id} deck={deck} isOwn={isOwnProfile} />
                        ))}
                      </div>
                    )}
                  </div>

                  <PerformanceChart data={profile.winRateHistory} />
                </div>

                {/* Right 1/3 */}
                <div className="space-y-4">
                  <RecentActivity matches={profile.recentMatches} />
                  {isOwnProfile && (
                    <MatchLogger decks={profile.decks} token={token} onLogged={load} />
                  )}
                  {/* Weekly Insight stub */}
                  <div className="rounded-2xl p-5" style={{ background: '#1e1f27' }}>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                      Weekly Insight
                    </h3>
                    {profile.stats.totalMatches >= 5 ? (
                      <>
                        <p className="text-sm italic text-zinc-400 leading-relaxed mb-3">
                          &ldquo;Your {profile.stats.favoriteFormat} archive is your strongest — keep refining your core strategy.&rdquo;
                        </p>
                        <button
                          onClick={() => navigate('/builder')}
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300 uppercase tracking-wider transition-colors"
                        >
                          Apply Advice →
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-zinc-600">
                        Log at least 5 matches to unlock weekly insights.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'decks' && (
              <DeckLibrary decks={profile.decks} isOwnProfile={isOwnProfile} />
            )}

            {tab === 'stats' && (
              <div className="max-w-3xl space-y-6">
                {/* Record breakdown */}
                <div className="rounded-2xl p-6" style={{ background: '#1e1f27' }}>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300 mb-5" style={{ fontFamily: 'Cinzel, serif' }}>
                    Match Record
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                      { label: 'Wins', value: profile.stats.wins, color: '#4ade80' },
                      { label: 'Losses', value: profile.stats.losses, color: '#f87171' },
                      { label: 'Draws', value: profile.stats.draws, color: '#a1a1aa' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl p-4 text-center" style={{ background: '#292931' }}>
                        <p className="text-2xl font-bold" style={{ color, letterSpacing: '-0.02em' }}>{value}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* W/L/D bar */}
                  {profile.stats.totalMatches > 0 && (
                    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                      <div style={{ width: `${(profile.stats.wins / profile.stats.totalMatches) * 100}%`, background: '#4ade80' }} />
                      <div style={{ width: `${(profile.stats.losses / profile.stats.totalMatches) * 100}%`, background: '#f87171' }} />
                      <div style={{ width: `${(profile.stats.draws / profile.stats.totalMatches) * 100}%`, background: '#3f3f46' }} />
                    </div>
                  )}
                </div>

                <WinRateChart data={profile.winRateHistory} />

                {/* Format breakdown */}
                {profile.decks.length > 0 && (
                  <div className="rounded-2xl p-6" style={{ background: '#1e1f27' }}>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                      Format Distribution
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(
                        profile.decks.reduce<Record<string, number>>((acc, d) => {
                          acc[d.format] = (acc[d.format] || 0) + 1;
                          return acc;
                        }, {})
                      )
                        .sort(([, a], [, b]) => b - a)
                        .map(([format, count]) => (
                          <div key={format} className="flex items-center gap-3">
                            <span className="text-xs text-zinc-400 w-24 truncate">{format}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#0d0e15' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(count / profile.decks.length) * 100}%`,
                                  background: 'linear-gradient(to right, #ffe1a7, #fbbf24)',
                                }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500 w-8 text-right">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'activity' && (
              <div className="max-w-xl space-y-4">
                {isOwnProfile && (
                  <MatchLogger decks={profile.decks} token={token} onLogged={load} />
                )}
                <div className="rounded-2xl overflow-hidden" style={{ background: '#1e1f27' }}>
                  <div className="px-5 py-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300" style={{ fontFamily: 'Cinzel, serif' }}>
                      Match Log
                    </h3>
                  </div>
                  {profile.recentMatches.length === 0 ? (
                    <div className="px-5 pb-8 text-center text-zinc-600 text-sm">
                      No matches logged yet.
                    </div>
                  ) : (
                    <div className="px-3 pb-4 space-y-0.5">
                      {profile.recentMatches.map(match => {
                        const colors = {
                          win: 'text-green-400',
                          loss: 'text-red-400',
                          draw: 'text-zinc-400',
                        };
                        return (
                          <div key={match.id} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#292931] transition-colors">
                            <div className={`text-xs font-bold uppercase w-10 flex-shrink-0 mt-0.5 ${colors[match.result]}`}>
                              {match.result}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-zinc-300 truncate">{match.deck_name}</p>
                              {match.opponent_archetype && (
                                <p className="text-xs text-zinc-500">vs {match.opponent_archetype}</p>
                              )}
                              {match.notes && (
                                <p className="text-xs text-zinc-600 mt-0.5 italic">{match.notes}</p>
                              )}
                            </div>
                            <p className="text-xs text-zinc-600 flex-shrink-0">
                              {new Date(match.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
