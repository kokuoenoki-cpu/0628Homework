'use client';

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KpiWithStatus, KpiStatus } from '@/types/finance';
import { formatByUnit, toThaiMonth } from '@/lib/utils';

const STATUS_STYLES: Record<KpiStatus, { badge: string; value: string; bg: string }> = {
  good:     { badge: 'bg-emerald-100 text-emerald-700', value: 'text-emerald-700', bg: 'bg-emerald-50' },
  warning:  { badge: 'bg-amber-100 text-amber-700',     value: 'text-amber-700',   bg: 'bg-amber-50'   },
  critical: { badge: 'bg-rose-100 text-rose-700',       value: 'text-rose-700',    bg: 'bg-rose-50'    },
};

const STATUS_LABELS: Record<KpiStatus, string> = {
  good:     'บรรลุเป้า',
  warning:  'ใกล้เป้า',
  critical: 'เกินกำหนด',
};

interface KpiSummaryCardProps {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  period: string;
  kpi?: KpiWithStatus;          // undefined = no data for this period
  // Override for computed cards (e.g. critical count)
  overrideValue?: string;
  overrideStatus?: KpiStatus;
  overrideSubtitle?: string;
}

export default function KpiSummaryCard({
  label, icon: Icon, iconColor, iconBg, period,
  kpi, overrideValue, overrideStatus, overrideSubtitle,
}: KpiSummaryCardProps) {
  const status  = overrideStatus  ?? kpi?.status ?? 'good';
  const styles  = STATUS_STYLES[status];
  const displayValue = overrideValue ?? (kpi ? formatByUnit(kpi.value, kpi.unit) : '—');
  const noData  = !kpi && !overrideValue;

  const trendPct = kpi ? Math.abs(kpi.variancePct) : 0;
  const isPositive = kpi
    ? (kpi.direction === 'higher_is_better' ? kpi.value >= kpi.target : kpi.value <= kpi.target)
    : null;
  const TrendIcon = isPositive === null ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
        {kpi && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${styles.badge}`}>
            {STATUS_LABELS[status]}
          </span>
        )}
        {overrideStatus && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${styles.badge}`}>
            {STATUS_LABELS[status]}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className={`text-xl font-bold tracking-tight ${noData ? 'text-gray-300' : styles.value}`}>
          {displayValue}
        </p>
        {noData && <p className="text-xs text-gray-300 mt-0.5">ไม่มีข้อมูล</p>}
      </div>

      {/* Target + trend */}
      {kpi && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">
              เป้า{' '}
              <span className="font-medium text-gray-600">
                {formatByUnit(kpi.target, kpi.unit)}
              </span>
            </p>
            {kpi.owner && (
              <p className="text-xs text-gray-400 mt-0.5">{kpi.owner.name}</p>
            )}
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trendPct.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Override subtitle */}
      {overrideSubtitle && (
        <p className="text-xs text-gray-400">{overrideSubtitle}</p>
      )}

      {/* Period */}
      <p className="text-xs text-gray-300 border-t border-gray-50 pt-2 mt-auto">
        {toThaiMonth(period)}
      </p>
    </div>
  );
}
