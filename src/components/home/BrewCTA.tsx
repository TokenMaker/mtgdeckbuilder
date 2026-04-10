import { useNavigate } from 'react-router-dom';

interface BrewCTAProps {
  onSignup: () => void;
}

// "Engineered for the Elite Brewer" how-it-works section + final CTA
export function BrewCTA({ onSignup }: BrewCTAProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* How it works */}
      <section className="py-24" style={{ background: '#111317' }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div>
              <h2
                className="text-4xl font-bold mb-8 leading-tight"
                style={{ color: '#e8dcc8', letterSpacing: '-0.02em' }}
              >
                Engineered for the<br />Elite Brewer
              </h2>

              <div className="space-y-7">
                {[
                  {
                    num: '01',
                    title: 'Input Intent',
                    body: 'Simply describe your strategy or list a few core cards. The AI understands card roles, not just names.',
                  },
                  {
                    num: '02',
                    title: 'Algorithmic Iteration',
                    body: 'The system runs simulations to find the highest probability win paths across various turn-counts.',
                  },
                  {
                    num: '03',
                    title: 'Refine and Export',
                    body: 'Tweak the results with professional-grade filters and export directly to Arena, MTGO, or Paper formats.',
                  },
                ].map(step => (
                  <div key={step.num} className="flex gap-5 group">
                    <span
                      className="text-xs font-bold flex-shrink-0 w-7 pt-0.5"
                      style={{ color: '#ffc174', fontFamily: 'Capriola, sans-serif' }}
                    >
                      {step.num}
                    </span>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm" style={{ color: '#e8dcc8' }}>
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#4a4035' }}>
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — builder UI mockup */}
            <div className="relative">
              {/* Window chrome */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#1a1c1f', border: '1px solid rgba(83,68,52,0.15)' }}
              >
                {/* Titlebar */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(83,68,52,0.1)' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', opacity: 0.6 }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b', opacity: 0.6 }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e', opacity: 0.6 }} />
                  <span className="ml-auto text-xs" style={{ color: '#3a3028' }}>SYNERGY_ANALYSIS.EXE</span>
                </div>

                {/* Mock content */}
                <div className="p-5">
                  {/* Fake search bar */}
                  <div
                    className="h-8 rounded-full mb-4 px-3 flex items-center gap-2"
                    style={{ background: '#111317' }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: '#333539' }} />
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: '#222426' }} />
                  </div>

                  {/* Fake card grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="aspect-[5/7] rounded-lg flex items-center justify-center"
                        style={{
                          background: i === 2
                            ? 'linear-gradient(135deg, #2a1f0a, #3a2a10)'
                            : '#111317',
                          border: i === 2 ? '1px solid rgba(255,193,116,0.3)' : 'none',
                        }}
                      >
                        {i === 2 ? (
                          <span style={{ color: '#ffc174', fontSize: 18 }}>+</span>
                        ) : (
                          <div
                            className="w-6 h-6 rounded"
                            style={{ background: '#1a1c1f' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Fake stat bar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3a3028' }}>SYNERGY SCORE</span>
                    <span className="text-xs font-bold" style={{ color: '#ffc174' }}>84% OPTIMAL</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: '#111317' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: '84%', background: 'linear-gradient(to right, #ffc174, #f59e0b)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Ambient glow behind mockup */}
              <div
                className="absolute -inset-4 -z-10 rounded-3xl opacity-30"
                style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 70%)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24" style={{ background: '#0d0f12' }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div
            className="rounded-2xl px-10 py-16"
            style={{ background: '#1a1c1f' }}
          >
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4 leading-tight"
              style={{ color: '#e8dcc8', letterSpacing: '-0.02em' }}
            >
              Ready to master the archives?
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#4a4035' }}>
              Join 50,000+ brewers already using AI to stay ahead of the competitive curve.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onSignup}
                className="px-8 py-3.5 text-sm font-bold rounded-xl transition-all"
                style={{
                  background: 'linear-gradient(to right, #ffc174, #f59e0b)',
                  color: '#111317',
                  boxShadow: '0 8px 32px rgba(245,158,11,0.2)',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 40px rgba(245,158,11,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,158,11,0.2)')}
              >
                Create an Account
              </button>
              <button
                onClick={() => navigate('/builder')}
                className="px-8 py-3.5 text-sm font-semibold rounded-xl transition-all"
                style={{
                  background: '#333539',
                  color: '#a09070',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3d3f43'; e.currentTarget.style.color = '#e8dcc8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#333539'; e.currentTarget.style.color = '#a09070'; }}
              >
                View Pricing
              </button>
            </div>

            <p className="mt-5 text-xs" style={{ color: '#3a3028' }}>
              No credit card required. Start with 3 free AI deck optimizations per day.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
