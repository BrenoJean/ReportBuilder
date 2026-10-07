import React from 'react';
import { FinancialData } from '../../types';

interface GeneralInfoSectionProps {
  data: FinancialData;
  onText: (field: keyof FinancialData, value: string) => void;
  onToggle: (field: keyof FinancialData, value: boolean) => void;
}

const TextField: React.FC<{
  label: string;
  name: keyof FinancialData;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'numeric' | 'text';
  className?: string;
}> = ({ label, name, value, onChange, placeholder, inputMode, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="field-label">{label}</span>
    <input
      type="text"
      name={name}
      value={value}
      inputMode={inputMode}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="field-input"
    />
  </label>
);

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ data, onText, onToggle }) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 pt-3">
    <TextField className="col-span-2" label="Nome da empresa" name="companyName" value={data.companyName} onChange={(v) => onText('companyName', v)} />
    <TextField
      className="col-span-2"
      label="Endereço (opcional)"
      name="companyAddress"
      value={data.companyAddress || ''}
      placeholder="Ex: Tortola, British Virgin Islands"
      onChange={(v) => onText('companyAddress', v)}
    />
    <TextField label="Ano atual" name="year" inputMode="numeric" value={data.year} onChange={(v) => onText('year', v)} />
    <TextField label="Ano anterior" name="prevYear" inputMode="numeric" value={data.prevYear} onChange={(v) => onText('prevYear', v)} />

    <label className="col-span-2 flex items-center justify-between gap-3 rounded-lg bg-zinc-50 ring-1 ring-zinc-200/70 px-3 py-2.5 cursor-pointer">
      <span>
        <span className="block text-sm font-medium text-zinc-800">Exibir coluna do ano anterior</span>
        <span className="block text-[11px] text-zinc-500">Mostra {data.prevYear || 'o ano anterior'} ao lado de {data.year || 'o ano atual'} no relatório</span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          name="showPrevYear"
          checked={data.showPrevYear}
          onChange={(e) => onToggle('showPrevYear', e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-zinc-300 transition-colors peer-checked:bg-zinc-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-900" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>

    <TextField className="col-span-2" label="Data do relatório" name="reportDate" value={data.reportDate} onChange={(v) => onText('reportDate', v)} />
    <TextField className="col-span-2" label="Nome do diretor" name="directorName" value={data.directorName} onChange={(v) => onText('directorName', v)} />
    <TextField label="Contador" name="accountantName" value={data.accountantName} onChange={(v) => onText('accountantName', v)} />
    <TextField label="CRC" name="crcNumber" value={data.crcNumber} placeholder="RS-000000/O-0" onChange={(v) => onText('crcNumber', v)} />
  </div>
);
