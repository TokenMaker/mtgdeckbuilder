import React from 'react';
import { usePanelResize } from '../../hooks/usePanelResize';

interface ResizablePanelsProps {
  chatPanel: React.ReactNode;
  cardPanel: React.ReactNode;
  deckPanel: React.ReactNode;
}

export function ResizablePanels({ chatPanel, cardPanel, deckPanel }: ResizablePanelsProps) {
  const { widths, resetWidths, startDragLeft, startDragRight } = usePanelResize();

  return (
    <div className="flex h-full overflow-hidden select-none">
      {/* Chat panel */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: `${widths.chat}%`, minWidth: '200px' }}
      >
        {chatPanel}
      </div>

      {/* Left divider */}
      <div
        className="w-1 flex-shrink-0 bg-zinc-800 hover:bg-amber-400 cursor-col-resize transition-colors duration-150 relative group"
        onMouseDown={startDragLeft}
        onDoubleClick={resetWidths}
        title="Drag to resize. Double-click to reset."
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-amber-400/20 transition-colors" />
      </div>

      {/* Cards panel */}
      <div
        className="flex flex-col overflow-hidden border-r border-zinc-800 px-4 py-3"
        style={{ width: `${widths.card}%`, minWidth: '280px' }}
      >
        {cardPanel}
      </div>

      {/* Right divider */}
      <div
        className="w-1 flex-shrink-0 bg-zinc-800 hover:bg-amber-400 cursor-col-resize transition-colors duration-150 relative group"
        onMouseDown={startDragRight}
        onDoubleClick={resetWidths}
        title="Drag to resize. Double-click to reset."
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-amber-400/20 transition-colors" />
      </div>

      {/* Deck panel */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: `${widths.deck}%`, minWidth: '240px' }}
      >
        {deckPanel}
      </div>
    </div>
  );
}
