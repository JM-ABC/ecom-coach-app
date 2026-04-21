'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MarketingEvent } from '@/lib/types';

const STORAGE_KEY = 'sellerkit-custom-events';

function load(): MarketingEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(events: MarketingEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function useCustomEvents() {
  const [events, setEvents] = useState<MarketingEvent[]>([]);

  useEffect(() => {
    setEvents(load());
  }, []);

  const add = useCallback((event: MarketingEvent) => {
    setEvents(prev => {
      const next = [...prev, { ...event, source: 'custom' as const }];
      save(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<MarketingEvent>) => {
    setEvents(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...patch } : e);
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { events, add, update, remove };
}
