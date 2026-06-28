'use client';

import { Filter, X } from 'lucide-react';
import { Member } from '@/types/finance';
import { KPI_CATEGORY_LABELS } from '@/types/finance';
import { toThaiMonth } from '@/lib/utils';

interface FilterBarProps {
  members: Member[];
  ownerId: string;        onOwnerChange: (v: string) => void;
  category: string;       onCategoryChange: (v: string) => void;
  periodFrom: string;     onPeriodFromChange: (v: string) => void;
  periodTo: string;       onPeriodToChange: (v: string) => void;
  availablePeriods: string[];
  hasActiveFilter: boolean;
  onClearFilters: () => void;
}

const CATEGORY_OPTIONS = Object.entries(KPI_CATEGORY_LABELS) as [string, string][];

export default function FilterBar({
  members, ownerId, onOwnerChange,
  category, onCategoryChange,
  periodFrom, onPeriodFromChange,
  periodTo, onPeriodToChange,
  availablePeriods, hasActiveFilter, onClearFilters,
}: FilterBarProps) {
  const activeCount =
    (ownerId !== 'all' ? 1 : 0) +
    (category !== 'all' ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
      <div className="flex flex-wrap items-center gap-3">
        {/* Label */}
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">กรองข้อมูล</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

        {/* Owner */}
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-400 font-medium">ผู้รับผิดชอบ</label>
          <select
            value={ownerId}
            onChange={(e) => onOwnerChange(e.target.value)}
            className="pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-36"
          >
            <option value="all">ทุกคน</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-400 font-medium">หมวด KPI</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-44"
          >
            <option value="all">ทุกหมวด</option>
            {CATEGORY_OPTIONS.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

        {/* Period From */}
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-400 font-medium">ตั้งแต่เดือน</label>
          <select
            value={periodFrom}
            onChange={(e) => onPeriodFromChange(e.target.value)}
            className="pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-32"
          >
            {availablePeriods.map((p) => (
              <option key={p} value={p}>{toThaiMonth(p)}</option>
            ))}
          </select>
        </div>

        {/* Period To */}
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-gray-400 font-medium">ถึงเดือน</label>
          <select
            value={periodTo}
            onChange={(e) => onPeriodToChange(e.target.value)}
            className="pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-32"
          >
            {availablePeriods
              .filter((p) => !periodFrom || p >= periodFrom)
              .map((p) => (
                <option key={p} value={p}>{toThaiMonth(p)}</option>
              ))}
          </select>
        </div>

        {/* Clear */}
        {hasActiveFilter && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-rose-600 hover:border-rose-200 transition-colors mt-4 sm:mt-0 self-end"
          >
            <X className="w-3.5 h-3.5" />
            ล้างตัวกรอง
          </button>
        )}
      </div>
    </div>
  );
}
