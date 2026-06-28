/**
 * seedData.ts
 * ข้อมูลตัวอย่างสำหรับ Finance KPI Dashboard
 * ครอบคลุม 4 กลุ่ม KPI ย้อนหลัง 6 เดือน
 *
 * วิธีใช้:
 *   import { seedAll } from '@/lib/seedData';
 *   seedAll();   // โหลดข้อมูลลง localStorage
 */

import { KpiEntry, Member } from '@/types/finance';
import { kpiStorage, memberStorage, lsHasData } from './storage';
import { LS_KEYS } from './constants';

// ─── Members ──────────────────────────────────────────────────────────────────

export const SEED_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    name: 'นพรัตน์ สมบูรณ์',
    role: 'AR',
    avatar_url: undefined,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'mem-002',
    name: 'กัญญา วิชัยดิษฐ',
    role: 'AP',
    avatar_url: undefined,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'mem-003',
    name: 'ธนพล รักษาสิทธิ์',
    role: 'GL',
    avatar_url: undefined,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'mem-004',
    name: 'ปณิตา เจริญสุข',
    role: 'Tax',
    avatar_url: undefined,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'mem-005',
    name: 'วีระ มานะกิจ',
    role: 'CFO',
    avatar_url: undefined,
    created_at: '2025-01-01T00:00:00.000Z',
  },
];

// ─── Seed KPI Entries ─────────────────────────────────────────────────────────
// ครอบคลุม 6 เดือน: Jan–Jun 2025
// แต่ละเดือนมี KPI ครบทุกกลุ่ม เพื่อให้ chart trend ใช้งานได้

const PERIODS = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];

// helper สร้าง id แบบ deterministic เพื่อป้องกัน duplicate เมื่อ seed ซ้ำ
const mkId = (period: string, slug: string) => `kpi-${period}-${slug}`;

function mkKpi(
  id: string,
  period: string,
  overrides: Partial<KpiEntry> & Pick<KpiEntry, 'kpi_name' | 'category' | 'value' | 'target' | 'unit' | 'direction' | 'owner_id'>
): KpiEntry {
  return {
    id,
    period,
    notes: undefined,
    created_at: `${period}-01T08:00:00.000Z`,
    ...overrides,
  };
}

// ─── กลุ่ม 1: AR/AP & กระแสเงินสด ───────────────────────────────────────────
// trend: AR Aging ลดลงช่วงปลายปี, DSO ทรงตัว, Cash เพิ่ม

const AR_AP_VALUES: Record<string, number[]> = {
  // AR Aging > 60 วัน (฿) — lower is better — Jan→Jun
  ar_aging:        [3_200_000, 2_950_000, 2_600_000, 2_410_000, 2_340_000, 1_980_000],
  // DSO (วัน) — lower is better
  dso:             [48, 46, 44, 43, 42, 40],
  // ยอดเงินสดคงเหลือ (฿) — higher is better
  cash_balance:    [6_100_000, 6_800_000, 7_200_000, 7_950_000, 8_750_000, 9_300_000],
  // Collection Rate (%) — higher is better
  collection_rate: [82, 84, 85, 87, 87.5, 89],
  // AP คงค้าง (฿) — lower is better
  ap_outstanding:  [2_800_000, 2_600_000, 2_200_000, 2_050_000, 1_890_000, 1_750_000],
  // DPO (วัน) — ใกล้เป้าหมายยิ่งดี (target 30) — higher_is_better ในมุมผู้ซื้อ
  dpo:             [22, 24, 25, 27, 28, 30],
};

// ─── กลุ่ม 2: ปิดงบ & งานบัญชี ──────────────────────────────────────────────

const CLOSING_VALUES: Record<string, number[]> = {
  // วันปิดงบ (วัน) — lower is better
  days_to_close:   [12, 11, 10, 9, 8, 7],
  // Reconciliation Rate (%) — higher is better
  recon_rate:      [85, 88, 90, 91, 92, 95],
  // ข้อผิดพลาด Journal (รายการ) — lower is better
  journal_errors:  [7, 6, 5, 4, 3, 2],
  // งานเสร็จตรงเวลา (%) — higher is better
  on_time_pct:     [68, 72, 75, 77, 78, 82],
};

// ─── กลุ่ม 3: งบประมาณ & กำไร ────────────────────────────────────────────────

const BUDGET_VALUES: Record<string, number[]> = {
  // รายได้จริง vs งบ (%) — higher is better
  revenue_vs_budget: [88, 91, 93, 93.5, 94.2, 96],
  // ค่าใช้จ่ายจริง vs งบ (%) — lower is better (ไม่เกิน 100%)
  expense_vs_budget: [105, 104, 103.5, 102.8, 102.3, 101],
  // Net Margin (%) — higher is better
  net_margin:        [9.2, 10.1, 11, 11.8, 12.4, 13.1],
  // Gross Margin (%) — higher is better
  gross_margin:      [35.1, 36.2, 37, 37.9, 38.7, 39.5],
  // EBITDA (฿) — higher is better
  ebitda:            [3_100_000, 3_400_000, 3_700_000, 3_950_000, 4_200_000, 4_600_000],
};

// ─── กลุ่ม 4: ภาษี & Compliance ──────────────────────────────────────────────

const TAX_VALUES: Record<string, number[]> = {
  // ใบกำกับภาษีค้างยื่น (รายการ) — lower is better
  tax_pending:      [8, 7, 6, 5, 4, 2],
  // VAT ค้างชำระ (฿) — lower is better
  vat_outstanding:  [320_000, 280_000, 230_000, 175_000, 125_000, 60_000],
  // Compliance Score (%) — higher is better
  compliance_score: [78, 80, 83, 85, 88, 91],
  // WHT ยื่นตรงเวลา (%) — higher is better
  wht_on_time:      [90, 95, 100, 100, 100, 100],
};

// ─── Build all seed entries ───────────────────────────────────────────────────

export const SEED_KPI_ENTRIES: KpiEntry[] = PERIODS.flatMap((period, i) => [

  // ── AR/AP ──────────────────────────────────────────────────────────────────
  mkKpi(mkId(period, 'ar-aging'), period, {
    kpi_name:  'AR Aging > 60 วัน',
    category:  'AR_AP',
    value:     AR_AP_VALUES.ar_aging[i],
    target:    1_500_000,
    unit:      '฿',
    direction: 'lower_is_better',
    owner_id:  'mem-001',
    notes:     'ยอด AR ที่ค้างชำระเกิน 60 วัน',
  }),

  mkKpi(mkId(period, 'dso'), period, {
    kpi_name:  'DSO (Days Sales Outstanding)',
    category:  'AR_AP',
    value:     AR_AP_VALUES.dso[i],
    target:    35,
    unit:      'วัน',
    direction: 'lower_is_better',
    owner_id:  'mem-001',
    notes:     'AR ÷ รายได้เฉลี่ยต่อวัน',
  }),

  mkKpi(mkId(period, 'cash-balance'), period, {
    kpi_name:  'ยอดเงินสดคงเหลือ',
    category:  'AR_AP',
    value:     AR_AP_VALUES.cash_balance[i],
    target:    5_000_000,
    unit:      '฿',
    direction: 'higher_is_better',
    owner_id:  'mem-005',
    notes:     'Cash + เงินฝากธนาคาร ณ สิ้นเดือน',
  }),

  mkKpi(mkId(period, 'collection-rate'), period, {
    kpi_name:  'Collection Rate',
    category:  'AR_AP',
    value:     AR_AP_VALUES.collection_rate[i],
    target:    95,
    unit:      '%',
    direction: 'higher_is_better',
    owner_id:  'mem-001',
    notes:     'ยอดเก็บได้จริง ÷ ยอด AR ครบกำหนด',
  }),

  mkKpi(mkId(period, 'ap-outstanding'), period, {
    kpi_name:  'AP คงค้าง',
    category:  'AR_AP',
    value:     AR_AP_VALUES.ap_outstanding[i],
    target:    2_500_000,
    unit:      '฿',
    direction: 'lower_is_better',
    owner_id:  'mem-002',
    notes:     'เจ้าหนี้การค้าที่ยังไม่ชำระรวม',
  }),

  mkKpi(mkId(period, 'dpo'), period, {
    kpi_name:  'DPO (Days Payable Outstanding)',
    category:  'AR_AP',
    value:     AR_AP_VALUES.dpo[i],
    target:    30,
    unit:      'วัน',
    direction: 'higher_is_better',
    owner_id:  'mem-002',
    notes:     'AP ÷ COGS เฉลี่ยต่อวัน',
  }),

  // ── Closing ────────────────────────────────────────────────────────────────
  mkKpi(mkId(period, 'days-close'), period, {
    kpi_name:  'วันปิดงบ (Days to Close)',
    category:  'Closing',
    value:     CLOSING_VALUES.days_to_close[i],
    target:    5,
    unit:      'วัน',
    direction: 'lower_is_better',
    owner_id:  'mem-003',
    notes:     'วันทำงานนับจากสิ้นเดือนถึงปิดงบสำเร็จ',
  }),

  mkKpi(mkId(period, 'recon-rate'), period, {
    kpi_name:  'Reconciliation Rate',
    category:  'Closing',
    value:     CLOSING_VALUES.recon_rate[i],
    target:    100,
    unit:      '%',
    direction: 'higher_is_better',
    owner_id:  'mem-003',
    notes:     'บัญชีที่ reconcile เสร็จ ÷ บัญชีทั้งหมด',
  }),

  mkKpi(mkId(period, 'journal-errors'), period, {
    kpi_name:  'ข้อผิดพลาด Journal Entries',
    category:  'Closing',
    value:     CLOSING_VALUES.journal_errors[i],
    target:    0,
    unit:      'รายการ',
    direction: 'lower_is_better',
    owner_id:  'mem-003',
    notes:     'จำนวน journal ที่ต้องแก้ไขในเดือนนั้น',
  }),

  mkKpi(mkId(period, 'on-time-pct'), period, {
    kpi_name:  'งานเสร็จตรงเวลา',
    category:  'Closing',
    value:     CLOSING_VALUES.on_time_pct[i],
    target:    95,
    unit:      '%',
    direction: 'higher_is_better',
    owner_id:  'mem-003',
    notes:     'Accounting tasks ที่ complete ก่อนหรือตรง due date',
  }),

  // ── Budget ─────────────────────────────────────────────────────────────────
  mkKpi(mkId(period, 'rev-vs-budget'), period, {
    kpi_name:  'รายได้จริง vs งบประมาณ',
    category:  'Budget',
    value:     BUDGET_VALUES.revenue_vs_budget[i],
    target:    100,
    unit:      '%',
    direction: 'higher_is_better',
    owner_id:  'mem-005',
    notes:     'Actual Revenue ÷ Budgeted Revenue × 100',
  }),

  mkKpi(mkId(period, 'exp-vs-budget'), period, {
    kpi_name:  'ค่าใช้จ่ายจริง vs งบประมาณ',
    category:  'Budget',
    value:     BUDGET_VALUES.expense_vs_budget[i],
    target:    100,
    unit:      '%',
    direction: 'lower_is_better',
    owner_id:  'mem-005',
    notes:     'Actual Expense ÷ Budgeted Expense × 100 (ไม่ควรเกิน 100%)',
  }),

  mkKpi(mkId(period, 'net-margin'), period, {
    kpi_name:  'Net Margin',
    category:  'Budget',
    value:     BUDGET_VALUES.net_margin[i],
    target:    15,
    unit:      '%',
    direction: 'higher_is_better',
    owner_id:  'mem-005',
    notes:     'กำไรสุทธิ ÷ รายได้รวม × 100',
  }),

  mkKpi(mkId(period, 'gross-margin'), period, {
    kpi_name:  'Gross Margin',
    category:  'Budget',
    value:     BUDGET_VALUES.gross_margin[i],
    target:    40,
    unit:      '%',
    direction: 'higher_is_better',
    owner_id:  'mem-005',
    notes:     '(รายได้ − ต้นทุนขาย) ÷ รายได้ × 100',
  }),

  mkKpi(mkId(period, 'ebitda'), period, {
    kpi_name:  'EBITDA',
    category:  'Budget',
    value:     BUDGET_VALUES.ebitda[i],
    target:    5_000_000,
    unit:      '฿',
    direction: 'higher_is_better',
    owner_id:  'mem-005',
    notes:     'Earnings Before Interest, Tax, Depreciation & Amortization',
  }),

  // ── Tax ────────────────────────────────────────────────────────────────────
  mkKpi(mkId(period, 'tax-pending'), period, {
    kpi_name:  'ใบกำกับภาษีค้างยื่น',
    category:  'Tax',
    value:     TAX_VALUES.tax_pending[i],
    target:    0,
    unit:      'รายการ',
    direction: 'lower_is_better',
    owner_id:  'mem-004',
    notes:     'จำนวนใบกำกับภาษีที่เลย due date แต่ยังไม่ได้ยื่น',
  }),

  mkKpi(mkId(period, 'vat-outstanding'), period, {
    kpi_name:  'VAT ค้างชำระ',
    category:  'Tax',
    value:     TAX_VALUES.vat_outstanding[i],
    target:    0,
    unit:      '฿',
    direction: 'lower_is_better',
    owner_id:  'mem-004',
    notes:     'Output VAT − Input VAT ที่ยังค้างชำระกับสรรพากร',
  }),

  mkKpi(mkId(period, 'compliance-score'), period, {
    kpi_name:  'Compliance Score',
    category:  'Tax',
    value:     TAX_VALUES.compliance_score[i],
    target:    100,
    unit:      '%',
    direction: 'higher_is_better',
    owner_id:  'mem-004',
    notes:     'ข้อกำหนดที่ปฏิบัติตาม ÷ ข้อกำหนดทั้งหมด',
  }),

  mkKpi(mkId(period, 'wht-on-time'), period, {
    kpi_name:  'WHT ยื่นตรงเวลา',
    category:  'Tax',
    value:     TAX_VALUES.wht_on_time[i],
    target:    100,
    unit:      '%',
    direction: 'higher_is_better',
    owner_id:  'mem-004',
    notes:     'ภาษีหัก ณ ที่จ่าย (ภงด.1, ภงด.3, ภงด.53) ที่ยื่นทันกำหนด',
  }),
]);

// ─── Seed functions ───────────────────────────────────────────────────────────

/** โหลด members ลง localStorage (ถ้ายังไม่มี) */
export function seedMembers(): void {
  memberStorage.seed(SEED_MEMBERS);
}

/** โหลด KPI entries ลง localStorage (ถ้ายังไม่มี) */
export function seedKpiEntries(): void {
  kpiStorage.seed(SEED_KPI_ENTRIES);
}

/**
 * โหลดข้อมูลตัวอย่างทั้งหมด
 * ปลอดภัย: ไม่เขียนทับข้อมูลที่มีอยู่แล้ว (merge mode)
 */
export function seedAll(): void {
  seedMembers();
  seedKpiEntries();
}

/**
 * ตรวจว่า localStorage มีข้อมูลอยู่แล้วหรือยัง
 * ใช้เพื่อตัดสินใจว่าควร seed หรือไม่
 */
export function hasAnyData(): boolean {
  return lsHasData(LS_KEYS.KPI_ENTRIES) || lsHasData(LS_KEYS.MEMBERS);
}
