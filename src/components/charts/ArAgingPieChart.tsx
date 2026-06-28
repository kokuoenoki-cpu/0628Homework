'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, PieLabelRenderProps } from 'recharts';
import { ArAgingSlice } from '@/hooks/useKpiDashboard';
import { formatCurrency, formatCompact } from '@/lib/utils';

interface ArAgingPieChartProps {
  data: ArAgingSlice[];
  period: string;
}

const RADIAN = Math.PI / 180;
const renderLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if ((percent ?? 0) < 0.08) return null;
  const ir = Number(innerRadius ?? 0);
  const or = Number(outerRadius ?? 0);
  const ma = Number(midAngle ?? 0);
  const r  = ir + (or - ir) * 0.5;
  const x  = Number(cx ?? 0) + r * Math.cos(-ma * RADIAN);
  const y  = Number(cy ?? 0) + r * Math.sin(-ma * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: {
  active?: boolean; payload?: Array<{ name: string; value: number; payload: ArAgingSlice }>;
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
        <span className="font-semibold text-gray-700">AR {item.name}</span>
      </div>
      <p className="text-gray-600">{formatCurrency(item.value)}</p>
    </div>
  );
};

export default function ArAgingPieChart({ data, period }: ArAgingPieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">AR Aging Breakdown</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          สัดส่วนลูกหนี้ตามอายุ · รวม{' '}
          <span className="font-semibold text-gray-600">{formatCurrency(total)}</span>
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-52 text-gray-300 text-sm">
          ไม่มีข้อมูล AR Aging ในช่วงนี้
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                labelLine={false}
                label={renderLabel}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Side legend with amounts */}
          <div className="space-y-3 min-w-44">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700">AR {item.name}</p>
                  <p className="text-sm font-bold text-gray-900">{formatCompact(item.value)} ฿</p>
                  <p className="text-xs text-gray-400">
                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
