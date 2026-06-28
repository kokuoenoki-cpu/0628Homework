'use client';

import { useState } from 'react';
import { Budget } from '@/types';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { getCurrentMonth } from '@/lib/utils';

interface BudgetFormProps {
  onSubmit: (data: Omit<Budget, 'id'>) => void;
  onCancel: () => void;
  existingCategories: string[];
  month?: string;
}

export default function BudgetForm({ onSubmit, onCancel, existingCategories, month }: BudgetFormProps) {
  const currentMonth = month ?? getCurrentMonth();
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !existingCategories.includes(c));

  const [category, setCategory] = useState(availableCategories[0] ?? '');
  const [limit, setLimit] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!category) e.category = 'Please select a category';
    if (!limit || isNaN(Number(limit)) || Number(limit) <= 0) e.limit = 'Please enter a valid limit';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ category, monthlyLimit: Number(limit), month: currentMonth });
  };

  if (availableCategories.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">All categories already have budgets set for this month.</p>
        <button onClick={onCancel} className="mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {availableCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Limit (THB)</label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.limit && <p className="text-xs text-red-500 mt-1">{errors.limit}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors">
          Set Budget
        </button>
      </div>
    </form>
  );
}
