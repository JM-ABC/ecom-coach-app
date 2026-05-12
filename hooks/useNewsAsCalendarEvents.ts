'use client';

import { useMemo } from 'react';
import { useNewsEvents } from './useNewsEvents';
import type { DetectedNewsEvent } from './useNewsEvents';
import type { MarketingEvent } from '@/lib/types';

// CLAUDE.md: 정기구독 모델 없음, 배송 관련 제안 금지
const BLOCK_KEYWORDS = ['배송', '구독', '정기구독', '당일배송', '맘쑝배송'];

const COUNTER_STRATEGIES: Record<string, string> = {
  coupang:     '쿠팡 행사 기간 → 맘큐 단독 쿠폰·번들로 유아 특화 가격 경쟁력 확보. 쿠팡 미취급 독점 브랜드 전면 배치.',
  naver:       '네이버 행사 기간 → 맘큐 회원 전용 적립 이벤트로 충성 고객 Lock-in. 네이버 미노출 독점 번들 기획.',
  '11st':      '11번가 행사 기간 → 맘큐 포인트 2배 이벤트로 락인 강화. 11번가 미취급 유아 특화 브랜드 집중 노출.',
  gmarket:     'G마켓 행사 기간 → 맘큐 전용 선물 포장·기프트카드 기획으로 차별화.',
  kakao:       '카카오 행사 기간 → 맘큐 개인화 추천 캠페인 연동으로 전환율 제고.',
  wemakeprice: '위메프 행사 기간 → 맘큐 타임딜 운영으로 즉각적 가격 메리트 제공.',
};

function isBlocked(ev: DetectedNewsEvent): boolean {
  const text = ev.title + ' ' + (ev.summary ?? '');
  return BLOCK_KEYWORDS.some(kw => text.includes(kw));
}

function toCalendarEvent(ev: DetectedNewsEvent): MarketingEvent {
  const isCompetitor = ev.platform !== 'momq';
  return {
    id: `news-${ev.id}`,
    title: ev.title,
    type: 'platform',
    start: ev.start,
    end: ev.end,
    categories: [],
    platforms: [ev.platform],
    summary: ev.summary || `${ev.title} (뉴스 감지 · ${ev.pubDate})`,
    trendScore: ev.confidence === 'high' ? 72 : ev.confidence === 'mid' ? 52 : 36,
    search: '+0%',
    gmv: '+0%',
    products: [],
    checklist: [],
    pro: `출처: ${ev.sourceTitle}`,
    source: 'news',
    counterStrategy: isCompetitor
      ? (COUNTER_STRATEGIES[ev.platform] ?? `${ev.platform} 행사 기간 → 맘큐 단독 혜택으로 차별화 대응`)
      : undefined,
  };
}

export function useNewsAsCalendarEvents(): MarketingEvent[] {
  const { events, status } = useNewsEvents();
  return useMemo(() => {
    if (status !== 'ok') return [];
    return events.filter(ev => !isBlocked(ev)).map(toCalendarEvent);
  }, [events, status]);
}
