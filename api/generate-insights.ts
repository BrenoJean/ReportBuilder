// api/generate-insights.ts
// Serverless function da Vercel usando Groq (LLaMA 3.3 70B)

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY env var" });
  }

  // Em algumas versões o body vem string, em outras objeto
  const body =
    typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const { data, language } = body;

  if (!data || !language) {
    return res.status(400).json({ error: "Missing data or language" });
  }

  try {
    const languageInstruction =
      language === "pt"
        ? "O texto DEVE ser escrito em Português do Brasil."
        : "The text MUST be written in English (Formal Business English).";

    // Totais para contexto da análise
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

    const grossProfitCurrent =
      data.dreRevenueCurrent - data.dreCostOfSalesCurrent;

    const totalExpensesCurrent =
      data.dreOperatingExpensesCurrent +
      data.dreOtherExpensesCurrent +
      data.dreIncomeTaxCurrent;

    const netIncomeCurrent = grossProfitCurrent - totalExpensesCurrent;

    const totalLiabilitiesCurrent =
      data.liabilityPayablesCurrent +
      data.liabilityLongTermCurrent +
      data.liabilityOtherCurrent;

    const prompt = `
Atue como um analista financeiro sênior da "Keep Gestão Contábil".

Analise os seguintes dados financeiros da empresa "${data.companyName}" para o ano de ${data.year} comparado a ${data.prevYear}:

Dados Balanço (em USD):
- Ativos Totais: ${totalAssetsCurrent} (Anterior: ${totalAssetsPrev})
- Caixa e Equivalentes: ${data.assetCashCurrent}
- Passivos Totais: ${totalLiabilitiesCurrent}
- Patrimônio Líquido: ${data.equityTotalCurrent}

Dados DRE (em USD):
- Receita: ${data.dreRevenueCurrent}
- Custo das Vendas: ${data.dreCostOfSalesCurrent}
- Lucro Bruto: ${grossProfitCurrent}
- Despesas Operacionais: ${data.dreOperatingExpensesCurrent}
- Outras despesas: ${data.dreOtherExpensesCurrent}
- Imposto de renda e contribuições: ${data.dreIncomeTaxCurrent}
- Lucro Líquido: ${netIncomeCurrent}

Gere 3 parágrafos concisos e profissionais de "Notas da Administração" ou "Insights Financeiros" para serem incluídos no relatório anual.
Foque em liquidez, rentabilidade e variação patrimonial entre ${data.prevYear} e ${data.year}.
Use um tom formal. Não use markdown, apenas texto puro separado por parágrafos.

${languageInstruction}
    `;

    // Chamada à Groq (API compatível com OpenAI)
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "Você é um analista financeiro sênior especializado em relatórios contábeis e análise de demonstrações financeiras.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errorBody);
      return res.status(500).json({
        error:
          language === "pt"
            ? `Erro ao conectar com a IA (Groq): ${errorBody}`
            : `Error connecting to AI (Groq): ${errorBody}`,
      });
    }

    const json = await groqResponse.json();

    const text =
      json.choices?.[0]?.message?.content ||
      (language === "pt"
        ? "Não foi possível gerar insights no momento."
        : "Could not generate insights at this time.");

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("Groq API Exception:", error);
    return res.status(500).json({
      error:
        language === "pt"
          ? `Erro ao conectar com a IA: ${error?.message || ""}`
          : `Error connecting to AI: ${error?.message || ""}`,
    });
  }
}
