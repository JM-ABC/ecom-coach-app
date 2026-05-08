'use client';

import { useState, useEffect } from 'react';

export interface DetectedNewsEvent {
  id: string;
  title: string;
  platform: string;
  start: string;
  end: string;
  confidence: 'high' | 'mid' | 'low';
  sourceTitle: string;
  sourceLink: string;
  pubDate: string;
  summary: string;
}

export interface NewsInsight {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  summary: string;
  sourceLink: string;
  pubDate: string;
}

export type NewsStatus = 'loading' | 'ok' | 'no-api-key' | 'error';

export interface NewsEventsState {
  events: DetectedNewsEvent[];
  insights: NewsInsight[];
  status: NewsStatus;
  updatedAt: string | null;
}

export function useNewsEvents(): NewsEventsState {
  const [state, setState] = useState<NewsEventsState>({
    events: [],
    insights: [],
    status: 'loading',
    updatedAt: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/news-events')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setState({
          events: data.events ?? [],
          insights: data.insights ?? [],
          status: data.status ?? 'ok',
          updatedAt: data.updatedAt ?? null,
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
