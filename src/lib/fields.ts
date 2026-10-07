import { FinancialData } from '../types';

export type MoneyBase = {
  [K in keyof FinancialData]-?: K extends `${infer B}Current`
    ? `${B}Prev` extends keyof FinancialData
      ? B
      : never
    : never;
}[keyof FinancialData];

export const currentKey = (b: MoneyBase) => `${b}Current` as const;
export const prevKey = (b: MoneyBase) => `${b}Prev` as const;

export interface MoneyRowDef {
  base: MoneyBase;
  label: string;
  hint?: string;
}

export interface MoneyGroupDef {
  title?: string;
  rows: MoneyRowDef[];
}

export const ASSET_GROUPS: MoneyGroupDef[] = [
  {
    rows: [
      { base: 'assetCash', label: 'Caixa e Equivalentes' },
      { base: 'assetLoans', label: 'Empréstimos a Sócios' },
      { base: 'assetInvestments', label: 'Investimentos e Ativos Financeiros' },
      { base: 'assetTangible', label: 'Ativos Tangíveis (Imobilizado)' },
      { base: 'assetIntangible', label: 'Ativos Intangíveis' },
      { base: 'assetOther', label: 'Outros Ativos' },
    ],
  },
];

export const LIABILITY_GROUPS: MoneyGroupDef[] = [
  {
    rows: [
      { base: 'liabilityPayables', label: 'Contas a Pagar' },
      { base: 'liabilityLongTerm', label: 'Dívidas de Longo Prazo' },
      { base: 'liabilityOther', label: 'Outros Passivos' },
    ],
  },
];

export const EQUITY_GROUPS: MoneyGroupDef[] = [
  {
    rows: [
      { base: 'equityCapitalSocial', label: 'Capital Social' },
      { base: 'equityCapitalToIntegralize', label: '( - ) Capital Social a Integralizar', hint: 'Informe positivo: é subtraído do total' },
      { base: 'equityCapitalIncreaseFund', label: 'Fundo para Aumento de Capital' },
      { base: 'equityProfitReserve', label: 'Reserva de Lucros' },
      { base: 'equityRetainedEarningsUntil2023', label: 'Lucros e Prejuízos até 2023' },
      { base: 'equityRetainedEarnings2024', label: 'Lucros e Prejuízos 2024' },
      { base: 'equityRetainedEarnings2025', label: 'Lucros e Prejuízos 2025' },
      { base: 'equityMonetaryConversionAdjustment', label: 'Ajuste Conversão Monetária', hint: 'Aceita negativo' },
    ],
  },
];

export const INCOME_GROUPS: MoneyGroupDef[] = [
  {
    rows: [
      { base: 'dreRevenue', label: 'Receita' },
      { base: 'dreCostOfSales', label: 'Custo das Vendas' },
    ],
  },
  {
    title: 'Outras Receitas',
    rows: [
      { base: 'dreOtherRevenuesDividends', label: 'Dividendos' },
      { base: 'dreOtherRevenuesEquityPickup', label: 'Equivalência Patrimonial' },
      { base: 'dreOtherRevenuesFinancialIncome', label: 'Rendimento Apl. Financeira' },
      { base: 'dreOtherRevenuesMarketValue', label: 'Valor de Mercado', hint: 'Negativo vira perda nas despesas' },
    ],
  },
  {
    title: 'Despesas',
    rows: [
      { base: 'dreOperatingExpenses', label: 'Despesas Operacionais' },
      { base: 'dreOtherExpenses', label: 'Outras Despesas' },
      { base: 'dreIncomeTax', label: 'Despesa com Impostos' },
    ],
  },
];
