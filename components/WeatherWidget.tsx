'use client';

import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import type { MarketingEvent } from '@/lib/types';

/**
 * 날씨 기반 마케팅 힌트 위젯
 *
 * 기상청 예보 API → MarketingEvent[] 형태의 응답을 받아
 * 캘린더 상단에 날씨 기반 상품 수요 힌트를 배너로 표시한다.
 */

const WEATHER_ICONS: Record<string, string> = {
  '폭염': '☀️',
  '한파': '❄️',
  '강수': '🌧️',
  '적설': '🌨️',
};

function getWeatherIcon(title: string): string {
  for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
    if (title.includes(key)) return icon;
  }
  return '⚡';
}

function formatHint(events: MarketingEvent[]): { icon: string; text: string } {
  if (events.length === 0) {
    return { icon: '☀️', text: '이번 주 특이 날씨 없음 — 시즌 기본 전략 유지' };
  }

  // 가장 trendScore 높은 날씨 이벤트 우선
  const top = [...events].sort((a, b) => b.trendScore - a.trendScore)[0];
  const icon = getWeatherIcon(top.title);

  // 추천 상품 이름들
  const productNames = top.products.map(p => p.name).slice(0, 3).join('·');

  return {
    icon,
    text: `${top.title} — ${productNames ? `${productNames} 수요 급증 예상` : top.summary}`,
  };
}

export default function WeatherWidget() {
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    fetch('/api/weather')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setEvents(data.events ?? []);
        setStatus('ok');
      })
      .catch(() => {
        setStatus('error');
      });
  }, []);

  if (status === 'loading') return null;
  if (status === 'error') return null;

  const { icon, text } = formatHint(events);
  const hasWeatherEvents = events.length > 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 8,
      background: hasWeatherEvents
        ? 'linear-gradient(90deg, oklch(0.95 0.04 250) 0%, var(--surface) 100%)'
        : 'var(--bg-subtle)',
      border: `1px solid ${hasWeatherEvents ? 'oklch(0.85 0.06 250)' : 'var(--border)'}`,
      fontSize: 12.5,
      color: 'var(--text)',
      marginBottom: 12,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{text}</span>
      {events.length > 1 && (
        <span style={{
          fontSize: 10.5,
          color: 'var(--text-subtle)',
          background: 'var(--bg-subtle)',
          padding: '2px 6px',
          borderRadius: 4,
          flexShrink: 0,
        }}>
          +{events.length - 1}건
        </span>
      )}
    </div>
  );
}
