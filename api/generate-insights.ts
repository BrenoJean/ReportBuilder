// api/generate-insights.ts
// Serverless function da Vercel usando Groq (GPT-OSS 120B)

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

type Lang = "pt" | "en";

const num = (value: unknown) => Number(value || 0);

const normalizeMarketValue = (value: number) => ({
  revenue: Math.max(value, 0),
  expense: Math.abs(Math.min(value, 0)),
});

const hasComparablePreviousYear = (data: any) => {
  if (!data?.showPrevYear) return false;

  const previousYearFields = [
    data.assetCashPrev,
    data.assetLoansPrev,
    data.assetInvestmentsPrev,
    data.assetTangiblePrev,
    data.assetIntangiblePrev,
    data.assetOtherPrev,
    ...(Array.isArray(data.assetOtherCompanyParticipations)
      ? data.assetOtherCompanyParticipations.map((p: any) => p?.prev)
      : []),
    data.liabilityPayablesPrev,
    data.liabilityLongTermPrev,
    data.liabilityOtherPrev,
    data.equityCapitalSocialPrev,
    data.equityRetainedEarningsUntil2023Prev,
    data.equityRetainedEarnings2024Prev,
    data.equityRetainedEarnings2025Prev,
    data.equityProfitReservePrev,
    data.equityTotalPrev,
    data.dreRevenuePrev,
    data.dreCostOfSalesPrev,
    data.dreOperatingExpensesPrev,
    data.dreOtherRevenuesDividendsPrev,
    data.dreOtherRevenuesEquityPickupPrev,
    data.dreOtherRevenuesFinancialIncomePrev,
    data.dreOtherRevenuesMarketValuePrev,
    data.dreOtherExpensesPrev,
    data.dreIncomeTaxPrev,
  ];

  return previousYearFields.some((value) => num(value) !== 0);
};

const getScenarioInstruction = (scenario: string, language: Lang) => {
  if (language === "pt") {
    if (scenario === "new_company") return "Empresa constituída no ano atual.";
    if (scenario === "closing_company") return "Empresa encerrou atividades no ano corrente.";
    if (scenario === "other") return "Há observações adicionais relevantes para a leitura dos dados.";
    return "";
  }
  if (scenario === "new_company") return "The company was incorporated in the current year.";
  if (scenario === "closing_company") return "The company ceased operations in the current year.";
  if (scenario === "other") return "There are additional notes relevant to interpreting the data.";
  return "";
};

// Rounded, human-readable amounts so the model never has to format or compute numbers.
export const formatMoney = (value: number, lang: Lang) => {
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const prefix = lang === "pt" ? "US$ " : "US$";
  const fmt = (n: number, digits: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(n);

  const big = (divisor: number, singular: string, plural: string, en: string) => {
    const rounded = Math.round((abs / divisor) * 10) / 10;
    return `${sign}${prefix}${fmt(rounded, 1)} ${lang === "pt" ? (rounded < 2 ? singular : plural) : en}`;
  };
  if (abs >= 999_950_000) return big(1_000_000_000, "bilhão", "bilhões", "billion");
  if (abs >= 999_950) return big(1_000_000, "milhão", "milhões", "million");
  if (abs >= 10_000) return `${sign}${prefix}${fmt(abs / 1_000, 1)} ${lang === "pt" ? "mil" : "thousand"}`;
  return `${sign}${prefix}${fmt(abs, 0)}`;
};

export const formatChange = (current: number, previous: number, lang: Lang): string | null => {
  if (previous === 0 || previous < 0 || current < 0) return null;
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const ratio = current / previous;
  if (ratio >= 4) {
    const times = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(ratio);
    return lang === "pt" ? `${times} vezes o valor anterior` : `${times} times the prior-year amount`;
  }
  const pct = (ratio - 1) * 100;
  const digits = Math.abs(pct) < 10 ? 1 : 0;
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(Math.abs(pct));
  if (formatted === "0") return lang === "pt" ? "estável" : "flat";
  return `${pct > 0 ? "+" : "-"}${formatted}%`;
};

const formatPct = (value: number, lang: Lang) =>
  `${new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", { maximumFractionDigits: Math.abs(value) < 10 ? 1 : 0 }).format(value)}%`;

interface Metric {
  section: string;
  label: string;
  current: number;
  previous: number;
}

export const buildFactSheet = (data: any, lang: Lang, withPrevious: boolean) => {
  const pt = lang === "pt";
  const participations: Array<{ name?: string; current?: number; prev?: number }> = Array.isArray(
    data.assetOtherCompanyParticipations,
  )
    ? data.assetOtherCompanyParticipations
    : [];
  const partCur = participations.reduce((s, p) => s + num(p.current), 0);
  const partPrev = participations.reduce((s, p) => s + num(p.prev), 0);

  const assetsCur =
    num(data.assetCashCurrent) + num(data.assetLoansCurrent) + num(data.assetInvestmentsCurrent) +
    num(data.assetTangibleCurrent) + num(data.assetIntangibleCurrent) + num(data.assetOtherCurrent) + partCur;
  const assetsPrev =
    num(data.assetCashPrev) + num(data.assetLoansPrev) + num(data.assetInvestmentsPrev) +
    num(data.assetTangiblePrev) + num(data.assetIntangiblePrev) + num(data.assetOtherPrev) + partPrev;
  const liabCur = num(data.liabilityPayablesCurrent) + num(data.liabilityLongTermCurrent) + num(data.liabilityOtherCurrent);
  const liabPrev = num(data.liabilityPayablesPrev) + num(data.liabilityLongTermPrev) + num(data.liabilityOtherPrev);

  const mvCur = normalizeMarketValue(num(data.dreOtherRevenuesMarketValueCurrent));
  const mvPrev = normalizeMarketValue(num(data.dreOtherRevenuesMarketValuePrev));
  const grossCur = num(data.dreRevenueCurrent) - num(data.dreCostOfSalesCurrent);
  const grossPrev = num(data.dreRevenuePrev) - num(data.dreCostOfSalesPrev);
  const otherRevCur =
    num(data.dreOtherRevenuesDividendsCurrent) + num(data.dreOtherRevenuesEquityPickupCurrent) +
    num(data.dreOtherRevenuesFinancialIncomeCurrent) + mvCur.revenue;
  const otherRevPrev =
    num(data.dreOtherRevenuesDividendsPrev) + num(data.dreOtherRevenuesEquityPickupPrev) +
    num(data.dreOtherRevenuesFinancialIncomePrev) + mvPrev.revenue;
  const expCur = num(data.dreOperatingExpensesCurrent) + num(data.dreOtherExpensesCurrent) + num(data.dreIncomeTaxCurrent) + mvCur.expense;
  const expPrev = num(data.dreOperatingExpensesPrev) + num(data.dreOtherExpensesPrev) + num(data.dreIncomeTaxPrev) + mvPrev.expense;
  const netCur = grossCur + otherRevCur - expCur;
  const netPrev = grossPrev + otherRevPrev - expPrev;

  const hasCostOfSales = num(data.dreCostOfSalesCurrent) !== 0 || (withPrevious && num(data.dreCostOfSalesPrev) !== 0);
  const totalRevenueCur = num(data.dreRevenueCurrent) + otherRevCur;

  const S = pt
    ? { assets: "ATIVO", liab: "PASSIVO E PATRIMÔNIO LÍQUIDO", result: "RESULTADO", ind: "INDICADORES" }
    : { assets: "ASSETS", liab: "LIABILITIES AND EQUITY", result: "RESULTS", ind: "INDICATORS" };

  const metrics: Metric[] = [
    { section: S.assets, label: pt ? "Total do ativo" : "Total assets", current: assetsCur, previous: assetsPrev },
    { section: S.assets, label: pt ? "Caixa e equivalentes" : "Cash and cash equivalents", current: num(data.assetCashCurrent), previous: num(data.assetCashPrev) },
    { section: S.assets, label: pt ? "Empréstimos a sócios" : "Loans to shareholders", current: num(data.assetLoansCurrent), previous: num(data.assetLoansPrev) },
    { section: S.assets, label: pt ? "Investimentos e ativos financeiros" : "Investments and financial assets", current: num(data.assetInvestmentsCurrent), previous: num(data.assetInvestmentsPrev) },
    { section: S.assets, label: pt ? "Ativos tangíveis" : "Tangible assets", current: num(data.assetTangibleCurrent), previous: num(data.assetTangiblePrev) },
    { section: S.assets, label: pt ? "Ativos intangíveis" : "Intangible assets", current: num(data.assetIntangibleCurrent), previous: num(data.assetIntangiblePrev) },
    { section: S.assets, label: pt ? "Outros ativos" : "Other assets", current: num(data.assetOtherCurrent), previous: num(data.assetOtherPrev) },
    { section: S.assets, label: pt ? "Participação em outras empresas (total)" : "Investments in other companies (total)", current: partCur, previous: partPrev },
    ...participations.map((p) => ({
      section: S.assets,
      label: `${pt ? "Participação em" : "Investment in"} ${p.name || (pt ? "empresa sem nome" : "unnamed company")}`,
      current: num(p.current),
      previous: num(p.prev),
    })),
    { section: S.liab, label: pt ? "Total do passivo" : "Total liabilities", current: liabCur, previous: liabPrev },
    { section: S.liab, label: pt ? "Contas a pagar" : "Accounts payable", current: num(data.liabilityPayablesCurrent), previous: num(data.liabilityPayablesPrev) },
    { section: S.liab, label: pt ? "Dívidas de longo prazo" : "Long-term debts", current: num(data.liabilityLongTermCurrent), previous: num(data.liabilityLongTermPrev) },
    { section: S.liab, label: pt ? "Outros passivos" : "Other liabilities", current: num(data.liabilityOtherCurrent), previous: num(data.liabilityOtherPrev) },
    { section: S.liab, label: pt ? "Patrimônio líquido" : "Shareholders' equity", current: num(data.equityTotalCurrent), previous: num(data.equityTotalPrev) },
    { section: S.result, label: pt ? "Receita operacional" : "Revenue", current: num(data.dreRevenueCurrent), previous: num(data.dreRevenuePrev) },
    { section: S.result, label: pt ? "Custo das vendas" : "Cost of sales", current: num(data.dreCostOfSalesCurrent), previous: num(data.dreCostOfSalesPrev) },
    ...(hasCostOfSales
      ? [{ section: S.result, label: pt ? "Lucro bruto" : "Gross profit", current: grossCur, previous: grossPrev }]
      : []),
    { section: S.result, label: pt ? "Outras receitas (total)" : "Other revenues (total)", current: otherRevCur, previous: otherRevPrev },
    { section: S.result, label: pt ? "Dividendos recebidos" : "Dividends received", current: num(data.dreOtherRevenuesDividendsCurrent), previous: num(data.dreOtherRevenuesDividendsPrev) },
    { section: S.result, label: pt ? "Equivalência patrimonial" : "Equity pickup", current: num(data.dreOtherRevenuesEquityPickupCurrent), previous: num(data.dreOtherRevenuesEquityPickupPrev) },
    { section: S.result, label: pt ? "Rendimento de aplicações financeiras" : "Financial income", current: num(data.dreOtherRevenuesFinancialIncomeCurrent), previous: num(data.dreOtherRevenuesFinancialIncomePrev) },
    { section: S.result, label: pt ? "Ganho de valor de mercado" : "Market value gain", current: mvCur.revenue, previous: mvPrev.revenue },
    { section: S.result, label: pt ? "Despesas totais" : "Total expenses", current: expCur, previous: expPrev },
    { section: S.result, label: pt ? "Despesas operacionais" : "Operating expenses", current: num(data.dreOperatingExpensesCurrent), previous: num(data.dreOperatingExpensesPrev) },
    { section: S.result, label: pt ? "Perda de valor de mercado" : "Market value loss", current: mvCur.expense, previous: mvPrev.expense },
    { section: S.result, label: pt ? "Outras despesas" : "Other expenses", current: num(data.dreOtherExpensesCurrent), previous: num(data.dreOtherExpensesPrev) },
    { section: S.result, label: pt ? "Impostos" : "Income tax", current: num(data.dreIncomeTaxCurrent), previous: num(data.dreIncomeTaxPrev) },
    {
      section: S.result,
      label: netCur < 0 ? (pt ? "Prejuízo líquido" : "Net loss") : pt ? "Lucro líquido" : "Net income",
      current: netCur,
      previous: netPrev,
    },
  ];

  const isTotal = (label: string) => /^(Total|Lucro|Prejuízo|Patrimônio|Net|Gross|Shareholders)/.test(label);
  const lines: string[] = [];
  let section = "";
  for (const m of metrics) {
    const relevant = m.current !== 0 || (withPrevious && m.previous !== 0);
    if (!relevant && !isTotal(m.label)) continue;
    if (m.section !== section) {
      section = m.section;
      lines.push("", section);
    }
    let line = `- ${m.label}: ${data.year} = ${formatMoney(m.current, lang)}`;
    if (withPrevious) {
      line += `; ${data.prevYear} = ${formatMoney(m.previous, lang)}`;
      const change = formatChange(m.current, m.previous, lang);
      if (change) line += `; ${pt ? "variação" : "change"} = ${change}`;
    }
    lines.push(line);
  }

  const indicators: string[] = [];
  const ratio = (label: string, a: number, b: number) => {
    if (b > 0) indicators.push(`- ${label}: ${formatPct((a / b) * 100, lang)}`);
  };
  if (hasCostOfSales) ratio(pt ? `Margem bruta ${data.year}` : `Gross margin ${data.year}`, grossCur, num(data.dreRevenueCurrent));
  ratio(
    pt ? `Margem líquida ${data.year} (resultado / receitas totais)` : `Net margin ${data.year} (net result / total revenues)`,
    netCur,
    totalRevenueCur,
  );
  ratio(pt ? `Passivos sobre o ativo ${data.year}` : `Liabilities to assets ${data.year}`, liabCur, assetsCur);
  ratio(
    pt ? `Participação das outras receitas no total de receitas ${data.year}` : `Other revenues as share of total revenues ${data.year}`,
    otherRevCur,
    totalRevenueCur,
  );
  if (indicators.length) lines.push("", S.ind, ...indicators);

  return lines.join("\n").trim();
};

const buildPrompt = (data: any, lang: Lang, withPrevious: boolean, facts: string, scenario: string, notes: string) => {
  const comparison = withPrevious
    ? ` comparando com ${data.prevYear}`
    : `. Não há ano anterior comparável: não faça comparações com ${data.prevYear} nem cite variações`;
  return `Escreva o resumo executivo das demonstrações financeiras de ${data.companyName} referentes a ${data.year}${comparison}.

COMO ESCREVER
- Exatamente 3 parágrafos de texto corrido, separados por uma linha em branco. Sem títulos, listas, markdown ou negrito.
- Parágrafo 1, posição patrimonial: tamanho e composição do ativo, nível de passivos e patrimônio líquido.
- Parágrafo 2, desempenho: receitas, principais despesas e resultado líquido.
- Parágrafo 3, leitura final para o cliente: o que o conjunto dos números indica e eventuais pontos de atenção. No máximo um número neste parágrafo.
- Tom profissional e acessível, como uma carta do contador ao cliente. Varie o tamanho das frases e use conectores naturais.
- No máximo 2 números por frase e 5 por parágrafo. Cite só o que for material; não percorra todas as linhas.
- Use os valores exatamente como aparecem nos dados abaixo (já arredondados e formatados). Não recalcule, não converta moedas e não crie números ou percentuais que não estejam nos dados.
- Interprete com prudência ("indica", "sugere", "reflete"), sem atribuir causas que não estejam nos dados ou no contexto informado.
- Linhas sem valor foram omitidas. Não comente ausência de contas, exceto se o total do passivo for zero.

DADOS (US$)
${facts}

CONTEXTO INFORMADO PELO CONTADOR
- Cenário: ${scenario || "não informado"}
- Observações: ${notes || "nenhuma"}

${lang === "pt" ? "Escreva em português do Brasil." : "Write in formal business English. Keep the amounts exactly as given in the data."}`;
};

// gpt-oss uses narrow no-break spaces and non-breaking hyphens that render badly in justified text.
export const cleanInsightText = (text: string) =>
  text
    .replace(/[\u00A0\u202F\u2007\u2009\u200A]/g, " ")
    .replace(/[\u2010\u2011]/g, "-")
    .replace(/(\d) +%/g, "$1%")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    // drop a stray title line such as "Resumo Executivo"
    .replace(/^(resumo executivo|resumo|executive summary|summary|insights|análise)[^\n]{0,30}\n\n/i, "");

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
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const { data } = body;
  const language: Lang = body.language === "en" ? "en" : "pt";

  if (!data || !body.language) {
    return res.status(400).json({ error: "Missing data or language" });
  }

  const withPrevious = hasComparablePreviousYear(data);
  const facts = buildFactSheet(data, language, withPrevious);
  const prompt = buildPrompt(
    data,
    language,
    withPrevious,
    facts,
    getScenarioInstruction(data.aiScenario || "none", language),
    String(data.aiContextNotes || "").trim(),
  );

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "Você é um contador sênior da Keep Gestão Contábil que escreve resumos executivos claros e elegantes para clientes. É rigoroso: usa somente os números fornecidos, já calculados e formatados, e nunca faz contas próprias.",
          },
          { role: "user", content: prompt },
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
    const raw: string = json.choices?.[0]?.message?.content || "";
    const text =
      cleanInsightText(raw) ||
      (language === "pt" ? "Não foi possível gerar insights no momento." : "Could not generate insights at this time.");

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
