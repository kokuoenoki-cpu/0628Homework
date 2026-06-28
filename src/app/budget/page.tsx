'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { formatCurrency, getCurrentMonth, getMonthLabel } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import BudgetForm from '@/components/forms/BudgetForm';

export default function BudgetPage() {
  const { budgets, getBudgetProgress, addBudget, deleteBudget } = useFinanceData();
  const [showAddModal, setShowAddModal] = useState(false);

  const currentMonth = getCurrentMonth();
  const budgetProgress = getBudgetProgress(currentMonth);
  const existingCategories = budgets.filter((b) => b.month === currentMonth).map((b) => b.category);

  const totalBudget = budgetProgress.reduce((s, bp) => s + bp.budget.monthlyLimit, 0);
  const totalSpent = budgetProgress.reduce((s, bp) => s + bp.spent, 0);
  const overBudgetCount = budgetProgress.filter((bp) => bp.isOverBudget).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{getMonthLabel(currentMonth)}</p>
          <h2 className="text-xl font-bold text-gray-900">Budget Tracker</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          Set Budget
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Total Budget</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
          <p className="text-xs text-gray-400 mt-1">{budgetProgress.length} categories</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Total Spent</p>
          <p className="text-xl font-bold text-rose-600">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of budget used
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Remaining</p>
          <p className={`text-xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
          {overBudgetCount > 0 && (
            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {overBudgetCount} over budget
            </p>
          )}
        </div>
      </div>

      {budgetProgress.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-gray-700 font-medium">No budgets set for {getMonthLabel(currentMonth)}</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Set spending limits to track your expenses</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            Set your first budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetProgress.map(({ budget, spent, remaining, percentage, isOverBudget }) => {
            const color = CATEGORY_COLORS[budget.category] ?? '#6b7280';
            const barColor = isOverBudget ? '#ef4444' : percentage > 80 ? '#f59e0b' : color;

            return (
              <div key={budget.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{budget.category}</p>
                      <p className="text-xs text-gray-400">Limit: {formatCurrency(budget.monthlyLimit)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverBudget
                      ? <AlertTriangle className="w-4 h-4 text-rose-500" />
                      : <CheckCircle className="w-4 h-4 text-emerald-400" />
                    }
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Spent: <span className="font-semibold" style={{ color: barColor }}>{formatCurrency(spent)}</span></span>
                    <span className={`font-semibold ${isOverBudget ? 'text-rose-500' : 'text-gray-600'}`}>
                      {isOverBudget ? `Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} left`}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>

                <p className="text-xs text-right" style={{ color: barColor }}>
                  {Math.min(percentage, 999).toFixed(1)}% used
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Set Budget">
        <BudgetForm
          onSubmit={(data) => { addBudget(data); setShowAddModal(false); }}
          onCancel={() => setShowAddModal(false)}
          existingCategories={existingCategories}
          month={currentMonth}
        />
      </Modal>
    </div>
  );
}
