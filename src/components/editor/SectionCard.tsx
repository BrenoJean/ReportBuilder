import React, { useState } from 'react';
import { IconChevron } from '../ui/icons';
import { formatAmount } from '../../lib/format';

interface SectionCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  total?: { label: string; current: number; prev: number; showPrev: boolean };
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ id, title, description, icon, total, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = `${id}-body`;

  return (
    <section id={id} className="rounded-2xl bg-white ring-1 ring-zinc-200/80 shadow-[0_1px_2px_rgb(0_0_0/0.04)] scroll-mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left rounded-2xl hover:bg-zinc-50/80 transition-colors"
      >
        {icon && <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">{icon}</span>}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-zinc-900">{title}</span>
          {description && <span className="block text-xs text-zinc-500 truncate">{description}</span>}
        </span>
        {total && (
          <span className="text-right shrink-0">
            <span className="block text-[10px] uppercase tracking-wide text-zinc-400">{total.label}</span>
            <span className={`block text-sm font-semibold tnum ${total.current < 0 ? 'text-red-700' : 'text-zinc-900'}`}>
              {formatAmount(total.current)}
            </span>
            {total.showPrev && <span className="block text-[11px] tnum text-zinc-400">{formatAmount(total.prev)}</span>}
          </span>
        )}
        <IconChevron size={16} className={`shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={bodyId} className="@container px-4 pb-4 pt-1 border-t border-zinc-100">
          {children}
        </div>
      )}
    </section>
  );
};
