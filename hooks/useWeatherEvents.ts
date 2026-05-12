'use client';

import { useState, useEffect } from 'react';
import type { MarketingEvent } from '@/lib/types';

export type WeatherStatus = 'loading' | 'ok' | 'empty' | 'no-api-key' | 'error';

export interface WeatherState {
  events: MarketingEvent[];
  status: WeatherStatus;
  updatedAt: string | null;
  error: string | null;
}

export function useWeatherEvents(): WeatherState {
  const [state, setState] = useState<WeatherState>({
    events: [],
    status: 'loading',
    updatedAt: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/weather')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setState({
          events: data.events ?? [],
          status: data.status ?? 'ok',
          updatedAt: data.updatedAt ?? null,
          error: data.message ?? null,
        });
      })
      .catch(err => {
        if (cancelled) return;
        setState({ events: [], status: 'error', updatedAt: null, error: String(err) });
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
