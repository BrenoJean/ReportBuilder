import { FinancialData } from '../types';

export const normalizeMarketValue = (value: number) => ({
  revenue: Math.max(value, 0),
  expense: Math.abs(Math.min(value, 0)),
});

const EQUITY_ANALYTICAL_FIELDS = [
  'equityCapitalSocial',
  'equityCapitalToIntegralize',
  'equityCapitalIncreaseFund',
  'equityRetainedEarningsUntil2023',
  'equityRetainedEarnings2024',
  'equityRetainedEarnings2025',
  'equityMonetaryConversionAdjustment',
  'equityProfitReserve',
] as const;

type Period = 'Current' | 'Prev';

const equityAnalyticalSum = (d: FinancialData, p: Period) =>
  d[`equityCapitalSocial${p}`] -
  d[`equityCapitalToIntegralize${p}`] +
  d[`equityCapitalIncreaseFund${p}`] +
  d[`equityRetainedEarningsUntil2023${p}`] +
  d[`equityRetainedEarnings2024${p}`] +
  d[`equityRetainedEarnings2025${p}`] +
  d[`equityMonetaryConversionAdjustment${p}`] +
  d[`equityProfitReserve${p}`];

export const hasEquityAnalytical = (d: FinancialData, p: Period) =>
  EQUITY_ANALYTICAL_FIELDS.some((f) => d[`${f}${p}`] !== 0);

// When analytical equity accounts are filled, the equity total is derived from them.
export const applyEquityAutoTotal = (d: FinancialData): FinancialData => {
  const next = { ...d };
  if (hasEquityAnalytical(next, 'Current')) next.equityTotalCurrent = equityAnalyticalSum(next, 'Current');
  if (hasEquityAnalytical(next, 'Prev')) next.equityTotalPrev = equityAnalyticalSum(next, 'Prev');
  return next;
};

const nonZero = (a: number, b: number) => a !== 0 || b !== 0;

export const computeReport = (d: FinancialData) => {
  const participations = d.assetOtherCompanyParticipations ?? [];
  const participationsCurrent = participations.reduce((s, i) => s + i.current, 0);
  const participationsPrev = participations.reduce((s, i) => s + i.prev, 0);

  const totalAssetsCurrent =
    d.assetCashCurrent + d.assetLoansCurrent + d.assetInvestmentsCurrent + d.assetTangibleCurrent +
    d.assetIntangibleCurrent + d.assetOtherCurrent + participationsCurrent;
  const totalAssetsPrev =
    d.assetCashPrev + d.assetLoansPrev + d.assetInvestmentsPrev + d.assetTangiblePrev +
    d.assetIntangiblePrev + d.assetOtherPrev + participationsPrev;

  const totalLiabilitiesCurrent = d.liabilityPayablesCurrent + d.liabilityLongTermCurrent + d.liabilityOtherCurrent;
  const totalLiabilitiesPrev = d.liabilityPayablesPrev + d.liabilityLongTermPrev + d.liabilityOtherPrev;

  const marketValueCurrent = normalizeMarketValue(d.dreOtherRevenuesMarketValueCurrent);
  const marketValuePrev = normalizeMarketValue(d.dreOtherRevenuesMarketValuePrev);

  const grossProfitCurrent = d.dreRevenueCurrent - d.dreCostOfSalesCurrent;
  const grossProfitPrev = d.dreRevenuePrev - d.dreCostOfSalesPrev;

  const totalOtherRevenuesCurrent =
    d.dreOtherRevenuesDividendsCurrent + d.dreOtherRevenuesEquityPickupCurrent +
    d.dreOtherRevenuesFinancialIncomeCurrent + marketValueCurrent.revenue;
  const totalOtherRevenuesPrev =
    d.dreOtherRevenuesDividendsPrev + d.dreOtherRevenuesEquityPickupPrev +
    d.dreOtherRevenuesFinancialIncomePrev + marketValuePrev.revenue;

  const totalExpensesCurrent =
    d.dreOperatingExpensesCurrent + d.dreOtherExpensesCurrent + d.dreIncomeTaxCurrent + marketValueCurrent.expense;
  const totalExpensesPrev =
    d.dreOperatingExpensesPrev + d.dreOtherExpensesPrev + d.dreIncomeTaxPrev + marketValuePrev.expense;

  const netIncomeCurrent = grossProfitCurrent + totalOtherRevenuesCurrent - totalExpensesCurrent;
  const netIncomePrev = grossProfitPrev + totalOtherRevenuesPrev - totalExpensesPrev;

  const show = {
    capitalSocial: nonZero(d.equityCapitalSocialCurrent, d.equityCapitalSocialPrev),
    capitalToIntegralize: nonZero(d.equityCapitalToIntegralizeCurrent, d.equityCapitalToIntegralizePrev),
    capitalIncreaseFund: nonZero(d.equityCapitalIncreaseFundCurrent, d.equityCapitalIncreaseFundPrev),
    profitReserve: nonZero(d.equityProfitReserveCurrent, d.equityProfitReservePrev),
    retainedEarningsUntil2023: nonZero(d.equityRetainedEarningsUntil2023Current, d.equityRetainedEarningsUntil2023Prev),
    retainedEarnings2024: nonZero(d.equityRetainedEarnings2024Current, d.equityRetainedEarnings2024Prev),
    retainedEarnings2025: nonZero(d.equityRetainedEarnings2025Current, d.equityRetainedEarnings2025Prev),
    monetaryConversionAdjustment: nonZero(d.equityMonetaryConversionAdjustmentCurrent, d.equityMonetaryConversionAdjustmentPrev),
    dividends: nonZero(d.dreOtherRevenuesDividendsCurrent, d.dreOtherRevenuesDividendsPrev),
    equityPickup: nonZero(d.dreOtherRevenuesEquityPickupCurrent, d.dreOtherRevenuesEquityPickupPrev),
    financialIncome: nonZero(d.dreOtherRevenuesFinancialIncomeCurrent, d.dreOtherRevenuesFinancialIncomePrev),
    marketValueRevenue: nonZero(marketValueCurrent.revenue, marketValuePrev.revenue),
    marketValueLoss: nonZero(marketValueCurrent.expense, marketValuePrev.expense),
  };
  const showOtherRevenues = show.dividends || show.equityPickup || show.financialIncome || show.marketValueRevenue;

  const liabilitiesAndEquityCurrent = totalLiabilitiesCurrent + d.equityTotalCurrent;
  const liabilitiesAndEquityPrev = totalLiabilitiesPrev + d.equityTotalPrev;

  return {
    participations,
    participationsCurrent,
    participationsPrev,
    totalAssetsCurrent,
    totalAssetsPrev,
    totalLiabilitiesCurrent,
    totalLiabilitiesPrev,
    marketValueCurrent,
    marketValuePrev,
    grossProfitCurrent,
    grossProfitPrev,
    totalOtherRevenuesCurrent,
    totalOtherRevenuesPrev,
    totalExpensesCurrent,
    totalExpensesPrev,
    netIncomeCurrent,
    netIncomePrev,
    isNetLoss: netIncomeCurrent < 0,
    show,
    showOtherRevenues,
    liabilitiesAndEquityCurrent,
    liabilitiesAndEquityPrev,
    balanceDiffCurrent: round2(totalAssetsCurrent - liabilitiesAndEquityCurrent),
    balanceDiffPrev: round2(totalAssetsPrev - liabilitiesAndEquityPrev),
  };
};

export type ReportTotals = ReturnType<typeof computeReport>;

const round2 = (n: number) => Math.round(n * 100) / 100;
