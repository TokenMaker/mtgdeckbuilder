import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { profileApi, type ProfileData } from '../services/api';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { DeckLibrary } from '../components/profile/DeckLibrary';
import { WinRateChart } from '../components/profile/WinRateChart';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    profileApi.get(username)
      .then(data => setProfile(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Profile not found'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <p className="text-lg">{error || 'Profile not found'}</p>
        <Link to="/" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
          <ArrowLeft size={16} /> Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Home
        </Link>

        <ProfileHeader
          username={profile.username}
          joinedAt={profile.joined_at}
          stats={profile.stats}
        />

        {/* Win rate chart */}
        {profile.winRateHistory.length >= 2 && (
          <div className="mb-8">
            <WinRateChart data={profile.winRateHistory} />
          </div>
        )}

        {/* Deck library */}
        <DeckLibrary decks={profile.decks} />
      </div>
    </div>
  );
}
