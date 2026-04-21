'use client';

import { useState, useEffect } from 'react';
import type { CategoryTrend } from '@/app/api/trends/route';

export type TrendStatus = 'loading' | 'ok' | 'no-api-key' | 'error';

export interface TrendState {
  trends: CategoryTrend[];
  status: TrendStatus;
  updatedAt: string | null;
  // ourKey → changeVsPrevWeek 룩업
  byKey: Record<string, CategoryTrend>;
}

export function useTrendData(): TrendState {
  const [state, setState] = useState<TrendState>({
    trends: [],
    status: 'loading',
    updatedAt: null,
    byKey: {},
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/trends')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const trends: CategoryTrend[] = data.trends ?? [];
        const byKey: Record<string, CategoryTrend> = {};
        for (const t of trends) byKey[t.ourKey] = t;

        setState({
          trends,
          status: data.status ?? 'ok',
          updatedAt: data.updatedAt ?? null,
          byKey,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState(prev => ({ ...prev, status: 'error' }));
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
