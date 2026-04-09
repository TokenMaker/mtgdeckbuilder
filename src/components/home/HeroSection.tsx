import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onSignup: () => void;
}

export function HeroSection({ onSignup }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Ambient amber glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-amber-400/4 rounded-full blur-2xl" />
      </div>

      {/* Floating card fan */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-80 h-96 pointer-events-none">
        {[
          { rotate: -15, translate: '-40px, 10px', z: 1, delay: '0s' },
          { rotate: -7, translate: '-20px, 5px', z: 2, delay: '0.1s' },
          { rotate: 0, translate: '0px, 0px', z: 3, delay: '0.2s' },
          { rotate: 7, translate: '20px, 5px', z: 2, delay: '0.3s' },
        ].map((card, i) => (
          <div
            key={i}
            className="absolute w-44 h-60 rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl"
            style={{
              transform: `rotate(${card.rotate}deg) translate(${card.translate})`,
              zIndex: card.z,
              animation: `float 3s ease-in-out infinite`,
              animationDelay: card.delay,
            }}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent" />
            <div className="absolute top-3 left-3 right-3 h-1.5 bg-amber-500/30 rounded-full" />
            <div className="absolute bottom-8 left-3 right-3 h-20 bg-zinc-700/50 rounded-lg" />
            <div className="absolute bottom-3 left-3 right-3 h-4 bg-amber-500/20 rounded" />
          </div>
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center lg:text-left lg:mr-[340px]">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
            AI-Powered Deck Building
          </span>
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-100 leading-tight mb-6"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          Build Better<br />
          <span className="text-amber-400">Decks with AI</span>
        </h1>

        <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
          Your intelligent Magic: The Gathering companion. Chat with AI to discover cards, build optimized decks, track your win rates, and import trending meta decks — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
          <button
            onClick={onSignup}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base rounded-xl transition-colors shadow-lg shadow-amber-500/20"
          >
            Start Brewing Free
          </button>
          <button
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-3.5 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-400 font-semibold text-base rounded-xl transition-colors"
          >
            See How It Works
          </button>
          <button
            onClick={() => navigate('/builder')}
            className="px-8 py-3.5 text-zinc-500 hover:text-zinc-300 font-semibold text-base transition-colors"
          >
            Try Without Account &rarr;
          </button>
        </div>

        <div className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400">&#10003;</span> Free to use
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400">&#10003;</span> 30,000+ cards
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400">&#10003;</span> All formats
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400">&#10003;</span> Real-time AI
          </span>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: var(--transform) translateY(0px); }
          50% { transform: var(--transform) translateY(-12px); }
        }
      `}</style>
    </section>
  );
}
