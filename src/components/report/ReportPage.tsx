import React from 'react';
import { ReportStrings } from '../../lib/i18n';

export const KeepMark: React.FC<{ inverted?: boolean; className?: string }> = ({ inverted, className = '' }) => (
  <span
    className={`inline-flex items-center justify-center font-bold tracking-[0.25em] text-[8pt] px-2 py-1 ${
      inverted ? 'bg-white text-black' : 'bg-black text-white'
    } ${className}`}
  >
    KEEP
  </span>
);

interface ReportPageProps {
  t: ReportStrings;
  companyName: string;
  companyAddress?: string;
  title?: string;
  subtitle?: string;
  pageNumber?: number;
  flushTop?: boolean;
  children: React.ReactNode;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  t,
  companyName,
  companyAddress,
  title,
  subtitle,
  pageNumber,
  flushTop,
  children,
}) => (
  <section className="report-page">
    <header className="bg-black text-white px-[18mm] pt-[9mm] pb-[5mm]">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[14pt] font-semibold leading-tight break-words">{companyName}</p>
          {companyAddress && <p className="text-[8.5pt] text-white/60 mt-1">{companyAddress}</p>}
        </div>
        <KeepMark inverted className="shrink-0 mt-1" />
      </div>
      {title && (
        <div className="mt-[4mm] border-t border-white/20 pt-[3mm]">
          <p className="text-[11pt] font-medium">{title}</p>
          {subtitle && <p className="text-[8.5pt] text-white/60 mt-0.5">{subtitle}</p>}
        </div>
      )}
    </header>

    <div className={`flex-1 px-[18mm] ${flushTop ? '' : 'pt-[7mm]'} pb-[4mm] flex flex-col`}>{children}</div>

    <footer className="px-[18mm] pb-[8mm]">
      <div className="flex items-end justify-between border-t border-zinc-300 pt-[2.5mm] text-[8pt] text-zinc-500">
        <div>
          <p>{t.preparedBy}</p>
          <p className="font-semibold text-black uppercase tracking-wide">Keep Gestão Contábil</p>
        </div>
        {pageNumber !== undefined && (
          <p className="tnum">
            {t.pageLabel} <span className="font-semibold text-black">{pageNumber}</span>
          </p>
        )}
      </div>
    </footer>
  </section>
);
