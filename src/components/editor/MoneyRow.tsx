import React from 'react';
import { FinancialData } from '../../types';
import { currentKey, MoneyBase, MoneyGroupDef, prevKey } from '../../lib/fields';
import { MoneyInput } from './MoneyInput';

export type MoneyChange = (field: keyof FinancialData, value: number) => void;

interface MoneyRowProps {
  label: string;
  hint?: string;
  current: number;
  prev: number;
  onCurrent: (v: number) => void;
  onPrev: (v: number) => void;
  year: string;
  prevYear: string;
  showPrev: boolean;
  currentName?: string;
  prevName?: string;
  lockCurrent?: boolean;
  lockPrev?: boolean;
  badge?: React.ReactNode;
  strong?: boolean;
}

export const MoneyRow: React.FC<MoneyRowProps> = ({
  label,
  hint,
  current,
  prev,
  onCurrent,
  onPrev,
  year,
  prevYear,
  showPrev,
  currentName,
  prevName,
  lockCurrent,
  lockPrev,
  badge,
  strong,
}) => (
  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 py-2 @sm:grid-cols-[minmax(0,1fr)_9.5rem_9.5rem] @sm:items-center @sm:gap-y-0">
    <div className="col-span-2 @sm:col-span-1 min-w-0 pr-1">
      <p className={`text-sm leading-tight ${strong ? 'font-semibold text-zinc-900' : 'text-zinc-700'}`}>
        {label} {badge}
      </p>
      {hint && <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{hint}</p>}
    </div>
    <MoneyInput
      value={current}
      onChange={onCurrent}
      tag={year}
      name={currentName}
      ariaLabel={`${label} ${year}`}
      disabled={lockCurrent}
    />
    <MoneyInput
      value={prev}
      onChange={onPrev}
      tag={prevYear}
      name={prevName}
      ariaLabel={`${label} ${prevYear}`}
      disabled={lockPrev}
      dimmed={!showPrev}
      title={showPrev ? undefined : 'Ano anterior oculto no relatório'}
    />
  </div>
);

interface MoneyGroupsProps {
  groups: MoneyGroupDef[];
  data: FinancialData;
  onChange: MoneyChange;
}

export const MoneyGroups: React.FC<MoneyGroupsProps> = ({ groups, data, onChange }) => (
  <div className="divide-y divide-zinc-100">
    {groups.map((group, gi) => (
      <div key={gi} className={group.title ? 'pt-3' : ''}>
        {group.title && <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 pb-1">{group.title}</p>}
        {group.rows.map((row) => (
          <BoundMoneyRow key={row.base} base={row.base} label={row.label} hint={row.hint} data={data} onChange={onChange} />
        ))}
      </div>
    ))}
  </div>
);

export const BoundMoneyRow: React.FC<{
  base: MoneyBase;
  label: string;
  hint?: string;
  data: FinancialData;
  onChange: MoneyChange;
  lockCurrent?: boolean;
  lockPrev?: boolean;
  badge?: React.ReactNode;
  strong?: boolean;
}> = ({ base, data, onChange, ...rest }) => {
  const ck = currentKey(base);
  const pk = prevKey(base);
  return (
    <MoneyRow
      {...rest}
      current={data[ck] as number}
      prev={data[pk] as number}
      onCurrent={(v) => onChange(ck, v)}
      onPrev={(v) => onChange(pk, v)}
      currentName={ck}
      prevName={pk}
      year={data.year}
      prevYear={data.prevYear}
      showPrev={data.showPrevYear}
    />
  );
};
