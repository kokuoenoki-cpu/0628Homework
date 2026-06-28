import { KpiCategory, KpiUnit, KpiDirection } from '@/types/finance';

export interface KpiDefinition {
  name: string;
  category: KpiCategory;
  unit: KpiUnit;
  direction: KpiDirection;
  defaultTarget: number;
  description: string;
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  // ── AR/AP & กระแสเงินสด ──────────────────────────────────────────────────
  { name: 'AR Aging 0-30 วัน',            category: 'AR_AP',   unit: '฿',     direction: 'lower_is_better',  defaultTarget: 5_000_000, description: 'ยอด AR ค้างชำระ 0-30 วัน' },
  { name: 'AR Aging 31-60 วัน',           category: 'AR_AP',   unit: '฿',     direction: 'lower_is_better',  defaultTarget: 2_000_000, description: 'ยอด AR ค้างชำระ 31-60 วัน' },
  { name: 'AR Aging > 60 วัน',            category: 'AR_AP',   unit: '฿',     direction: 'lower_is_better',  defaultTarget: 1_500_000, description: 'ยอด AR ค้างชำระเกิน 60 วัน' },
  { name: 'DSO (Days Sales Outstanding)', category: 'AR_AP',   unit: 'วัน',   direction: 'lower_is_better',  defaultTarget: 35,        description: 'AR ÷ รายได้เฉลี่ยต่อวัน' },
  { name: 'ยอดเงินสดคงเหลือ',            category: 'AR_AP',   unit: '฿',     direction: 'higher_is_better', defaultTarget: 5_000_000, description: 'Cash + เงินฝากธนาคาร ณ สิ้นเดือน' },
  { name: 'Collection Rate',              category: 'AR_AP',   unit: '%',     direction: 'higher_is_better', defaultTarget: 95,        description: 'ยอดเก็บได้จริง ÷ ยอด AR ครบกำหนด' },
  { name: 'AP คงค้าง',                   category: 'AR_AP',   unit: '฿',     direction: 'lower_is_better',  defaultTarget: 2_500_000, description: 'เจ้าหนี้การค้าที่ยังไม่ชำระ' },
  { name: 'DPO (Days Payable Outstanding)', category: 'AR_AP', unit: 'วัน',   direction: 'higher_is_better', defaultTarget: 30,        description: 'AP ÷ COGS เฉลี่ยต่อวัน' },

  // ── ปิดงบ & งานบัญชี ─────────────────────────────────────────────────────
  { name: 'วันปิดงบ (Days to Close)',     category: 'Closing', unit: 'วัน',   direction: 'lower_is_better',  defaultTarget: 5,         description: 'วันทำงานนับจากสิ้นเดือนถึงปิดงบ' },
  { name: 'Reconciliation Rate',          category: 'Closing', unit: '%',     direction: 'higher_is_better', defaultTarget: 100,       description: 'บัญชีที่ reconcile เสร็จ ÷ บัญชีทั้งหมด' },
  { name: 'ข้อผิดพลาด Journal Entries',  category: 'Closing', unit: 'รายการ',direction: 'lower_is_better',  defaultTarget: 0,         description: 'จำนวน journal ที่ต้องแก้ไข' },
  { name: 'งานเสร็จตรงเวลา',             category: 'Closing', unit: '%',     direction: 'higher_is_better', defaultTarget: 95,        description: 'Accounting tasks ที่เสร็จก่อน/ตรง due date' },

  // ── งบประมาณ & กำไร ──────────────────────────────────────────────────────
  { name: 'รายได้จริง vs งบประมาณ',      category: 'Budget',  unit: '%',     direction: 'higher_is_better', defaultTarget: 100,       description: 'Actual Revenue ÷ Budgeted Revenue × 100' },
  { name: 'ค่าใช้จ่ายจริง vs งบประมาณ', category: 'Budget',  unit: '%',     direction: 'lower_is_better',  defaultTarget: 100,       description: 'Actual Expense ÷ Budgeted Expense × 100' },
  { name: 'Net Margin',                   category: 'Budget',  unit: '%',     direction: 'higher_is_better', defaultTarget: 15,        description: 'กำไรสุทธิ ÷ รายได้รวม × 100' },
  { name: 'Gross Margin',                 category: 'Budget',  unit: '%',     direction: 'higher_is_better', defaultTarget: 40,        description: '(รายได้ − COGS) ÷ รายได้ × 100' },
  { name: 'EBITDA',                       category: 'Budget',  unit: '฿',     direction: 'higher_is_better', defaultTarget: 5_000_000, description: 'Earnings Before Interest, Tax, D&A' },

  // ── ภาษี & Compliance ────────────────────────────────────────────────────
  { name: 'ใบกำกับภาษีค้างยื่น',         category: 'Tax',     unit: 'รายการ',direction: 'lower_is_better',  defaultTarget: 0,         description: 'ใบกำกับที่เลย due date ยังไม่ยื่น' },
  { name: 'VAT ค้างชำระ',                category: 'Tax',     unit: '฿',     direction: 'lower_is_better',  defaultTarget: 0,         description: 'Output VAT − Input VAT ที่ค้างชำระ' },
  { name: 'Compliance Score',             category: 'Tax',     unit: '%',     direction: 'higher_is_better', defaultTarget: 100,       description: 'ข้อกำหนดที่ปฏิบัติตาม ÷ ข้อกำหนดทั้งหมด' },
  { name: 'WHT ยื่นตรงเวลา',             category: 'Tax',     unit: '%',     direction: 'higher_is_better', defaultTarget: 100,       description: 'ภงด.1/3/53 ที่ยื่นทันกำหนด' },
];

export const KPI_BY_CATEGORY = KPI_DEFINITIONS.reduce((acc, def) => {
  if (!acc[def.category]) acc[def.category] = [];
  acc[def.category].push(def);
  return acc;
}, {} as Record<KpiCategory, KpiDefinition[]>);

export function findDefinition(kpiName: string): KpiDefinition | undefined {
  return KPI_DEFINITIONS.find((d) => d.name === kpiName);
}
