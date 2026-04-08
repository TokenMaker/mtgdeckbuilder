import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupModal({ onClose, onSwitchToLogin }: SignupModalProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm mx-4 p-8 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 bg-green-400/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h3 className="text-zinc-100 font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Check Your Email</h3>
          <p className="text-sm text-zinc-400 mb-6">We sent a confirmation link to <span className="text-amber-400">{email}</span></p>
          <button onClick={onClose} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2.5 rounded-xl transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-base font-bold text-zinc-100" style={{ fontFamily: 'Cinzel, serif' }}>Create Account</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>

          <p className="text-center text-xs text-zinc-500">
            Already have one?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
