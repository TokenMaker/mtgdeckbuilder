const S = {
  base: '#111317' as const,
  low: '#1a1c1f' as const,
  high: '#333539' as const,
  primary: '#ffc174' as const,
  muted: '#6b5f4a' as const,
  dim: '#3a3028' as const,
};

const FEATURES = [
  {
    tag: 'INTELLIGENCE',
    title: 'Recursive AI Analysis',
    body: 'Our neural engine scans millions of tournament pairings to identify non-obvious synergies in your card choices, providing real-time power level scores.',
    size: 'large',
    accent: true,
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="rgba(255,193,116,0.08)" />
        <circle cx="18" cy="18" r="7" stroke="#ffc174" strokeWidth="1.5" fill="none" />
        <circle cx="18" cy="18" r="3" fill="#ffc174" fillOpacity="0.4" />
        <path d="M18 8v3M18 25v3M8 18h3M25 18h3" stroke="#ffc174" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    tag: 'SYNC',
    title: 'Collection Sync',
    body: 'Import your digital or physical library. The Archivist only builds what you actually own.',
    size: 'small',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="rgba(255,193,116,0.08)" />
        <path d="M8 14h12M14 8l6 6-6 6" stroke="#ffc174" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tag: 'FORMAT',
    title: 'Multi-Format',
    body: 'Full support for Commander, Modern, Standard, and Legacy with format-specific legality checks.',
    size: 'small',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="rgba(255,193,116,0.08)" />
        <rect x="7" y="7" width="6" height="6" rx="1.5" stroke="#ffc174" strokeWidth="1.5" />
        <rect x="15" y="7" width="6" height="6" rx="1.5" stroke="#ffc174" strokeWidth="1.5" />
        <rect x="7" y="15" width="6" height="6" rx="1.5" stroke="#ffc174" strokeWidth="1.5" />
        <rect x="15" y="15" width="6" height="6" rx="1.5" stroke="#ffc174" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    tag: 'OPTIMIZATION',
    title: 'Precision Mana Tuning',
    body: "Don't just guess your land counts. Get probabilistic breakdowns of hitting your curve based on actual hypergeometric distributions.",
    size: 'large',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="rgba(255,193,116,0.08)" />
        <rect x="8" y="24" width="4" height="4" rx="1" fill="#ffc174" fillOpacity="0.4" />
        <rect x="14" y="18" width="4" height="10" rx="1" fill="#ffc174" fillOpacity="0.6" />
        <rect x="20" y="12" width="4" height="16" rx="1" fill="#ffc174" fillOpacity="0.8" />
        <rect x="26" y="8" width="4" height="20" rx="1" fill="#ffc174" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  const [large1, small1, small2, large2] = FEATURES;

  return (
    <section id="features" style={{ background: S.base }} className="py-24">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Large left */}
          <FeatureCard feature={large1} className="lg:col-span-7" />
          {/* Small right */}
          <FeatureCard feature={small1} className="lg:col-span-5" />
          {/* Small left */}
          <FeatureCard feature={small2} className="lg:col-span-5" />
          {/* Large right */}
          <FeatureCard feature={large2} className="lg:col-span-7" />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  className = '',
}: {
  feature: (typeof FEATURES)[number];
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-7 flex flex-col gap-4 transition-all duration-200 group ${className}`}
      style={{
        background: S.low,
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1e2024')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = S.low)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest mb-3 block"
            style={{ color: S.primary, letterSpacing: '0.12em' }}
          >
            {feature.tag}
          </span>
          <h3
            className="font-bold text-xl leading-tight"
            style={{ color: '#e8dcc8', letterSpacing: '-0.01em' }}
          >
            {feature.title}
          </h3>
        </div>
        <div className="flex-shrink-0 mt-1">{feature.icon}</div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: S.muted }}>
        {feature.body}
      </p>
    </div>
  );
}
