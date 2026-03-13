export type Language = 'pt' | 'en';

export interface FinancialData {
  companyName: string;
  companyAddress?: string;
  year: string;
  prevYear: string;
  reportDate: string;
  directorName: string;
  accountantName: string;
  crcNumber: string;
  showPrevYear: boolean;
  aiScenario: 'none' | 'new_company' | 'closing_company' | 'other';
  aiContextNotes: string;
  
  // Balance Sheet - Assets
  assetCashCurrent: number;
  assetCashPrev: number;
  assetLoansCurrent: number;
  assetLoansPrev: number;
  assetInvestmentsCurrent: number;
  assetInvestmentsPrev: number;
  assetTangibleCurrent: number;
  assetTangiblePrev: number;
  assetIntangibleCurrent: number;
  assetIntangiblePrev: number;
  assetOtherCurrent: number;
  assetOtherPrev: number;
  
  // Balance Sheet - Liabilities
  liabilityPayablesCurrent: number;
  liabilityPayablesPrev: number;
  liabilityLongTermCurrent: number;
  liabilityLongTermPrev: number;
  liabilityOtherCurrent: number;
  liabilityOtherPrev: number;

  // Balance Sheet - Equity
  equityCapitalSocialCurrent: number;
  equityCapitalSocialPrev: number;
  equityRetainedEarningsUntil2023Current: number;
  equityRetainedEarningsUntil2023Prev: number;
  equityRetainedEarnings2024Current: number;
  equityRetainedEarnings2024Prev: number;
  equityRetainedEarnings2025Current: number;
  equityRetainedEarnings2025Prev: number;
  equityTotalCurrent: number;
  equityTotalPrev: number;
  
  // Income Statement
  dreRevenueCurrent: number;
  dreRevenuePrev: number;
  dreCostOfSalesCurrent: number;
  dreCostOfSalesPrev: number;
  
  dreOperatingExpensesCurrent: number;
  dreOperatingExpensesPrev: number;
  dreOtherExpensesCurrent: number;
  dreOtherExpensesPrev: number;
  dreIncomeTaxCurrent: number;
  dreIncomeTaxPrev: number;
}

export const INITIAL_DATA: FinancialData = {
  companyName: "Sua Empresa Ltda",
  companyAddress: "",
  year: "2025",
  prevYear: "2024",
  reportDate: "31 de Dezembro de 2025",
  directorName: "Nome do Diretor",
  accountantName: "Alexandre Luis Flach",
  crcNumber: "RS-062558/O-8",
  showPrevYear: true,
  aiScenario: 'none',
  aiContextNotes: '',
  
  // Assets
  assetCashCurrent: 0,
  assetCashPrev: 0,
  assetLoansCurrent: 0,
  assetLoansPrev: 0,
  assetInvestmentsCurrent: 0,
  assetInvestmentsPrev: 0,
  assetTangibleCurrent: 0,
  assetTangiblePrev: 0,
  assetIntangibleCurrent: 0,
  assetIntangiblePrev: 0,
  assetOtherCurrent: 0,
  assetOtherPrev: 0,
  
  // Liabilities
  liabilityPayablesCurrent: 0,
  liabilityPayablesPrev: 0,
  liabilityLongTermCurrent: 0,
  liabilityLongTermPrev: 0,
  liabilityOtherCurrent: 0,
  liabilityOtherPrev: 0,

  // Equity
  equityCapitalSocialCurrent: 0,
  equityCapitalSocialPrev: 0,
  equityRetainedEarningsUntil2023Current: 0,
  equityRetainedEarningsUntil2023Prev: 0,
  equityRetainedEarnings2024Current: 0,
  equityRetainedEarnings2024Prev: 0,
  equityRetainedEarnings2025Current: 0,
  equityRetainedEarnings2025Prev: 0,
  equityTotalCurrent: 0,
  equityTotalPrev: 0,
  
  // Income Statement
  dreRevenueCurrent: 0,
  dreRevenuePrev: 0,
  dreCostOfSalesCurrent: 0,
  dreCostOfSalesPrev: 0,
  dreOperatingExpensesCurrent: 0,
  dreOperatingExpensesPrev: 0,
  dreOtherExpensesCurrent: 0,
  dreOtherExpensesPrev: 0,
  dreIncomeTaxCurrent: 0,
  dreIncomeTaxPrev: 0,
};
