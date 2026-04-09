interface BrewCTAProps {
  onSignup: () => void;
}

export function BrewCTA({ onSignup }: BrewCTAProps) {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative bg-zinc-900 border-2 border-amber-500/30 rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />

          <h2
            className="relative text-4xl sm:text-5xl font-bold text-zinc-100 mb-4 leading-tight"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Your Next Championship Deck<br />
            <span className="text-amber-400">Starts Here</span>
          </h2>
          <p className="relative text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of players building smarter decks with AI assistance. Free to start — no credit card required.
          </p>
          <button
            onClick={onSignup}
            className="relative px-10 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-xl transition-colors shadow-xl shadow-amber-500/20"
          >
            Create Free Account
          </button>
          <p className="relative mt-4 text-xs text-zinc-600">
            Already have an account? <button onClick={onSignup} className="text-amber-500 hover:text-amber-400 transition-colors">Sign in</button>
          </p>
        </div>
      </div>
    </section>
  );
}
