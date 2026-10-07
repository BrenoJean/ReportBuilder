// services/insightsService.ts
import { FinancialData, Language } from "../types";

export const generateFinancialInsights = async (
  data: FinancialData,
  language: Language
): Promise<string> => {
  const response = await fetch("/api/generate-insights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, language }),
  });

  if (!response.ok) {
    let msg =
      language === "pt"
        ? "Erro ao gerar insights."
        : "Error generating insights.";

    try {
      const body = await response.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore JSON parse
    }

    throw new Error(msg);
  }

  const result = await response.json();
  return result.text as string;
};
