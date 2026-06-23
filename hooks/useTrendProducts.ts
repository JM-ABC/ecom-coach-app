'use client';

import { useState, useCallback } from 'react';
import type { ProductCandidate } from '@/lib/types';
import type { NewsInsight } from '@/hooks/useNewsEvents';

type FetchStatus = 'idle' | 'loading' | 'ok' | 'no-api-key' | 'error';

export function useTrendProducts() {
  const [candidates, setCandidates] = useState<ProductCandidate[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');

  const analyze = useCallback(async (insights: NewsInsight[], categories: string[]) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/trend-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insights: insights.map(i => ({ title: i.title, summary: i.summary, tag: i.tag, sourceLink: i.sourceLink })),
          categories,
        }),
      });
      const data = await res.json();
      setCandidates(data.candidates ?? []);
      setStatus(data.status ?? 'ok');
    } catch {
      setStatus('error');
    }
  }, []);

  return { candidates, status, analyze };
}
