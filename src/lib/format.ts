const decimalFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatAmount = (val: number) => decimalFormatter.format(val);

// Report convention: zero renders as a dash.
export const formatCurrency = (val: number) => {
  if (val === 0 || Number.isNaN(val)) return '-';
  return decimalFormatter.format(val);
};

export const formatParensNegative = (val: number) => {
  if (val === 0 || Number.isNaN(val)) return '-';
  const formatted = decimalFormatter.format(Math.abs(val));
  return val < 0 ? `(${formatted})` : formatted;
};

export const isTypingNumeric = (raw: string) => /^[\sUSR$]*[-(]?[\d.,\s]*\)?$/.test(raw);

// Accepts typed and pasted values: "1234,56", "1.234,56", "1,234.56", "(1,234.00)", "US$ 10".
export const parseNumeric = (raw: string): number | null => {
  let s = raw.replace(/US\$|R\$|\$|\s/g, '');
  if (s === '' || s === '-' || s === '(' || s === '-.' || s === '.' || s === ',' || s === '-,') return 0;

  let negative = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    negative = true;
    s = s.slice(1, -1);
  } else if (s.startsWith('(')) {
    negative = true;
    s = s.slice(1);
  }
  if (s.startsWith('-')) {
    negative = !negative;
    s = s.slice(1);
  }

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  const dots = (s.match(/\./g) || []).length;
  const commas = (s.match(/,/g) || []).length;

  if (dots && commas) {
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const thousandSep = decimalSep === '.' ? ',' : '.';
    s = s.split(thousandSep).join('').replace(decimalSep, '.');
  } else if (commas) {
    s = commas > 1 ? s.split(',').join('') : s.replace(',', '.');
  } else if (dots > 1) {
    s = s.split('.').join('');
  }

  if (s === '' || s === '.') return 0;
  if (!/^\d*\.?\d*$/.test(s)) return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return negative ? -n : n;
};
