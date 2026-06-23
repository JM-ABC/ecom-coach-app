import { describe, it, expect } from 'vitest';
import { buildTrendProductsPrompt } from '../app/api/trend-products/route';

describe('buildTrendProductsPrompt', () => {
  it('기사·카테고리를 프롬프트에 포함하고 맘큐 룰을 명시', () => {
    const p = buildTrendProductsPrompt({
      insights: [{ title: '기내 수분 마스크 인기', summary: '여행 건조 케어 급증', tag: '소비트렌드', sourceLink: 'http://x' }],
      categories: ['l_body', 'l_tissue', 'b_wipe'],
    });
    expect(p).toContain('기내 수분 마스크 인기');
    expect(p).toContain('l_body');
    expect(p).toContain('정기구독');
    expect(p).toContain('배송');
    expect(p).toContain('추정');
  });
});
