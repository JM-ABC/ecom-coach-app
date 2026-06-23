import { describe, it, expect } from 'vitest';
import { getCandidateProductsByCategory, buildEventFromCandidates } from '../lib/candidates';
import type { ProductCandidate } from '../lib/types';

const SAMPLE: ProductCandidate[] = [
  { id: 'c1', name: '기내 수분 마스크팩', reason: '기내 건조 트렌드', urgency: 'high', category: 'l_body', source: 'news', signalLabel: '기내 마스크 (뉴스)', estimated: true },
  { id: 'c2', name: '쿨링 생리대', reason: '여름 급등', urgency: 'mid', category: 'l_sanitary', source: 'trend', signalLabel: '생리대 +20% 급등' },
];

describe('getCandidateProductsByCategory', () => {
  it('해당 카테고리 품목을 urgency 순으로 dedupe 반환', () => {
    const out = getCandidateProductsByCategory('l_sanitary', 4);
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(4);
    expect(out.every(p => p.category === 'l_sanitary')).toBe(true);
    const names = out.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);
    const order = { high: 0, mid: 1, low: 2 } as const;
    for (let i = 1; i < out.length; i++) {
      expect(order[out[i - 1].urgency]).toBeLessThanOrEqual(order[out[i].urgency]);
    }
  });
  it('없는 카테고리는 빈 배열', () => {
    expect(getCandidateProductsByCategory('nonexistent_cat')).toEqual([]);
  });
});

describe('buildEventFromCandidates', () => {
  it('후보를 유효한 MarketingEvent로 변환', () => {
    const ev = buildEventFromCandidates(SAMPLE, '2026-06-23');
    expect(ev.id).toMatch(/^candidate-/);
    expect(ev.type).toBe('season');
    expect(ev.source).toBe('custom');
    expect(ev.start).toBe('2026-06-23');
    expect(ev.end).toBe('2026-07-07');
    expect(ev.categories.sort()).toEqual(['l_body', 'l_sanitary']);
    expect(ev.products).toHaveLength(2);
    expect(ev.products[0].name).toBe('기내 수분 마스크팩');
    expect(ev.checklist.length).toBeGreaterThan(0);
  });
  it('빈 후보면 빈 categories/products', () => {
    const ev = buildEventFromCandidates([], '2026-06-23');
    expect(ev.categories).toEqual([]);
    expect(ev.products).toEqual([]);
  });
});
