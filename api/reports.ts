import { list, put } from '@vercel/blob';

const REPORT_PREFIX = 'reports';

type Req = {
  method?: string;
  query?: { company?: string | string[] };
  body?: any;
};

type Res = {
  setHeader: (key: string, value: string) => void;
  status: (code: number) => { json: (body: any) => void };
};

const normalizeCompanyName = (input: string) =>
  input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'empresa-sem-nome';

const getBlobToken = () => {
  const token = process.env.REPORTBLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error('Variável REPORTBLOB_READ_WRITE_TOKEN não configurada neste ambiente (Preview/Production).');
  }

  return token;
};

const readJsonFromBlob = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao ler blob (${response.status})`);
  }

  return response.json();
};

const getCompanyQuery = (queryCompany: string | string[] | undefined): string => {
  if (Array.isArray(queryCompany)) {
    return queryCompany[0] || '';
  }

  return queryCompany || '';
};

export default async function handler(req: Req, res: Res) {
  try {
    const token = getBlobToken();

    if (req.method === 'GET') {
      const company = getCompanyQuery(req.query?.company);

      if (company) {
        const { blobs } = await list({ prefix: `${REPORT_PREFIX}/${company}/`, token });

        if (!blobs.length) {
          return res.status(404).json({ error: 'Nenhum relatório salvo para esta empresa.' });
        }

        const latestBlob = blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
        const report = await readJsonFromBlob(latestBlob.url);

        return res.status(200).json({ report });
      }

      const { blobs } = await list({ prefix: `${REPORT_PREFIX}/`, token });
      const latestByCompany = new Map<string, { companyName: string; latestSavedAt: string }>();

      for (const blob of blobs) {
        const parts = blob.pathname.split('/');
        const companyKey = parts[1];
        if (!companyKey) continue;

        const existing = latestByCompany.get(companyKey);
        if (!existing || new Date(existing.latestSavedAt).getTime() < blob.uploadedAt.getTime()) {
          latestByCompany.set(companyKey, {
            companyName: companyKey.replace(/-/g, ' '),
            latestSavedAt: blob.uploadedAt.toISOString(),
          });
        }
      }

      const items = Array.from(latestByCompany.entries())
        .map(([key, value]) => ({ key, ...value }))
        .sort((a, b) => b.latestSavedAt.localeCompare(a.latestSavedAt));

      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const companyName = String(body.companyName || '').trim();
      const report = body.report;

      if (!companyName || !report?.data) {
        return res.status(400).json({ error: 'companyName e report.data são obrigatórios.' });
      }

      const companyKey = normalizeCompanyName(companyName);
      const filename = `${REPORT_PREFIX}/${companyKey}/${Date.now()}.json`;

      await put(filename, JSON.stringify(report, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json; charset=utf-8',
        token,
      });

      return res.status(200).json({ ok: true, companyKey });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao processar persistência.';
    return res.status(500).json({ error: message });
  }
}
