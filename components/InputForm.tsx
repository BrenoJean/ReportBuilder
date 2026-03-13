import React from 'react';
import { FinancialData, Language } from '../types';

interface InputFormProps {
  data: FinancialData;
  language: Language;
  setLanguage: (lang: Language) => void;
  onChange: (field: keyof FinancialData, value: string | number | boolean) => void;
  onGenerateInsights: () => void;
  isGenerating: boolean;
  printInsights: boolean;
  setPrintInsights: (val: boolean) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ 
  data, 
  language,
  setLanguage,
  onChange, 
  onGenerateInsights, 
  isGenerating,
  printInsights,
  setPrintInsights
}) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    onChange(
      name as keyof FinancialData, 
      type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    );
  };

  const hasCurrentAnalyticalValues =
    data.equityCapitalSocialCurrent +
      data.equityRetainedEarningsUntil2023Current +
      data.equityRetainedEarnings2024Current +
      data.equityRetainedEarnings2025Current !==
    0;

  const hasPrevAnalyticalValues =
    data.equityCapitalSocialPrev +
      data.equityRetainedEarningsUntil2023Prev +
      data.equityRetainedEarnings2024Prev +
      data.equityRetainedEarnings2025Prev !==
    0;

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg h-full overflow-y-auto">
      <div className="border-b pb-4 mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Editor de Dados</h2>
      </div>

      {/* Language Selector */}
      <div className="mb-6 bg-gray-50 p-3 rounded border border-gray-200">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Idioma do Relatório</label>
        <div className="flex gap-2">
          <button 
            onClick={() => setLanguage('pt')}
            className={`flex-1 py-1 px-3 text-sm rounded border ${language === 'pt' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            Português
          </button>
          <button 
            onClick={() => setLanguage('en')}
            className={`flex-1 py-1 px-3 text-sm rounded border ${language === 'en' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            English
          </button>
        </div>
      </div>
      
      {/* Dados Gerais */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-800 uppercase text-sm border-b border-gray-200 pb-1">Informações Gerais</h3>
        <div className="grid grid-cols-1 gap-3">
          <label className="block text-sm">
            Nome da Empresa
            <input type="text" name="companyName" value={data.companyName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-gray-500 focus:border-gray-500" />
          </label>
           <label className="block text-sm">
            Endereço (Opcional)
            <input type="text" name="companyAddress" value={data.companyAddress || ''} placeholder="Ex: Tortola, British Virgin Islands" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-gray-500 focus:border-gray-500" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">
              Ano Atual
              <input type="text" name="year" value={data.year} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </label>
            <label className="block text-sm">
              Ano Anterior
              <input type="text" name="prevYear" value={data.prevYear} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </label>
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox" 
              name="showPrevYear" 
              checked={data.showPrevYear} 
              onChange={handleChange}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Exibir coluna do Ano Anterior
            </label>
          </div>

          <label className="block text-sm">
            Data do Relatório
            <input type="text" name="reportDate" value={data.reportDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          </label>
           <label className="block text-sm">
            Nome do Diretor
            <input type="text" name="directorName" value={data.directorName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">
              Contador
              <input type="text" name="accountantName" value={data.accountantName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </label>
            <label className="block text-sm">
              CRC (RS)
              <input type="text" name="crcNumber" value={data.crcNumber} placeholder="RS-000000/O-0" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </label>
          </div>
        </div>
      </div>

      {/* Ativos */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-800 uppercase text-sm border-b border-gray-200 pb-1">Balanço: Ativos (USD)</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1">Caixa e Equivalentes</label>
          <input type="number" name="assetCashCurrent" placeholder="Atual" value={data.assetCashCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="assetCashPrev" placeholder="Anterior" value={data.assetCashPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Empréstimos e Recebíveis</label>
          <input type="number" name="assetLoansCurrent" placeholder="Atual" value={data.assetLoansCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="assetLoansPrev" placeholder="Anterior" value={data.assetLoansPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Investimentos e Ativos Financeiros</label>
          <input type="number" name="assetInvestmentsCurrent" placeholder="Atual" value={data.assetInvestmentsCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="assetInvestmentsPrev" placeholder="Anterior" value={data.assetInvestmentsPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Ativos Tangíveis (Imobilizado)</label>
          <input type="number" name="assetTangibleCurrent" placeholder="Atual" value={data.assetTangibleCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="assetTangiblePrev" placeholder="Anterior" value={data.assetTangiblePrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Ativos Intangíveis</label>
          <input type="number" name="assetIntangibleCurrent" placeholder="Atual" value={data.assetIntangibleCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="assetIntangiblePrev" placeholder="Anterior" value={data.assetIntangiblePrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Outros Ativos</label>
          <input type="number" name="assetOtherCurrent" placeholder="Atual" value={data.assetOtherCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="assetOtherPrev" placeholder="Anterior" value={data.assetOtherPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
        </div>
      </div>

      {/* Passivos e PL */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-800 uppercase text-sm border-b border-gray-200 pb-1">Balanço: Passivos e PL (USD)</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1">Contas a Pagar</label>
          <input type="number" name="liabilityPayablesCurrent" placeholder="Atual" value={data.liabilityPayablesCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="liabilityPayablesPrev" placeholder="Anterior" value={data.liabilityPayablesPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Dívidas de Longo Prazo</label>
          <input type="number" name="liabilityLongTermCurrent" placeholder="Atual" value={data.liabilityLongTermCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="liabilityLongTermPrev" placeholder="Anterior" value={data.liabilityLongTermPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Outros Passivos</label>
          <input type="number" name="liabilityOtherCurrent" placeholder="Atual" value={data.liabilityOtherCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="liabilityOtherPrev" placeholder="Anterior" value={data.liabilityOtherPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Patrimônio Líquido (Shareholder's Equity)</label>

          <label className="block text-sm col-span-2 pl-2">Capital Social</label>
          <input type="number" name="equityCapitalSocialCurrent" placeholder="Atual" value={data.equityCapitalSocialCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="equityCapitalSocialPrev" placeholder="Anterior" value={data.equityCapitalSocialPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm col-span-2 pl-2">Lucros e Prejuízos até 2023</label>
          <input type="number" name="equityRetainedEarningsUntil2023Current" placeholder="Atual" value={data.equityRetainedEarningsUntil2023Current} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="equityRetainedEarningsUntil2023Prev" placeholder="Anterior" value={data.equityRetainedEarningsUntil2023Prev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm col-span-2 pl-2">Lucros e Prejuízos 2024</label>
          <input type="number" name="equityRetainedEarnings2024Current" placeholder="Atual" value={data.equityRetainedEarnings2024Current} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="equityRetainedEarnings2024Prev" placeholder="Anterior" value={data.equityRetainedEarnings2024Prev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm col-span-2 pl-2">Lucros e Prejuízos 2025</label>
          <input type="number" name="equityRetainedEarnings2025Current" placeholder="Atual" value={data.equityRetainedEarnings2025Current} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="equityRetainedEarnings2025Prev" placeholder="Anterior" value={data.equityRetainedEarnings2025Prev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 pl-2">Total do Patrimônio Líquido</label>
          <input
            type="number"
            name="equityTotalCurrent"
            placeholder="Atual"
            value={data.equityTotalCurrent}
            onChange={handleChange}
            disabled={hasCurrentAnalyticalValues}
            className={`block w-full border border-gray-300 rounded px-2 py-1 text-sm ${hasCurrentAnalyticalValues ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
          />
          <input
            type="number"
            name="equityTotalPrev"
            placeholder="Anterior"
            value={data.equityTotalPrev}
            onChange={handleChange}
            disabled={hasPrevAnalyticalValues}
            className={`block w-full border border-gray-300 rounded px-2 py-1 text-sm ${hasPrevAnalyticalValues ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
          />
          <input type="number" name="equityTotalCurrent" placeholder="Atual" value={data.equityTotalCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="equityTotalPrev" placeholder="Anterior" value={data.equityTotalPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
        </div>
      </div>

      {/* DRE */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-800 uppercase text-sm border-b border-gray-200 pb-1">DRE (Income Statement)</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1">Receita (Revenue)</label>
          <input type="number" name="dreRevenueCurrent" placeholder="Atual" value={data.dreRevenueCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="dreRevenuePrev" placeholder="Anterior" value={data.dreRevenuePrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Custo das Vendas (Cost of Sales)</label>
          <input type="number" name="dreCostOfSalesCurrent" placeholder="Atual" value={data.dreCostOfSalesCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="dreCostOfSalesPrev" placeholder="Anterior" value={data.dreCostOfSalesPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Despesas Operacionais</label>
          <input type="number" name="dreOperatingExpensesCurrent" placeholder="Atual" value={data.dreOperatingExpensesCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="dreOperatingExpensesPrev" placeholder="Anterior" value={data.dreOperatingExpensesPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Outras Despesas</label>
          <input type="number" name="dreOtherExpensesCurrent" placeholder="Atual" value={data.dreOtherExpensesCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="dreOtherExpensesPrev" placeholder="Anterior" value={data.dreOtherExpensesPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Despesa com impostos</label>
          <input type="number" name="dreIncomeTaxCurrent" placeholder="Atual" value={data.dreIncomeTaxCurrent} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
          <input type="number" name="dreIncomeTaxPrev" placeholder="Anterior" value={data.dreIncomeTaxPrev} onChange={handleChange} className="block w-full border border-gray-300 rounded px-2 py-1 text-sm" />
        </div>
      </div>

      {/* IA Section */}
      <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Inteligência Artificial (Gemini)
        </h3>
        <p className="text-xs text-gray-600 mb-3">Gerar análise financeira automática ({language === 'pt' ? 'Português' : 'English'}).</p>

        <div className="space-y-2 mb-3">
          <label className="block text-xs font-semibold text-gray-700">
            Contexto para IA
            <select
              name="aiScenario"
              value={data.aiScenario}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="none">Sem observação específica</option>
              <option value="new_company">Empresa constituída no ano atual</option>
              <option value="closing_company">Empresa encerrou atividades no ano corrente</option>
              <option value="other">Outro contexto</option>
            </select>
          </label>

          <label className="block text-xs font-semibold text-gray-700">
            Observações adicionais (opcional)
            <textarea
              name="aiContextNotes"
              value={data.aiContextNotes}
              onChange={(e) => onChange('aiContextNotes', e.target.value)}
              rows={3}
              placeholder="Ex: primeiro exercício operacional completo, operação encerrada em novembro etc."
              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </label>
        </div>
        
        <button 
          onClick={onGenerateInsights}
          disabled={isGenerating}
          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50 text-sm flex justify-center items-center"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Analisando...
            </>
          ) : 'Gerar Insights'}
        </button>

        <div className="mt-4 flex items-center">
          <input 
            type="checkbox" 
            id="printInsights" 
            checked={printInsights} 
            onChange={(e) => setPrintInsights(e.target.checked)}
            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
          />
          <label htmlFor="printInsights" className="ml-2 block text-sm text-gray-900">
            Incluir Insights na Impressão/PDF
          </label>
        </div>
      </div>
    </div>
  );
};