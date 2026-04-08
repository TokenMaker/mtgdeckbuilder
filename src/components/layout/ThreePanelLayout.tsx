import React from 'react';

interface ThreePanelLayoutProps {
  chatPanel: React.ReactNode;
  cardPanel: React.ReactNode;
  deckPanel: React.ReactNode;
}

export function ThreePanelLayout({ chatPanel, cardPanel, deckPanel }: ThreePanelLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat — 28% */}
      <div className="flex flex-col border-r border-zinc-800 overflow-hidden" style={{ width: '28%', minWidth: '240px' }}>
        {chatPanel}
      </div>

      {/* Cards — flex-1 (middle) */}
      <div className="flex flex-col flex-1 overflow-hidden border-r border-zinc-800 px-4 py-3">
        {cardPanel}
      </div>

      {/* Deck — 30% */}
      <div className="flex flex-col overflow-hidden" style={{ width: '30%', minWidth: '260px' }}>
        {deckPanel}
      </div>
    </div>
  );
}
