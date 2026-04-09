import { AlertTriangle, XCircle } from 'lucide-react';
import { useChatLimit } from '../../context/ChatLimitContext';

export function ChatLimitBanner() {
  const { messagesUsed, messagesLimit, limitReached } = useChatLimit();
  const pct = messagesLimit > 0 ? messagesUsed / messagesLimit : 0;
  const nearLimit = pct >= 0.8 && !limitReached;

  if (!nearLimit && !limitReached) return null;

  if (limitReached) {
    return (
      <div className="mx-3 mb-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
        <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-red-400">Daily limit reached</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            You&apos;ve used all {messagesLimit} messages for today. Limit resets at midnight.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-2 flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
      <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-amber-400">Approaching daily limit</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {messagesUsed} / {messagesLimit} messages used today.
        </p>
      </div>
    </div>
  );
}
