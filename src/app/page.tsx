'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { DollarSign, TrendingUp, TrendingDown, Percent, Plus } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { formatCurrency, getMonthLabel, getCurrentMonth } from '@/lib/utils';
import KPICard from '@/components/ui/KPICard';
import Modal from '@/components/ui/Modal';
import TransactionForm from '@/components/forms/TransactionForm';
import TransactionList from '@/components/TransactionList';

const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), { ssr: false });
const CategoryPieChart = dynamic(() => import('@/components/charts/CategoryPieChart'), { ssr: false });

export default function DashboardPage() {
  const {
    recentTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary,
    getMonthlyData,
    getCategoryBreakdown,
  } = useFinanceData();
  const [showAddModal, setShowAddModal] = useState(false);

  const currentMonth = getCurrentMonth();
  const summary = getSummary(currentMonth);
  const monthlyData = getMonthlyData(6);
  const categoryBreakdown = getCategoryBreakdown(currentMonth);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{getMonthLabel(currentMonth)}</p>
          <h2 className="text-xl font-bold text-gray-900">Financial Overview</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Income"
          value={formatCurrency(summary.totalIncome)}
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          valueColor="text-indigo-700"
          subtitle={getMonthLabel(currentMonth)}
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={TrendingDown}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          valueColor="text-rose-700"
          subtitle={getMonthLabel(currentMonth)}
        />
        <KPICard
          title="Net Income"
          value={formatCurrency(summary.netIncome)}
          icon={DollarSign}
          iconColor={summary.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}
          iconBg={summary.netIncome >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}
          valueColor={summary.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}
          subtitle="Income minus expenses"
        />
        <KPICard
          title="Savings Rate"
          value={`${summary.savingsRate.toFixed(1)}%`}
          icon={Percent}
          iconColor={summary.savingsRate >= 20 ? 'text-emerald-600' : summary.savingsRate >= 0 ? 'text-amber-600' : 'text-rose-600'}
          iconBg={summary.savingsRate >= 20 ? 'bg-emerald-50' : summary.savingsRate >= 0 ? 'bg-amber-50' : 'bg-rose-50'}
          valueColor={summary.savingsRate >= 20 ? 'text-emerald-700' : summary.savingsRate >= 0 ? 'text-amber-700' : 'text-rose-700'}
          subtitle="Net / Income ratio"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart data={monthlyData} />
        </div>
        <div>
          <CategoryPieChart data={categoryBreakdown} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest 8 entries</p>
          </div>
          <a href="/transactions" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
            View all →
          </a>
        </div>
        <TransactionList
          transactions={recentTransactions}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
        />
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Transaction">
        <TransactionForm
          onSubmit={(data) => {
            addTransaction(data);
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
