import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface NavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function Navbar({ onLogin, onSignup }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'AN';
  const username = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'Archivist';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(17,19,23,0.92)'
          : 'rgba(17,19,23,0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(83,68,52,0.15)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 h-full flex items-center gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ffc174, #f59e0b)' }}
          >
            <span className="text-zinc-900 font-black text-xs" style={{ fontFamily: 'Cinzel, serif' }}>TA</span>
          </div>
          <span
            className="font-bold text-sm tracking-widest uppercase hidden sm:block"
            style={{
              fontFamily: 'Cinzel, serif',
              color: '#ffc174',
              letterSpacing: '0.14em',
            }}
          >
            The Technical Archivist
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {[
            { label: 'Decks', to: '/builder' },
            { label: 'Library', to: user ? '/profile/me' : undefined, onClick: !user ? onLogin : undefined },
            { label: 'Analytics', to: user ? '/profile/me' : undefined, onClick: !user ? onLogin : undefined },
            { label: 'AI Archivist', to: '/builder' },
          ].map(item => (
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="px-3 py-1.5 text-sm font-medium transition-colors rounded-lg"
                style={{ color: '#a09070' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffc174')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a09070')}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                className="px-3 py-1.5 text-sm font-medium transition-colors rounded-lg"
                style={{ color: '#a09070' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffc174')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a09070')}
              >
                {item.label}
              </button>
            )
          ))}
        </nav>

        {/* Search bar */}
        <div className="flex-1 max-w-xs hidden lg:block">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{ background: '#1a1c1f' }}
          >
            <Search size={13} style={{ color: '#6b5f4a' }} />
            <span style={{ color: '#4a4035' }} className="text-xs">Search archives...</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                className="p-2 rounded-lg transition-colors hidden sm:block"
                style={{ color: '#6b5f4a' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffc174')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b5f4a')}
              >
                <Bell size={15} />
              </button>
              <button
                className="p-2 rounded-lg transition-colors hidden sm:block"
                style={{ color: '#6b5f4a' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffc174')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b5f4a')}
              >
                <Settings size={15} />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl transition-all"
                  style={{ background: '#1a1c1f' }}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffc174', fontFamily: 'Cinzel, serif', fontSize: '0.6rem' }}>
                      Archivist
                    </p>
                    <p className="text-xs truncate max-w-[80px]" style={{ color: '#a09070' }}>{username}</p>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2a2418, #3a3020)', border: '1px solid rgba(255,193,116,0.3)' }}
                  >
                    <span className="text-xs font-bold" style={{ color: '#ffc174', fontFamily: 'Cinzel, serif' }}>{initials}</span>
                  </div>
                  <ChevronDown size={12} style={{ color: '#6b5f4a' }} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-50"
                      style={{ background: '#1a1c1f', border: '1px solid rgba(83,68,52,0.2)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
                    >
                      <Link
                        to="/profile/me"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#a09070' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#292931'; e.currentTarget.style.color = '#ffc174'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a09070'; }}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/builder"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#a09070' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#292931'; e.currentTarget.style.color = '#ffc174'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a09070'; }}
                      >
                        Deck Builder
                      </Link>
                      <div style={{ height: 1, background: 'rgba(83,68,52,0.15)', margin: '4px 0' }} />
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#7a5a5a' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#292931'; e.currentTarget.style.color = '#f87171'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7a5a5a'; }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="px-3 py-1.5 text-sm font-medium transition-colors rounded-lg"
                style={{ color: '#a09070' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffc174')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a09070')}
              >
                Sign In
              </button>
              <button
                onClick={onSignup}
                className="px-4 py-1.5 text-sm font-bold rounded-xl transition-all"
                style={{ background: 'linear-gradient(to right, #ffc174, #f59e0b)', color: '#111317' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
