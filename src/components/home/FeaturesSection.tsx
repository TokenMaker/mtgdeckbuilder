const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Collaborator',
    description: 'Chat with GPT-4o to find cards, build complete decks, and get expert strategy advice in real time.',
  },
  {
    icon: '🃏',
    title: '30k+ Cards',
    description: 'Full Scryfall integration with advanced search. Every card ever printed, with high-res images and legality data.',
  },
  {
    icon: '⚖️',
    title: 'Format Enforcement',
    description: 'Automatic legality validation for Standard, Modern, Pioneer, Legacy, Vintage, Commander, and Pauper.',
  },
  {
    icon: '📈',
    title: 'Meta Insights',
    description: 'Import trending decks directly from MTGTop8. Stay current with what the competitive meta is playing.',
  },
  {
    icon: '🏆',
    title: 'Win Rate Tracking',
    description: 'Log your match results and track performance over time. Know which decks win and which need tuning.',
  },
  {
    icon: '📚',
    title: 'Deck Library',
    description: 'Save unlimited decks to your account. Export to MTGO, Arena, or text formats whenever you need.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2
            className="text-4xl font-bold text-zinc-100 mb-4"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Everything You Need
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Powerful tools for competitive players, casual brewers, and everyone in between.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(feature => (
            <div
              key={feature.title}
              className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-200 hover:bg-zinc-900/80"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3
                className="text-zinc-100 font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                {feature.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
