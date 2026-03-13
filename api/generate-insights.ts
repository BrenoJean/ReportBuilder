// api/generate-insights.ts
// Serverless function da Vercel usando Groq (LLaMA 3.3 70B)

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));

const hasComparablePreviousYear = (data: any) => {
  if (!data?.showPrevYear) return false;

  const previousYearFields = [
    data.assetCashPrev,
    data.assetLoansPrev,
    data.assetInvestmentsPrev,
    data.assetTangiblePrev,
    data.assetIntangiblePrev,
    data.assetOtherPrev,
    data.liabilityPayablesPrev,
    data.liabilityLongTermPrev,
    data.liabilityOtherPrev,
    data.equityCapitalSocialPrev,
    data.equityRetainedEarningsUntil2023Prev,
    data.equityRetainedEarnings2024Prev,
    data.equityRetainedEarnings2025Prev,
    data.equityTotalPrev,
    data.dreRevenuePrev,
    data.dreCostOfSalesPrev,
    data.dreOperatingExpensesPrev,
    data.dreOtherExpensesPrev,
    data.dreIncomeTaxPrev,
  ];

  return previousYearFields.some((value) => Number(value || 0) !== 0);
};

const getScenarioInstruction = (scenario: string, language: string) => {
  if (language === "pt") {
    if (scenario === "new_company") return "Contexto declarado: empresa constituída no ano atual.";
    if (scenario === "closing_company") return "Contexto declarado: empresa encerrou atividades no ano corrente.";
    if (scenario === "other") return "Contexto declarado: há observações adicionais relevantes para leitura dos dados.";
    return "";
  }

  if (scenario === "new_company") return "Declared context: company was incorporated in the current year.";
  if (scenario === "closing_company") return "Declared context: company ceased operations in the current year.";
  if (scenario === "other") return "Declared context: there are additional relevant notes for interpreting the data.";
  return "";
};

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

  const hasPreviousYearData = hasComparablePreviousYear(data);
  const scenarioInstruction = getScenarioInstruction(data.aiScenario || "none", language);
  const additionalContext = String(data.aiContextNotes || "").trim();

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
    const grossProfitPrev = data.dreRevenuePrev - data.dreCostOfSalesPrev;

    const totalExpensesCurrent =
      data.dreOperatingExpensesCurrent +
      data.dreOtherExpensesCurrent +
      data.dreIncomeTaxCurrent;
    const totalExpensesPrev =
      data.dreOperatingExpensesPrev +
      data.dreOtherExpensesPrev +
      data.dreIncomeTaxPrev;

    const netIncomeCurrent = grossProfitCurrent - totalExpensesCurrent;
    const netIncomePrev = grossProfitPrev - totalExpensesPrev;

    const totalLiabilitiesCurrent =
      data.liabilityPayablesCurrent +
      data.liabilityLongTermCurrent +
      data.liabilityOtherCurrent;
    const totalLiabilitiesPrev =
      data.liabilityPayablesPrev +
      data.liabilityLongTermPrev +
      data.liabilityOtherPrev;

    const dataset = {
      years: { current: data.year, previous: data.prevYear },
      balanceSheet: {
        assets: {
          total: { current: totalAssetsCurrent, previous: totalAssetsPrev },
          cash: { current: data.assetCashCurrent, previous: data.assetCashPrev },
          loans: { current: data.assetLoansCurrent, previous: data.assetLoansPrev },
          investments: { current: data.assetInvestmentsCurrent, previous: data.assetInvestmentsPrev },
          tangible: { current: data.assetTangibleCurrent, previous: data.assetTangiblePrev },
          intangible: { current: data.assetIntangibleCurrent, previous: data.assetIntangiblePrev },
          other: { current: data.assetOtherCurrent, previous: data.assetOtherPrev },
        },
        liabilities: {
          total: { current: totalLiabilitiesCurrent, previous: totalLiabilitiesPrev },
        },
        equity: {
          total: { current: data.equityTotalCurrent, previous: data.equityTotalPrev },
        },
      },
      incomeStatement: {
        revenue: { current: data.dreRevenueCurrent, previous: data.dreRevenuePrev },
        costOfSales: { current: data.dreCostOfSalesCurrent, previous: data.dreCostOfSalesPrev },
        grossProfit: { current: grossProfitCurrent, previous: grossProfitPrev },
        operatingExpenses: { current: data.dreOperatingExpensesCurrent, previous: data.dreOperatingExpensesPrev },
        otherExpenses: { current: data.dreOtherExpensesCurrent, previous: data.dreOtherExpensesPrev },
        incomeTax: { current: data.dreIncomeTaxCurrent, previous: data.dreIncomeTaxPrev },
        totalExpenses: { current: totalExpensesCurrent, previous: totalExpensesPrev },
        netIncome: { current: netIncomeCurrent, previous: netIncomePrev },
      },
    };

    const prompt = `
Atue como analista financeiro sênior da Keep Gestão Contábil.

Tarefa: produzir 3 parágrafos de insights financeiros para ${data.companyName}, sobre o ano ${data.year}${hasPreviousYearData ? ` e comparando com ${data.prevYear}` : ''}.

REGRAS OBRIGATÓRIAS (não descumprir):
1) Use SOMENTE os números do dataset abaixo. Não invente valores, percentuais, causas, tendências ou contexto externo.
2) Sempre que citar variação, calcule com base exclusiva nos dados informados.
3) Priorize comentar linhas com valores NÃO zero e materialidade mais alta; não foque em linhas zeradas.
4) Se algum ponto não puder ser concluído pelos dados, diga explicitamente: "não é possível concluir com os dados disponíveis".
5) Não afirmar ausência total de passivos, crescimento patrimonial, reinvestimento, liquidez confortável ou qualquer conclusão qualitativa sem suporte numérico explícito.
6) Cite números com 2 casas decimais.
7) Não use markdown, listas ou títulos. Apenas texto corrido em 3 parágrafos.
8) ${hasPreviousYearData ? `Há dados válidos para ${data.prevYear}; comparações são permitidas quando sustentadas.` : `Não há base comparativa válida de ano anterior. NÃO faça comparações com ${data.prevYear}, NÃO fale em variação percentual e foque exclusivamente no desempenho e estrutura de ${data.year}.`}

Resumo numérico rápido (USD):
- Ativos totais: ${fmt(totalAssetsCurrent)} (anterior: ${fmt(totalAssetsPrev)})
- Passivos totais: ${fmt(totalLiabilitiesCurrent)} (anterior: ${fmt(totalLiabilitiesPrev)})
- Patrimônio líquido: ${fmt(data.equityTotalCurrent)} (anterior: ${fmt(data.equityTotalPrev)})
- Receita: ${fmt(data.dreRevenueCurrent)} (anterior: ${fmt(data.dreRevenuePrev)})
- Lucro líquido: ${fmt(netIncomeCurrent)} (anterior: ${fmt(netIncomePrev)})

Dataset completo (JSON):
${JSON.stringify(dataset)}

Contexto adicional informado pelo usuário:
- Cenário: ${scenarioInstruction || (language === "pt" ? "não informado" : "not provided")}
- Observações: ${additionalContext || (language === "pt" ? "nenhuma" : "none")}

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
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "Você é um analista financeiro sênior extremamente rigoroso com precisão numérica. Nunca invente números, nunca extrapole sem base e destaque apenas conclusões suportadas pelos dados recebidos.",
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
