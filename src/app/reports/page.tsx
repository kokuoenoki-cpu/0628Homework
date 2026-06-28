'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useFinanceData } from '@/hooks/useFinanceData';
import { formatCurrency, getPastMonths, getMonthLabel, getCurrentMonth } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/constants';

const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), { ssr: false });
const CategoryPieChart = dynamic(() => import('@/components/charts/CategoryPieChart'), { ssr: false });
const MonthlyBarChart = dynamic(() => import('@/components/charts/MonthlyBarChart'), { ssr: false });

export default function ReportsPage() {
  const { getSummary, getMonthlyData, getCategoryBreakdown, transactions } = useFinanceData();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const months = getPastMonths(12);
  const monthlyData6 = getMonthlyData(6);
  const monthlyData12 = getMonthlyData(12);
  const categoryBreakdown = getCategoryBreakdown(selectedMonth);
  const summary = getSummary(selectedMonth);

  const topExpenseCategory = categoryBreakdown[0];
  const totalTransactions = transactions.length;
  const avgIncome = monthlyData12.reduce((s, m) => s + m.income, 0) / 12;
  const avgExpenses = monthlyData12.reduce((s, m) => s + m.expenses, 0) / 12;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-400 mt-0.5">Insights from your financial data</p>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {months.map((m) => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Monthly Income', value: formatCurrency(avgIncome), color: 'text-indigo-700' },
          { label: 'Avg Monthly Expenses', value: formatCurrency(avgExpenses), color: 'text-rose-700' },
          { label: 'Total Transactions', value: totalTransactions.toString(), color: 'text-gray-900' },
          {
            label: 'Top Expense',
            value: topExpenseCategory?.category ?? 'N/A',
            color: topExpenseCategory ? 'text-gray-900' : 'text-gray-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-lg font-bold truncate ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart data={monthlyData6} />
        </div>
        <div>
          <CategoryPieChart data={categoryBreakdown} />
        </div>
      </div>

      <MonthlyBarChart data={monthlyData12} />

      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Category Breakdown — {getMonthLabel(selectedMonth)}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Total: {formatCurrency(summary.totalExpenses)}</p>
          </div>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-gray-700">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{cat.percentage.toFixed(1)}%</span>
                    <span className="font-semibold text-gray-900 w-28 text-right">{formatCurrency(cat.amount)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
