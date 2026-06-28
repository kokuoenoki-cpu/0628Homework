'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, PieLabelRenderProps } from 'recharts';
import { CategoryBreakdown } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
}

const RADIAN = Math.PI / 180;
const renderLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if ((percent ?? 0) < 0.05) return null;
  const ir = Number(innerRadius ?? 0);
  const or = Number(outerRadius ?? 0);
  const ma = Number(midAngle ?? 0);
  const radius = ir + (or - ir) * 0.5;
  const x = Number(cx ?? 0) + radius * Math.cos(-ma * RADIAN);
  const y = Number(cy ?? 0) + radius * Math.sin(-ma * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Expense Breakdown</h3>
        <p className="text-xs text-gray-400 mb-6">This month by category</p>
        <div className="flex items-center justify-center h-52 text-gray-300">
          <p className="text-sm">No expense data this month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">Expense Breakdown</h3>
        <p className="text-xs text-gray-400 mt-0.5">This month by category</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(value) => [formatCurrency(Number(value)), '']}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
