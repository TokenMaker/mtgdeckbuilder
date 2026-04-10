import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Deck Builder', to: '/builder' },
      { label: 'Meta Analysis', to: '/#trending' },
      { label: 'Price Tracker', to: '/builder' },
      { label: 'AI Assistant', to: '/builder' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'API Docs', to: '/' },
      { label: 'Guides', to: '/' },
      { label: 'Tournament Data', to: '/' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms of Service', to: '/' },
      { label: 'Fan Content Policy', to: '/' },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: '#0d0f12', borderTop: '1px solid rgba(83,68,52,0.1)' }} className="py-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #ffc174, #f59e0b)' }}
              >
                <span className="text-zinc-900 font-black text-xs" style={{ fontFamily: 'Cinzel, serif' }}>TA</span>
              </div>
              <span
                className="font-bold text-sm uppercase tracking-widest"
                style={{ fontFamily: 'Cinzel, serif', color: '#ffc174', letterSpacing: '0.1em' }}
              >
                The Technical Archivist
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: '#3a3028' }}>
              The premier data-driven utility for the modern Magic: The Gathering strategist.
            </p>
          </div>

          {/* Columns */}
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: '#6b5f4a', letterSpacing: '0.1em' }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs transition-colors"
                      style={{ color: '#3a3028' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#a09070')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#3a3028')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6 text-xs"
          style={{ borderTop: '1px solid rgba(83,68,52,0.08)', color: '#2a2218' }}
        >
          <p>
            &copy; {new Date().getFullYear()} The Technical Archivist. Portions of M:TG are property of Wizards of the Coast.
          </p>
          <p>Card data by Scryfall</p>
        </div>
      </div>
    </footer>
  );
}
