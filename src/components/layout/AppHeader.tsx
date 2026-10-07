import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../../types';
import { IconFile, IconImport, IconLogout, IconMore, IconPrinter, IconSave, IconSpinner } from '../ui/icons';

interface AppHeaderProps {
  companyName: string;
  draftSavedAt: Date | null;
  dirty: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenImport: () => void;
  onSave: () => void;
  isSaving: boolean;
  onPrint: () => void;
  onNew: () => void;
  onLogout: () => void;
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const AppHeader: React.FC<AppHeaderProps> = ({
  companyName,
  draftSavedAt,
  dirty,
  language,
  setLanguage,
  onOpenImport,
  onSave,
  isSaving,
  onPrint,
  onNew,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 text-white">
      <div className="flex h-14 items-center gap-2 sm:gap-3 px-3 sm:px-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-950 text-sm font-black">K</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">
              <span className="hidden md:inline text-white/60 font-normal">Keep · </span>
              {companyName || 'Report Builder'}
            </p>
            <p className="text-[11px] leading-tight text-white/50 truncate" aria-live="polite">
              {dirty ? 'Alterações não salvas na nuvem' : 'Sincronizado com a nuvem'}
              {draftSavedAt && <span className="hidden sm:inline"> · rascunho {timeFmt.format(draftSavedAt)}</span>}
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex rounded-lg bg-white/10 p-0.5 text-xs font-semibold" role="group" aria-label="Idioma do relatório">
          {(['pt', 'en'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              aria-pressed={language === lang}
              className={`rounded-md px-2.5 py-1.5 uppercase transition-colors ${language === lang ? 'bg-white text-zinc-950' : 'text-white/70 hover:text-white'}`}
            >
              {lang}
            </button>
          ))}
        </div>

        <button type="button" onClick={onOpenImport} className="btn h-9 px-2.5 sm:px-3 text-white/90 hover:bg-white/10" title="Importar empresa salva">
          <IconImport size={17} />
          <span className="hidden lg:inline">Importar</span>
        </button>
        <button type="button" onClick={onSave} disabled={isSaving} className="btn h-9 px-2.5 sm:px-3 text-white/90 hover:bg-white/10" title="Salvar empresa na nuvem">
          {isSaving ? <IconSpinner size={17} /> : <IconSave size={17} />}
          <span className="hidden lg:inline">{isSaving ? 'Salvando…' : 'Salvar'}</span>
          {dirty && !isSaving && <span className="size-1.5 rounded-full bg-amber-400" aria-hidden="true" />}
        </button>
        <button type="button" onClick={onPrint} className="btn h-9 px-2.5 sm:px-3.5 bg-white text-zinc-950 hover:bg-zinc-200" title="Imprimir ou salvar PDF">
          <IconPrinter size={17} />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="btn btn-icon h-9 text-white/80 hover:bg-white/10"
            title="Mais opções"
          >
            <IconMore size={18} />
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-60 rounded-xl bg-white text-zinc-900 shadow-xl ring-1 ring-zinc-200 p-1.5 text-sm">
              <div className="sm:hidden px-2.5 pt-1.5 pb-2">
                <p className="text-[11px] font-medium text-zinc-500 mb-1.5">Idioma do relatório</p>
                <div className="inline-flex w-full rounded-lg bg-zinc-100 p-0.5 text-xs font-semibold">
                  {(['pt', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      aria-pressed={language === lang}
                      className={`flex-1 rounded-md py-1.5 ${language === lang ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
                    >
                      {lang === 'pt' ? 'Português' : 'English'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onNew();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-zinc-100"
              >
                <IconFile size={16} className="text-zinc-500" /> Novo relatório
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-zinc-100"
              >
                <IconLogout size={16} className="text-zinc-500" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
