import React, { useMemo, useState } from 'react';
import { SavedCompanyEntry } from '../../services/blobReportService';
import { Dialog } from '../ui/Dialog';
import { IconBuilding, IconRefresh, IconSearch, IconSpinner } from '../ui/icons';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  companies: SavedCompanyEntry[];
  loading: boolean;
  importingKey: string | null;
  onRefresh: () => void;
  onSelect: (company: SavedCompanyEntry) => void;
}

const dateFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, companies, loading, importingKey, onRefresh, onSelect }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return q ? companies.filter((c) => normalize(c.companyName).includes(q) || c.key.includes(q)) : companies;
  }, [companies, query]);

  return (
    <Dialog open={open} onClose={onClose} title="Importar empresa" description="Carrega o último relatório salvo da empresa escolhida." wide>
      <div className="flex gap-2 sticky top-0 bg-white pb-3">
        <label className="relative flex-1">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar empresa"
            aria-label="Buscar empresa"
            className="field-input pl-9"
          />
        </label>
        <button type="button" onClick={onRefresh} disabled={loading} className="btn btn-secondary btn-icon h-10 w-10" title="Atualizar lista">
          {loading ? <IconSpinner size={16} /> : <IconRefresh size={16} />}
        </button>
      </div>

      {loading && companies.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">Carregando…</p>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-zinc-600">{companies.length ? 'Nenhuma empresa encontrada.' : 'Nenhuma empresa salva ainda.'}</p>
          {!companies.length && import.meta.env.DEV && (
            <p className="mt-1 text-xs text-zinc-400">Salvar e importar funcionam no deploy da Vercel (Preview/Produção).</p>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 -mx-1">
          {filtered.map((company) => (
            <li key={company.key}>
              <button
                type="button"
                onClick={() => onSelect(company)}
                disabled={importingKey !== null}
                className="w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-zinc-50 disabled:opacity-60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  <IconBuilding size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-zinc-900 truncate capitalize">{company.companyName}</span>
                  <span className="block text-xs text-zinc-500">Salvo em {dateFmt.format(new Date(company.latestSavedAt))}</span>
                </span>
                {importingKey === company.key && <IconSpinner size={16} className="text-zinc-500" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
};
