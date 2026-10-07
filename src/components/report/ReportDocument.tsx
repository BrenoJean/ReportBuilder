import React from 'react';
import { FinancialData, Language } from '../../types';
import { getStrings, ReportStrings } from '../../lib/i18n';
import { computeReport, ReportTotals } from '../../lib/calculations';
import { formatAmount, formatCurrency, formatParensNegative } from '../../lib/format';
import { KeepMark, ReportPage } from './ReportPage';
import { StatementLine, StatementTable } from './StatementTable';

interface ReportDocumentProps {
  data: FinancialData;
  language: Language;
  insights: string | null;
  printInsights: boolean;
}

// Mirrors the AI fact sheet: percentages for normal moves, a multiplier for very large ones.
const formatChange = (current: number, previous: number, language: Language): string | null => {
  if (previous <= 0 || current < 0) return null;
  const locale = language === 'pt' ? 'pt-BR' : 'en-US';
  const ratio = current / previous;
  if (ratio >= 4) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(ratio)}×`;
  const pct = (ratio - 1) * 100;
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: Math.abs(pct) < 10 ? 1 : 0 }).format(Math.abs(pct));
  if (formatted === '0') return '0%';
  return `${pct > 0 ? '▲' : '▼'} ${formatted}%`;
};

const paren = (v: number) => (v === 0 || Number.isNaN(v) ? '-' : `(${formatCurrency(v)})`);

const line = (label: string, cur: number, prev: number, fmt = formatCurrency, indent: 0 | 1 | 2 = 1): StatementLine => ({
  kind: 'line',
  label,
  cur: fmt(cur),
  prev: fmt(prev),
  indent,
});

const balanceSheetLines = (d: FinancialData, r: ReportTotals, t: ReportStrings): StatementLine[] => {
  const lines: StatementLine[] = [
    { kind: 'heading', label: t.assets },
    line(t.cashEquivalents, d.assetCashCurrent, d.assetCashPrev),
    line(t.loansReceivables, d.assetLoansCurrent, d.assetLoansPrev),
    line(t.investmentsAssets, d.assetInvestmentsCurrent, d.assetInvestmentsPrev),
    line(t.tangibleFixed, d.assetTangibleCurrent, d.assetTangiblePrev),
    line(t.intangibleAssets, d.assetIntangibleCurrent, d.assetIntangiblePrev),
    line(t.otherAssets, d.assetOtherCurrent, d.assetOtherPrev),
  ];
  if (r.participations.length > 0) {
    lines.push({ kind: 'group', label: t.otherCompanyParticipations });
    r.participations.forEach((p) => lines.push(line(p.name || '—', p.current, p.prev, formatCurrency, 2)));
  }
  lines.push(
    { kind: 'total', label: t.totalAssets, cur: formatCurrency(r.totalAssetsCurrent), prev: formatCurrency(r.totalAssetsPrev) },
    { kind: 'heading', label: t.liabilities },
    line(t.accountsPayable, d.liabilityPayablesCurrent, d.liabilityPayablesPrev),
    line(t.longTermDebts, d.liabilityLongTermCurrent, d.liabilityLongTermPrev),
    line(t.otherLiabilities, d.liabilityOtherCurrent, d.liabilityOtherPrev),
    { kind: 'subtotal', label: t.totalLiabilities, cur: formatCurrency(r.totalLiabilitiesCurrent), prev: formatCurrency(r.totalLiabilitiesPrev) },
    { kind: 'heading', label: t.shareholderEquity },
  );
  const s = r.show;
  if (s.capitalSocial) lines.push(line(t.capitalSocial, d.equityCapitalSocialCurrent, d.equityCapitalSocialPrev));
  if (s.capitalToIntegralize) lines.push(line(t.capitalToIntegralize, d.equityCapitalToIntegralizeCurrent, d.equityCapitalToIntegralizePrev));
  if (s.capitalIncreaseFund) lines.push(line(t.capitalIncreaseFund, d.equityCapitalIncreaseFundCurrent, d.equityCapitalIncreaseFundPrev));
  if (s.profitReserve) lines.push(line(t.profitReserve, d.equityProfitReserveCurrent, d.equityProfitReservePrev));
  if (s.retainedEarningsUntil2023) lines.push(line(t.retainedEarningsUntil2023, d.equityRetainedEarningsUntil2023Current, d.equityRetainedEarningsUntil2023Prev));
  if (s.retainedEarnings2024) lines.push(line(t.retainedEarnings2024, d.equityRetainedEarnings2024Current, d.equityRetainedEarnings2024Prev));
  if (s.retainedEarnings2025) lines.push(line(t.retainedEarnings2025, d.equityRetainedEarnings2025Current, d.equityRetainedEarnings2025Prev));
  if (s.monetaryConversionAdjustment)
    lines.push(line(t.monetaryConversionAdjustment, d.equityMonetaryConversionAdjustmentCurrent, d.equityMonetaryConversionAdjustmentPrev, formatParensNegative));
  lines.push(
    { kind: 'subtotal', label: t.totalEquity, cur: formatCurrency(d.equityTotalCurrent), prev: formatCurrency(d.equityTotalPrev) },
    {
      kind: 'total',
      label: t.totalLiabilitiesEquity,
      cur: formatCurrency(r.liabilitiesAndEquityCurrent),
      prev: formatCurrency(r.liabilitiesAndEquityPrev),
    },
  );
  return lines;
};

const incomeStatementLines = (d: FinancialData, r: ReportTotals, t: ReportStrings): StatementLine[] => {
  const s = r.show;
  const lines: StatementLine[] = [
    line(t.revenue, d.dreRevenueCurrent, d.dreRevenuePrev, formatCurrency, 0),
    line(t.costOfSales, d.dreCostOfSalesCurrent, d.dreCostOfSalesPrev, paren, 0),
    { kind: 'subtotal', label: t.grossProfit, cur: formatCurrency(r.grossProfitCurrent), prev: formatCurrency(r.grossProfitPrev) },
  ];
  if (r.showOtherRevenues) {
    lines.push({ kind: 'heading', label: t.otherRevenues });
    if (s.dividends) lines.push(line(t.dividends, d.dreOtherRevenuesDividendsCurrent, d.dreOtherRevenuesDividendsPrev));
    if (s.equityPickup) lines.push(line(t.equityPickup, d.dreOtherRevenuesEquityPickupCurrent, d.dreOtherRevenuesEquityPickupPrev));
    if (s.financialIncome) lines.push(line(t.financialIncome, d.dreOtherRevenuesFinancialIncomeCurrent, d.dreOtherRevenuesFinancialIncomePrev));
    if (s.marketValueRevenue) lines.push(line(t.marketValue, r.marketValueCurrent.revenue, r.marketValuePrev.revenue));
    lines.push({
      kind: 'subtotal',
      label: t.totalOtherRevenues,
      cur: formatCurrency(r.totalOtherRevenuesCurrent),
      prev: formatCurrency(r.totalOtherRevenuesPrev),
    });
  }
  lines.push(
    { kind: 'heading', label: t.expenses },
    line(t.operatingExpenses, d.dreOperatingExpensesCurrent, d.dreOperatingExpensesPrev, paren),
  );
  if (s.marketValueLoss) lines.push(line(t.marketValueLoss, r.marketValueCurrent.expense, r.marketValuePrev.expense, paren));
  lines.push(
    line(t.otherExpenses, d.dreOtherExpensesCurrent, d.dreOtherExpensesPrev, paren),
    line(t.incomeTaxExpense, d.dreIncomeTaxCurrent, d.dreIncomeTaxPrev, paren),
    { kind: 'subtotal', label: t.totalExpenses, cur: paren(r.totalExpensesCurrent), prev: paren(r.totalExpensesPrev) },
    {
      kind: 'total',
      label: r.isNetLoss ? t.netLoss : t.netIncome,
      cur: formatCurrency(r.netIncomeCurrent),
      prev: formatCurrency(r.netIncomePrev),
    },
  );
  return lines;
};

export const ReportDocument: React.FC<ReportDocumentProps> = ({ data, language, insights, printInsights }) => {
  const t = getStrings(language);
  const r = computeReport(data);
  const hasInsightsPage = Boolean(printInsights && insights?.trim());
  const bsLines = balanceSheetLines(data, r, t);
  const insightWords = insights?.trim().split(/\s+/).length ?? 0;
  const insightDensity = insightWords > 340 ? 'dense' : insightWords > 230 ? 'compact' : 'normal';
  const keyFigures = [
    { label: t.kpiAssets, current: r.totalAssetsCurrent, prev: r.totalAssetsPrev },
    { label: t.kpiEquity, current: data.equityTotalCurrent, prev: data.equityTotalPrev },
    {
      label: t.kpiRevenues,
      current: data.dreRevenueCurrent + r.totalOtherRevenuesCurrent,
      prev: data.dreRevenuePrev + r.totalOtherRevenuesPrev,
    },
    { label: r.isNetLoss ? t.kpiNetLoss : t.kpiNetIncome, current: r.netIncomeCurrent, prev: r.netIncomePrev },
  ].map((kpi) => ({ ...kpi, change: data.showPrevYear ? formatChange(kpi.current, kpi.prev, language) : null }));
  const pageProps = { t, companyName: data.companyName, companyAddress: data.companyAddress };

  const contents = [
    { id: 1, title: t.accReport, page: 3 },
    { id: 2, title: t.finPos, page: 4 },
    { id: 3, title: t.compIncome, page: 5 },
    ...(hasInsightsPage
      ? [{ id: 4, title: language === 'pt' ? `${t.notes} e ${t.aiInsights}` : `${t.notes} and ${t.aiInsights}`, page: 6 }]
      : []),
  ];

  return (
    <div className="report-doc flex flex-col items-center gap-8 print:gap-0">
      {/* Cover */}
      <section className="report-page bg-white">
        <div className="h-[3mm] bg-black" />
        <div className="flex-1 flex flex-col px-[22mm] pt-[24mm] pb-[18mm]">
          <KeepMark className="self-start" />
          <div className="mt-auto mb-auto pt-[30mm]">
            <p className="text-[9pt] uppercase tracking-[0.3em] text-zinc-500">{t.finStatements}</p>
            <h1 className="mt-[5mm] text-[30pt] font-bold leading-[1.1] tracking-tight break-words">{data.companyName}</h1>
            {data.companyAddress && <p className="mt-[3mm] text-[10pt] text-zinc-500">{data.companyAddress}</p>}
            <div className="mt-[12mm] flex items-center gap-[5mm]">
              <span className="h-px w-[18mm] bg-black" />
              <span className="text-[22pt] font-light tnum tracking-wide">{data.year}</span>
            </div>
            <p className="mt-[3mm] text-[9pt] text-zinc-500">{t.expressedIn}</p>
          </div>
          <div className="border-t border-zinc-300 pt-[5mm] flex items-end justify-between">
            <div className="text-[9pt] text-zinc-500">
              <p>{t.preparedBy}</p>
              <p className="text-[12pt] font-semibold text-black uppercase tracking-wide">Keep Gestão Contábil</p>
            </div>
            <p className="text-[9pt] text-zinc-500 tnum">{data.reportDate}</p>
          </div>
        </div>
      </section>

      {/* Contents */}
      <ReportPage {...pageProps} title={t.finStatements} subtitle={`${t.forYearEnded} ${data.year}`} pageNumber={2}>
        <h2 className="text-[9pt] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-[8mm]">{t.toc}</h2>
        <ol className="text-[11pt]">
          {contents.map((item) => (
            <li key={item.id} className="flex items-baseline gap-3 py-[3.5mm] border-b border-zinc-200">
              <span className="w-[7mm] font-semibold tnum text-zinc-400">{item.id}.</span>
              <span className="flex-1">{item.title}</span>
              <span className="font-semibold tnum">{item.page}</span>
            </li>
          ))}
        </ol>
      </ReportPage>

      {/* Accountant's report */}
      <ReportPage {...pageProps} title={`1. ${t.accReport}`} pageNumber={3}>
        <div className="text-[10pt] leading-[1.65] text-justify space-y-[5mm]">
          <p className="font-semibold text-left">
            {language === 'pt' ? 'Ao Diretor da' : 'The Director'}
            <br />
            {data.companyName}
          </p>
          <p>{t.reportBody1.replace('{YEAR}', data.year)}</p>
          <p>{t.reportBody2}</p>
          <p>{t.reportBody3}</p>
          <p className="pt-[6mm]">
            {t.onBehalf} {data.companyName}, {t.on} {data.reportDate}.
          </p>
        </div>
        <div className="mt-[14mm] text-[10pt]">
          <p>{t.preparedByLabel}</p>
          <div className="mt-[16mm] w-[70mm] border-t border-black pt-[2mm]">
            <p className="font-semibold uppercase">{data.accountantName}</p>
            <p className="text-[8pt] font-bold tracking-wide">KEEP GESTÃO CONTÁBIL</p>
            <p className="text-[9pt] tnum text-zinc-600">{data.crcNumber}</p>
          </div>
        </div>
      </ReportPage>

      {/* Balance sheet */}
      <ReportPage {...pageProps} title={`2. ${t.finPos}`} subtitle={`${t.asAt} ${data.year} ${t.expressedIn}`} pageNumber={4} flushTop>
        <StatementTable
          year={data.year}
          prevYear={data.prevYear}
          showPrev={data.showPrevYear}
          currency={t.currency}
          lines={bsLines}
          dense={bsLines.length > 26}
        />
        <div className="mt-auto pt-[8mm] flex items-end justify-between gap-6">
          <p className="text-[8pt] italic text-zinc-500 max-w-[95mm]">{t.disclaimer}</p>
          {data.directorName.trim() && (
            <div className="w-[60mm] border-t border-black pt-[2mm] text-[9pt]">
              <p className="font-semibold">{data.directorName}</p>
              <p className="text-zinc-500">{t.director}</p>
            </div>
          )}
        </div>
      </ReportPage>

      {/* Income statement */}
      <ReportPage {...pageProps} title={`3. ${t.compIncome}`} subtitle={`${t.forYearEnded} ${data.year} ${t.expressedIn}`} pageNumber={5} flushTop>
        <StatementTable
          year={data.year}
          prevYear={data.prevYear}
          showPrev={data.showPrevYear}
          currency={t.currency}
          lines={incomeStatementLines(data, r, t)}
        />
        <p className="mt-auto pt-[8mm] text-[8pt] italic text-zinc-500">{t.disclaimer}</p>
      </ReportPage>

      {hasInsightsPage && (
        <ReportPage {...pageProps} title={t.aiInsights} subtitle={t.aiHeaderSub} pageNumber={6}>
          <p className="text-[8pt] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-[3mm]">{t.keyFigures}</p>
          <div className={`grid grid-cols-2 gap-[4mm] ${insightDensity === 'normal' ? 'mb-[9mm]' : 'mb-[6mm]'}`}>
            {keyFigures.map((kpi) => (
              <div
                key={kpi.label}
                className={`border-t-[2pt] border-black bg-zinc-50 px-[4mm] ${insightDensity === 'dense' ? 'pt-[2mm] pb-[2mm]' : 'pt-[3mm] pb-[3.5mm]'}`}
              >
                <p className="text-[7.5pt] font-semibold uppercase tracking-[0.12em] text-zinc-500">{kpi.label}</p>
                <p className="mt-[1.5mm] text-[16pt] font-semibold tnum leading-none">
                  <span className="text-[9pt] font-medium text-zinc-500 mr-[1mm]">US$</span>
                  {formatAmount(kpi.current)}
                </p>
                <p className={`${insightDensity === 'dense' ? 'mt-[1mm]' : 'mt-[2mm]'} text-[8.5pt] text-zinc-600 tnum min-h-[1em]`}>
                  {kpi.change ? `${kpi.change} vs. ${data.prevYear}` : ''}
                </p>
              </div>
            ))}
          </div>

          <h2 className={`text-[13pt] font-semibold border-b border-black pb-[2mm] ${insightDensity === 'normal' ? 'mb-[5mm]' : 'mb-[3mm]'}`}>
            {t.execSummary}
          </h2>
          <div
            lang={language === 'pt' ? 'pt-BR' : 'en'}
            className={`text-zinc-800 text-justify hyphens-auto ${
              insightDensity === 'dense'
                ? 'text-[9.5pt] leading-[1.4] space-y-[1.5mm]'
                : insightDensity === 'compact'
                  ? 'text-[10pt] leading-[1.6] space-y-[2.5mm]'
                  : 'text-[11pt] leading-[1.75] space-y-[3.5mm]'
            }`}
          >
            {(insights ?? '')
              .split(/\n\s*\n/)
              .map((paragraph) => paragraph.trim().replace(/US\$ (?=[-\d])/g, 'US$' + '\u00A0'))
              .filter(Boolean)
              .map((paragraph, i) => (
                <p key={i} className="indent-[8mm] whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
          </div>
          <div className={`mt-auto ${insightDensity === 'normal' ? 'pt-[10mm]' : 'pt-[4mm]'}`}>
            <p className={`text-[8pt] italic text-zinc-500 bg-zinc-50 border border-zinc-200 ${insightDensity === 'normal' ? 'p-[4mm]' : 'p-[2.5mm]'}`}>
              {t.aiDisclaimer}
            </p>
          </div>
        </ReportPage>
      )}
    </div>
  );
};
