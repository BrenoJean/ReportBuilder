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
    <div className="relative h-full">
      <div ref={containerRef} className="h-full overflow-auto scrollbar-thin bg-zinc-200/70">
        <div className="py-6 sm:py-8">
          <div className="mx-auto w-max" style={{ zoom }}>
            {children}
          </div>
        </div>
      </div>
      {canToggle && (
        <div className="absolute bottom-4 right-4 z-10 inline-flex rounded-lg bg-white/95 backdrop-blur shadow-md ring-1 ring-zinc-200 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('fit')}
            aria-pressed={mode === 'fit'}
            className={`flex items-center gap-1 rounded-md px-2 py-1.5 ${mode === 'fit' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
          >
            <IconFit size={14} /> Ajustar
          </button>
          <button
            type="button"
            onClick={() => setMode('actual')}
            aria-pressed={mode === 'actual'}
            className={`flex items-center gap-1 rounded-md px-2 py-1.5 ${mode === 'actual' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
          >
            <IconZoom size={14} /> 100%
          </button>
        </div>
      )}
    </div>
  );
};
