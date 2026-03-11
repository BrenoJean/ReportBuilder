import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FinancialData, INITIAL_DATA, Language } from './types';
import { InputForm } from './components/InputForm';
import { ReportPreview } from './components/ReportPreview';
import { generateFinancialInsights } from './services/geminiService';
import Login from "./components/Login"; // ✅ import correto

const App: React.FC = () => {
  const [logged, setLogged] = useState(false);
  const [data, setData] = useState<FinancialData>(INITIAL_DATA);
  const [language, setLanguage] = useState<Language>('pt');
  const [insights, setInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printInsights, setPrintInsights] = useState(false);

  const handleDataChange = (field: keyof FinancialData, value: string | number | boolean) => {
    setData(prev => {
      const next = { ...prev, [field]: value } as FinancialData;

      const equityAnalyticalCurrentSum =
        next.equityCapitalSocialCurrent +
        next.equityRetainedEarningsUntil2023Current +
        next.equityRetainedEarnings2024Current +
        next.equityRetainedEarnings2025Current;

      const equityAnalyticalPrevSum =
        next.equityCapitalSocialPrev +
        next.equityRetainedEarningsUntil2023Prev +
        next.equityRetainedEarnings2024Prev +
        next.equityRetainedEarnings2025Prev;

      const hasCurrentAnalyticalValues = equityAnalyticalCurrentSum !== 0;
      const hasPrevAnalyticalValues = equityAnalyticalPrevSum !== 0;

      if (hasCurrentAnalyticalValues) {
        next.equityTotalCurrent = equityAnalyticalCurrentSum;
      }

      if (hasPrevAnalyticalValues) {
        next.equityTotalPrev = equityAnalyticalPrevSum;
      }

      return next;
    });
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFinancialInsights(data, language);
      setInsights(result);
      setPrintInsights(true); // Auto-enable print check when generated
    } catch (error) {
      alert("Erro ao gerar insights. Verifique sua chave de API.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

    if (!logged) {
    return <Login onSuccess={() => setLogged(true)} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col print:bg-white print:h-auto">
      {/* Header - Hidden on Print */}
      <header className="bg-black text-white shadow-md p-4 flex justify-between items-center print:hidden sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black font-bold flex items-center justify-center rounded">K</div>
          <h1 className="text-lg font-bold">Keep Gestão Contábil <span className="font-normal opacity-75">| Report Builder</span></h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Imprimir / Salvar PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden print:h-auto print:overflow-visible print:block">
        
        {/* Editor Sidebar - Hidden on Print */}
        <div className="w-full md:w-1/3 lg:w-1/4 h-full border-r border-gray-300 print:hidden overflow-y-auto">
          <InputForm 
            data={data} 
            language={language}
            setLanguage={setLanguage}
            onChange={handleDataChange} 
            onGenerateInsights={handleGenerateInsights}
            isGenerating={isGenerating}
            printInsights={printInsights}
            setPrintInsights={setPrintInsights}
          />
        </div>

        {/* Live Preview / Print Area */}
        <div className="w-full md:w-2/3 lg:w-3/4 h-full bg-gray-600 overflow-y-auto p-8 print:p-0 print:w-full print:h-auto print:bg-white print:overflow-visible">
           <div className="mx-auto max-w-[210mm] print:max-w-none">
             <ReportPreview 
              data={data} 
              language={language}
              insights={insights}
              printInsights={printInsights} 
            />
           </div>
        </div>
      </main>
    </div>
  );
};

// Render Logic
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
