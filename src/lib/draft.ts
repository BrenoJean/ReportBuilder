import { FinancialData, INITIAL_DATA, Language } from '../types';

const DRAFT_KEY = 'keep-report-builder:draft';
const SESSION_KEY = 'keep-report-builder:session';

export interface Draft {
  data: FinancialData;
  language: Language;
  insights: string | null;
  printInsights: boolean;
  savedAt: string;
  cloudSnapshot?: string;
}

export const loadDraft = (): Draft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (!parsed?.data) return null;
    return {
      data: { ...INITIAL_DATA, ...parsed.data },
      language: parsed.language === 'en' ? 'en' : 'pt',
      insights: typeof parsed.insights === 'string' ? parsed.insights : null,
      printInsights: Boolean(parsed.printInsights),
      savedAt: parsed.savedAt ?? new Date().toISOString(),
      cloudSnapshot: typeof parsed.cloudSnapshot === 'string' ? parsed.cloudSnapshot : undefined,
    };
  } catch {
    return null;
  }
};

export const saveDraft = (draft: Draft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // storage unavailable
  }
};

export const hasSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

export const setSession = (active: boolean) => {
  try {
    if (active) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // storage unavailable
  }
};
