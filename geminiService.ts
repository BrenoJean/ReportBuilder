import { GoogleGenAI } from "@google/genai";
import { FinancialData, Language } from "../types";

export const generateFinancialInsights = async (data: FinancialData, language: Language): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your settings.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const languageInstruction = language === 'pt' 
    ? "O texto DEVE ser escrito em Português do Brasil." 
    : "The text MUST be written in English (Formal Business English).";

  // Calculate totals for prompt context
  const totalAssetsCurrent = data.assetCashCurrent + data.assetLoansCurrent + data.assetInvestmentsCurrent + data.assetTangibleCurrent + data.assetIntangibleCurrent + data.assetOtherCurrent;
  const totalAssetsPrev = data.assetCashPrev + data.assetLoansPrev + data.assetInvestmentsPrev + data.assetTangiblePrev + data.assetIntangiblePrev + data.assetOtherPrev;
  
  const grossProfitCurrent = data.dreRevenueCurrent - data.dreCostOfSalesCurrent;
  const totalExpensesCurrent = data.dreOperatingExpensesCurrent + data.dreOtherExpensesCurrent + data.dreIncomeTaxCurrent;
  const netIncomeCurrent = grossProfitCurrent - totalExpensesCurrent;

  const prompt = `
    Atue como um analista financeiro sênior da "Keep Gestão Contábil".
    
    Analise os seguintes dados financeiros da empresa "${data.companyName}" para o ano de ${data.year} comparado a ${data.prevYear}:
    
    Dados Balanço (em USD):
    - Ativos Totais: ${totalAssetsCurrent} (Anterior: ${totalAssetsPrev})
    - Caixa e Equivalentes: ${data.assetCashCurrent}
    - Passivos Totais: ${data.liabilityPayablesCurrent + data.liabilityLongTermCurrent + data.liabilityOtherCurrent}
    - Patrimônio Líquido: ${data.equityTotalCurrent}
    
    Dados DRE (em USD):
    - Receita: ${data.dreRevenueCurrent}
    - Custo das Vendas: ${data.dreCostOfSalesCurrent}
    - Lucro Bruto: ${grossProfitCurrent}
    - Despesas Operacionais: ${data.dreOperatingExpensesCurrent}
    - Lucro Líquido: ${netIncomeCurrent}
    
    Gere 3 parágrafos concisos e profissionais de "Notas da Administração" ou "Insights Financeiros" para serem incluídos no relatório anual.
    Foque na liquidez, rentabilidade e variação patrimonial.
    Use um tom formal. Não use markdown, apenas texto puro separado por parágrafos.
    
    ${languageInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || (language === 'pt' ? "Não foi possível gerar insights no momento." : "Could not generate insights at this time.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(language === 'pt' ? "Erro ao conectar com a IA." : "Error connecting to AI.");
  }
};