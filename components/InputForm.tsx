import React, { useEffect, useMemo, useState } from 'react';
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
  onSaveToBlob: () => void;
  isPersisting: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ 
  data, 
  language,
  setLanguage,
  onChange, 
  onGenerateInsights, 
  isGenerating,
  printInsights,
  setPrintInsights,
  onSaveToBlob,
  isPersisting
}) => {
  const numericFieldNames = useMemo(
    () =>
      new Set<keyof FinancialData>([
        'assetCashCurrent',
        'assetCashPrev',
        'assetLoansCurrent',
        'assetLoansPrev',
        'assetInvestmentsCurrent',
        'assetInvestmentsPrev',
        'assetTangibleCurrent',
        'assetTangiblePrev',
        'assetIntangibleCurrent',
        'assetIntangiblePrev',
        'assetOtherCurrent',
        'assetOtherPrev',
        'liabilityPayablesCurrent',
        'liabilityPayablesPrev',
        'liabilityLongTermCurrent',
        'liabilityLongTermPrev',
        'liabilityOtherCurrent',
        'liabilityOtherPrev',
        'equityCapitalSocialCurrent',
        'equityCapitalSocialPrev',
        'equityRetainedEarningsUntil2023Current',
        'equityRetainedEarningsUntil2023Prev',
        'equityRetainedEarnings2024Current',
        'equityRetainedEarnings2024Prev',
        'equityRetainedEarnings2025Current',
        'equityRetainedEarnings2025Prev',
        'equityProfitReserveCurrent',
        'equityProfitReservePrev',
        'equityTotalCurrent',
        'equityTotalPrev',
        'dreRevenueCurrent',
        'dreRevenuePrev',
        'dreCostOfSalesCurrent',
        'dreCostOfSalesPrev',
        'dreOperatingExpensesCurrent',
        'dreOperatingExpensesPrev',
        'dreOtherRevenuesDividendsCurrent',
        'dreOtherRevenuesDividendsPrev',
        'dreOtherRevenuesEquityPickupCurrent',
        'dreOtherRevenuesEquityPickupPrev',
        'dreOtherRevenuesFinancialIncomeCurrent',
        'dreOtherRevenuesFinancialIncomePrev',
        'dreOtherRevenuesMarketValueCurrent',
        'dreOtherRevenuesMarketValuePrev',
        'dreOtherExpensesCurrent',
        'dreOtherExpensesPrev',
        'dreIncomeTaxCurrent',
        'dreIncomeTaxPrev',
      ]),
    []
  );
  const [draftValues, setDraftValues] = useState<Partial<Record<keyof FinancialData, string>>>({});

  useEffect(() => {
    setDraftValues((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const fieldName of numericFieldNames) {
        if (!(fieldName in prev)) {
          continue;
        }

        const dataValue = data[fieldName];

        if (typeof dataValue !== 'number') {
          continue;
        }

        if (document.activeElement instanceof HTMLInputElement && document.activeElement.name === fieldName) {
          continue;
        }

        const normalizedDataValue = dataValue === 0 ? '0' : String(dataValue);
        if (prev[fieldName] === normalizedDataValue) {
          delete next[fieldName];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [data, numericFieldNames]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;
    const field = name as keyof FinancialData;

    if (type === 'checkbox') {
      onChange(field, checked);
      return;
    }

    if (numericFieldNames.has(field)) {
      const normalizedValue = value.replace(',', '.');

      if (!/^[-]?\d*[.]?\d*$/.test(normalizedValue)) {
        return;
      }

      setDraftValues((prev) => ({ ...prev, [field]: normalizedValue }));

      if (normalizedValue === '' || normalizedValue === '-' || normalizedValue === '.' || normalizedValue === '-.') {
        onChange(field, 0);
        return;
      }

      const parsedValue = Number(normalizedValue);
      if (!Number.isNaN(parsedValue)) {
        onChange(field, parsedValue);
      }
      return;
    }

    onChange(field, value);
  };

  const handleNumericBlur = (field: keyof FinancialData) => {
    setDraftValues((prev) => {
      const rawValue = prev[field];
      if (rawValue === undefined) {
        return prev;
      }

      const next = { ...prev };

      if (rawValue === '' || rawValue === '-' || rawValue === '.' || rawValue === '-.') {
        delete next[field];
        onChange(field, 0);
        return next;
      }

      const parsedValue = Number(rawValue);
      if (Number.isNaN(parsedValue)) {
        delete next[field];
        return next;
      }

      next[field] = parsedValue === 0 ? '0' : String(parsedValue);
      return next;
    });
  };

  const handleNumericFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.select();
    }
  };

  const getNumericValue = (field: keyof FinancialData) => {
    const draftValue = draftValues[field];
    if (draftValue !== undefined) {
      return draftValue;
    }

    const dataValue = data[field];
    return typeof dataValue === 'number' ? String(dataValue) : '';
  };

  const renderNumericInput = (field: keyof FinancialData, placeholder: string, disabled = false, className = '') => (
    <input
      type="text"
      inputMode="decimal"
      name={field}
      placeholder={placeholder}
      value={getNumericValue(field)}
      onChange={handleChange}
      onBlur={() => handleNumericBlur(field)}
      onFocus={handleNumericFocus}
      disabled={disabled}
      className={`block w-full border border-gray-300 rounded px-2 py-1 text-sm ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''} ${className}`.trim()}
    />
  );

  const hasCurrentAnalyticalValues =
    data.equityCapitalSocialCurrent +
      data.equityRetainedEarningsUntil2023Current +
      data.equityRetainedEarnings2024Current +
      data.equityRetainedEarnings2025Current +
      data.equityProfitReserveCurrent !==
    0;

  const hasPrevAnalyticalValues =
    data.equityCapitalSocialPrev +
      data.equityRetainedEarningsUntil2023Prev +
      data.equityRetainedEarnings2024Prev +
      data.equityRetainedEarnings2025Prev +
      data.equityProfitReservePrev !==
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
          {renderNumericInput('assetCashCurrent', 'Atual')}
          {renderNumericInput('assetCashPrev', 'Anterior')}
          
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Empréstimos e Recebíveis</label>
          {renderNumericInput('assetLoansCurrent', 'Atual')}
          {renderNumericInput('assetLoansPrev', 'Anterior')}
          
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Investimentos e Ativos Financeiros</label>
          {renderNumericInput('assetInvestmentsCurrent', 'Atual')}
          {renderNumericInput('assetInvestmentsPrev', 'Anterior')}
          
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Ativos Tangíveis (Imobilizado)</label>
          {renderNumericInput('assetTangibleCurrent', 'Atual')}
          {renderNumericInput('assetTangiblePrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Ativos Intangíveis</label>
          {renderNumericInput('assetIntangibleCurrent', 'Atual')}
          {renderNumericInput('assetIntangiblePrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Outros Ativos</label>
          {renderNumericInput('assetOtherCurrent', 'Atual')}
          {renderNumericInput('assetOtherPrev', 'Anterior')}
        </div>
      </div>

      {/* Passivos e PL */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-800 uppercase text-sm border-b border-gray-200 pb-1">Balanço: Passivos e PL (USD)</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1">Contas a Pagar</label>
          {renderNumericInput('liabilityPayablesCurrent', 'Atual')}
          {renderNumericInput('liabilityPayablesPrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Dívidas de Longo Prazo</label>
          {renderNumericInput('liabilityLongTermCurrent', 'Atual')}
          {renderNumericInput('liabilityLongTermPrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Outros Passivos</label>
          {renderNumericInput('liabilityOtherCurrent', 'Atual')}
          {renderNumericInput('liabilityOtherPrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Patrimônio Líquido (Shareholder's Equity)</label>

          <label className="block text-sm col-span-2 pl-2">Capital Social</label>
          {renderNumericInput('equityCapitalSocialCurrent', 'Atual')}
          {renderNumericInput('equityCapitalSocialPrev', 'Anterior')}

          <label className="block text-sm col-span-2 pl-2">Reserva de Lucros</label>
          {renderNumericInput('equityProfitReserveCurrent', 'Atual')}
          {renderNumericInput('equityProfitReservePrev', 'Anterior')}

          <label className="block text-sm col-span-2 pl-2">Lucros e Prejuízos até 2023</label>
          {renderNumericInput('equityRetainedEarningsUntil2023Current', 'Atual')}
          {renderNumericInput('equityRetainedEarningsUntil2023Prev', 'Anterior')}

          <label className="block text-sm col-span-2 pl-2">Lucros e Prejuízos 2024</label>
          {renderNumericInput('equityRetainedEarnings2024Current', 'Atual')}
          {renderNumericInput('equityRetainedEarnings2024Prev', 'Anterior')}

          <label className="block text-sm col-span-2 pl-2">Lucros e Prejuízos 2025</label>
          {renderNumericInput('equityRetainedEarnings2025Current', 'Atual')}
          {renderNumericInput('equityRetainedEarnings2025Prev', 'Anterior')}
          <label className="block text-sm font-bold col-span-2 pl-2">Total do Patrimônio Líquido</label>
          {renderNumericInput('equityTotalCurrent', 'Atual', hasCurrentAnalyticalValues)}
          {renderNumericInput('equityTotalPrev', 'Anterior', hasPrevAnalyticalValues)}
        </div>
      </div>

      {/* DRE */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-800 uppercase text-sm border-b border-gray-200 pb-1">DRE (Income Statement)</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1">Receita (Revenue)</label>
          {renderNumericInput('dreRevenueCurrent', 'Atual')}
          {renderNumericInput('dreRevenuePrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Custo das Vendas (Cost of Sales)</label>
          {renderNumericInput('dreCostOfSalesCurrent', 'Atual')}
          {renderNumericInput('dreCostOfSalesPrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Outras Receitas</label>

          <label className="block text-sm col-span-2 pl-2">Dividendos</label>
          {renderNumericInput('dreOtherRevenuesDividendsCurrent', 'Atual')}
          {renderNumericInput('dreOtherRevenuesDividendsPrev', 'Anterior')}

          <label className="block text-sm col-span-2 pl-2">Equivalência Patrimonial</label>
          {renderNumericInput('dreOtherRevenuesEquityPickupCurrent', 'Atual')}
          {renderNumericInput('dreOtherRevenuesEquityPickupPrev', 'Anterior')}

          <label className="block text-sm col-span-2 pl-2">Rendimento Apl. Financeira</label>
          {renderNumericInput('dreOtherRevenuesFinancialIncomeCurrent', 'Atual')}
          {renderNumericInput('dreOtherRevenuesFinancialIncomePrev', 'Anterior')}

          <label className="block text-sm col-span-2 pl-2">Valor de Mercado <span className="text-xs text-gray-500">(aceita negativo)</span></label>
          {renderNumericInput('dreOtherRevenuesMarketValueCurrent', 'Atual')}
          {renderNumericInput('dreOtherRevenuesMarketValuePrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Despesas Operacionais</label>
          {renderNumericInput('dreOperatingExpensesCurrent', 'Atual')}
          {renderNumericInput('dreOperatingExpensesPrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Outras Despesas</label>
          {renderNumericInput('dreOtherExpensesCurrent', 'Atual')}
          {renderNumericInput('dreOtherExpensesPrev', 'Anterior')}

          <label className="block text-sm font-bold col-span-2 bg-gray-50 p-1 mt-2">Despesa com impostos</label>
          {renderNumericInput('dreIncomeTaxCurrent', 'Atual')}
          {renderNumericInput('dreIncomeTaxPrev', 'Anterior')}
        </div>
      </div>

      {/* Salvar empresa */}
      <div className="mb-6 bg-blue-50 p-3 rounded border border-blue-200 space-y-2">
        <h3 className="font-semibold text-sm text-blue-900">Salvar empresa</h3>
        <p className="text-xs text-blue-800">Salva os dados preenchidos da empresa para reutilizar depois.</p>

        <button
          type="button"
          onClick={onSaveToBlob}
          disabled={isPersisting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:opacity-60"
        >
          {isPersisting ? 'Salvando...' : 'Salvar empresa'}
        </button>
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
