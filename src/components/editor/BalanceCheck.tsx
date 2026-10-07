import React, { useState } from 'react';
import { FinancialData } from '../../types';
import { ReportTotals } from '../../lib/calculations';
import { formatAmount } from '../../lib/format';
import { IconAlert, IconCheck, IconChevron } from '../ui/icons';

interface BalanceCheckProps {
  data: FinancialData;
  totals: ReportTotals;
}

type Status = 'empty' | 'ok' | 'diff';

const statusOf = (assets: number, liabEq: number, diff: number): Status =>
  assets === 0 && liabEq === 0 ? 'empty' : diff === 0 ? 'ok' : 'diff';

const Pill: React.FC<{ year: string; status: Status; diff: number }> = ({ year, status, diff }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tnum ${
      status === 'ok' ? 'bg-emerald-50 text-emerald-800' : status === 'diff' ? 'bg-amber-50 text-amber-900' : 'bg-zinc-100 text-zinc-500'
    }`}
  >
    {status === 'diff' ? <IconAlert size={13} /> : <IconCheck size={13} />}
    {year}
    {status === 'ok' && <span className="font-normal">fecha</span>}
    {status === 'diff' && <span className="font-normal">dif. {formatAmount(diff)}</span>}
    {status === 'empty' && <span className="font-normal">sem valores</span>}
  </span>
);

export const BalanceCheck: React.FC<BalanceCheckProps> = ({ data, totals }) => {
  const [expanded, setExpanded] = useState(false);
  const cur = statusOf(totals.totalAssetsCurrent, totals.liabilitiesAndEquityCurrent, totals.balanceDiffCurrent);
  const prev = statusOf(totals.totalAssetsPrev, totals.liabilitiesAndEquityPrev, totals.balanceDiffPrev);

  return (
    <div className="sticky bottom-0 z-10 -mx-3 sm:-mx-4 mt-2 border-t border-zinc-200 bg-white/95 backdrop-blur px-3 sm:px-4 py-2.5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-2 text-left"
      >
        <span className="text-xs font-semibold text-zinc-700 shrink-0">Ativo = Passivo + PL</span>
        <span className="flex flex-wrap gap-1.5 flex-1 justify-end">
          <Pill year={data.year} status={cur} diff={totals.balanceDiffCurrent} />
          {data.showPrevYear && <Pill year={data.prevYear} status={prev} diff={totals.balanceDiffPrev} />}
        </span>
        <IconChevron size={14} className={`shrink-0 text-zinc-400 transition-transform ${expanded ? '' : 'rotate-180'}`} />
      </button>
      {expanded && (
        <table className="mt-2 w-full text-xs tnum">
          <thead>
            <tr className="text-zinc-400">
              <th className="text-left font-medium py-1" />
              <th className="text-right font-medium">{data.year}</th>
              {data.showPrevYear && <th className="text-right font-medium">{data.prevYear}</th>}
            </tr>
          </thead>
          <tbody className="text-zinc-700">
            <tr>
              <td className="py-0.5">Total do Ativo</td>
              <td className="text-right">{formatAmount(totals.totalAssetsCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatAmount(totals.totalAssetsPrev)}</td>}
            </tr>
            <tr>
              <td className="py-0.5">Passivo + PL</td>
              <td className="text-right">{formatAmount(totals.liabilitiesAndEquityCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatAmount(totals.liabilitiesAndEquityPrev)}</td>}
            </tr>
            <tr className="font-semibold border-t border-zinc-200">
              <td className="py-1">Diferença</td>
              <td className={`text-right ${totals.balanceDiffCurrent ? 'text-amber-700' : 'text-emerald-700'}`}>
                {formatAmount(totals.balanceDiffCurrent)}
              </td>
              {data.showPrevYear && (
                <td className={`text-right ${totals.balanceDiffPrev ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {formatAmount(totals.balanceDiffPrev)}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};
