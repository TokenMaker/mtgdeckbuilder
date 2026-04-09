import React, { useState, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatLimitBanner } from '../builder/ChatLimitBanner';
import { useChatLimit } from '../../context/ChatLimitContext';

const SUGGESTED_PROMPTS = [
  'Show me cheap removal spells',
  'Find card draw spells',
  'Suggest ramp for Commander',
  'What creatures have haste?',
  'Show counterspells under 2 mana',
  'Find board wipes',
];

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
  hasMessages: boolean;
}

export function ChatInput({ onSend, loading, hasMessages }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messagesUsed, messagesLimit, limitReached } = useChatLimit();

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading || limitReached) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const pct = messagesLimit > 0 ? messagesUsed / messagesLimit : 0;
  const showBanner = pct >= 0.8;

  return (
    <div className="border-t border-zinc-800 pt-3 flex-shrink-0">
      {showBanner && <ChatLimitBanner />}

      {/* Suggested prompts — shown when no messages yet */}
      {!hasMessages && (
        <div className="px-3 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-xs text-zinc-500">Try asking...</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => { setValue(p); textareaRef.current?.focus(); }}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/50 text-zinc-400 hover:text-amber-300 px-2.5 py-1 rounded-full transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="px-3 pb-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-zinc-800 border border-zinc-700 focus-within:border-amber-500/50 rounded-xl overflow-hidden transition-colors">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={limitReached ? 'Daily limit reached' : 'Ask about cards, deck strategies...'}
              rows={1}
              disabled={loading || limitReached}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 px-3 py-2.5 outline-none resize-none leading-relaxed disabled:opacity-50"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={submit}
            disabled={!value.trim() || loading || limitReached}
            className="flex-shrink-0 w-9 h-9 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black rounded-xl flex items-center justify-center transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>

        {/* Usage counter */}
        {messagesLimit > 0 && (
          <div className="flex justify-end mt-1.5">
            <span className={`text-xs ${
              limitReached ? 'text-red-400' : pct >= 0.8 ? 'text-amber-400' : 'text-zinc-600'
            }`}>
              {messagesUsed} / {messagesLimit} messages today
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
