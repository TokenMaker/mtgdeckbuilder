import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, BarChart2, Activity,
  Plus, ArrowLeft, GripVertical, X, Check, Pencil,
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

type BlockId = 'active-decks' | 'performance' | 'activity' | 'insight' | 'match-logger';

const DEFAULT_BLOCKS: BlockId[] = ['active-decks', 'performance', 'activity', 'insight'];
const DEFAULT_BLOCKS_OWN: BlockId[] = ['active-decks', 'performance', 'match-logger', 'activity', 'insight'];

const BLOCK_LABELS: Record<BlockId, string> = {
  'active-decks': 'Active Decks',
  'performance': 'Performance',
  'activity': 'Recent Activity',
  'insight': 'Weekly Insight',
  'match-logger': 'Log Match',
};

const NAV_TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'decks', label: 'Decks', Icon: BookOpen },
  { id: 'stats', label: 'Stats', Icon: BarChart2 },
  { id: 'activity', label: 'Activity', Icon: Activity },
];

/* ─── Edit Profile Modal ─── */
function EditProfileModal({
  currentUsername,
  token,
  onSave,
  onClose,
}: {
  currentUsername: string;
  token: string | null;
  onSave: (newUsername: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(currentUsername);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await profileApi.updateMe(token, { username: value.trim() });
      onSave(res.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 z-10"
        style={{ background: '#1a1c1f', border: '1px solid rgba(83,68,52,0.2)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base" style={{ color: '#e8dcc8', fontFamily: 'Capriola, sans-serif' }}>
            Edit Profile
          </h2>
          <button onClick={onClose} style={{ color: '#6b5f4a' }}>
            <X size={16} />
          </button>
        </div>

        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: '#6b5f4a' }}>
          Username
        </label>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          maxLength={32}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-1"
          style={{
            background: '#111317',
            color: '#e8dcc8',
            border: '1px solid rgba(83,68,52,0.25)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,193,116,0.4)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(83,68,52,0.25)')}
          placeholder="letters, numbers, _ or -"
        />
        <p className="text-xs mb-4" style={{ color: '#4a4035' }}>
          Letters, numbers, underscores and hyphens only.
        </p>

        {error && (
          <p className="text-xs mb-3" style={{ color: '#f87171' }}>{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || value.trim().length < 2}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(to right, #ffc174, #f59e0b)', color: '#111317' }}
          >
            {saving ? 'Saving…' : <><Check size={14} /> Save</>}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm transition-all"
            style={{ background: '#333539', color: '#a09070' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Draggable Block Wrapper ─── */
function DraggableBlock({
  id,
  index,
  editMode,
  onDragStart,
  onDragOver,
  onDrop,
  children,
}: {
  id: BlockId;
  index: number;
  editMode: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      draggable={editMode}
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(e, index); }}
      onDrop={() => onDrop(index)}
      className="relative"
      style={{ cursor: editMode ? 'grab' : undefined }}
    >
      {editMode && (
        <div
          className="absolute -top-2 -left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: '#ffc174', color: '#111317' }}
        >
          <GripVertical size={11} />
          {BLOCK_LABELS[id]}
        </div>
      )}
      <div style={editMode ? { opacity: 0.85, outline: '2px dashed rgba(255,193,116,0.4)', borderRadius: 16 } : undefined}>
        {children}
      </div>
    </div>
  );
}

/* ─── Main Profile Page ─── */
export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [token, setToken] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const isOwnProfile =
    username === 'me' ||
    (!!user && (
      user.email?.split('@')[0] === username ||
      user.user_metadata?.username === username
    ));

  const storageKey = `archivist-blocks-${username ?? 'me'}`;
  const defaultBlocks = isOwnProfile ? DEFAULT_BLOCKS_OWN : DEFAULT_BLOCKS;
  const [blocks, setBlocks] = useState<BlockId[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultBlocks;
    } catch {
      return defaultBlocks;
    }
  });

  const saveBlocks = (b: BlockId[]) => {
    setBlocks(b);
    localStorage.setItem(storageKey, JSON.stringify(b));
  };

  const handleDragStart = (index: number) => { dragIndex.current = index; };
  const handleDragOver = (_e: React.DragEvent, _index: number) => {};
  const handleDrop = (targetIndex: number) => {
    if (dragIndex.current === null || dragIndex.current === targetIndex) return;
    const reordered = [...blocks];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(targetIndex, 0, moved);
    saveBlocks(reordered);
    dragIndex.current = null;
  };

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#111317' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ffc174', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#111317' }}>
        <p className="text-sm" style={{ color: '#6b5f4a' }}>{error || 'Profile not found'}</p>
        <Link to="/" className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: '#ffc174' }}>
          <ArrowLeft size={14} /> Go Home
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

  const renderBlock = (blockId: BlockId, index: number) => {
    const wrap = (children: React.ReactNode) => (
      <DraggableBlock
        key={blockId}
        id={blockId}
        index={index}
        editMode={editMode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {children}
      </DraggableBlock>
    );

    switch (blockId) {
      case 'active-decks':
        return wrap(
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#a09070', fontFamily: 'Capriola, sans-serif' }}>
                Active Decks
              </h2>
              {profile.decks.length > 4 && (
                <button
                  onClick={() => setTab('decks')}
                  className="text-xs transition-colors"
                  style={{ color: '#ffc174' }}
                >
                  View All →
                </button>
              )}
            </div>
            {recentDecks.length === 0 ? (
              <div className="rounded-2xl p-8 text-center text-sm" style={{ background: '#1a1c1f', color: '#4a4035' }}>
                No decks yet.{' '}
                {isOwnProfile && (
                  <button onClick={() => navigate('/builder')} style={{ color: '#ffc174' }}>
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
        );

      case 'performance':
        return wrap(<PerformanceChart data={profile.winRateHistory} />);

      case 'activity':
        return wrap(<RecentActivity matches={profile.recentMatches} />);

      case 'match-logger':
        return isOwnProfile
          ? wrap(<MatchLogger decks={profile.decks} token={token} onLogged={load} />)
          : null;

      case 'insight':
        return wrap(
          <div className="rounded-2xl p-5" style={{ background: '#1a1c1f' }}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#a09070', fontFamily: 'Capriola, sans-serif' }}>
              Weekly Insight
            </h3>
            {profile.stats.totalMatches >= 5 ? (
              <>
                <p className="text-sm italic leading-relaxed mb-3" style={{ color: '#6b5f4a' }}>
                  &ldquo;Your {profile.stats.favoriteFormat} archive is your strongest — keep refining your core strategy.&rdquo;
                </p>
                <button
                  onClick={() => navigate('/builder')}
                  className="text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: '#ffc174' }}
                >
                  Apply Advice →
                </button>
              </>
            ) : (
              <p className="text-sm" style={{ color: '#4a4035' }}>
                Log at least 5 matches to unlock weekly insights.
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#111317' }}>
      {/* Profile top header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-6 gap-6"
        style={{
          background: 'rgba(17,19,23,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(83,68,52,0.12)',
        }}
      >
        <Link to="/" style={{ fontFamily: 'Capriola, sans-serif', color: '#ffc174', letterSpacing: '0.14em' }}
          className="font-bold text-sm tracking-widest uppercase flex-shrink-0">
          Archivist
        </Link>
        <div className="flex-1" />
        <Link to="/builder" className="text-sm transition-colors px-3 py-1.5 rounded-lg" style={{ color: '#6b5f4a' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffc174')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6b5f4a')}>
          Builder
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: '#6b5f4a' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffc174')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6b5f4a')}>
          <ArrowLeft size={13} /> Home
        </Link>
      </header>

      <div className="pt-14">
        {/* Hero banner */}
        <div className="relative h-52 overflow-hidden">
          {heroImage ? (
            <img src={heroImage} alt="" className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a1208 0%, #2a1d08 50%, #111317 100%)' }} />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(17,19,23,0.88) 80%, #111317 100%)' }} />

          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-6 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
                style={{ background: '#1a1c1f', border: '2px solid rgba(255,193,116,0.25)' }}
              >
                <span className="font-bold text-2xl" style={{ color: '#ffc174', fontFamily: 'Capriola, sans-serif' }}>
                  {initials}
                </span>
              </div>
              <div className="pb-1">
                <h1 className="text-3xl font-bold" style={{ color: '#e8dcc8', letterSpacing: '-0.02em' }}>
                  {profile.username}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: '#6b5f4a' }}>
                  {profile.rank}{profile.stats.favoriteFormat ? ` · ${profile.stats.favoriteFormat} Specialist` : ''}
                  {' · '}Joined {joined}
                </p>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex gap-2 pb-1">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(26,28,31,0.9)', backdropFilter: 'blur(12px)', color: '#a09070', border: '1px solid rgba(83,68,52,0.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffc174')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#a09070')}
                >
                  <Pencil size={13} /> Edit Profile
                </button>
                <button
                  onClick={() => navigate('/builder')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(to right, #ffc174, #f59e0b)', color: '#111317' }}
                >
                  <Plus size={13} /> New Deck
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="px-6 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Decks Built', value: profile.stats.totalDecks.toString(), accent: false },
            { label: 'Win Rate', value: `${winRate}%`, accent: true },
            { label: 'Total Matches', value: profile.stats.totalMatches.toString(), accent: false },
            { label: 'Fav. Format', value: profile.stats.favoriteFormat || '—', accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: '#1a1c1f' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4a4035' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ letterSpacing: '-0.02em', color: accent ? '#ffc174' : '#e8dcc8' }}>
                {value}
              </p>
              {accent && profile.stats.totalMatches > 0 && (
                <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: '#333539' }}>
                  <div className="h-full rounded-full" style={{ width: `${winRate}%`, background: 'linear-gradient(to right, #ffc174, #f59e0b)' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Horizontal Tab Navigation */}
        <div
          className="sticky top-14 z-30 px-6 sm:px-8 py-2.5 flex items-center gap-1 overflow-x-auto"
          style={{ background: 'rgba(17,19,23,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(83,68,52,0.1)' }}
        >
          {NAV_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
              style={
                tab === id
                  ? { background: 'rgba(255,193,116,0.12)', color: '#ffc174' }
                  : { color: '#6b5f4a' }
              }
              onMouseEnter={e => { if (tab !== id) e.currentTarget.style.color = '#a09070'; }}
              onMouseLeave={e => { if (tab !== id) e.currentTarget.style.color = '#6b5f4a'; }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}

          <div className="flex-1" />

          {isOwnProfile && tab === 'overview' && (
            <button
              onClick={() => setEditMode(m => !m)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
              style={editMode
                ? { background: 'rgba(255,193,116,0.15)', color: '#ffc174' }
                : { background: '#1a1c1f', color: '#6b5f4a' }
              }
            >
              <GripVertical size={12} />
              {editMode ? 'Done' : 'Arrange'}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="px-6 sm:px-8 pb-16 pt-6 max-w-7xl">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left 2/3 */}
              <div className="xl:col-span-2 space-y-6">
                {blocks
                  .filter(b => b === 'active-decks' || b === 'performance')
                  .map((b) => renderBlock(b, blocks.indexOf(b)))}
              </div>

              {/* Right 1/3 */}
              <div className="space-y-4">
                {blocks
                  .filter(b => b !== 'active-decks' && b !== 'performance')
                  .map((b) => renderBlock(b, blocks.indexOf(b)))}
              </div>
            </div>
          )}

          {tab === 'decks' && (
            <DeckLibrary decks={profile.decks} isOwnProfile={isOwnProfile} />
          )}

          {tab === 'stats' && (
            <div className="max-w-3xl space-y-6">
              <div className="rounded-2xl p-6" style={{ background: '#1a1c1f' }}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: '#a09070', fontFamily: 'Capriola, sans-serif' }}>
                  Match Record
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: 'Wins', value: profile.stats.wins, color: '#4ade80' },
                    { label: 'Losses', value: profile.stats.losses, color: '#f87171' },
                    { label: 'Draws', value: profile.stats.draws, color: '#6b5f4a' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-4 text-center" style={{ background: '#333539' }}>
                      <p className="text-2xl font-bold" style={{ color, letterSpacing: '-0.02em' }}>{value}</p>
                      <p className="text-xs uppercase tracking-wider mt-1" style={{ color: '#4a4035' }}>{label}</p>
                    </div>
                  ))}
                </div>
                {profile.stats.totalMatches > 0 && (
                  <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                    <div style={{ width: `${(profile.stats.wins / profile.stats.totalMatches) * 100}%`, background: '#4ade80' }} />
                    <div style={{ width: `${(profile.stats.losses / profile.stats.totalMatches) * 100}%`, background: '#f87171' }} />
                    <div style={{ width: `${(profile.stats.draws / profile.stats.totalMatches) * 100}%`, background: '#333539' }} />
                  </div>
                )}
              </div>

              <WinRateChart data={profile.winRateHistory} />

              {profile.decks.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#1a1c1f' }}>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#a09070', fontFamily: 'Capriola, sans-serif' }}>
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
                          <span className="text-xs w-24 truncate" style={{ color: '#6b5f4a' }}>{format}</span>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#333539' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(count / profile.decks.length) * 100}%`,
                                background: 'linear-gradient(to right, #ffc174, #f59e0b)',
                              }}
                            />
                          </div>
                          <span className="text-xs w-8 text-right" style={{ color: '#4a4035' }}>{count}</span>
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
              <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1c1f' }}>
                <div className="px-5 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#a09070', fontFamily: 'Capriola, sans-serif' }}>
                    Match Log
                  </h3>
                </div>
                {profile.recentMatches.length === 0 ? (
                  <div className="px-5 pb-8 text-center text-sm" style={{ color: '#4a4035' }}>
                    No matches logged yet.
                  </div>
                ) : (
                  <div className="px-3 pb-4 space-y-0.5">
                    {profile.recentMatches.map(match => {
                      const resultColor = match.result === 'win' ? '#4ade80' : match.result === 'loss' ? '#f87171' : '#6b5f4a';
                      return (
                        <div key={match.id} className="flex items-start gap-3 px-3 py-3 rounded-xl transition-colors"
                          style={{ background: 'transparent' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#333539')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div className="text-xs font-bold uppercase w-10 flex-shrink-0 mt-0.5" style={{ color: resultColor }}>
                            {match.result}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: '#e8dcc8' }}>{match.deck_name}</p>
                            {match.opponent_archetype && (
                              <p className="text-xs" style={{ color: '#4a4035' }}>vs {match.opponent_archetype}</p>
                            )}
                            {match.notes && (
                              <p className="text-xs mt-0.5 italic" style={{ color: '#3a3028' }}>{match.notes}</p>
                            )}
                          </div>
                          <p className="text-xs flex-shrink-0" style={{ color: '#4a4035' }}>
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
      </div>

      {showEditModal && (
        <EditProfileModal
          currentUsername={profile.username}
          token={token}
          onSave={newUsername => {
            setProfile(p => p ? { ...p, username: newUsername } : p);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
