import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onSignup: () => void;
}

export function HeroSection({ onSignup }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark atmospheric background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, #1a1208 0%, #111317 40%, #0d0f12 100%)' }}
      />

      {/* Amber radial glow — upper center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 500,
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
          backgroundSize: '256px',
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 pt-28 pb-20 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-7">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ color: '#ffc174', background: 'rgba(255,193,116,0.08)', border: '1px solid rgba(255,193,116,0.15)' }}
          >
            Archivist V.Alpha
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-4"
          style={{ color: '#e8dcc8', letterSpacing: '-0.02em' }}
        >
          AI Powered Deck Building
        </h1>
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-7"
          style={{
            background: 'linear-gradient(to right, #ffc174, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}
        >
          Build Better Decks
        </h2>

        <p
          className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: '#6b5f4a' }}
        >
          Optimize your synergy, master the mana curve, and dominate the meta with advanced algorithmic brewing.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onSignup}
            className="px-8 py-3.5 text-sm font-bold rounded-xl transition-all"
            style={{
              background: 'linear-gradient(to right, #ffc174, #f59e0b)',
              color: '#111317',
              boxShadow: '0 8px 32px rgba(245,158,11,0.25)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 40px rgba(245,158,11,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,158,11,0.25)')}
          >
            Start Brewing Free
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 text-sm font-semibold rounded-xl transition-all"
            style={{
              background: '#1a1c1f',
              color: '#a09070',
              border: '1px solid rgba(83,68,52,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ffc174'; e.currentTarget.style.borderColor = 'rgba(255,193,116,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#a09070'; e.currentTarget.style.borderColor = 'rgba(83,68,52,0.3)'; }}
          >
            See How It Works
          </button>
          <button
            onClick={() => navigate('/builder')}
            className="px-8 py-3.5 text-sm font-medium transition-all rounded-xl"
            style={{ color: '#4a4035' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a09070')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4a4035')}
          >
            Try Without Account →
          </button>
        </div>

        {/* Trust bar */}
        <div className="mt-12 flex flex-wrap gap-6 justify-center text-xs" style={{ color: '#3a3028' }}>
          {['Free to use', '30,000+ cards', 'All 7 formats', 'Real-time AI'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span style={{ color: '#f59e0b' }}>✓</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #111317)' }}
      />
    </section>
  );
}
