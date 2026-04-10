import { useState } from 'react';
import { Save, Download, FolderOpen, LogIn, LogOut, Trash2, ChevronDown, Import } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDeckContext } from '../../context/DeckContext';
import { useAuth } from '../auth/AuthProvider';
import type { Format } from '../../utils/formatRules';
import { FORMATS } from '../../utils/formatRules';

interface BuilderHeaderProps {
  onSave: () => void;
  onExport: () => void;
  onMyDecks: () => void;
  onLogin: () => void;
  onClearDeck: () => void;
  onImportMeta: () => void;
}

export function BuilderHeader({
  onSave,
  onExport,
  onMyDecks,
  onLogin,
  onClearDeck,
  onImportMeta,
}: BuilderHeaderProps) {
  const { name, setDeckName, format, setFormat, totalCards, validationErrors } = useDeckContext();
  const { user, signOut, isConfigured } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [formatOpen, setFormatOpen] = useState(false);

  const minSize = format === 'Commander' ? 100 : 60;
  const isValid = validationErrors.filter(e => e.type === 'error').length === 0 && totalCards >= minSize;
  const isOver = totalCards > (format === 'Commander' ? 100 : 60);

  const countColor = isOver
    ? 'text-red-400 bg-red-400/10 border-red-400/30'
    : isValid && totalCards > 0
    ? 'text-green-400 bg-green-400/10 border-green-400/30'
    : 'text-zinc-400 bg-zinc-800 border-zinc-700';

  const maxSize = format === 'Commander' ? 100 : 60;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 h-14 flex items-center px-4 gap-3">
      {/* Logo / Home link */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center">
          <span className="text-black font-bold text-xs">MTG</span>
        </div>
        <span className="font-semibold text-zinc-200 hidden sm:block text-sm" style={{ fontFamily: 'Capriola, sans-serif' }}>
          AI Deck Builder
        </span>
      </Link>

      <div className="w-px h-6 bg-zinc-800 flex-shrink-0" />

      {/* Format selector */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setFormatOpen(o => !o)}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-200 text-sm px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>{format}</span>
          <ChevronDown size={14} className="text-zinc-500" />
        </button>
        {formatOpen && (
          <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[140px] overflow-hidden">
            {FORMATS.map(f => (
              <button
                key={f}
                onClick={() => { setFormat(f as Format); setFormatOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  f === format
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Deck name */}
      <div className="flex-1 min-w-0 max-w-xs">
        {editingName ? (
          <input
            autoFocus
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={() => { setDeckName(nameValue || 'New Deck'); setEditingName(false); }}
            onKeyDown={e => {
              if (e.key === 'Enter') { setDeckName(nameValue || 'New Deck'); setEditingName(false); }
              if (e.key === 'Escape') { setNameValue(name); setEditingName(false); }
            }}
            className="w-full bg-zinc-800 border border-amber-500/50 rounded-lg px-3 py-1.5 text-sm text-zinc-100 outline-none"
          />
        ) : (
          <button
            onClick={() => { setNameValue(name); setEditingName(true); }}
            className="w-full text-left text-sm text-zinc-200 hover:text-amber-400 transition-colors truncate px-1 py-1"
            title="Click to rename deck"
          >
            {name}
          </button>
        )}
      </div>

      {/* Card count badge */}
      <div className={`flex-shrink-0 text-sm font-semibold px-3 py-1 rounded-full border ${countColor}`}>
        {totalCards} / {maxSize}
      </div>

      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Import Meta button */}
        <button
          onClick={onImportMeta}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
          title="Import deck from meta"
        >
          <Import size={15} />
          <span className="hidden sm:block">Meta Import</span>
        </button>

        <button
          onClick={onClearDeck}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          title="Clear deck"
        >
          <Trash2 size={16} />
        </button>

        {isConfigured && user && (
          <>
            <Link
              to="/profile/me"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="My Profile"
            >
              <span className="hidden sm:block">Profile</span>
              <span className="sm:hidden">👤</span>
            </Link>
            <button
              onClick={onMyDecks}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <FolderOpen size={15} />
              <span className="hidden sm:block">My Decks</span>
            </button>
          </>
        )}

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Download size={15} />
          <span className="hidden sm:block">Export</span>
        </button>

        {isConfigured && user && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
          >
            <Save size={15} />
            <span className="hidden sm:block">Save</span>
          </button>
        )}

        <div className="w-px h-5 bg-zinc-800" />

        {isConfigured ? (
          user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LogIn size={15} />
              <span className="hidden sm:block">Sign In</span>
            </button>
          )
        ) : null}
      </div>

      {/* Close format dropdown on outside click */}
      {formatOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setFormatOpen(false)} />
      )}
    </header>
  );
}
