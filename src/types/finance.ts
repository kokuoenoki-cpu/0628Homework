// ─── KPI Category ────────────────────────────────────────────────────────────

export type KpiCategory = 'AR_AP' | 'Closing' | 'Budget' | 'Tax';

export const KPI_CATEGORY_LABELS: Record<KpiCategory, string> = {
  AR_AP:   'AR/AP & กระแสเงินสด',
  Closing: 'ปิดงบ & งานบัญชี',
  Budget:  'งบประมาณ & กำไร',
  Tax:     'ภาษี & Compliance',
};

// ─── KPI Unit ─────────────────────────────────────────────────────────────────

export type KpiUnit = '฿' | 'วัน' | '%' | 'รายการ';

// ─── KPI Direction (ยิ่งมากยิ่งดี vs ยิ่งน้อยยิ่งดี) ─────────────────────────

export type KpiDirection = 'higher_is_better' | 'lower_is_better';

// ─── KPI Status (คำนวณจาก value vs target + direction) ───────────────────────

export type KpiStatus = 'good' | 'warning' | 'critical';

// ─── KpiEntry ─────────────────────────────────────────────────────────────────

export interface KpiEntry {
  id: string;
  kpi_name: string;           // ชื่อ KPI (ภาษาไทย)
  category: KpiCategory;
  value: number;              // ค่าจริง
  target: number;             // ค่าเป้าหมาย
  unit: KpiUnit;
  direction: KpiDirection;    // higher_is_better หรือ lower_is_better
  period: string;             // YYYY-MM  เช่น "2025-06"
  owner_id: string;           // อ้างอิง Member.id
  notes?: string;             // หมายเหตุเพิ่มเติม
  created_at: string;         // ISO 8601 datetime
}

// ─── Member ───────────────────────────────────────────────────────────────────

export type MemberRole = 'AR' | 'AP' | 'GL' | 'Tax' | 'CFO' | 'Auditor' | 'Other';

export interface Member {
  id: string;
  name: string;               // ชื่อ-นามสกุล (ภาษาไทย)
  role: MemberRole;
  avatar_url?: string;        // URL รูปโปรไฟล์ (optional)
  created_at: string;
}

// ─── Derived / computed types ─────────────────────────────────────────────────

export interface KpiWithStatus extends KpiEntry {
  status: KpiStatus;
  variance: number;           // value - target
  variancePct: number;        // (value - target) / target * 100
  owner?: Member;
}

export interface KpiSummary {
  category: KpiCategory;
  total: number;
  good: number;
  warning: number;
  critical: number;
  goodPct: number;
}

// ─── Storage snapshot (เพื่อ export/import ข้อมูลทั้งหมด) ─────────────────────

export interface StorageSnapshot {
  kpiEntries: KpiEntry[];
  members: Member[];
  exportedAt: string;         // ISO 8601 datetime
  version: string;            // เวอร์ชัน schema เช่น "1.0"
}
