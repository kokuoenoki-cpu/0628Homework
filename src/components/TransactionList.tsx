'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/constants';
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Modal from './ui/Modal';
import TransactionForm from './forms/TransactionForm';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  showAll?: boolean;
}

export default function TransactionList({ transactions, onUpdate, onDelete, showAll = false }: TransactionListProps) {
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const displayed = showAll ? transactions : transactions.slice(0, 8);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-300">
        <ArrowUpCircle className="w-10 h-10 mb-3" />
        <p className="text-sm font-medium text-gray-400">No transactions yet</p>
        <p className="text-xs text-gray-300 mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {displayed.map((tx) => {
          const color = CATEGORY_COLORS[tx.category] ?? '#6b7280';
          return (
            <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                {tx.type === 'income'
                  ? <ArrowUpCircle className="w-4 h-4" style={{ color }} />
                  : <ArrowDownCircle className="w-4 h-4" style={{ color }} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {tx.description || tx.category}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {tx.category}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(tx.date)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingTx(tx)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(tx.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={!!editingTx} onClose={() => setEditingTx(null)} title="Edit Transaction">
        {editingTx && (
          <TransactionForm
            initialData={editingTx}
            onSubmit={(data) => {
              onUpdate(editingTx.id, data);
              setEditingTx(null);
            }}
            onCancel={() => setEditingTx(null)}
          />
        )}
      </Modal>
    </>
  );
}
