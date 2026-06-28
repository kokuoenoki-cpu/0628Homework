/**
 * seedDataImport.ts
 * ข้อมูลตัวอย่าง KPI จากไฟล์ import/kpi-seed-data.json
 * - เพิ่ม direction, created_at, และ normalize ชื่อ KPI ให้ตรงกับ dashboard
 * - เพิ่ม budget attainment % (คำนวณจาก รายได้รวม / ค่าใช้จ่ายรวม เทียบ target)
 */

import { KpiEntry, Member } from '@/types/finance';
import { kpiStorage, memberStorage, lsRead } from './storage';
import { LS_KEYS } from './constants';

// ─── Members ──────────────────────────────────────────────────────────────────

const IMPORT_MEMBERS: Member[] = [
  { id: 'im1', name: 'สมชาย ใจดี',    role: 'AR',  avatar_url: '', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'im2', name: 'สุดา รักงาน',    role: 'AP',  avatar_url: '', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'im3', name: 'ปิยะ มั่นคง',    role: 'GL',  avatar_url: '', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'im4', name: 'นภา ศรีสุข',     role: 'Tax', avatar_url: '', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'im5', name: 'วีรพงษ์ บริหาร', role: 'CFO', avatar_url: '', created_at: '2026-01-01T00:00:00.000Z' },
];

// ─── KPI Entries (normalized from kpi-seed-data.json) ────────────────────────
// หมายเหตุการแปลงชื่อ:
//   "AP ค้างจ่ายรวม"              → "AP คงค้าง"                (ตรงกับ CARD_CONFIGS)
//   "Days to Close (ระยะเวลาปิดงบ)" → "วันปิดงบ (Days to Close)" (ตรงกับ CARD_CONFIGS)
//   เพิ่ม "รายได้จริง vs งบประมาณ" และ "ค่าใช้จ่ายจริง vs งบประมาณ" (% สำหรับ BudgetAttainmentChart)

const IMPORT_KPI_ENTRIES: KpiEntry[] = [
  // ── AR ค้างชำระรวม (6 months) ─────────────────────────────────────────────
  { id: 'ik001', kpi_name: 'AR ค้างชำระรวม', category: 'AR_AP', value: 4850000, target: 4000000, unit: '฿', direction: 'lower_is_better', period: '2026-01', owner_id: 'im1', created_at: '2026-01-31T00:00:00.000Z' },
  { id: 'ik002', kpi_name: 'AR ค้างชำระรวม', category: 'AR_AP', value: 4620000, target: 4000000, unit: '฿', direction: 'lower_is_better', period: '2026-02', owner_id: 'im1', created_at: '2026-02-28T00:00:00.000Z' },
  { id: 'ik003', kpi_name: 'AR ค้างชำระรวม', category: 'AR_AP', value: 4310000, target: 4000000, unit: '฿', direction: 'lower_is_better', period: '2026-03', owner_id: 'im1', created_at: '2026-03-31T00:00:00.000Z' },
  { id: 'ik004', kpi_name: 'AR ค้างชำระรวม', category: 'AR_AP', value: 3980000, target: 4000000, unit: '฿', direction: 'lower_is_better', period: '2026-04', owner_id: 'im1', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik005', kpi_name: 'AR ค้างชำระรวม', category: 'AR_AP', value: 4150000, target: 4000000, unit: '฿', direction: 'lower_is_better', period: '2026-05', owner_id: 'im1', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik006', kpi_name: 'AR ค้างชำระรวม', category: 'AR_AP', value: 3870000, target: 4000000, unit: '฿', direction: 'lower_is_better', period: '2026-06', owner_id: 'im1', created_at: '2026-06-30T00:00:00.000Z' },

  // ── AR Aging buckets ───────────────────────────────────────────────────────
  { id: 'ik007', kpi_name: 'AR Aging > 60 วัน',  category: 'AR_AP', value: 1250000, target: 800000,  unit: '฿', direction: 'lower_is_better', period: '2026-04', owner_id: 'im1', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik008', kpi_name: 'AR Aging > 60 วัน',  category: 'AR_AP', value: 1180000, target: 800000,  unit: '฿', direction: 'lower_is_better', period: '2026-05', owner_id: 'im1', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik009', kpi_name: 'AR Aging > 60 วัน',  category: 'AR_AP', value:  980000, target: 800000,  unit: '฿', direction: 'lower_is_better', period: '2026-06', owner_id: 'im1', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik010', kpi_name: 'AR Aging 31-60 วัน', category: 'AR_AP', value: 1340000, target: 1200000, unit: '฿', direction: 'lower_is_better', period: '2026-06', owner_id: 'im1', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik011', kpi_name: 'AR Aging 0-30 วัน',  category: 'AR_AP', value: 1550000, target: 2000000, unit: '฿', direction: 'lower_is_better', period: '2026-06', owner_id: 'im1', created_at: '2026-06-30T00:00:00.000Z' },

  // ── DSO (6 months) ─────────────────────────────────────────────────────────
  { id: 'ik012', kpi_name: 'DSO (Days Sales Outstanding)', category: 'AR_AP', value: 52, target: 45, unit: 'วัน', direction: 'lower_is_better', period: '2026-01', owner_id: 'im1', created_at: '2026-01-31T00:00:00.000Z' },
  { id: 'ik013', kpi_name: 'DSO (Days Sales Outstanding)', category: 'AR_AP', value: 50, target: 45, unit: 'วัน', direction: 'lower_is_better', period: '2026-02', owner_id: 'im1', created_at: '2026-02-28T00:00:00.000Z' },
  { id: 'ik014', kpi_name: 'DSO (Days Sales Outstanding)', category: 'AR_AP', value: 48, target: 45, unit: 'วัน', direction: 'lower_is_better', period: '2026-03', owner_id: 'im1', created_at: '2026-03-31T00:00:00.000Z' },
  { id: 'ik015', kpi_name: 'DSO (Days Sales Outstanding)', category: 'AR_AP', value: 46, target: 45, unit: 'วัน', direction: 'lower_is_better', period: '2026-04', owner_id: 'im1', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik016', kpi_name: 'DSO (Days Sales Outstanding)', category: 'AR_AP', value: 47, target: 45, unit: 'วัน', direction: 'lower_is_better', period: '2026-05', owner_id: 'im1', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik017', kpi_name: 'DSO (Days Sales Outstanding)', category: 'AR_AP', value: 44, target: 45, unit: 'วัน', direction: 'lower_is_better', period: '2026-06', owner_id: 'im1', created_at: '2026-06-30T00:00:00.000Z' },

  // ── AP & DPO ───────────────────────────────────────────────────────────────
  { id: 'ik018', kpi_name: 'AP คงค้าง',                  category: 'AR_AP', value: 3200000, target: 3500000, unit: '฿',    direction: 'lower_is_better',  period: '2026-06', owner_id: 'im2', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik019', kpi_name: 'DPO (Days Payable Outstanding)', category: 'AR_AP', value: 38, target: 40, unit: 'วัน', direction: 'higher_is_better', period: '2026-06', owner_id: 'im2', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik020', kpi_name: 'Overdue Invoices',            category: 'AR_AP', value: 14, target: 5, unit: 'รายการ', direction: 'lower_is_better',  period: '2026-06', owner_id: 'im1', created_at: '2026-06-30T00:00:00.000Z' },

  // ── ยอดเงินสดคงเหลือ (6 months) ───────────────────────────────────────────
  { id: 'ik021', kpi_name: 'ยอดเงินสดคงเหลือ', category: 'AR_AP', value: 6200000, target: 5000000, unit: '฿', direction: 'higher_is_better', period: '2026-01', owner_id: 'im5', created_at: '2026-01-31T00:00:00.000Z' },
  { id: 'ik022', kpi_name: 'ยอดเงินสดคงเหลือ', category: 'AR_AP', value: 5850000, target: 5000000, unit: '฿', direction: 'higher_is_better', period: '2026-02', owner_id: 'im5', created_at: '2026-02-28T00:00:00.000Z' },
  { id: 'ik023', kpi_name: 'ยอดเงินสดคงเหลือ', category: 'AR_AP', value: 6400000, target: 5000000, unit: '฿', direction: 'higher_is_better', period: '2026-03', owner_id: 'im5', created_at: '2026-03-31T00:00:00.000Z' },
  { id: 'ik024', kpi_name: 'ยอดเงินสดคงเหลือ', category: 'AR_AP', value: 5600000, target: 5000000, unit: '฿', direction: 'higher_is_better', period: '2026-04', owner_id: 'im5', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik025', kpi_name: 'ยอดเงินสดคงเหลือ', category: 'AR_AP', value: 5950000, target: 5000000, unit: '฿', direction: 'higher_is_better', period: '2026-05', owner_id: 'im5', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik026', kpi_name: 'ยอดเงินสดคงเหลือ', category: 'AR_AP', value: 6750000, target: 5000000, unit: '฿', direction: 'higher_is_better', period: '2026-06', owner_id: 'im5', created_at: '2026-06-30T00:00:00.000Z' },

  // ── วันปิดงบ (Days to Close) — 6 months ───────────────────────────────────
  { id: 'ik027', kpi_name: 'วันปิดงบ (Days to Close)', category: 'Closing', value: 9, target: 5, unit: 'วัน', direction: 'lower_is_better', period: '2026-01', owner_id: 'im3', created_at: '2026-01-31T00:00:00.000Z' },
  { id: 'ik028', kpi_name: 'วันปิดงบ (Days to Close)', category: 'Closing', value: 8, target: 5, unit: 'วัน', direction: 'lower_is_better', period: '2026-02', owner_id: 'im3', created_at: '2026-02-28T00:00:00.000Z' },
  { id: 'ik029', kpi_name: 'วันปิดงบ (Days to Close)', category: 'Closing', value: 7, target: 5, unit: 'วัน', direction: 'lower_is_better', period: '2026-03', owner_id: 'im3', created_at: '2026-03-31T00:00:00.000Z' },
  { id: 'ik030', kpi_name: 'วันปิดงบ (Days to Close)', category: 'Closing', value: 6, target: 5, unit: 'วัน', direction: 'lower_is_better', period: '2026-04', owner_id: 'im3', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik031', kpi_name: 'วันปิดงบ (Days to Close)', category: 'Closing', value: 6, target: 5, unit: 'วัน', direction: 'lower_is_better', period: '2026-05', owner_id: 'im3', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik032', kpi_name: 'วันปิดงบ (Days to Close)', category: 'Closing', value: 5, target: 5, unit: 'วัน', direction: 'lower_is_better', period: '2026-06', owner_id: 'im3', created_at: '2026-06-30T00:00:00.000Z' },

  // ── Closing KPIs ───────────────────────────────────────────────────────────
  { id: 'ik033', kpi_name: 'จำนวน Journal Entries',            category: 'Closing', value: 142, target: 150, unit: 'รายการ', direction: 'higher_is_better', period: '2026-06', owner_id: 'im3', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik034', kpi_name: 'งานบัญชีค้าง/เลยกำหนด',           category: 'Closing', value: 7,   target: 0,   unit: 'รายการ', direction: 'lower_is_better',  period: '2026-06', owner_id: 'im3', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik035', kpi_name: 'รายการกระทบยอดธนาคารค้าง',        category: 'Closing', value: 3,   target: 0,   unit: 'รายการ', direction: 'lower_is_better',  period: '2026-06', owner_id: 'im3', created_at: '2026-06-30T00:00:00.000Z' },

  // ── รายได้รวม (3 months) ──────────────────────────────────────────────────
  { id: 'ik036', kpi_name: 'รายได้รวม', category: 'Budget', value: 12500000, target: 13000000, unit: '฿', direction: 'higher_is_better', period: '2026-04', owner_id: 'im5', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik037', kpi_name: 'รายได้รวม', category: 'Budget', value: 13200000, target: 13000000, unit: '฿', direction: 'higher_is_better', period: '2026-05', owner_id: 'im5', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik038', kpi_name: 'รายได้รวม', category: 'Budget', value: 13850000, target: 13000000, unit: '฿', direction: 'higher_is_better', period: '2026-06', owner_id: 'im5', created_at: '2026-06-30T00:00:00.000Z' },

  // ── ค่าใช้จ่ายรวม (3 months) ──────────────────────────────────────────────
  { id: 'ik039', kpi_name: 'ค่าใช้จ่ายรวม', category: 'Budget', value: 10100000, target: 9500000, unit: '฿', direction: 'lower_is_better', period: '2026-04', owner_id: 'im5', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik040', kpi_name: 'ค่าใช้จ่ายรวม', category: 'Budget', value:  9800000, target: 9500000, unit: '฿', direction: 'lower_is_better', period: '2026-05', owner_id: 'im5', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik041', kpi_name: 'ค่าใช้จ่ายรวม', category: 'Budget', value:  9950000, target: 9500000, unit: '฿', direction: 'lower_is_better', period: '2026-06', owner_id: 'im5', created_at: '2026-06-30T00:00:00.000Z' },

  // ── Net Margin (3 months) ─────────────────────────────────────────────────
  { id: 'ik042', kpi_name: 'Net Margin', category: 'Budget', value: 19.2, target: 22, unit: '%', direction: 'higher_is_better', period: '2026-04', owner_id: 'im5', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik043', kpi_name: 'Net Margin', category: 'Budget', value: 25.8, target: 22, unit: '%', direction: 'higher_is_better', period: '2026-05', owner_id: 'im5', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik044', kpi_name: 'Net Margin', category: 'Budget', value: 28.1, target: 22, unit: '%', direction: 'higher_is_better', period: '2026-06', owner_id: 'im5', created_at: '2026-06-30T00:00:00.000Z' },

  // ── Budget Variance (target = -5 หมายถึง ยอมรับ variance ไม่เกิน -5%) ────
  { id: 'ik045', kpi_name: 'Budget Variance', category: 'Budget', value: -4.7, target: -5, unit: '%', direction: 'higher_is_better', period: '2026-06', owner_id: 'im5', created_at: '2026-06-30T00:00:00.000Z' },

  // ── Tax KPIs ───────────────────────────────────────────────────────────────
  { id: 'ik046', kpi_name: 'ใบกำกับภาษีค้างยื่น',             category: 'Tax', value: 2,      target: 0,      unit: 'รายการ', direction: 'lower_is_better',  period: '2026-06', owner_id: 'im4', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik047', kpi_name: 'VAT ที่ต้องชำระ',                  category: 'Tax', value: 385000, target: 385000, unit: '฿',      direction: 'lower_is_better',  period: '2026-06', owner_id: 'im4', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik048', kpi_name: 'ภงด.หัก ณ ที่จ่ายค้างนำส่ง',     category: 'Tax', value: 62000,  target: 0,      unit: '฿',      direction: 'lower_is_better',  period: '2026-06', owner_id: 'im4', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik049', kpi_name: 'เอกสารรอตรวจสอบ (Audit)',         category: 'Tax', value: 11,     target: 0,      unit: 'รายการ', direction: 'lower_is_better',  period: '2026-06', owner_id: 'im4', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik050', kpi_name: 'ยื่นภาษีตรงเวลา',                 category: 'Tax', value: 100,    target: 100,    unit: '%',      direction: 'higher_is_better', period: '2026-06', owner_id: 'im4', created_at: '2026-06-30T00:00:00.000Z' },

  // ── Budget Attainment % (คำนวณจาก รายได้รวม / ค่าใช้จ่ายรวม เทียบ target)
  // ใช้สำหรับ BudgetAttainmentChart ที่ต้องการค่า % เทียบกับ 100%
  // Apr: 12500000/13000000=96.15%, expense 10100000/9500000=106.32%
  // May: 13200000/13000000=101.54%, expense 9800000/9500000=103.16%
  // Jun: 13850000/13000000=106.54%, expense 9950000/9500000=104.74%
  { id: 'ik101', kpi_name: 'รายได้จริง vs งบประมาณ',   category: 'Budget', value:  96.15, target: 100, unit: '%', direction: 'higher_is_better', period: '2026-04', owner_id: 'im5', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik102', kpi_name: 'รายได้จริง vs งบประมาณ',   category: 'Budget', value: 101.54, target: 100, unit: '%', direction: 'higher_is_better', period: '2026-05', owner_id: 'im5', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik103', kpi_name: 'รายได้จริง vs งบประมาณ',   category: 'Budget', value: 106.54, target: 100, unit: '%', direction: 'higher_is_better', period: '2026-06', owner_id: 'im5', created_at: '2026-06-30T00:00:00.000Z' },
  { id: 'ik104', kpi_name: 'ค่าใช้จ่ายจริง vs งบประมาณ', category: 'Budget', value: 106.32, target: 100, unit: '%', direction: 'lower_is_better', period: '2026-04', owner_id: 'im5', created_at: '2026-04-30T00:00:00.000Z' },
  { id: 'ik105', kpi_name: 'ค่าใช้จ่ายจริง vs งบประมาณ', category: 'Budget', value: 103.16, target: 100, unit: '%', direction: 'lower_is_better', period: '2026-05', owner_id: 'im5', created_at: '2026-05-31T00:00:00.000Z' },
  { id: 'ik106', kpi_name: 'ค่าใช้จ่ายจริง vs งบประมาณ', category: 'Budget', value: 104.74, target: 100, unit: '%', direction: 'lower_is_better', period: '2026-06', owner_id: 'im5', created_at: '2026-06-30T00:00:00.000Z' },
];

// ─── Seed functions ───────────────────────────────────────────────────────────

/** ตรวจว่ามีข้อมูล import อยู่แล้วหรือยัง (เช็คจาก id ik001) */
export function hasImportedData(): boolean {
  if (typeof window === 'undefined') return false;
  const entries = lsRead<KpiEntry>(LS_KEYS.KPI_ENTRIES);
  return entries.some((e) => e.id.startsWith('ik'));
}

/** ตรวจว่ามีข้อมูลใดๆ ใน localStorage หรือไม่ */
export function hasAnyKpiData(): boolean {
  if (typeof window === 'undefined') return false;
  const entries = lsRead<KpiEntry>(LS_KEYS.KPI_ENTRIES);
  return entries.length > 0;
}

/**
 * seed ข้อมูลจาก import file (merge — ไม่ลบข้อมูลเดิม, dedup โดย id)
 * เรียกเมื่อ: กดปุ่ม "โหลดข้อมูลตัวอย่าง" หรือ auto-seed ครั้งแรก
 */
export function seedImportedData(): void {
  memberStorage.seed(IMPORT_MEMBERS);
  kpiStorage.seed(IMPORT_KPI_ENTRIES);
}

/**
 * แทนที่ข้อมูลทั้งหมดด้วย import data (ลบก่อนแล้วค่อย seed ใหม่)
 * เรียกเมื่อ: ผู้ใช้ต้องการ reset กลับสู่ข้อมูลตัวอย่าง
 */
export function replaceWithImportedData(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LS_KEYS.KPI_ENTRIES);
  window.localStorage.removeItem(LS_KEYS.MEMBERS);
  memberStorage.seed(IMPORT_MEMBERS);
  kpiStorage.seed(IMPORT_KPI_ENTRIES);
}
