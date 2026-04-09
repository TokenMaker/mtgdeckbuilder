import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatLimitContextValue {
  messagesUsed: number;
  messagesLimit: number;
  limitReached: boolean;
  setUsage: (used: number, limit: number) => void;
  incrementUsed: () => void;
}

const ChatLimitContext = createContext<ChatLimitContextValue | null>(null);

const FREE_LIMIT = 20;

export function ChatLimitProvider({ children }: { children: React.ReactNode }) {
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [messagesLimit, setMessagesLimit] = useState(FREE_LIMIT);

  const limitReached = messagesUsed >= messagesLimit;

  const setUsage = useCallback((used: number, limit: number) => {
    setMessagesUsed(used);
    setMessagesLimit(limit);
  }, []);

  const incrementUsed = useCallback(() => {
    setMessagesUsed(prev => prev + 1);
  }, []);

  return (
    <ChatLimitContext.Provider value={{
      messagesUsed,
      messagesLimit,
      limitReached,
      setUsage,
      incrementUsed,
    }}>
      {children}
    </ChatLimitContext.Provider>
  );
}

export function useChatLimit() {
  const ctx = useContext(ChatLimitContext);
  if (!ctx) throw new Error('useChatLimit must be used within ChatLimitProvider');
  return ctx;
}
