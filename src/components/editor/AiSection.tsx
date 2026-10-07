import React from 'react';
import { FinancialData, Language } from '../../types';
import { IconRefresh, IconSparkles, IconSpinner } from '../ui/icons';

interface AiSectionProps {
  data: FinancialData;
  language: Language;
  onText: (field: keyof FinancialData, value: string) => void;
  insights: string | null;
  onInsightsChange: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  printInsights: boolean;
  setPrintInsights: (v: boolean) => void;
}

export const AiSection: React.FC<AiSectionProps> = ({
  data,
  language,
  onText,
  insights,
  onInsightsChange,
  onGenerate,
  isGenerating,
  printInsights,
  setPrintInsights,
}) => (
  <div className="space-y-3.5 pt-3">
    <p className="text-xs text-zinc-500">
      Gera uma análise financeira automática em <strong className="font-medium text-zinc-700">{language === 'pt' ? 'Português' : 'English'}</strong>{' '}
      (idioma do relatório) usando apenas os números preenchidos.
    </p>

    <label className="block">
      <span className="field-label">Contexto para a IA</span>
      <select name="aiScenario" value={data.aiScenario} onChange={(e) => onText('aiScenario', e.target.value)} className="field-input pr-8">
        <option value="none">Sem observação específica</option>
        <option value="new_company">Empresa constituída no ano atual</option>
        <option value="closing_company">Empresa encerrou atividades no ano corrente</option>
        <option value="other">Outro contexto</option>
      </select>
    </label>

    <label className="block">
      <span className="field-label">Observações adicionais (opcional)</span>
      <textarea
        name="aiContextNotes"
        value={data.aiContextNotes}
        onChange={(e) => onText('aiContextNotes', e.target.value)}
        rows={3}
        placeholder="Ex: primeiro exercício operacional completo, operação encerrada em novembro etc."
        className="field-input h-auto py-2 resize-y"
      />
    </label>

    <button type="button" onClick={onGenerate} disabled={isGenerating} className="btn btn-primary w-full h-10">
      {isGenerating ? (
        <>
          <IconSpinner size={16} /> Analisando…
        </>
      ) : insights ? (
        <>
          <IconRefresh size={16} /> Gerar novamente
        </>
      ) : (
        <>
          <IconSparkles size={16} /> Gerar insights
        </>
      )}
    </button>

    {insights !== null && (
      <div className="space-y-2">
        <label className="block">
          <span className="field-label flex items-center justify-between">
            <span>Texto gerado (pode editar antes de imprimir)</span>
          </span>
          <textarea
            aria-label="Texto dos insights"
            value={insights}
            onChange={(e) => onInsightsChange(e.target.value)}
            rows={9}
            className="field-input h-auto py-2.5 text-[13px] leading-relaxed resize-y"
          />
        </label>
      </div>
    )}

    <label className="flex items-center gap-2.5 text-sm text-zinc-800 cursor-pointer select-none">
      <input
        type="checkbox"
        id="printInsights"
        checked={printInsights}
        onChange={(e) => setPrintInsights(e.target.checked)}
        className="size-4 rounded border-zinc-300 accent-zinc-900"
      />
      Incluir insights na impressão / PDF
    </label>
  </div>
);
