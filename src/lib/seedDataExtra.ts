/**
 * seedDataExtra.ts — AR Aging bucket data (0-30 วัน และ 31-60 วัน)
 * แยกจาก seedData.ts เพื่อไม่ต้องแก้ไขไฟล์เดิม
 */

import { KpiEntry } from '@/types/finance';
import { kpiStorage } from './storage';

const PERIODS = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
const mkId = (period: string, slug: string) => `kpi-${period}-${slug}`;

// ค่า AR Aging รายเดือน: แนวโน้มลดลง (ทีมเก็บหนี้ดีขึ้น)
const AR_0_30_VALUES  = [4_800_000, 4_500_000, 4_100_000, 3_850_000, 3_600_000, 3_200_000];
const AR_31_60_VALUES = [1_900_000, 1_750_000, 1_600_000, 1_490_000, 1_380_000, 1_200_000];

export const SEED_KPI_EXTRA: KpiEntry[] = PERIODS.flatMap((period, i) => [
  {
    id: mkId(period, 'ar-aging-0-30'),
    kpi_name: 'AR Aging 0-30 วัน',
    category: 'AR_AP' as const,
    value: AR_0_30_VALUES[i],
    target: 5_000_000,
    unit: '฿' as const,
    direction: 'lower_is_better' as const,
    period,
    owner_id: 'mem-001',
    notes: 'ยอด AR ค้างชำระ 0-30 วัน',
    created_at: `${period}-01T08:00:00.000Z`,
  },
  {
    id: mkId(period, 'ar-aging-31-60'),
    kpi_name: 'AR Aging 31-60 วัน',
    category: 'AR_AP' as const,
    value: AR_31_60_VALUES[i],
    target: 2_000_000,
    unit: '฿' as const,
    direction: 'lower_is_better' as const,
    period,
    owner_id: 'mem-001',
    notes: 'ยอด AR ค้างชำระ 31-60 วัน',
    created_at: `${period}-01T08:00:00.000Z`,
  },
]);

export function seedExtraData(): void {
  kpiStorage.seed(SEED_KPI_EXTRA);
}

/** โหลด seed data ทั้งหมด (main + extra) */
export async function seedAllData(): Promise<void> {
  const { seedAll } = await import('./seedData');
  seedAll();
  seedExtraData();
}
