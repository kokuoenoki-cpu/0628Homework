/**
 * storage.ts
 * ฟังก์ชันอ่าน/เขียน Local Storage แบบ type-safe
 * ทุกฟังก์ชัน guard สำหรับ SSR (ไม่มี window บน server)
 */

import {
  KpiEntry,
  KpiCategory,
  KpiStatus,
  KpiWithStatus,
  KpiSummary,
  Member,
  StorageSnapshot,
} from '@/types/finance';
import { LS_KEYS, KPI_STATUS_THRESHOLDS, STORAGE_SCHEMA_VERSION } from './constants';
import { generateId } from './utils';

// ─── Generic helpers ──────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * อ่านข้อมูลจาก localStorage และ parse เป็น array
 * คืน [] เมื่อไม่มีข้อมูล หรือ parse ไม่ได้
 */
export function lsRead<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn(`[storage] lsRead failed for key="${key}"`);
    return [];
  }
}

/**
 * เขียน array ลง localStorage
 * คืน false เมื่อ storage เต็มหรือเกิด error
 */
export function lsWrite<T>(key: string, data: T[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    // QuotaExceededError หรือ SecurityError
    console.error(`[storage] lsWrite failed for key="${key}"`, err);
    return false;
  }
}

/** ลบข้อมูลทั้ง key */
export function lsClear(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

/** ตรวจว่า key มีข้อมูลอยู่แล้วหรือยัง */
export function lsHasData(key: string): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(key) !== null;
}

// ─── Generic CRUD ─────────────────────────────────────────────────────────────

/** สร้าง record ใหม่และ push เข้า array */
export function lsCreate<T extends { id: string }>(key: string, data: T): T {
  const all = lsRead<T>(key);
  all.push(data);
  lsWrite(key, all);
  return data;
}

/** อัปเดต record โดย id — merge แบบ shallow */
export function lsUpdate<T extends { id: string }>(
  key: string,
  id: string,
  patch: Partial<T>
): T | null {
  const all = lsRead<T>(key);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  lsWrite(key, all);
  return all[idx];
}

/** ลบ record โดย id — คืน true เมื่อสำเร็จ */
export function lsDelete<T extends { id: string }>(key: string, id: string): boolean {
  const all = lsRead<T>(key);
  const filtered = all.filter((r) => r.id !== id);
  if (filtered.length === all.length) return false;
  lsWrite(key, filtered);
  return true;
}

/** หา record เดี่ยวโดย id */
export function lsFindById<T extends { id: string }>(
  key: string,
  id: string
): T | undefined {
  return lsRead<T>(key).find((r) => r.id === id);
}

// ─── KpiEntry CRUD ────────────────────────────────────────────────────────────

export const kpiStorage = {
  /** อ่าน KPI ทั้งหมด */
  getAll(): KpiEntry[] {
    return lsRead<KpiEntry>(LS_KEYS.KPI_ENTRIES);
  },

  /** อ่าน KPI กรองตาม period (YYYY-MM) */
  getByPeriod(period: string): KpiEntry[] {
    return kpiStorage.getAll().filter((e) => e.period === period);
  },

  /** อ่าน KPI กรองตาม category */
  getByCategory(category: KpiCategory, period?: string): KpiEntry[] {
    return kpiStorage
      .getAll()
      .filter((e) => e.category === category && (!period || e.period === period));
  },

  /** อ่าน KPI ของ owner คนใดคนหนึ่ง */
  getByOwner(owner_id: string, period?: string): KpiEntry[] {
    return kpiStorage
      .getAll()
      .filter((e) => e.owner_id === owner_id && (!period || e.period === period));
  },

  /** สร้าง KPI ใหม่ (auto-generate id + created_at) */
  create(data: Omit<KpiEntry, 'id' | 'created_at'>): KpiEntry {
    const entry: KpiEntry = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    return lsCreate(LS_KEYS.KPI_ENTRIES, entry);
  },

  /** อัปเดตค่า KPI */
  update(id: string, patch: Partial<Omit<KpiEntry, 'id' | 'created_at'>>): KpiEntry | null {
    return lsUpdate<KpiEntry>(LS_KEYS.KPI_ENTRIES, id, patch);
  },

  /** ลบ KPI */
  delete(id: string): boolean {
    return lsDelete<KpiEntry>(LS_KEYS.KPI_ENTRIES, id);
  },

  /** upsert: อัปเดตถ้ามี id แล้ว ไม่งั้นสร้างใหม่ */
  upsert(data: KpiEntry): KpiEntry {
    const existing = lsFindById<KpiEntry>(LS_KEYS.KPI_ENTRIES, data.id);
    if (existing) {
      return lsUpdate(LS_KEYS.KPI_ENTRIES, data.id, data) ?? data;
    }
    return lsCreate(LS_KEYS.KPI_ENTRIES, data);
  },

  /** bulk insert (ใช้ตอน seed) */
  seed(entries: KpiEntry[]): void {
    const existing = kpiStorage.getAll();
    const existingIds = new Set(existing.map((e) => e.id));
    const fresh = entries.filter((e) => !existingIds.has(e.id));
    lsWrite(LS_KEYS.KPI_ENTRIES, [...existing, ...fresh]);
  },

  /** ลบ KPI ทั้งหมดใน period นั้น (เพื่อ re-import) */
  clearPeriod(period: string): void {
    const all = kpiStorage.getAll().filter((e) => e.period !== period);
    lsWrite(LS_KEYS.KPI_ENTRIES, all);
  },
};

// ─── Member CRUD ──────────────────────────────────────────────────────────────

export const memberStorage = {
  getAll(): Member[] {
    return lsRead<Member>(LS_KEYS.MEMBERS);
  },

  getById(id: string): Member | undefined {
    return lsFindById<Member>(LS_KEYS.MEMBERS, id);
  },

  create(data: Omit<Member, 'id' | 'created_at'>): Member {
    const member: Member = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    return lsCreate(LS_KEYS.MEMBERS, member);
  },

  update(id: string, patch: Partial<Omit<Member, 'id' | 'created_at'>>): Member | null {
    return lsUpdate<Member>(LS_KEYS.MEMBERS, id, patch);
  },

  delete(id: string): boolean {
    return lsDelete<Member>(LS_KEYS.MEMBERS, id);
  },

  seed(members: Member[]): void {
    const existing = memberStorage.getAll();
    const existingIds = new Set(existing.map((m) => m.id));
    const fresh = members.filter((m) => !existingIds.has(m.id));
    lsWrite(LS_KEYS.MEMBERS, [...existing, ...fresh]);
  },
};

// ─── KPI Analytics ────────────────────────────────────────────────────────────

/**
 * คำนวณ status ของ KPI แต่ละตัว
 * higher_is_better: value ต่ำกว่า target = ไม่ดี
 * lower_is_better:  value สูงกว่า target = ไม่ดี
 */
export function calcKpiStatus(entry: KpiEntry): KpiStatus {
  const { value, target, direction } = entry;
  if (target === 0) return value === 0 ? 'good' : 'critical';

  const variancePct = ((value - target) / Math.abs(target)) * 100;
  // สำหรับ lower_is_better ให้กลับเครื่องหมาย
  const adjustedVariance = direction === 'lower_is_better' ? -variancePct : variancePct;

  if (adjustedVariance >= -KPI_STATUS_THRESHOLDS.WARNING_PCT) return 'good';
  if (adjustedVariance >= -KPI_STATUS_THRESHOLDS.CRITICAL_PCT) return 'warning';
  return 'critical';
}

/** แนบ status, variance, owner เข้ากับ KpiEntry */
export function enrichKpi(entry: KpiEntry, members: Member[]): KpiWithStatus {
  const status = calcKpiStatus(entry);
  const variance = entry.value - entry.target;
  const variancePct = entry.target !== 0 ? (variance / Math.abs(entry.target)) * 100 : 0;
  const owner = members.find((m) => m.id === entry.owner_id);
  return { ...entry, status, variance, variancePct, owner };
}

/** สรุป KPI รายกลุ่ม category */
export function summarizeByCategory(
  entries: KpiEntry[],
  members: Member[]
): KpiSummary[] {
  const categories: KpiCategory[] = ['AR_AP', 'Closing', 'Budget', 'Tax'];
  return categories.map((category) => {
    const group = entries.filter((e) => e.category === category);
    const enriched = group.map((e) => enrichKpi(e, members));
    const good     = enriched.filter((e) => e.status === 'good').length;
    const warning  = enriched.filter((e) => e.status === 'warning').length;
    const critical = enriched.filter((e) => e.status === 'critical').length;
    return {
      category,
      total: group.length,
      good,
      warning,
      critical,
      goodPct: group.length > 0 ? (good / group.length) * 100 : 0,
    };
  });
}

/** ดึง KPI trend ย้อนหลัง N เดือน สำหรับ KPI ชื่อเดิม */
export function getKpiTrend(
  kpiName: string,
  periods: string[]   // YYYY-MM จากเก่าสุดไปใหม่สุด
): Array<{ period: string; value: number | null }> {
  const all = kpiStorage.getAll().filter((e) => e.kpi_name === kpiName);
  return periods.map((period) => {
    const found = all.find((e) => e.period === period);
    return { period, value: found?.value ?? null };
  });
}

// ─── Export / Import snapshot ─────────────────────────────────────────────────

/** Export ข้อมูลทั้งหมดเป็น JSON string */
export function exportSnapshot(): string {
  const snapshot: StorageSnapshot = {
    kpiEntries: kpiStorage.getAll(),
    members:    memberStorage.getAll(),
    exportedAt: new Date().toISOString(),
    version:    STORAGE_SCHEMA_VERSION,
  };
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Import snapshot จาก JSON string
 * merge = true: เพิ่มข้อมูลใหม่โดยไม่ลบของเดิม
 * merge = false: แทนที่ทั้งหมด
 */
export function importSnapshot(json: string, merge = true): boolean {
  try {
    const snapshot: StorageSnapshot = JSON.parse(json);
    if (!snapshot.kpiEntries || !snapshot.members) return false;

    if (merge) {
      kpiStorage.seed(snapshot.kpiEntries);
      memberStorage.seed(snapshot.members);
    } else {
      lsWrite(LS_KEYS.KPI_ENTRIES, snapshot.kpiEntries);
      lsWrite(LS_KEYS.MEMBERS, snapshot.members);
    }
    return true;
  } catch {
    console.error('[storage] importSnapshot: invalid JSON');
    return false;
  }
}
