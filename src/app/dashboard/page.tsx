'use client';

import dynamic from 'next/dynamic';
import {
  Banknote, AlertCircle, CreditCard, Calendar,
  TrendingUp, ShieldAlert, Database,
} from 'lucide-react';
import { useKpiDashboard } from '@/hooks/useKpiDashboard';
import { KpiStatus } from '@/types/finance';
import AlertBanner        from '@/components/dashboard/AlertBanner';
import FilterBar          from '@/components/dashboard/FilterBar';
import KpiSummaryCard     from '@/components/dashboard/KpiSummaryCard';
import { toThaiMonth }    from '@/lib/utils';
import { seedAll }        from '@/lib/seedData';
import { seedExtraData }  from '@/lib/seedDataExtra';

const BudgetAttainmentChart = dynamic(() => import('@/components/charts/BudgetAttainmentChart'), { ssr: false });
const TrendLineChart        = dynamic(() => import('@/components/charts/TrendLineChart'),        { ssr: false });
const ArAgingPieChart       = dynamic(() => import('@/components/charts/ArAgingPieChart'),       { ssr: false });

// ── Summary card definitions ──────────────────────────────────────────────────
const CARD_CONFIGS = [
  {
    kpiName:   'ยอดเงินสดคงเหลือ',
    label:     'ยอดเงินสดคงเหลือ',
    icon:      Banknote,
    iconColor: 'text-emerald-600',
    iconBg:    'bg-emerald-50',
  },
  {
    kpiName:   'AR Aging > 60 วัน',
    label:     'AR ค้างชำระ > 60 วัน',
    icon:      AlertCircle,
    iconColor: 'text-rose-600',
    iconBg:    'bg-rose-50',
  },
  {
    kpiName:   'AP คงค้าง',
    label:     'AP คงค้างจ่าย',
    icon:      CreditCard,
    iconColor: 'text-amber-600',
    iconBg:    'bg-amber-50',
  },
  {
    kpiName:   'วันปิดงบ (Days to Close)',
    label:     'วันปิดงบ',
    icon:      Calendar,
    iconColor: 'text-indigo-600',
    iconBg:    'bg-indigo-50',
  },
  {
    kpiName:   'Net Margin',
    label:     'Net Margin',
    icon:      TrendingUp,
    iconColor: 'text-blue-600',
    iconBg:    'bg-blue-50',
  },
] as const;

export default function DashboardPage() {
  const {
    members, criticalKpis, summaryKpis, trendData, budgetData, arAgingData,
    availablePeriods, effectivePeriodTo,
    ownerId, setOwnerId,
    category, setCategory,
    periodFrom, setPeriodFrom,
    periodTo, setPeriodTo,
    clearFilters, hasActiveFilter, hasData,
  } = useKpiDashboard();

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <Database className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">ยังไม่มีข้อมูล KPI</p>
          <p className="text-sm text-gray-400 mt-1">โหลดข้อมูลตัวอย่างหรือบันทึก KPI ก่อนเพื่อดู Dashboard</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => { seedAll(); seedExtraData(); window.location.reload(); }}
            className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
          >
            โหลดข้อมูลตัวอย่าง
          </button>
          <a
            href="/entry"
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            บันทึก KPI ของฉัน
          </a>
        </div>
      </div>
    );
  }

  // Critical count card status
  const criticalCardStatus: KpiStatus =
    criticalKpis.length === 0 ? 'good' :
    criticalKpis.length <= 2  ? 'warning' : 'critical';

  return (
    <div className="p-6 space-y-5">

      {/* ── Alert Banner ──────────────────────────────────────────────────── */}
      <AlertBanner items={criticalKpis} />

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <FilterBar
        members={members}
        ownerId={ownerId}       onOwnerChange={setOwnerId}
        category={category}     onCategoryChange={setCategory}
        periodFrom={periodFrom} onPeriodFromChange={setPeriodFrom}
        periodTo={periodTo}     onPeriodToChange={setPeriodTo}
        availablePeriods={availablePeriods}
        hasActiveFilter={hasActiveFilter}
        onClearFilters={clearFilters}
      />

      {/* ── Period label ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ภาพรวม KPI การเงิน</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            ข้อมูลล่าสุด: {effectivePeriodTo ? toThaiMonth(effectivePeriodTo) : '—'}
          </p>
        </div>
        <a
          href="/entry"
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
        >
          + บันทึก KPI
        </a>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CARD_CONFIGS.map((cfg) => (
          <KpiSummaryCard
            key={cfg.kpiName}
            label={cfg.label}
            icon={cfg.icon}
            iconColor={cfg.iconColor}
            iconBg={cfg.iconBg}
            period={effectivePeriodTo}
            kpi={summaryKpis.get(cfg.kpiName)}
          />
        ))}

        {/* Critical count card */}
        <KpiSummaryCard
          label="งาน/ภาษีเลยกำหนด"
          icon={ShieldAlert}
          iconColor={criticalCardStatus === 'good' ? 'text-emerald-600' : 'text-rose-600'}
          iconBg={criticalCardStatus === 'good' ? 'bg-emerald-50' : 'bg-rose-50'}
          period={effectivePeriodTo}
          overrideValue={`${criticalKpis.length} รายการ`}
          overrideStatus={criticalCardStatus}
          overrideSubtitle={
            criticalKpis.length === 0
              ? 'ไม่มีรายการเลยกำหนด'
              : `${criticalKpis.map((k) => k.kpi_name).slice(0, 2).join(', ')}${criticalKpis.length > 2 ? '...' : ''}`
          }
        />
      </div>

      {/* ── Charts Row 1: Budget + Trend ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <BudgetAttainmentChart data={budgetData} />
        <TrendLineChart data={trendData} />
      </div>

      {/* ── Charts Row 2: AR Aging ────────────────────────────────────────── */}
      <ArAgingPieChart data={arAgingData} period={effectivePeriodTo} />

    </div>
  );
}
