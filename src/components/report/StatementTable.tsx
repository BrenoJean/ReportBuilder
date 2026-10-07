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
}

const indentClass = ['pl-0', 'pl-[5mm]', 'pl-[10mm]'];

export const StatementTable: React.FC<StatementTableProps> = ({ year, prevYear, showPrev, currency, lines }) => {
  const cols = showPrev ? 3 : 2;
  return (
    <table className="w-full text-[9.5pt] border-collapse">
      <colgroup>
        <col />
        <col className="w-[34mm]" />
        {showPrev && <col className="w-[34mm]" />}
      </colgroup>
      <thead>
        <tr className="border-b-[1.5pt] border-black">
          <th />
          <th className="text-right font-semibold pb-[2mm] tnum">
            {year}
            <span className="block text-[7.5pt] font-normal text-zinc-500">{currency}</span>
          </th>
          {showPrev && (
            <th className="text-right font-semibold pb-[2mm] tnum text-zinc-500">
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
                <td colSpan={cols} className="pt-[5mm] pb-[1.5mm] text-[8.5pt] font-bold uppercase tracking-[0.08em]">
                  {line.label}
                </td>
              </tr>
            );
          }
          if (line.kind === 'group') {
            return (
              <tr key={i}>
                <td colSpan={cols} className="pl-[5mm] pt-[1.5mm] py-[1mm] font-medium">
                  {line.label}
                </td>
              </tr>
            );
          }
          if (line.kind === 'line') {
            const indent = line.indent ?? 1;
            return (
              <tr key={i} className="border-b border-zinc-100">
                <td className={`py-[1.4mm] pr-4 ${indentClass[indent]} ${indent === 2 ? 'text-zinc-600' : ''}`}>
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
                <td className="py-[1.8mm] border-t border-black">{line.label}</td>
                <td className="text-right tnum border-t border-black">{line.cur}</td>
                {showPrev && <td className="text-right tnum border-t border-black">{line.prev}</td>}
              </tr>
            );
          }
          return (
            <tr key={i} className="font-bold bg-zinc-100">
              <td className="py-[2.2mm] pl-[2mm] border-t border-black border-b-[2.5pt] border-b-black border-double">
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
