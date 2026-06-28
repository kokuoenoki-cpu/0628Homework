'use client';

import { useState } from 'react';
import { ClipboardList, ExternalLink } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { KpiEntry, Member } from '@/types/finance';
import { LS_KEYS } from '@/lib/constants';
import KpiEntryForm from '@/components/kpi/KpiEntryForm';
import { toThaiMonth, formatByUnit } from '@/lib/utils';
import { KPI_CATEGORY_LABELS } from '@/types/finance';
import { seedAll } from '@/lib/seedData';
import { seedExtraData } from '@/lib/seedDataExtra';

export default function EntryPage() {
  const [kpiEntries] = useLocalStorage<KpiEntry[]>(LS_KEYS.KPI_ENTRIES, []);
  const [members]    = useLocalStorage<Member[]>(LS_KEYS.MEMBERS, []);
  const [recentSaved, setRecentSaved] = useState<KpiEntry[]>([]);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = () => {
    seedAll();
    seedExtraData();
    setSeeded(true);
    window.location.reload();
  };

  const handleSuccess = (entry: KpiEntry) => {
    setRecentSaved((prev) => [entry, ...prev].slice(0, 5));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">บันทึกค่า KPI</h2>
          <p className="text-sm text-gray-400 mt-0.5">กรอกค่าจริงรายเดือนสำหรับแต่ละ KPI</p>
        </div>
        <div className="flex items-center gap-2">
          {members.length === 0 && !seeded && (
            <button
              onClick={handleSeed}
              className="flex items-center gap-2 px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              โหลดข้อมูลตัวอย่าง
            </button>
          )}
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
          >
            <ExternalLink className="w-4 h-4" />
            ดู Dashboard
          </a>
        </div>
      </div>

      {/* No members warning */}
      {members.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">ยังไม่มีสมาชิกทีม</p>
            <p className="text-xs text-amber-600 mt-0.5">
              กด "โหลดข้อมูลตัวอย่าง" เพื่อเพิ่มสมาชิกและ KPI ตัวอย่าง หรือเพิ่มสมาชิกก่อนบันทึก
            </p>
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <KpiEntryForm members={members} onSuccess={handleSuccess} />
      </div>

      {/* Recently saved in this session */}
      {recentSaved.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            บันทึกในเซสชันนี้ ({recentSaved.length} รายการ)
          </h3>
          <div className="space-y-2">
            {recentSaved.map((entry) => {
              const owner = members.find((m) => m.id === entry.owner_id);
              return (
                <div key={entry.id} className="flex items-center gap-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{entry.kpi_name}</p>
                    <p className="text-xs text-gray-400">
                      {KPI_CATEGORY_LABELS[entry.category]} · {toThaiMonth(entry.period)}
                      {owner && ` · ${owner.name}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-700">
                      {formatByUnit(entry.value, entry.unit)}
                    </p>
                    <p className="text-xs text-gray-400">
                      เป้า {formatByUnit(entry.target, entry.unit)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
