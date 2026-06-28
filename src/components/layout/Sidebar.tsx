'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Wallet, BarChart3,
  TrendingUp, PieChart, ClipboardPen,
} from 'lucide-react';

const KPI_NAV = [
  { href: '/dashboard', label: 'KPI Dashboard',  icon: PieChart        },
  { href: '/entry',     label: 'บันทึก KPI',     icon: ClipboardPen    },
];

const PERSONAL_NAV = [
  { href: '/',             label: 'ภาพรวม',      icon: LayoutDashboard },
  { href: '/transactions', label: 'รายการ',       icon: ArrowLeftRight  },
  { href: '/budget',       label: 'งบประมาณ',    icon: Wallet          },
  { href: '/reports',      label: 'รายงาน',       icon: BarChart3       },
];

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      pathname === href
        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Finance KPI</p>
            <p className="text-slate-400 text-xs">Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* KPI Team section */}
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2 mt-1">
          ทีมบัญชี / การเงิน
        </p>
        {KPI_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}

        {/* Divider */}
        <div className="border-t border-slate-700/50 my-3" />

        {/* Personal finance section */}
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
          การเงินส่วนตัว
        </p>
        {PERSONAL_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400">เก็บข้อมูลใน Local Storage</p>
          <p className="text-xs text-slate-500 mt-0.5">ไม่ต้องล็อกอิน · ไม่มี DB</p>
        </div>
      </div>
    </aside>
  );
}
