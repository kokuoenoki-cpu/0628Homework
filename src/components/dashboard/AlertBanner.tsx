'use client';

import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { KpiWithStatus } from '@/types/finance';
import { formatByUnit } from '@/lib/utils';
import { KPI_CATEGORY_LABELS } from '@/types/finance';

interface AlertBannerProps {
  items: KpiWithStatus[];
}

export default function AlertBanner({ items }: AlertBannerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || items.length === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-rose-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-800">
              รายการต้องรีบจัดการ
            </p>
            <p className="text-xs text-rose-600">
              พบ {items.length} KPI ที่เกินกำหนด/ต่ำกว่าเป้าหมายอย่างมีนัยสำคัญ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-200 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-200 hover:text-rose-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items list */}
      {!collapsed && (
        <div className="px-5 py-3 space-y-2">
          {items.map((kpi) => {
            const isLower = kpi.direction === 'lower_is_better';
            const diff = isLower
              ? kpi.value - kpi.target       // เกินเป้า (ยิ่งน้อยยิ่งดี)
              : kpi.target - kpi.value;      // ต่ำกว่าเป้า (ยิ่งมากยิ่งดี)
            const pct = kpi.target !== 0
              ? Math.abs(kpi.variancePct).toFixed(1)
              : '—';

            return (
              <div key={kpi.id} className="flex items-center justify-between py-1.5 border-b border-rose-100 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-100 text-rose-700 flex-shrink-0">
                    เกินกำหนด
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-rose-900 truncate">{kpi.kpi_name}</p>
                    <p className="text-xs text-rose-500">{KPI_CATEGORY_LABELS[kpi.category]}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-rose-700">
                    {formatByUnit(kpi.value, kpi.unit)}
                  </p>
                  <p className="text-xs text-rose-500">
                    เป้า {formatByUnit(kpi.target, kpi.unit)}
                    {' · '}<span className="font-medium">{isLower ? '+' : '-'}{pct}%</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
