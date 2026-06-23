import { describe, it, expect } from 'vitest';
import { getCandidateProductsByCategory } from '../lib/candidates';

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
