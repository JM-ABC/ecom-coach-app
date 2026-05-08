'use client';

import { useState, useEffect } from 'react';

interface EventTrendResult {
  change: string | null;
  basis: string;
  status: string;
}

export function useEventTrend(categories: string[], eventStart: string): EventTrendResult | null {
  const [result, setResult] = useState<EventTrendResult | null>(null);

  useEffect(() => {
    if (!categories.length || !eventStart) return;
    setResult(null);

    const params = new URLSearchParams({
      categories: categories.join(','),
      start: eventStart,
    });

    fetch(`/api/event-trend?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.change) setResult(data);
      })
      .catch(() => {});
  }, [categories.join(','), eventStart]);

  return result;
}
