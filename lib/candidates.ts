import { EVENTS, LIFECYCLE_RECOS } from './data';
import type { MarketingEvent, Product, ProductCandidate } from './types';

const URGENCY_ORDER: Record<string, number> = { high: 0, mid: 1, low: 2 };

export function getCandidateProductsByCategory(ourKey: string, limit = 4): Product[] {
  const pool: Product[] = [
    ...EVENTS.flatMap(e => e.products),
    ...LIFECYCLE_RECOS.flatMap(r => r.products),
  ].filter(p => p.category === ourKey);

  const seen = new Set<string>();
  const deduped = pool.filter(p => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });

  deduped.sort((a, b) => {
    const u = (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9);
    if (u !== 0) return u;
    return (b.priceRange ? 1 : 0) - (a.priceRange ? 1 : 0);
  });

  return deduped.slice(0, limit);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildEventFromCandidates(items: ProductCandidate[], todayIso: string): MarketingEvent {
  const categories = [...new Set(items.map(c => c.category))];
  return {
    id: `candidate-${todayIso}-${items.length}`,
    title: '트렌드·뉴스 후보 기획전 (검토 필요)',
    type: 'season',
    start: todayIso,
    end: addDays(todayIso, 14),
    categories,
    platforms: ['momq', 'naver', 'coupang'],
    summary: '네이버 트렌드/뉴스 신호 기반 품목 후보 모음입니다. 수치는 추정치이며 확정 전 검토가 필요합니다.',
    trendScore: 70,
    search: '신호 기반(추정치)',
    gmv: '신호 기반(추정치)',
    products: items.map(c => ({
      name: c.name,
      reason: c.reason,
      urgency: c.urgency,
      category: c.category,
      ...(c.priceRange ? { priceRange: c.priceRange } : {}),
    })),
    checklist: [
      { d: -7, task: '후보 품목 실제 취급 여부·재고 확인', done: false },
      { d: -3, task: '맘큐 기획전 배너·상세 구성 검토', done: false },
      { d: 0, task: '기획전 라이브 + CRM 발송', done: false },
    ],
    pro: '신호 기반 자동 후보입니다. 추정 수치이므로 공식 데이터·실제 취급 품목을 확인 후 확정하세요.',
    source: 'custom',
  };
}
