import React from 'react';

export type StatementLine =
  | { kind: 'heading'; label: string }
  | { kind: 'group'; label: string }
  | { kind: 'line'; label: string; cur: string; prev: string; indent?: 0 | 1 | 2 }
  | { kind: 'subtotal'; label: string; cur: string; prev: string }
  | { kind: 'total'; label: string; cur: string; prev: string };

interface StatementTableProps {
  year: string;
  prevYear: string;
  showPrev: boolean;
  currency: string;
  lines: StatementLine[];
  dense?: boolean;
}

const indentClass = ['pl-0', 'pl-[5mm]', 'pl-[10mm]'];

export const StatementTable: React.FC<StatementTableProps> = ({ year, prevYear, showPrev, currency, lines, dense }) => {
  const cols = showPrev ? 3 : 2;
  const rowPad = dense ? 'py-[0.55mm]' : 'py-[1mm]';
  return (
    <table className={`w-full border-collapse leading-[1.35] ${dense ? 'text-[8.5pt]' : 'text-[9pt]'}`}>
      <colgroup>
        <col />
        <col className="w-[34mm]" />
        {showPrev && <col className="w-[34mm]" />}
      </colgroup>
      <thead>
        <tr className="border-b-[1.5pt] border-black">
          <th className="pt-[7mm]" />
          <th className="text-right font-semibold pt-[7mm] pb-[1.5mm] tnum">
            {year}
            <span className="block text-[7.5pt] font-normal text-zinc-500">{currency}</span>
          </th>
          {showPrev && (
            <th className="text-right font-semibold pt-[7mm] pb-[1.5mm] tnum text-zinc-500">
              {prevYear}
              <span className="block text-[7.5pt] font-normal">{currency}</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {lines.map((line, i) => {
          if (line.kind === 'heading') {
            return (
              <tr key={i}>
                <td colSpan={cols} className={`${dense ? 'pt-[2.5mm]' : 'pt-[3.5mm]'} pb-[1mm] text-[8pt] font-bold uppercase tracking-[0.08em]`}>
                  {line.label}
                </td>
              </tr>
            );
          }
          if (line.kind === 'group') {
            return (
              <tr key={i}>
                <td colSpan={cols} className={`pl-[5mm] ${rowPad} font-medium`}>
                  {line.label}
                </td>
              </tr>
            );
          }
          if (line.kind === 'line') {
            const indent = line.indent ?? 1;
            return (
              <tr key={i} className="border-b border-zinc-100">
                <td className={`${rowPad} pr-4 ${indentClass[indent]} ${indent === 2 ? 'text-zinc-600' : ''}`}>
                  {line.label}
                </td>
                <td className="text-right tnum">{line.cur}</td>
                {showPrev && <td className="text-right tnum text-zinc-600">{line.prev}</td>}
              </tr>
            );
          }
          if (line.kind === 'subtotal') {
            return (
              <tr key={i} className="font-semibold">
                <td className={`${dense ? 'py-[0.9mm]' : 'py-[1.3mm]'} border-t border-black`}>{line.label}</td>
                <td className="text-right tnum border-t border-black">{line.cur}</td>
                {showPrev && <td className="text-right tnum border-t border-black">{line.prev}</td>}
              </tr>
            );
          }
          return (
            <tr key={i} className="font-bold bg-zinc-100">
              <td className={`${dense ? 'py-[1.1mm]' : 'py-[1.6mm]'} pl-[2mm] border-t border-black border-b-[2.5pt] border-b-black border-double`}>
                {line.label}
              </td>
              <td className="text-right tnum border-t border-black border-b-[2.5pt] border-b-black border-double">
                {line.cur}
              </td>
              {showPrev && (
                <td className="text-right tnum border-t border-black border-b-[2.5pt] border-b-black border-double">
                  {line.prev}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
