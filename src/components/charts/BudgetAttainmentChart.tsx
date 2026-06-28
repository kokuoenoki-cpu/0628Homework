'use client';

import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { BudgetPoint } from '@/hooks/useKpiDashboard';

interface BudgetAttainmentChartProps {
  data: BudgetPoint[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>
            {p.value != null ? `${p.value.toFixed(1)}%` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function BudgetAttainmentChart({ data }: BudgetAttainmentChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">งบประมาณ vs จริง</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          รายได้และค่าใช้จ่ายเทียบเป้า (%) · เส้นประ = 100%
        </p>
      </div>
      {data.every((d) => d.revenue === null && d.expense === null) ? (
        <div className="flex items-center justify-center h-56 text-gray-300 text-sm">
          ไม่มีข้อมูลงบประมาณในช่วงนี้
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[70, 115]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={100} stroke="#6366f1" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: 'เป้า 100%', position: 'right', fontSize: 10, fill: '#6366f1' }} />
            <Bar dataKey="revenue" name="รายได้ vs งบ (%)" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar dataKey="expense" name="ค่าใช้จ่าย vs งบ (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} opacity={0.85} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
