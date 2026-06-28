import { MONTH_LABELS } from './constants';

export function formatCurrency(amount: number, currency = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${MONTH_LABELS[parseInt(month) - 1]} ${year}`;
}

export function getPastMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getTransactionMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ─── Thai date helpers ────────────────────────────────────────────────────────

const THAI_MONTH_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

/** "2025-06" → "มิ.ย. 2025" */
export function toThaiMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${THAI_MONTH_SHORT[parseInt(month) - 1]} ${year}`;
}

/** "2025-06" → "มิ.ย." (สำหรับ chart axis) */
export function toShortThaiMonth(yearMonth: string): string {
  const month = parseInt(yearMonth.split('-')[1]);
  return THAI_MONTH_SHORT[month - 1];
}

/** "2025-06" → "2025-06-01" (วันแรกของเดือน) */
export function periodToDate(yearMonth: string): Date {
  const [y, m] = yearMonth.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, 1);
}

/** compact number: 1500000 → "1.5M" / 9300 → "9.3K" */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat('th-TH', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

/** format ตาม unit */
export function formatByUnit(value: number, unit: string): string {
  if (unit === '฿') return formatCurrency(value);
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 'วัน') return `${value} วัน`;
  return `${value} ${unit}`;
}
