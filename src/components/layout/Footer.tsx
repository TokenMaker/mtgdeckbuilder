import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xs">MTG</span>
              </div>
              <span
                className="font-bold text-zinc-100 text-lg"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                AI Deck Builder
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Intelligent Magic: The Gathering deck building powered by AI. Build better decks, track your wins, explore the meta.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-zinc-500 hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/builder" className="text-sm text-zinc-500 hover:text-amber-400 transition-colors">
                  Deck Builder
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Legal
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              MTG AI Deck Builder is unofficial fan content permitted under Wizards of the Coast Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast &copy; Wizards of the Coast LLC.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} MTG AI Deck Builder. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700">
            Card data provided by Scryfall
          </p>
        </div>
      </div>
    </footer>
  );
}
