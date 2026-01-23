import React from 'react';
import { FinancialData, Language } from '../types';

interface ReportPreviewProps {
  data: FinancialData;
  insights: string | null;
  printInsights: boolean;
  language: Language;
}

// Dictionary for translations
const translations = {
  en: {
    finStatements: "Financial Statements",
    preparedBy: "Prepared and reviewed by:",
    toc: "Table of Contents",
    accReport: "Accountant's Report",
    finPos: "Statement of Financial Position",
    compIncome: "Income Statement",
    changesEquity: "Statement of Changes in Equity",
    notes: "Notes to the Financial Statements",
    aiInsights: "Management Analysis (Insights)",
    forYearEnded: "For the year ended December 31st,",
    asAt: "As at 31 December",
    expressedIn: "(Expressed in US Dollars)",
    
    // Balance Sheet Labels
    assets: "ASSETS",
    cashEquivalents: "Cash and cash equivalents",
    loansReceivables: "Loans and receivables",
    investmentsAssets: "Investments and other financial assets",
    tangibleFixed: "Tangible fixed assets",
    intangibleAssets: "Intangible assets",
    otherAssets: "Other assets",
    totalAssets: "TOTAL ASSETS",
    
    liabilities: "LIABILITIES",
    accountsPayable: "Accounts payable",
    longTermDebts: "Long-term debts",
    otherLiabilities: "Other Liabilities",
    totalLiabilities: "TOTAL LIABILITIES",
    
    shareholderEquity: "SHAREHOLDER'S EQUITY",

    // Income Statement Labels
    revenue: "REVENUE",
    costOfSales: "COST OF SALES",
    grossProfit: "GROSS PROFIT",
    expenses: "EXPENSES",
    operatingExpenses: "Operating expenses",
    otherExpenses: "Other expenses",
    incomeTaxExpense: "Income tax expense",
    totalExpenses: "TOTAL EXPENSES",
    netIncome: "NET INCOME",

    disclaimer: "The accompanying notes are an integral part of these financial statements.",
    director: "Director",
    preparedByLabel: "Prepared by,",
    onBehalf: "On behalf of",
    on: "on",
    aiDisclaimer: "Note: This analysis report was processed with the aid of data intelligence and reviewed by the Keep Gestão Contábil technical team to ensure relevance and accuracy.",
    aiHeaderSub: "Technical Analysis & Data Intelligence",
    execSummary: "Executive Summary",
    reportBody1: "We have compiled the accompanying financial statements of the company based on information you have provided. These financial statements comprise the statement of financial position of the Company as at December 31st, {YEAR}, the statement of comprehensive income, statement of changes in equity and statement of cash flows for the year then ended.",
    reportBody2: "We have applied our expertise in accounting and financial reporting to assist you in the preparation and presentation of these financial statements in accordance with practices adopted in Brazil (BR GAAP) and International Financial Reporting Standards (IFRS). We have complied with relevant ethical requirements, including principles of integrity, objectivity, professional competence and due care.",
    reportBody3: "Since a compilation engagement is not an assurance engagement, we are not required to verify the accuracy or completeness of the information you provided to us. The information used to compile them are your responsibility. We do not express an audit opinion."
  },
  pt: {
    finStatements: "Demonstrações Financeiras",
    preparedBy: "Preparado e revisado por:",
    toc: "Índice",
    accReport: "Relatório do Contador",
    finPos: "Balanço Patrimonial",
    compIncome: "Demonstração do Resultado (DRE)",
    changesEquity: "Demonstração das Mutações do P.L.",
    notes: "Notas Explicativas",
    aiInsights: "Análise de Gestão (Insights)",
    forYearEnded: "Para o ano findo em 31 de Dezembro de",
    asAt: "Em 31 de Dezembro de",
    expressedIn: "(Expresso em Dólares Americanos)",

    // Balance Sheet Labels
    assets: "ATIVO",
    cashEquivalents: "Caixa e equivalentes de caixa",
    loansReceivables: "Empréstimos e recebíveis",
    investmentsAssets: "Investimentos e outros ativos financeiros",
    tangibleFixed: "Ativos tangíveis (Imobilizado)",
    intangibleAssets: "Ativos intangíveis",
    otherAssets: "Outros ativos",
    totalAssets: "TOTAL DO ATIVO",
    
    liabilities: "PASSIVO",
    accountsPayable: "Contas a pagar",
    longTermDebts: "Dívidas de longo prazo",
    otherLiabilities: "Outros passivos",
    totalLiabilities: "TOTAL DO PASSIVO",
    
    shareholderEquity: "PATRIMÔNIO LÍQUIDO",

    // Income Statement Labels
    revenue: "RECEITA",
    costOfSales: "CUSTO DAS VENDAS",
    grossProfit: "LUCRO BRUTO",
    expenses: "DESPESAS",
    operatingExpenses: "Despesas operacionais",
    otherExpenses: "Outras despesas",
    incomeTaxExpense: "Despesa com impostos",
    totalExpenses: "TOTAL DE DESPESAS",
    netIncome: "LUCRO LÍQUIDO",

    disclaimer: "As notas explicativas são parte integrante destas demonstrações financeiras.",
    director: "Diretor",
    preparedByLabel: "Preparado por,",
    onBehalf: "Em nome de",
    on: "em",
    aiDisclaimer: "Nota: Este relatório de análise foi processado com auxílio de inteligência de dados e revisado pela equipe técnica da Keep Gestão Contábil para assegurar a relevância das informações.",
    aiHeaderSub: "Análise Técnica & Inteligência de Dados",
    execSummary: "Resumo Executivo",
    reportBody1: "Compilamos as demonstrações financeiras anexas da empresa com base nas informações fornecidas pela administração. Estas demonstrações financeiras compreendem o balanço patrimonial da Companhia em 31 de dezembro de {YEAR}, a demonstração do resultado abrangente, a demonstração das mutações do patrimônio líquido e a demonstração dos fluxos de caixa para o exercício findo nessa data.",
    reportBody2: "Aplicamos nossa experiência em contabilidade e relatórios financeiros para auxiliá-lo na preparação e apresentação destas demonstrações financeiras de acordo com as práticas adotadas no Brasil (BR GAAP) e Normas Internacionais de Relatório Financeiro (IFRS). Cumprimos os requisitos éticos relevantes, incluindo princípios de integridade, objetividade, competência profissional e zelo devido.",
    reportBody3: "Como um trabalho de compilação não é um trabalho de asseguração, não somos obrigados a verificar a precisão ou a integridade das informações que você nos forneceu. As informações usadas para compilá-las são de sua responsabilidade. Não expressamos uma opinião de auditoria."
  }
};

// Utility for currency formatting
const formatCurrency = (val: number) => {
  if (val === 0 || isNaN(val)) return "-";
  return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(val);
};

export const ReportPreview: React.FC<ReportPreviewProps> = ({ data, insights, printInsights, language }) => {
  const t = translations[language];

  // Calculations
  const totalAssetsCurrent = 
    data.assetCashCurrent + 
    data.assetLoansCurrent + 
    data.assetInvestmentsCurrent + 
    data.assetTangibleCurrent + 
    data.assetIntangibleCurrent + 
    data.assetOtherCurrent;

  const totalAssetsPrev = 
    data.assetCashPrev + 
    data.assetLoansPrev + 
    data.assetInvestmentsPrev + 
    data.assetTangiblePrev + 
    data.assetIntangiblePrev + 
    data.assetOtherPrev;

  const totalLiabilitiesCurrent = 
    data.liabilityPayablesCurrent + 
    data.liabilityLongTermCurrent + 
    data.liabilityOtherCurrent;

  const totalLiabilitiesPrev = 
    data.liabilityPayablesPrev + 
    data.liabilityLongTermPrev + 
    data.liabilityOtherPrev;

  // Income Statement Calculations
  const grossProfitCurrent = data.dreRevenueCurrent - data.dreCostOfSalesCurrent;
  const grossProfitPrev = data.dreRevenuePrev - data.dreCostOfSalesPrev;

  const totalExpensesCurrent = data.dreOperatingExpensesCurrent + data.dreOtherExpensesCurrent + data.dreIncomeTaxCurrent;
  const totalExpensesPrev = data.dreOperatingExpensesPrev + data.dreOtherExpensesPrev + data.dreIncomeTaxPrev;

  const netIncomeCurrent = grossProfitCurrent - totalExpensesCurrent;
  const netIncomePrev = grossProfitPrev - totalExpensesPrev;

  // Footer Component
  const Footer = () => (
    <div className="absolute bottom-16 left-0 right-0 px-15mm">
        <div className="w-full border-t-2 border-gray-400 pt-2">
          <div className="flex justify-end items-center gap-4">
             <div className="text-right text-sm text-gray-600">
              <p>{t.preparedBy}</p>
              <p className="font-bold text-black text-lg uppercase">Keep Gestão Contábil</p>
            </div>
             <div className="bg-black text-white p-2 font-bold text-xs tracking-widest">KEEP</div>
          </div>
        </div>
    </div>
  );

  return (
    <div className="print-container font-serif text-black leading-snug">
      
      {/* PAGE 1: COVER */}
      <div className="a4-page flex flex-col justify-between items-center text-center">
        <div className="mt-48 w-full">
          <h1 className="text-4xl font-bold mb-4">{data.companyName}</h1>
          <h2 className="text-2xl text-black font-bold mb-2">{t.finStatements}</h2>
          <h3 className="text-2xl font-bold">{data.year}</h3>
        </div>

        <div className="w-full border-t-2 border-gray-400 pt-4 mb-12">
          <div className="flex justify-end items-center gap-4">
             <div className="text-right text-sm text-gray-600">
              <p>{t.preparedBy}</p>
              <p className="font-bold text-black text-lg uppercase">Keep Gestão Contábil</p>
            </div>
             <div className="bg-black text-white p-2 font-bold text-xs tracking-widest">KEEP</div>
          </div>
        </div>
      </div>

      {/* PAGE 2: TABLE OF CONTENTS */}
      <div className="a4-page">
        <div className="bg-black text-white p-4 mb-12">
          <h2 className="text-xl font-bold">{data.companyName}</h2>
          {data.companyAddress && <p className="text-sm opacity-80">{data.companyAddress}</p>}
          <div className="mt-2 font-bold uppercase">{t.finStatements}</div>
          <div className="text-sm">{t.forYearEnded} {data.year}</div>
        </div>

        <h3 className="text-lg font-bold uppercase text-gray-600 mb-8">{t.toc}</h3>

        <div className="space-y-4 text-sm">
          {[
            { id: 1, title: t.accReport, page: 3 },
            { id: 2, title: t.finPos, page: 4 },
            { id: 3, title: t.compIncome, page: 5 },
            { id: 4, title: t.changesEquity, page: 6 },
            { id: 5, title: t.notes, page: 7 },
            ...(printInsights && insights ? [{ id: 6, title: t.aiInsights, page: 8 }] : [])
          ].map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-gray-100 p-2">
              <span>{item.id}. {item.title}</span>
              <span className="font-bold">{item.page}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PAGE 3: ACCOUNTANT'S REPORT */}
      <div className="a4-page">
        <div className="bg-black text-white px-4 py-2 mb-8">
          <h2 className="text-lg font-bold">{data.companyName}</h2>
          <p className="text-sm">1. {t.accReport}</p>
        </div>

        <div className="space-y-6 text-justify text-sm">
          <p className="font-bold">{language === 'pt' ? 'Ao Diretor da' : 'The Director'} <br/>{data.companyName}</p>
          
          <p>{t.reportBody1.replace('{YEAR}', data.year)}</p>
          <p>{t.reportBody2}</p>
          <p>{t.reportBody3}</p>

          <div className="mt-12">
            <p>{t.onBehalf} {data.companyName}, {t.on} {data.reportDate}.</p>
          </div>
          
          <div className="mt-12">
            <p>{t.preparedByLabel}</p>
            <div className="mt-12 border-t border-black w-1/3 pt-2">
              <p className="font-bold uppercase">{data.accountantName}</p>
              <p className="text-xs text-black font-bold">KEEP GESTÃO CONTÁBIL</p>
              <p>{data.crcNumber}</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 text-center text-sm">3</div>
      </div>

      {/* PAGE 4: BALANCE SHEET */}
      <div className="a4-page">
        <div className="bg-black text-white px-4 py-2 mb-6">
          <h2 className="text-lg font-bold">{data.companyName}</h2>
          <p className="text-sm">2. {t.finPos}</p>
          <p className="text-xs italic">{t.asAt} {data.year} {t.expressedIn}</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className={`text-left pb-2 ${data.showPrevYear ? 'w-2/3' : 'w-4/5'}`}></th>
              <th className="text-right pb-2">{data.year} (US$)</th>
              {data.showPrevYear && <th className="text-right pb-2">{data.prevYear} (US$)</th>}
            </tr>
          </thead>
          <tbody>
            {/* Assets */}
            <tr>
              <td className="pt-4 font-bold" colSpan={data.showPrevYear ? 3 : 2}>{t.assets}</td>
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.cashEquivalents}</td>
              <td className="text-right">{formatCurrency(data.assetCashCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.assetCashPrev)}</td>}
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.loansReceivables}</td>
              <td className="text-right">{formatCurrency(data.assetLoansCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.assetLoansPrev)}</td>}
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.investmentsAssets}</td>
              <td className="text-right">{formatCurrency(data.assetInvestmentsCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.assetInvestmentsPrev)}</td>}
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.tangibleFixed}</td>
              <td className="text-right">{formatCurrency(data.assetTangibleCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.assetTangiblePrev)}</td>}
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.intangibleAssets}</td>
              <td className="text-right">{formatCurrency(data.assetIntangibleCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.assetIntangiblePrev)}</td>}
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.otherAssets}</td>
              <td className="text-right">{formatCurrency(data.assetOtherCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.assetOtherPrev)}</td>}
            </tr>

             <tr className="border-t-2 border-black border-b-2 font-bold bg-gray-100">
              <td className="py-2">{t.totalAssets}</td>
              <td className="text-right py-2">{formatCurrency(totalAssetsCurrent)}</td>
              {data.showPrevYear && <td className="text-right py-2">{formatCurrency(totalAssetsPrev)}</td>}
            </tr>

             {/* Liabilities */}
             <tr>
              <td className="pt-6 font-bold" colSpan={data.showPrevYear ? 3 : 2}>{t.liabilities}</td>
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.accountsPayable}</td>
              <td className="text-right">{formatCurrency(data.liabilityPayablesCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.liabilityPayablesPrev)}</td>}
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.longTermDebts}</td>
              <td className="text-right">{formatCurrency(data.liabilityLongTermCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.liabilityLongTermPrev)}</td>}
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.otherLiabilities}</td>
              <td className="text-right">{formatCurrency(data.liabilityOtherCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.liabilityOtherPrev)}</td>}
            </tr>
            
            <tr className="border-t border-black border-b-2 font-bold">
              <td className="py-2">{t.totalLiabilities}</td>
              <td className="text-right">{formatCurrency(totalLiabilitiesCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(totalLiabilitiesPrev)}</td>}
            </tr>

            {/* Equity */}
            <tr>
              <td className="pt-6 font-bold" colSpan={data.showPrevYear ? 3 : 2}>{t.shareholderEquity}</td>
            </tr>
             <tr className="border-t-2 border-black border-b-2 font-bold bg-gray-100">
              <td className="py-2">{t.shareholderEquity}</td>
              <td className="text-right py-2">{formatCurrency(data.equityTotalCurrent)}</td>
              {data.showPrevYear && <td className="text-right py-2">{formatCurrency(data.equityTotalPrev)}</td>}
            </tr>
          </tbody>
        </table>
         <div className="absolute bottom-10 left-0 right-0 text-center text-sm">4</div>
         <Footer />
      </div>

      {/* PAGE 5: P&L */}
      <div className="a4-page">
        <div className="bg-black text-white px-4 py-2 mb-6">
          <h2 className="text-lg font-bold">{data.companyName}</h2>
          <p className="text-sm">3. {t.compIncome}</p>
          <p className="text-xs italic">{t.asAt} {data.year} {t.expressedIn}</p>
        </div>

        <table className="w-full text-sm">
           <thead>
            <tr className="border-b-2 border-black">
              <th className={`text-left pb-2 ${data.showPrevYear ? 'w-1/2' : 'w-3/4'}`}></th>
              <th className="text-right pb-2">{data.year} (US$)</th>
              {data.showPrevYear && <th className="text-right pb-2">{data.prevYear} (US$)</th>}
            </tr>
          </thead>
          <tbody>
            {/* Revenue */}
            <tr>
              <td className="py-2">{t.revenue}</td>
              <td className="text-right">{formatCurrency(data.dreRevenueCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(data.dreRevenuePrev)}</td>}
            </tr>
            <tr>
              <td className="py-2">{t.costOfSales}</td>
              <td className="text-right">({formatCurrency(data.dreCostOfSalesCurrent)})</td>
              {data.showPrevYear && <td className="text-right">({formatCurrency(data.dreCostOfSalesPrev)})</td>}
            </tr>
            <tr className="border-t border-black font-bold">
              <td className="py-2">{t.grossProfit}</td>
              <td className="text-right">{formatCurrency(grossProfitCurrent)}</td>
              {data.showPrevYear && <td className="text-right">{formatCurrency(grossProfitPrev)}</td>}
            </tr>

            {/* Expenses */}
            <tr><td className="pt-8 font-bold" colSpan={data.showPrevYear ? 3 : 2}>{t.expenses}</td></tr>
            <tr>
              <td className="py-1 pl-4">{t.operatingExpenses}</td>
              <td className="text-right">({formatCurrency(data.dreOperatingExpensesCurrent)})</td>
              {data.showPrevYear && <td className="text-right">({formatCurrency(data.dreOperatingExpensesPrev)})</td>}
            </tr>
            <tr>
              <td className="py-1 pl-4">{t.otherExpenses}</td>
              <td className="text-right">({formatCurrency(data.dreOtherExpensesCurrent)})</td>
              {data.showPrevYear && <td className="text-right">({formatCurrency(data.dreOtherExpensesPrev)})</td>}
            </tr>
             <tr>
              <td className="py-1 pl-4">{t.incomeTaxExpense}</td>
              <td className="text-right">({formatCurrency(data.dreIncomeTaxCurrent)})</td>
              {data.showPrevYear && <td className="text-right">({formatCurrency(data.dreIncomeTaxPrev)})</td>}
            </tr>
             <tr className="border-t border-black font-bold">
              <td className="py-1">{t.totalExpenses}</td>
              <td className="text-right">({formatCurrency(totalExpensesCurrent)})</td>
              {data.showPrevYear && <td className="text-right">({formatCurrency(totalExpensesPrev)})</td>}
            </tr>
             
             {/* Net Income */}
             <tr className="border-t-2 border-black border-b-2 font-bold bg-gray-100">
              <td className="py-2">{t.netIncome}</td>
              <td className="text-right py-2">{formatCurrency(netIncomeCurrent)}</td>
              {data.showPrevYear && <td className="text-right py-2">{formatCurrency(netIncomePrev)}</td>}
            </tr>
          </tbody>
        </table>
        <div className="absolute bottom-10 left-0 right-0 text-center text-sm">5</div>
        <Footer />
      </div>

       {/* PAGE 6: AI INSIGHTS (Optional) */}
       {printInsights && insights && (
        <div className="a4-page">
          <div className="bg-black text-white px-4 py-2 mb-8">
            <h2 className="text-lg font-bold">{data.companyName}</h2>
            <p className="text-sm">{t.aiInsights}</p>
            <p className="text-xs italic">{t.aiHeaderSub}</p>
          </div>
          
          <div className="prose max-w-none text-justify text-black">
             <h3 className="text-xl font-bold text-black mb-4 border-b border-black pb-2">{t.execSummary}</h3>
             <div className="text-base leading-relaxed whitespace-pre-line">
                {insights}
             </div>

             <div className="mt-12 bg-gray-50 p-6 rounded border border-gray-200">
                <p className="text-xs text-gray-500 italic">
                  {t.aiDisclaimer}
                </p>
             </div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 text-center text-sm">6</div>
        </div>
      )}

    </div>
  );
};