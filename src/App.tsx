import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FinancialData, INITIAL_DATA, Language, OtherCompanyParticipation } from './types';
import { applyEquityAutoTotal, computeReport } from './lib/calculations';
import { clearDraft, hasSession, loadDraft, saveDraft, setSession } from './lib/draft';
import { generateFinancialInsights } from './services/insightsService';
import { listSavedCompanies, loadCompanyReport, saveCompanyReport, SavedCompanyEntry } from './services/blobReportService';
import Login from './components/Login';
import { AppHeader } from './components/layout/AppHeader';
import { ImportDialog } from './components/layout/ImportDialog';
import { EditorPanel } from './components/editor/EditorPanel';
import { ReportDocument } from './components/report/ReportDocument';
import { ScaledPreview } from './components/ui/ScaledPreview';
import { ConfirmDialog } from './components/ui/Dialog';
import { useToast } from './components/ui/Toast';
import { IconEdit, IconFile } from './components/ui/icons';

const buildReportDate = (lang: Language, year: string) => (lang === 'en' ? `December 31, ${year}` : `31 de Dezembro de ${year}`);

const errorMessage = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  action: () => void;
}

const snapshot = (d: FinancialData) => JSON.stringify(d);

const App: React.FC = () => {
  const notify = useToast();
  const [initialDraft] = useState(loadDraft);

  const [logged, setLogged] = useState(hasSession);
  const [data, setData] = useState<FinancialData>(initialDraft?.data ?? INITIAL_DATA);
  const [language, setLanguage] = useState<Language>(initialDraft?.language ?? 'pt');
  const [insights, setInsights] = useState<string | null>(initialDraft?.insights ?? null);
  const [printInsights, setPrintInsights] = useState(initialDraft?.printInsights ?? false);
  const [cloudSnapshot, setCloudSnapshot] = useState(initialDraft?.cloudSnapshot ?? snapshot(INITIAL_DATA));
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(initialDraft ? new Date(initialDraft.savedAt) : null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<SavedCompanyEntry[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importingKey, setImportingKey] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'report'>('editor');

  const totals = useMemo(() => computeReport(data), [data]);
  const dirty = useMemo(() => snapshot(data) !== cloudSnapshot, [data, cloudSnapshot]);

  const restoredNotified = useRef(false);
  useEffect(() => {
    if (logged && initialDraft && !restoredNotified.current) {
      restoredNotified.current = true;
      notify('Rascunho restaurado deste navegador.', 'info');
    }
  }, [logged, initialDraft, notify]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const savedAt = new Date();
      if (saveDraft({ data, language, insights, printInsights, cloudSnapshot, savedAt: savedAt.toISOString() })) {
        setDraftSavedAt(savedAt);
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [data, language, insights, printInsights, cloudSnapshot]);

  useEffect(() => {
    const original = document.title;
    const before = () => {
      document.title = `${data.companyName || 'Relatorio'} - ${language === 'en' ? 'Financial Statements' : 'Demonstracoes Financeiras'} ${data.year}`;
    };
    const after = () => {
      document.title = original;
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, [data.companyName, data.year, language]);

  const handleMoney = useCallback((field: keyof FinancialData, value: number) => {
    setData((prev) => applyEquityAutoTotal({ ...prev, [field]: value } as FinancialData));
  }, []);

  const handleText = useCallback(
    (field: keyof FinancialData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value } as FinancialData;
        if (field === 'year' && prev.reportDate === buildReportDate(language, prev.year)) {
          next.reportDate = buildReportDate(language, value);
        }
        return next;
      });
    },
    [language],
  );

  const handleToggle = useCallback((field: keyof FinancialData, value: boolean) => {
    setData((prev) => ({ ...prev, [field]: value }) as FinancialData);
  }, []);

  const handleParticipations = useCallback((items: OtherCompanyParticipation[]) => {
    setData((prev) => ({ ...prev, assetOtherCompanyParticipations: items }));
  }, []);

  const handleLanguageChange = (next: Language) => {
    if (next === language) return;
    setLanguage(next);
    if (insights) notify('Os insights foram descartados porque estavam no outro idioma. Gere novamente.', 'info');
    setInsights(null);
    setPrintInsights(false);
    setData((prev) => ({ ...prev, reportDate: buildReportDate(next, prev.year) }));
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const text = await generateFinancialInsights(data, language);
      setInsights(text);
      setPrintInsights(true);
      notify('Insights gerados. Revise o texto antes de imprimir.', 'success');
    } catch (error) {
      notify(errorMessage(error, 'Erro ao gerar insights.'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      setCompanies(await listSavedCompanies());
    } catch (error) {
      notify(errorMessage(error, 'Falha ao listar empresas salvas.'), 'error');
    } finally {
      setLoadingCompanies(false);
    }
  }, [notify]);

  const handleSave = async () => {
    if (!data.companyName.trim()) {
      notify('Informe o nome da empresa antes de salvar.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await saveCompanyReport(data.companyName, data);
      setCloudSnapshot(snapshot(data));
      notify(`"${data.companyName}" salva com sucesso.`, 'success');
      void refreshCompanies();
    } catch (error) {
      notify(errorMessage(error, 'Não foi possível salvar a empresa.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openImport = () => {
    setImportOpen(true);
    void refreshCompanies();
  };

  const importCompany = async (company: SavedCompanyEntry) => {
    setImportingKey(company.key);
    try {
      const saved = await loadCompanyReport(company.key);
      const merged = { ...INITIAL_DATA, ...saved.data };
      setData(merged);
      setCloudSnapshot(snapshot(merged));
      setInsights(null);
      setPrintInsights(false);
      setImportOpen(false);
      notify(`"${merged.companyName}" importada.`, 'success');
    } catch (error) {
      notify(errorMessage(error, 'Não foi possível importar a empresa selecionada.'), 'error');
    } finally {
      setImportingKey(null);
    }
  };

  const handleSelectCompany = (company: SavedCompanyEntry) => {
    if (!dirty) {
      void importCompany(company);
      return;
    }
    setConfirm({
      title: 'Substituir os dados atuais?',
      message: 'Há alterações não salvas na nuvem. Ao importar, os dados preenchidos agora serão substituídos.',
      confirmLabel: 'Importar mesmo assim',
      destructive: true,
      action: () => void importCompany(company),
    });
  };

  const resetReport = () => {
    const fresh = { ...INITIAL_DATA, reportDate: buildReportDate(language, INITIAL_DATA.year) };
    setData(fresh);
    setCloudSnapshot(snapshot(fresh));
    setInsights(null);
    setPrintInsights(false);
    clearDraft();
    notify('Novo relatório iniciado.', 'info');
  };

  const handleNew = () =>
    setConfirm({
      title: 'Começar um novo relatório?',
      message: dirty
        ? 'Os dados atuais não foram salvos na nuvem e serão apagados deste navegador.'
        : 'Os campos serão limpos. A empresa salva na nuvem não é afetada.',
      confirmLabel: 'Limpar e começar',
      destructive: dirty,
      action: resetReport,
    });

  const handleLogout = () => {
    setSession(false);
    setLogged(false);
  };

  if (!logged) {
    return (
      <Login
        onSuccess={() => {
          setSession(true);
          setLogged(true);
        }}
      />
    );
  }

  const report = <ReportDocument data={data} language={language} insights={insights} printInsights={printInsights} />;

  return (
    <div className="h-dvh flex flex-col">
      <AppHeader
        companyName={data.companyName}
        draftSavedAt={draftSavedAt}
        dirty={dirty}
        language={language}
        setLanguage={handleLanguageChange}
        onOpenImport={openImport}
        onSave={handleSave}
        isSaving={isSaving}
        onPrint={() => window.print()}
        onNew={handleNew}
        onLogout={handleLogout}
      />

      <nav className="lg:hidden bg-white border-b border-zinc-200 px-3 py-2" aria-label="Alternar visualização">
        <div className="grid grid-cols-2 rounded-xl bg-zinc-100 p-1 text-sm font-medium">
          {(
            [
              ['editor', 'Editor', <IconEdit size={15} key="e" />],
              ['report', 'Relatório', <IconFile size={15} key="r" />],
            ] as const
          ).map(([tab, label, icon]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              aria-pressed={mobileTab === tab}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-colors ${
                mobileTab === tab ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 min-h-0 flex">
        <aside
          className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-[500px] xl:w-[540px] shrink-0 overflow-y-auto scrollbar-thin bg-zinc-50 lg:border-r border-zinc-200`}
          aria-label="Editor de dados"
        >
          <EditorPanel
            data={data}
            totals={totals}
            language={language}
            onMoney={handleMoney}
            onText={handleText}
            onToggle={handleToggle}
            onParticipations={handleParticipations}
            insights={insights}
            onInsightsChange={setInsights}
            onGenerateInsights={handleGenerateInsights}
            isGenerating={isGenerating}
            printInsights={printInsights}
            setPrintInsights={setPrintInsights}
          />
        </aside>
        <div className={`${mobileTab === 'report' ? 'block' : 'hidden'} lg:block flex-1 min-w-0`} aria-label="Pré-visualização do relatório">
          <ScaledPreview>{report}</ScaledPreview>
        </div>
      </main>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        companies={companies}
        loading={loadingCompanies}
        importingKey={importingKey}
        onRefresh={refreshCompanies}
        onSelect={handleSelectCompany}
      />

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel ?? 'Confirmar'}
        destructive={confirm?.destructive}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm?.action;
          setConfirm(null);
          action?.();
        }}
      />

      {createPortal(<div className="print-only">{report}</div>, document.body)}
    </div>
  );
};

export default App;
