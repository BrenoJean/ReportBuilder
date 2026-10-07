import React, { useEffect, useRef } from 'react';
import { IconX } from './icons';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, description, children, footer, wide }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const focusable = panelRef.current?.querySelector<HTMLElement>('input, button[data-autofocus], select, textarea');
    focusable?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panelRef}
        className={`relative w-full ${wide ? 'sm:max-w-lg' : 'sm:max-w-md'} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85dvh] flex flex-col`}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" aria-label="Fechar">
            <IconX size={18} />
          </button>
        </div>
        {children && <div className="px-5 pb-4 overflow-y-auto scrollbar-thin">{children}</div>}
        {footer && <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 py-4 border-t border-zinc-100">{footer}</div>}
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, confirmLabel, destructive, onConfirm, onCancel }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    title={title}
    description={message}
    footer={
      <>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancelar
        </button>
        <button type="button" data-autofocus onClick={onConfirm} className={`btn ${destructive ? 'btn-danger' : 'btn-primary'}`}>
          {confirmLabel}
        </button>
      </>
    }
  />
);
