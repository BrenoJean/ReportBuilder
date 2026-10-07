import React, { useEffect, useRef, useState } from 'react';
import { IconFit, IconZoom } from './icons';

const A4_WIDTH_PX = (210 / 25.4) * 96;
const GUTTER = 32;

export const ScaledPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [mode, setMode] = useState<'fit' | 'actual'>('fit');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitZoom = width ? Math.min(1, (width - GUTTER) / A4_WIDTH_PX) : 1;
  const zoom = mode === 'fit' ? fitZoom : 1;
  const canToggle = fitZoom < 0.995;

  return (
    <div ref={containerRef} className="relative h-full overflow-auto scrollbar-thin bg-zinc-200/70">
      {canToggle && (
        <div className="sticky top-3 z-10 flex justify-end px-3 pointer-events-none">
          <div className="pointer-events-auto inline-flex rounded-lg bg-white/90 backdrop-blur shadow-sm ring-1 ring-zinc-200 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('fit')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 ${mode === 'fit' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              <IconFit size={14} /> Ajustar
            </button>
            <button
              type="button"
              onClick={() => setMode('actual')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 ${mode === 'actual' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              <IconZoom size={14} /> 100%
            </button>
          </div>
        </div>
      )}
      <div className={`py-6 sm:py-8 ${canToggle ? '-mt-9' : ''}`}>
        <div className="mx-auto w-max" style={{ zoom }}>
          {children}
        </div>
      </div>
    </div>
  );
};
