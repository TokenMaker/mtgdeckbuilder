import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

interface NavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function Navbar({ onLogin, onSignup }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xs">MTG</span>
          </div>
          <span
            className="font-bold text-zinc-100 text-lg hidden sm:block"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            AI Deck Builder
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-zinc-400 hover:text-amber-400 transition-colors">
            Home
          </Link>
          <a
            href="#features"
            onClick={e => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
          >
            Features
          </a>
          <a
            href="#trending"
            onClick={e => {
              e.preventDefault();
              document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
          >
            Trending
          </a>
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => navigate('/builder')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors"
              >
                Go to Builder
              </button>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="px-3 py-2 text-sm text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Log In
              </button>
              <button
                onClick={onSignup}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
