'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { KpiEntry, Member, KpiWithStatus, KpiCategory } from '@/types/finance';
import { LS_KEYS } from '@/lib/constants';
import { enrichKpi, calcKpiStatus } from '@/lib/storage';
import { getCurrentMonth, toShortThaiMonth } from '@/lib/utils';

export interface DashboardFilters {
  ownerId: string;        // 'all' | member id
  category: string;       // 'all' | KpiCategory
  periodFrom: string;     // YYYY-MM
  periodTo: string;       // YYYY-MM
}

export interface TrendPoint {
  label: string;          // "มิ.ย."
  period: string;
  dso: number | null;
  cash: number | null;
}

export interface BudgetPoint {
  label: string;
  period: string;
  revenue: number | null;
  expense: number | null;
  target: number;
}

export interface ArAgingSlice {
  name: string;
  value: number;
  color: string;
}

export function useKpiDashboard() {
  const [kpiEntries] = useLocalStorage<KpiEntry[]>(LS_KEYS.KPI_ENTRIES, []);
  const [members]    = useLocalStorage<Member[]>(LS_KEYS.MEMBERS, []);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [ownerId,    setOwnerId]    = useState('all');
  const [category,   setCategory]   = useState('all');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo,   setPeriodTo]   = useState('');

  // ── Derived: available periods sorted oldest→newest ─────────────────────────
  const availablePeriods = useMemo(() => {
    const s = new Set(kpiEntries.map((e) => e.period));
    return Array.from(s).sort();
  }, [kpiEntries]);

  const latestPeriod = availablePeriods[availablePeriods.length - 1] ?? getCurrentMonth();

  // Initialize period filters once data loads
  useEffect(() => {
    if (availablePeriods.length > 0 && !periodTo) {
      const last  = availablePeriods[availablePeriods.length - 1];
      const first = availablePeriods.length >= 6
        ? availablePeriods[availablePeriods.length - 6]
        : availablePeriods[0];
      setPeriodFrom(first);
      setPeriodTo(last);
    }
  }, [availablePeriods, periodTo]);

  const effectivePeriodFrom = periodFrom || availablePeriods[0] || getCurrentMonth();
  const effectivePeriodTo   = periodTo   || latestPeriod;

  // ── Periods in range ─────────────────────────────────────────────────────────
  const inRangePeriods = useMemo(
    () => availablePeriods.filter((p) => p >= effectivePeriodFrom && p <= effectivePeriodTo),
    [availablePeriods, effectivePeriodFrom, effectivePeriodTo]
  );

  // ── Filter helper ─────────────────────────────────────────────────────────────
  const matchesOwner    = (e: KpiEntry) => ownerId   === 'all' || e.owner_id === ownerId;
  const matchesCategory = (e: KpiEntry) => category  === 'all' || e.category === category;
  const matchesPeriod   = (e: KpiEntry) => e.period >= effectivePeriodFrom && e.period <= effectivePeriodTo;

  // ── Enriched entries (filtered) ───────────────────────────────────────────────
  const enrichedEntries = useMemo<KpiWithStatus[]>(() => {
    return kpiEntries
      .filter((e) => matchesOwner(e) && matchesCategory(e) && matchesPeriod(e))
      .map((e) => enrichKpi(e, members));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiEntries, members, ownerId, category, effectivePeriodFrom, effectivePeriodTo]);

  // ── Critical KPIs (always latest period, all owners/categories) ───────────────
  const criticalKpis = useMemo<KpiWithStatus[]>(() => {
    return kpiEntries
      .filter((e) => e.period === latestPeriod)
      .map((e) => enrichKpi(e, members))
      .filter((e) => e.status === 'critical')
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [kpiEntries, members, latestPeriod]);

  // ── Summary map: latest period → name → KpiWithStatus ────────────────────────
  const summaryKpis = useMemo<Map<string, KpiWithStatus>>(() => {
    const map = new Map<string, KpiWithStatus>();
    kpiEntries
      .filter((e) => e.period === effectivePeriodTo && matchesOwner(e))
      .map((e) => enrichKpi(e, members))
      .forEach((e) => map.set(e.kpi_name, e));
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiEntries, members, effectivePeriodTo, ownerId]);

  // ── Trend data: DSO + Cash ────────────────────────────────────────────────────
  const trendData = useMemo<TrendPoint[]>(() => {
    return inRangePeriods.map((period) => {
      const byPeriod = kpiEntries.filter(
        (e) => e.period === period && matchesOwner(e)
      );
      const find = (name: string) => byPeriod.find((e) => e.kpi_name === name)?.value ?? null;
      return {
        label:  toShortThaiMonth(period),
        period,
        dso:    find('DSO (Days Sales Outstanding)'),
        cash:   find('ยอดเงินสดคงเหลือ'),
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiEntries, inRangePeriods, ownerId]);

  // ── Budget attainment: Revenue vs Budget + Expense vs Budget ─────────────────
  const budgetData = useMemo<BudgetPoint[]>(() => {
    return inRangePeriods.map((period) => {
      const byPeriod = kpiEntries.filter(
        (e) => e.period === period && e.category === 'Budget' && matchesOwner(e)
      );
      const find = (name: string) => byPeriod.find((e) => e.kpi_name === name)?.value ?? null;
      return {
        label:   toShortThaiMonth(period),
        period,
        revenue: find('รายได้จริง vs งบประมาณ'),
        expense: find('ค่าใช้จ่ายจริง vs งบประมาณ'),
        target:  100,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiEntries, inRangePeriods, ownerId]);

  // ── AR Aging pie: 3 buckets in latest selected period ─────────────────────────
  const arAgingData = useMemo<ArAgingSlice[]>(() => {
    const byPeriod = kpiEntries.filter(
      (e) => e.period === effectivePeriodTo && matchesOwner(e)
    );
    const find = (name: string) => byPeriod.find((e) => e.kpi_name === name)?.value ?? 0;
    return [
      { name: '0-30 วัน',  value: find('AR Aging 0-30 วัน'),  color: '#10b981' },
      { name: '31-60 วัน', value: find('AR Aging 31-60 วัน'), color: '#f59e0b' },
      { name: '> 60 วัน',  value: find('AR Aging > 60 วัน'),  color: '#f43f5e' },
    ].filter((s) => s.value > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiEntries, effectivePeriodTo, ownerId]);

  // ── Clear filters ─────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setOwnerId('all');
    setCategory('all');
    const last  = availablePeriods[availablePeriods.length - 1] ?? '';
    const first = availablePeriods.length >= 6
      ? availablePeriods[availablePeriods.length - 6]
      : (availablePeriods[0] ?? '');
    setPeriodFrom(first);
    setPeriodTo(last);
  };

  const hasActiveFilter = ownerId !== 'all' || category !== 'all';
  const hasData = kpiEntries.length > 0;

  return {
    // raw
    members,
    // computed
    enrichedEntries,
    criticalKpis,
    summaryKpis,
    trendData,
    budgetData,
    arAgingData,
    // periods
    availablePeriods,
    latestPeriod,
    effectivePeriodTo,
    inRangePeriods,
    // filter state
    ownerId,    setOwnerId,
    category,   setCategory,
    periodFrom, setPeriodFrom,
    periodTo,   setPeriodTo,
    clearFilters,
    hasActiveFilter,
    hasData,
  };
}
