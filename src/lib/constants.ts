export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment Returns',
  'Business Revenue',
  'Rental Income',
  'Bonus',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Housing & Rent',
  'Food & Dining',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Education',
  'Insurance',
  'Savings & Investment',
  'Travel',
  'Personal Care',
  'Other',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Housing & Rent': '#6366f1',
  'Food & Dining': '#f59e0b',
  'Transportation': '#10b981',
  'Healthcare': '#ef4444',
  'Entertainment': '#8b5cf6',
  'Shopping': '#ec4899',
  'Utilities': '#14b8a6',
  'Education': '#3b82f6',
  'Insurance': '#f97316',
  'Savings & Investment': '#84cc16',
  'Travel': '#06b6d4',
  'Personal Care': '#a855f7',
  'Other': '#6b7280',
  'Salary': '#22c55e',
  'Freelance': '#0ea5e9',
  'Investment Returns': '#a78bfa',
  'Business Revenue': '#fbbf24',
  'Rental Income': '#64748b',
  'Bonus': '#34d399',
  'Other Income': '#94a3b8',
};

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const LS_KEYS = {
  TRANSACTIONS: 'fkd_transactions',
  BUDGETS:      'fkd_budgets',
  // Finance KPI dashboard
  KPI_ENTRIES:  'fkd_kpi_entries',
  MEMBERS:      'fkd_members',
} as const;

// ─── KPI Category metadata ────────────────────────────────────────────────────

export const KPI_CATEGORY_COLOR: Record<string, string> = {
  AR_AP:   '#6366f1',   // indigo
  Closing: '#f59e0b',   // amber
  Budget:  '#10b981',   // emerald
  Tax:     '#f43f5e',   // rose
};

export const KPI_CATEGORY_BG: Record<string, string> = {
  AR_AP:   '#eef2ff',
  Closing: '#fffbeb',
  Budget:  '#ecfdf5',
  Tax:     '#fff1f2',
};

// ─── KPI Status thresholds ────────────────────────────────────────────────────
// "good" = ±5% จากเป้า, "warning" = ±5–20%, "critical" = เกิน 20%
export const KPI_STATUS_THRESHOLDS = {
  WARNING_PCT:  5,    // variance% เกินนี้ = warning
  CRITICAL_PCT: 20,   // variance% เกินนี้ = critical
} as const;

// ─── Member role labels ───────────────────────────────────────────────────────

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  AR:      'ลูกหนี้การค้า',
  AP:      'เจ้าหนี้การค้า',
  GL:      'บัญชีแยกประเภท',
  Tax:     'ภาษีอากร',
  CFO:     'ผู้อำนวยการการเงิน',
  Auditor: 'ผู้ตรวจสอบบัญชี',
  Other:   'อื่นๆ',
};

// ─── Storage schema version (เพิ่มทุกครั้งที่ Data Model เปลี่ยน) ─────────────

export const STORAGE_SCHEMA_VERSION = '1.0';
