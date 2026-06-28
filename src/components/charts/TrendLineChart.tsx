'use client';

import {
  ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendPoint } from '@/hooks/useKpiDashboard';
import { formatCompact } from '@/lib/utils';

interface TrendLineChartProps {
  data: TrendPoint[];
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
            {p.value != null
              ? p.name.includes('DSO') ? `${p.value} วัน` : `฿${formatCompact(p.value)}`
              : '—'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendLineChart({ data }: TrendLineChartProps) {
  const hasDso  = data.some((d) => d.dso  !== null);
  const hasCash = data.some((d) => d.cash !== null);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">แนวโน้ม DSO & เงินสด</h3>
        <p className="text-xs text-gray-400 mt-0.5">DSO (วัน, แกนซ้าย) · เงินสดคงเหลือ (฿, แกนขวา)</p>
      </div>
      {!hasDso && !hasCash ? (
        <div className="flex items-center justify-center h-56 text-gray-300 text-sm">
          ไม่มีข้อมูลในช่วงนี้
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            {/* Left: DSO */}
            <YAxis
              yAxisId="dso"
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}ว`}
              width={32}
            />
            {/* Right: Cash */}
            <YAxis
              yAxisId="cash"
              orientation="right"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${formatCompact(v)}`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            {hasDso && (
              <Line
                yAxisId="dso"
                type="monotone"
                dataKey="dso"
                name="DSO (วัน)"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            )}
            {hasCash && (
              <Line
                yAxisId="cash"
                type="monotone"
                dataKey="cash"
                name="เงินสดคงเหลือ"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
