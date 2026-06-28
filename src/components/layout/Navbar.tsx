'use client';

import { usePathname } from 'next/navigation';
import { Calendar, Bell } from 'lucide-react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/':             { title: 'ภาพรวมการเงิน',       subtitle: 'Personal finance overview' },
  '/dashboard':    { title: 'KPI Dashboard',         subtitle: 'ติดตาม KPI ทีมบัญชี/การเงิน' },
  '/entry':        { title: 'บันทึกค่า KPI',         subtitle: 'กรอกค่าจริงรายเดือน' },
  '/transactions': { title: 'รายการธุรกรรม',         subtitle: 'จัดการรายรับ-รายจ่าย' },
  '/budget':       { title: 'งบประมาณ',              subtitle: 'ติดตามวงเงินการใช้จ่าย' },
  '/reports':      { title: 'รายงานและวิเคราะห์',    subtitle: 'กราฟและสถิติ' },
};

export default function Navbar() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: 'Finance KPI', subtitle: '' };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{page.title}</h1>
        <p className="text-xs text-gray-400">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{dateStr}</span>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
