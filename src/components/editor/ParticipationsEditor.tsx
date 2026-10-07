import React from 'react';
import { OtherCompanyParticipation } from '../../types';
import { IconPlus, IconTrash } from '../ui/icons';
import { MoneyInput } from './MoneyInput';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `participation-${Date.now()}-${Math.random().toString(16).slice(2)}`;

interface ParticipationsEditorProps {
  items: OtherCompanyParticipation[];
  onChange: (items: OtherCompanyParticipation[]) => void;
  year: string;
  prevYear: string;
  showPrev: boolean;
}

export const ParticipationsEditor: React.FC<ParticipationsEditorProps> = ({ items, onChange, year, prevYear, showPrev }) => {
  const update = (id: string, patch: Partial<OtherCompanyParticipation>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const add = () => {
    const id = createId();
    onChange([...items, { id, name: '', current: 0, prev: 0 }]);
    requestAnimationFrame(() => document.getElementById(`participation-name-${id}`)?.focus());
  };

  return (
    <div className="mt-3 rounded-xl bg-zinc-50 ring-1 ring-zinc-200/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">Participação em Outras Empresas</p>
          <p className="text-[11px] text-zinc-500">Cada subconta vira uma linha própria no balanço.</p>
        </div>
        <button type="button" onClick={add} className="btn btn-secondary h-8 px-2.5 text-xs shrink-0">
          <IconPlus size={14} /> Adicionar
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-xs text-zinc-400 text-center py-3 border border-dashed border-zinc-200 rounded-lg">
          Nenhuma subconta adicionada.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-lg bg-white ring-1 ring-zinc-200 p-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-zinc-400 tnum w-4 text-center">{index + 1}</span>
                <input
                  id={`participation-name-${item.id}`}
                  type="text"
                  value={item.name}
                  onChange={(e) => update(item.id, { name: e.target.value })}
                  placeholder="Nome da empresa / subconta"
                  aria-label={`Nome da subconta ${index + 1}`}
                  className="field-input h-9"
                />
                <button
                  type="button"
                  onClick={() => onChange(items.filter((p) => p.id !== item.id))}
                  className="btn btn-ghost btn-icon h-9 shrink-0 hover:text-red-600 hover:bg-red-50"
                  aria-label={`Remover ${item.name || `subconta ${index + 1}`}`}
                  title="Remover"
                >
                  <IconTrash size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pl-6">
                <MoneyInput
                  value={item.current}
                  onChange={(v) => update(item.id, { current: v })}
                  tag={year}
                  ariaLabel={`${item.name || `Subconta ${index + 1}`} ${year}`}
                />
                <MoneyInput
                  value={item.prev}
                  onChange={(v) => update(item.id, { prev: v })}
                  tag={prevYear}
                  ariaLabel={`${item.name || `Subconta ${index + 1}`} ${prevYear}`}
                  dimmed={!showPrev}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
