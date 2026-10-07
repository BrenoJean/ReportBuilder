import React from 'react';
import { FinancialData, Language, OtherCompanyParticipation } from '../../types';
import { hasEquityAnalytical, ReportTotals } from '../../lib/calculations';
import { ASSET_GROUPS, EQUITY_GROUPS, INCOME_GROUPS, LIABILITY_GROUPS } from '../../lib/fields';
import { IconBuilding, IconSparkles } from '../ui/icons';
import { AiSection } from './AiSection';
import { BalanceCheck } from './BalanceCheck';
import { GeneralInfoSection } from './GeneralInfoSection';
import { BoundMoneyRow, MoneyChange, MoneyGroups } from './MoneyRow';
import { ParticipationsEditor } from './ParticipationsEditor';
import { SectionCard } from './SectionCard';

interface EditorPanelProps {
  data: FinancialData;
  totals: ReportTotals;
  language: Language;
  onMoney: MoneyChange;
  onText: (field: keyof FinancialData, value: string) => void;
  onToggle: (field: keyof FinancialData, value: boolean) => void;
  onParticipations: (items: OtherCompanyParticipation[]) => void;
  insights: string | null;
  onInsightsChange: (text: string) => void;
  onGenerateInsights: () => void;
  isGenerating: boolean;
  printInsights: boolean;
  setPrintInsights: (v: boolean) => void;
}

const Glyph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[11px] font-bold tracking-tight">{children}</span>
);

const AutoBadge = () => (
  <span className="ml-1 inline-flex items-center rounded-full bg-zinc-100 px-1.5 py-0.5 align-middle text-[10px] font-medium text-zinc-500">
    calculado
  </span>
);

export const EditorPanel: React.FC<EditorPanelProps> = ({
  data,
  totals,
  language,
  onMoney,
  onText,
  onToggle,
  onParticipations,
  insights,
  onInsightsChange,
  onGenerateInsights,
  isGenerating,
  printInsights,
  setPrintInsights,
}) => {
  const showPrev = data.showPrevYear;
  const equityAutoCurrent = hasEquityAnalytical(data, 'Current');
  const equityAutoPrev = hasEquityAnalytical(data, 'Prev');

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-3 px-3 sm:px-4 py-4">
        <SectionCard id="sec-general" title="Informações gerais" description={data.companyName || 'Empresa, anos e responsáveis'} icon={<IconBuilding size={16} />}>
          <GeneralInfoSection data={data} onText={onText} onToggle={onToggle} />
        </SectionCard>

        <SectionCard
          id="sec-assets"
          title="Ativo"
          description="Balanço patrimonial"
          icon={<Glyph>A</Glyph>}
          total={{ label: 'Total do ativo', current: totals.totalAssetsCurrent, prev: totals.totalAssetsPrev, showPrev }}
        >
          <MoneyGroups groups={ASSET_GROUPS} data={data} onChange={onMoney} />
          <ParticipationsEditor
            items={data.assetOtherCompanyParticipations}
            onChange={onParticipations}
            year={data.year}
            prevYear={data.prevYear}
            showPrev={showPrev}
          />
        </SectionCard>

        <SectionCard
          id="sec-liabilities"
          title="Passivo"
          description="Obrigações"
          icon={<Glyph>P</Glyph>}
          total={{ label: 'Total do passivo', current: totals.totalLiabilitiesCurrent, prev: totals.totalLiabilitiesPrev, showPrev }}
        >
          <MoneyGroups groups={LIABILITY_GROUPS} data={data} onChange={onMoney} />
        </SectionCard>

        <SectionCard
          id="sec-equity"
          title="Patrimônio líquido"
          description="Shareholder's equity"
          icon={<Glyph>PL</Glyph>}
          total={{ label: 'Total do PL', current: data.equityTotalCurrent, prev: data.equityTotalPrev, showPrev }}
        >
          <MoneyGroups groups={EQUITY_GROUPS} data={data} onChange={onMoney} />
          <div className="mt-1 border-t border-zinc-200">
            <BoundMoneyRow
              base="equityTotal"
              label="Total do Patrimônio Líquido"
              hint={
                equityAutoCurrent || equityAutoPrev
                  ? 'Soma automática das contas acima (Capital a Integralizar é subtraído)'
                  : 'Preencha direto ou use as contas analíticas acima'
              }
              data={data}
              onChange={onMoney}
              lockCurrent={equityAutoCurrent}
              lockPrev={equityAutoPrev}
              badge={equityAutoCurrent || equityAutoPrev ? <AutoBadge /> : null}
              strong
            />
          </div>
        </SectionCard>

        <SectionCard
          id="sec-income"
          title="Resultado (DRE)"
          description="Income statement"
          icon={<Glyph>R</Glyph>}
          total={{
            label: totals.isNetLoss ? 'Prejuízo líquido' : 'Lucro líquido',
            current: totals.netIncomeCurrent,
            prev: totals.netIncomePrev,
            showPrev,
          }}
        >
          <MoneyGroups groups={INCOME_GROUPS} data={data} onChange={onMoney} />
        </SectionCard>

        <SectionCard id="sec-ai" title="Inteligência artificial" description="Análise automática dos números" icon={<IconSparkles size={16} />}>
          <AiSection
            data={data}
            language={language}
            onText={onText}
            insights={insights}
            onInsightsChange={onInsightsChange}
            onGenerate={onGenerateInsights}
            isGenerating={isGenerating}
            printInsights={printInsights}
            setPrintInsights={setPrintInsights}
          />
        </SectionCard>
      </div>
      <div className="px-3 sm:px-4">
        <BalanceCheck data={data} totals={totals} />
      </div>
    </div>
  );
};
