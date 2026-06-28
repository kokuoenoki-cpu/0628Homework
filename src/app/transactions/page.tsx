'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Transaction, TransactionType } from '@/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants';
import { getTransactionMonth, getCurrentMonth } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import TransactionForm from '@/components/forms/TransactionForm';
import TransactionList from '@/components/TransactionList';

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map((t) => getTransactionMonth(t.date)));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;
        if (filterMonth !== 'all' && getTransactionMonth(t.date) !== filterMonth) return false;
        if (search) {
          const q = search.toLowerCase();
          return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, filterMonth, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
          <p className="text-sm text-gray-400 mt-0.5">{transactions.length} total entries</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Months</option>
            {availableMonths.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> results
          </p>
          {(search || filterType !== 'all' || filterCategory !== 'all' || filterMonth !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterType('all'); setFilterCategory('all'); setFilterMonth('all'); }}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <TransactionList
          transactions={filtered}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
          showAll
        />
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Transaction">
        <TransactionForm
          onSubmit={(data) => { addTransaction(data); setShowAddModal(false); }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
