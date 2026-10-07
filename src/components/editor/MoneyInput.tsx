import React, { useState } from 'react';
import { formatAmount, isTypingNumeric, parseNumeric } from '../../lib/format';

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  tag: string;
  ariaLabel: string;
  name?: string;
  disabled?: boolean;
  dimmed?: boolean;
  title?: string;
}

const focusNextMoneyInput = (current: HTMLInputElement) => {
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-money]:not([disabled])'));
  const next = inputs[inputs.indexOf(current) + 1];
  if (next) next.focus();
  else current.blur();
};

export const MoneyInput: React.FC<MoneyInputProps> = ({ value, onChange, tag, ariaLabel, name, disabled, dimmed, title }) => {
  const [draft, setDraft] = useState<string | null>(null);

  const display = draft ?? (value === 0 ? '' : formatAmount(value));

  return (
    <label
      title={title}
      className={`group relative flex items-center h-10 rounded-lg border bg-white transition-colors ${
        disabled
          ? 'border-zinc-200 bg-zinc-50'
          : 'border-zinc-200 hover:border-zinc-300 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10'
      } ${dimmed ? 'opacity-55' : ''}`}
    >
      <span className="pl-2.5 pr-1 text-[11px] font-medium text-zinc-400 tnum select-none">{tag}</span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        data-money=""
        name={name}
        aria-label={ariaLabel}
        disabled={disabled}
        placeholder="0.00"
        value={display}
        onFocus={(e) => {
          setDraft(value === 0 ? '' : String(value));
          const el = e.currentTarget;
          requestAnimationFrame(() => el.select());
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (!isTypingNumeric(raw)) return;
          setDraft(raw);
          const parsed = parseNumeric(raw);
          if (parsed !== null) onChange(parsed);
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            focusNextMoneyInput(e.currentTarget);
          }
        }}
        className={`min-w-0 flex-1 h-full bg-transparent pr-3 text-right text-sm tnum outline-none placeholder:text-zinc-300 ${
          value < 0 ? 'text-red-700' : 'text-zinc-900'
        } disabled:cursor-not-allowed disabled:text-zinc-500`}
      />
    </label>
  );
};
