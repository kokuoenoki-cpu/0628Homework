'use client';

import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Transaction, Budget, FinancialSummary, MonthlyData, CategoryBreakdown, BudgetProgress } from '@/types';
import { CATEGORY_COLORS, LS_KEYS } from '@/lib/constants';
import { generateId, getCurrentMonth, getTransactionMonth, getPastMonths, getMonthLabel, clamp } from '@/lib/utils';

export function useFinanceData() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(LS_KEYS.TRANSACTIONS, []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>(LS_KEYS.BUDGETS, []);

  const getSummary = (month?: string): FinancialSummary => {
    const m = month ?? getCurrentMonth();
    const filtered = transactions.filter((t) => getTransactionMonth(t.date) === m);
    const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? clamp((netIncome / totalIncome) * 100, -999, 100) : 0;
    return { totalIncome, totalExpenses, netIncome, savingsRate };
  };

  const getMonthlyData = (months = 6): MonthlyData[] => {
    return getPastMonths(months).map((m) => {
      const filtered = transactions.filter((t) => getTransactionMonth(t.date) === m);
      const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: getMonthLabel(m), income, expenses, net: income - expenses };
    });
  };

  const getCategoryBreakdown = (month?: string): CategoryBreakdown[] => {
    const m = month ?? getCurrentMonth();
    const filtered = transactions.filter((t) => t.type === 'expense' && getTransactionMonth(t.date) === m);
    const total = filtered.reduce((s, t) => s + t.amount, 0);
    const grouped: Record<string, number> = {};
    filtered.forEach((t) => {
      grouped[t.category] = (grouped[t.category] ?? 0) + t.amount;
    });
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CATEGORY_COLORS[category] ?? '#6b7280',
      }));
  };

  const getBudgetProgress = (month?: string): BudgetProgress[] => {
    const m = month ?? getCurrentMonth();
    const monthBudgets = budgets.filter((b) => b.month === m);
    return monthBudgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === budget.category && getTransactionMonth(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);
      const remaining = budget.monthlyLimit - spent;
      const percentage = budget.monthlyLimit > 0 ? clamp((spent / budget.monthlyLimit) * 100, 0, 200) : 0;
      return { budget, spent, remaining, percentage, isOverBudget: spent > budget.monthlyLimit };
    });
  };

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setTransactions((prev) => [tx, ...prev]);
    return tx;
  };

  const updateTransaction = (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addBudget = (data: Omit<Budget, 'id'>) => {
    const existing = budgets.find((b) => b.category === data.category && b.month === data.month);
    if (existing) {
      setBudgets((prev) => prev.map((b) => (b.id === existing.id ? { ...b, monthlyLimit: data.monthlyLimit } : b)));
      return existing;
    }
    const budget: Budget = { ...data, id: generateId() };
    setBudgets((prev) => [...prev, budget]);
    return budget;
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    [transactions]
  );

  return {
    transactions,
    budgets,
    recentTransactions,
    getSummary,
    getMonthlyData,
    getCategoryBreakdown,
    getBudgetProgress,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    deleteBudget,
  };
}
