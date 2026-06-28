'use client';

import { useState } from 'react';
import { Transaction, TransactionType } from '@/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants';
import { getCurrentMonth } from '@/lib/utils';

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Transaction;
}

export default function TransactionForm({ onSubmit, onCancel, initialData }: TransactionFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [date, setDate] = useState(initialData?.date ?? today);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Please enter a valid amount';
    if (!category) e.category = 'Please select a category';
    if (!date) e.date = 'Please select a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ type, amount: Number(amount), category, description, date });
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
              type === t
                ? t === 'income'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (THB)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional note..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
}
