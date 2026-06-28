'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircle2, AlertCircle, TrendingUp, TrendingDown,
  ChevronDown, RotateCcw,
} from 'lucide-react';
import { KpiEntry, Member, KpiCategory, KpiStatus } from '@/types/finance';
import { KPI_BY_CATEGORY, KpiDefinition, findDefinition } from '@/lib/kpiDefinitions';
import { KPI_CATEGORY_LABELS } from '@/types/finance';
import { kpiStorage } from '@/lib/storage';
import { calcKpiStatus } from '@/lib/storage';
import { formatByUnit, getCurrentMonth, toThaiMonth } from '@/lib/utils';

interface KpiEntryFormProps {
  members: Member[];
  onSuccess: (entry: KpiEntry) => void;
}

type FormField = 'category' | 'kpi_name' | 'value' | 'target' | 'unit' | 'period' | 'owner_id';

interface FormData {
  category: KpiCategory | '';
  kpi_name: string;
  value: string;
  target: string;
  unit: string;
  period: string;
  owner_id: string;
  notes: string;
  direction: string;
}

const CATEGORIES: KpiCategory[] = ['AR_AP', 'Closing', 'Budget', 'Tax'];
const UNITS = ['฿', 'วัน', '%', 'รายการ'];

const STATUS_CONFIG: Record<KpiStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  good:     { label: 'บรรลุเป้าหมาย',     icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  warning:  { label: 'ใกล้เคียงเป้าหมาย', icon: AlertCircle,   color: 'text-amber-600',   bg: 'bg-amber-50'   },
  critical: { label: 'ต่ำกว่า/เกินเป้า',  icon: AlertCircle,   color: 'text-rose-600',    bg: 'bg-rose-50'    },
};

function validate(form: FormData): Partial<Record<FormField, string>> {
  const e: Partial<Record<FormField, string>> = {};
  if (!form.category)  e.category = 'เลือกหมวด KPI';
  if (!form.kpi_name)  e.kpi_name = 'เลือกชื่อ KPI';
  if (!form.unit)      e.unit     = 'เลือกหน่วย';
  if (!form.period || !/^\d{4}-\d{2}$/.test(form.period)) e.period = 'รูปแบบ YYYY-MM เช่น 2025-06';
  if (!form.owner_id)  e.owner_id = 'เลือกผู้รับผิดชอบ';
  const val = Number(form.value);
  if (form.value === '' || isNaN(val) || val < 0) e.value = 'กรอกตัวเลขที่ถูกต้อง (≥ 0)';
  const tgt = Number(form.target);
  if (form.target === '' || isNaN(tgt) || tgt < 0) e.target = 'กรอกตัวเลขที่ถูกต้อง (≥ 0)';
  return e;
}

const EMPTY: FormData = {
  category: '', kpi_name: '', value: '', target: '',
  unit: '', period: getCurrentMonth(), owner_id: '', notes: '', direction: '',
};

export default function KpiEntryForm({ members, onSuccess }: KpiEntryFormProps) {
  const [form, setForm]     = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [saved, setSaved]   = useState(false);

  const set = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  // When category changes, reset kpi_name and related fields
  const handleCategoryChange = (cat: KpiCategory | '') => {
    setForm((f) => ({ ...f, category: cat, kpi_name: '', value: '', target: '', unit: '', direction: '' }));
    setErrors({});
  };

  // When KPI name changes, auto-fill unit, target, direction
  const handleKpiNameChange = (name: string) => {
    const def = findDefinition(name);
    setForm((f) => ({
      ...f,
      kpi_name:  name,
      unit:      def?.unit      ?? f.unit,
      target:    def ? String(def.defaultTarget) : f.target,
      direction: def?.direction ?? f.direction,
    }));
    setErrors((e) => ({ ...e, kpi_name: undefined }));
  };

  // Live preview: compute KpiEntry + status from current form
  const preview = useMemo(() => {
    const v = Number(form.value);
    const t = Number(form.target);
    if (!form.kpi_name || isNaN(v) || isNaN(t) || !form.unit || !form.direction) return null;
    const entry: Partial<KpiEntry> = {
      kpi_name:  form.kpi_name,
      category:  form.category as KpiCategory,
      value:     v,
      target:    t,
      unit:      form.unit as KpiEntry['unit'],
      direction: form.direction as KpiEntry['direction'],
      period:    form.period,
      owner_id:  form.owner_id,
    };
    const status = calcKpiStatus(entry as KpiEntry);
    const owner  = members.find((m) => m.id === form.owner_id);
    return { entry, status, owner };
  }, [form, members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const saved = kpiStorage.create({
      kpi_name:  form.kpi_name,
      category:  form.category as KpiCategory,
      value:     Number(form.value),
      target:    Number(form.target),
      unit:      form.unit as KpiEntry['unit'],
      direction: form.direction as KpiEntry['direction'],
      period:    form.period,
      owner_id:  form.owner_id,
      notes:     form.notes || undefined,
    });

    setSaved(true);
    onSuccess(saved);
    setTimeout(() => {
      setSaved(false);
      setForm({ ...EMPTY, period: form.period, owner_id: form.owner_id, category: form.category });
      setErrors({});
    }, 1800);
  };

  const kpisForCategory = form.category ? KPI_BY_CATEGORY[form.category] ?? [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">

        {/* Category + KPI name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              หมวด KPI <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value as KpiCategory | '')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— เลือกหมวด —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{KPI_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ชื่อ KPI <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.kpi_name}
              onChange={(e) => handleKpiNameChange(e.target.value)}
              disabled={!form.category}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">— เลือก KPI —</option>
              {kpisForCategory.map((d: KpiDefinition) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            {errors.kpi_name && <p className="text-xs text-rose-500 mt-1">{errors.kpi_name}</p>}
            {form.kpi_name && (
              <p className="text-xs text-gray-400 mt-1 italic">
                {findDefinition(form.kpi_name)?.description}
              </p>
            )}
          </div>
        </div>

        {/* Value + Target + Unit */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ค่าจริง <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => { set('value', e.target.value); setErrors((err) => ({ ...err, value: undefined })); }}
              placeholder="0"
              min="0"
              step="any"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.value && <p className="text-xs text-rose-500 mt-1">{errors.value}</p>}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              เป้าหมาย <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={form.target}
              onChange={(e) => { set('target', e.target.value); setErrors((err) => ({ ...err, target: undefined })); }}
              placeholder="0"
              min="0"
              step="any"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.target && <p className="text-xs text-rose-500 mt-1">{errors.target}</p>}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              หน่วย <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">—</option>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            {errors.unit && <p className="text-xs text-rose-500 mt-1">{errors.unit}</p>}
          </div>
        </div>

        {/* Direction (auto-filled but editable) */}
        {form.kpi_name && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ทิศทาง KPI</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {[
                { value: 'higher_is_better', label: 'ยิ่งมาก ยิ่งดี', Icon: TrendingUp },
                { value: 'lower_is_better',  label: 'ยิ่งน้อย ยิ่งดี', Icon: TrendingDown },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('direction', value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    form.direction === value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Period + Owner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              งวดเดือน (YYYY-MM) <span className="text-rose-500">*</span>
            </label>
            <input
              type="month"
              value={form.period}
              onChange={(e) => { set('period', e.target.value); setErrors((err) => ({ ...err, period: undefined })); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.period && <p className="text-xs text-rose-500 mt-1">{errors.period}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ผู้รับผิดชอบ <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.owner_id}
              onChange={(e) => { set('owner_id', e.target.value); setErrors((err) => ({ ...err, owner_id: undefined })); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— เลือกสมาชิก —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
            {errors.owner_id && <p className="text-xs text-rose-500 mt-1">{errors.owner_id}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุ (ไม่บังคับ)</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="บันทึกเพิ่มเติม..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setErrors({}); }}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ล้างฟอร์ม
          </button>
          <button
            type="submit"
            disabled={saved}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              saved
                ? 'bg-emerald-500 text-white cursor-default'
                : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25'
            }`}
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> บันทึกสำเร็จ!</>
            ) : (
              'บันทึก KPI'
            )}
          </button>
        </div>
      </form>

      {/* ── Preview ───────────────────────────────────────────────────────── */}
      <div className="lg:col-span-2">
        <p className="text-sm font-medium text-gray-700 mb-3">ตัวอย่างก่อนบันทึก</p>
        {!preview ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 min-h-56">
            <ChevronDown className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-400">กรอกข้อมูลเพื่อดูตัวอย่าง</p>
            <p className="text-xs text-gray-300">เลือกหมวด → ชื่อ KPI → ค่าจริง</p>
          </div>
        ) : (() => {
          const { entry, status, owner } = preview;
          const cfg = STATUS_CONFIG[status];
          const StatusIcon = cfg.icon;
          const isGood = status === 'good';
          const TrendIcon = entry.direction === 'higher_is_better'
            ? (isGood ? TrendingUp : TrendingDown)
            : (isGood ? TrendingDown : TrendingUp);

          return (
            <div className={`rounded-2xl p-5 border-2 ${
              status === 'good'    ? 'border-emerald-200 bg-emerald-50/30' :
              status === 'warning' ? 'border-amber-200 bg-amber-50/30' :
                                     'border-rose-200 bg-rose-50/30'
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  entry.category === 'AR_AP'   ? 'bg-indigo-100 text-indigo-700' :
                  entry.category === 'Closing' ? 'bg-amber-100 text-amber-700'   :
                  entry.category === 'Budget'  ? 'bg-emerald-100 text-emerald-700':
                                                  'bg-rose-100 text-rose-700'
                }`}>
                  {entry.category ? KPI_CATEGORY_LABELS[entry.category] : '—'}
                </span>
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {cfg.label}
                </div>
              </div>

              {/* KPI Name */}
              <p className="text-sm text-gray-500 mb-1">ชื่อ KPI</p>
              <p className="font-semibold text-gray-900 text-base mb-4 leading-snug">{entry.kpi_name || '—'}</p>

              {/* Value vs Target */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`rounded-xl p-3 ${cfg.bg}`}>
                  <p className="text-xs text-gray-500 mb-0.5">ค่าจริง</p>
                  <p className={`text-lg font-bold ${cfg.color}`}>
                    {form.value !== '' ? formatByUnit(Number(form.value), entry.unit ?? '') : '—'}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">เป้าหมาย</p>
                  <p className="text-lg font-bold text-gray-700">
                    {form.target !== '' ? formatByUnit(Number(form.target), entry.unit ?? '') : '—'}
                  </p>
                </div>
              </div>

              {/* Trend indicator */}
              <div className={`flex items-center gap-2 p-2.5 rounded-xl ${cfg.bg} mb-4`}>
                <TrendIcon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-xs font-medium ${cfg.color}`}>
                  {form.direction === 'higher_is_better' ? 'ยิ่งมาก ยิ่งดี' : 'ยิ่งน้อย ยิ่งดี'}
                </span>
              </div>

              {/* Meta */}
              <div className="space-y-1.5 border-t border-gray-200/60 pt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">งวดเดือน</span>
                  <span className="font-medium text-gray-700">
                    {form.period ? toThaiMonth(form.period) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">ผู้รับผิดชอบ</span>
                  <span className="font-medium text-gray-700">
                    {owner ? `${owner.name} (${owner.role})` : '—'}
                  </span>
                </div>
                {form.notes && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">หมายเหตุ</span>
                    <span className="font-medium text-gray-700 text-right max-w-32 truncate">{form.notes}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
