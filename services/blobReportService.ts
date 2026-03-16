import { FinancialData } from '../types';

interface SavedReportEnvelope {
  schemaVersion: number;
  savedAt: string;
  data: FinancialData;
}

interface SavePayload {
  companyName: string;
  report: SavedReportEnvelope;
}

export interface SavedCompanyEntry {
  key: string;
  companyName: string;
  latestSavedAt: string;
}

const API_BASE = '/api/reports';

export const REPORT_SCHEMA_VERSION = 1;

export const buildEvolvingReport = (data: FinancialData): SavedReportEnvelope => ({
  schemaVersion: REPORT_SCHEMA_VERSION,
  savedAt: new Date().toISOString(),
  data,
});

export const saveCompanyReport = async (companyName: string, data: FinancialData): Promise<void> => {
  const payload: SavePayload = {
    companyName,
    report: buildEvolvingReport(data),
  };

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || 'Falha ao salvar JSON no Blob.');
  }
};

export const listSavedCompanies = async (): Promise<SavedCompanyEntry[]> => {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || 'Falha ao listar empresas salvas.');
  }

  const body = await response.json();
  return body.items as SavedCompanyEntry[];
};

export const loadCompanyReport = async (companyKey: string): Promise<SavedReportEnvelope> => {
  const response = await fetch(`${API_BASE}?company=${encodeURIComponent(companyKey)}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || 'Falha ao carregar JSON da empresa.');
  }

  const body = await response.json();
  return body.report as SavedReportEnvelope;
};
