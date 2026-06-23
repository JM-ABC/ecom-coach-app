# 트렌드/뉴스 → 품목 후보 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 네이버 트렌드/뉴스 신호를 맘큐 품목 후보로 변환해 인사이트·시즌 기획전 탭에서 검토·선택하고, 캘린더 이벤트 또는 AI 기획서로 보낸다.

**Architecture:** 하이브리드 생성 — 트렌드 카테고리는 기존 큐레이션 품목 재활용(결정적·무료), 뉴스 기사는 Claude Sonnet 구조화 출력으로 추출. 선택 후보는 localStorage 장바구니에 모아 `buildEventFromCandidates`로 `MarketingEvent`를 만들어 두 도착지(캘린더/AI 기획서)에 공급. 후보 UI는 공유 컴포넌트로 두 탭에서 재사용.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, `@anthropic-ai/sdk`(claude-sonnet-4-6, output_config json_schema + effort low), Vitest, CSS 변수 디자인 시스템.

**설계 문서:** `docs/plans/2026-06-23-trend-news-product-candidates-design.md`

---

## 사전 확인 (참고만, 변경 금지)

- 구조화 출력 패턴: `app/api/brief-ai/route.ts:130-150` (Anthropic SDK `output_config: { effort:'low', format:{ type:'json_schema', schema } }`)
- 트렌드 데이터 shape: `app/api/trends/route.ts:37-44` (`CategoryTrend`: ourKey, changeVsPrevWeek, latestRatio, keywords)
- 뉴스 인사이트 shape: `hooks/useNewsEvents.ts:18-26` (`NewsInsight`: tag, title, summary, sourceLink, pubDate)
- 커스텀 이벤트 추가: `hooks/useCustomEvents.ts` (`add(event)`, localStorage)
- AI 기획서 패널: `components/PromoPlanPanel.tsx` (`event: MarketingEvent` prop만 받음 — 무수정 재사용)
- 타입: `lib/types.ts` (`Product`, `MarketingEvent`, `UrgencyLevel`)
- 테스트: `test/*.test.ts`, `import { describe, it, expect } from 'vitest'`, 상대경로 import, 실행 `npm test`

---

## Task 1: ProductCandidate 타입 추가

**Files:**
- Modify: `lib/types.ts` (파일 끝에 추가)

**Step 1: 타입 추가**

```ts
export interface ProductCandidate {
  id: string;
  name: string;
  reason: string;
  urgency: UrgencyLevel;
  category: string;            // 맘큐 ourKey
  priceRange?: { min: number; max: number };
  source: 'trend' | 'news';
  signalLabel: string;         // "기저귀 +24% 급등" / "기내 수분 마스크 (뉴스)"
  sourceLink?: string;
  estimated?: boolean;
}
```

**Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

**Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: ProductCandidate 타입 추가"
```

---

## Task 2: 후보 헬퍼 — getCandidateProductsByCategory (결정적)

**Files:**
- Create: `lib/candidates.ts`
- Test: `test/candidates.test.ts`

**Step 1: 실패하는 테스트 작성**

```ts
// test/candidates.test.ts
import { describe, it, expect } from 'vitest';
import { getCandidateProductsByCategory } from '../lib/candidates';

describe('getCandidateProductsByCategory', () => {
  it('해당 카테고리 품목을 urgency 순으로 dedupe 반환', () => {
    const out = getCandidateProductsByCategory('l_sanitary', 4);
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(4);
    // 전부 요청 카테고리
    expect(out.every(p => p.category === 'l_sanitary')).toBe(true);
    // 이름 중복 없음
    const names = out.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);
    // high가 mid보다 앞
    const order = { high: 0, mid: 1, low: 2 } as const;
    for (let i = 1; i < out.length; i++) {
      expect(order[out[i - 1].urgency]).toBeLessThanOrEqual(order[out[i].urgency]);
    }
  });

  it('없는 카테고리는 빈 배열', () => {
    expect(getCandidateProductsByCategory('nonexistent_cat')).toEqual([]);
  });
});
```

**Step 2: 실패 확인**

Run: `npm test -- candidates`
Expected: FAIL ("getCandidateProductsByCategory is not a function" 등)

**Step 3: 최소 구현**

```ts
// lib/candidates.ts
import { EVENTS, LIFECYCLE_RECOS } from './data';
import type { Product } from './types';

const URGENCY_ORDER: Record<string, number> = { high: 0, mid: 1, low: 2 };

/** EVENTS·LIFECYCLE_RECOS의 큐레이션 품목 중 해당 카테고리를 dedupe+정렬해 반환 */
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
    // priceRange 보유 우선
    return (b.priceRange ? 1 : 0) - (a.priceRange ? 1 : 0);
  });

  return deduped.slice(0, limit);
}
```

**Step 4: 통과 확인**

Run: `npm test -- candidates`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/candidates.ts test/candidates.test.ts
git commit -m "feat: getCandidateProductsByCategory 헬퍼 + 테스트"
```

---

## Task 3: 후보 → MarketingEvent 빌더

**Files:**
- Modify: `lib/candidates.ts`
- Test: `test/candidates.test.ts` (추가)

**Step 1: 실패하는 테스트 추가**

```ts
import { buildEventFromCandidates } from '../lib/candidates';
import type { ProductCandidate } from '../lib/types';

const SAMPLE: ProductCandidate[] = [
  { id: 'c1', name: '기내 수분 마스크팩', reason: '기내 건조 트렌드', urgency: 'high', category: 'l_body', source: 'news', signalLabel: '기내 마스크 (뉴스)', estimated: true },
  { id: 'c2', name: '쿨링 생리대', reason: '여름 급등', urgency: 'mid', category: 'l_sanitary', source: 'trend', signalLabel: '생리대 +20% 급등' },
];

describe('buildEventFromCandidates', () => {
  it('후보를 유효한 MarketingEvent로 변환', () => {
    const ev = buildEventFromCandidates(SAMPLE, '2026-06-23');
    expect(ev.id).toMatch(/^candidate-/);
    expect(ev.type).toBe('season');
    expect(ev.source).toBe('custom');
    expect(ev.start).toBe('2026-06-23');
    expect(ev.end).toBe('2026-07-07'); // +14일
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
```

**Step 2: 실패 확인** — Run: `npm test -- candidates` → FAIL

**Step 3: 구현 추가**

```ts
// lib/candidates.ts (추가)
import type { MarketingEvent, ProductCandidate } from './types';

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 선택 후보 묶음 → 검토용 커스텀 MarketingEvent */
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
```

**Step 4: 통과 확인** — Run: `npm test -- candidates` → PASS

**Step 5: Commit**

```bash
git add lib/candidates.ts test/candidates.test.ts
git commit -m "feat: buildEventFromCandidates 빌더 + 테스트"
```

---

## Task 4: 뉴스 품목 추출 라우트 (Claude)

**Files:**
- Create: `app/api/trend-products/route.ts`
- Test: `test/trend-products-prompt.test.ts`

**Step 1: 실패하는 테스트 작성 (프롬프트 빌더만 단위 테스트)**

```ts
// test/trend-products-prompt.test.ts
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
    expect(p).toContain('정기구독'); // 룰 명시
    expect(p).toContain('배송');     // 룰 명시
    expect(p).toContain('추정');     // estimated 표기 지침
  });
});
```

**Step 2: 실패 확인** — Run: `npm test -- trend-products` → FAIL

**Step 3: 라우트 구현** (brief-ai 패턴 미러링)

```ts
// app/api/trend-products/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface InsightInput { title: string; summary: string; tag?: string; sourceLink?: string }
interface TrendProductsRequest { insights: InsightInput[]; categories: string[] }

export function buildTrendProductsPrompt(req: TrendProductsRequest): string {
  const articles = req.insights
    .map((a, i) => `${i + 1}. [${a.tag ?? '트렌드'}] ${a.title} — ${a.summary} (출처: ${a.sourceLink ?? '없음'})`)
    .join('\n');

  return `당신은 하기스 중심 유아동+생활용품 자사몰 "맘큐"의 MD입니다.
아래 소비 트렌드 기사에서 맘큐가 실제로 판매할 수 있는 구체적 "품목 후보"를 추출하세요.

[맘큐 카테고리 ID 목록] ${req.categories.join(', ')}

[소비 트렌드 기사]
${articles}

[규칙]
- 맘큐가 실제 취급 가능한 구체 품목만. 맘큐 카테고리와 무관한 품목은 제외하세요.
- 각 품목의 category는 위 맘큐 카테고리 ID 중 가장 맞는 것으로 매핑하세요.
- 맘큐는 정기구독 모델이 없습니다. 정기구독 제안 금지.
- 배송 운영(무료배송·배송보장 등) 제안 금지. 쿠팡 로켓배송 등 플랫폼 기능 언급도 하지 마세요.
- 가격대(priceRange)는 확정 데이터가 아니므로 추정할 경우 estimated를 true로 설정하세요.
- signalLabel은 "기사 핵심 (뉴스)" 형식으로 작성하세요.
- sourceLink는 해당 기사의 출처 링크를 그대로 넣으세요.
- 관련 품목이 없는 기사는 후보를 만들지 마세요(빈 결과 허용).`;
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          reason: { type: 'string' },
          urgency: { type: 'string', enum: ['high', 'mid', 'low'] },
          category: { type: 'string' },
          priceRange: {
            type: 'object',
            properties: { min: { type: 'number' }, max: { type: 'number' } },
            required: ['min', 'max'],
            additionalProperties: false,
          },
          signalLabel: { type: 'string' },
          sourceLink: { type: 'string' },
          estimated: { type: 'boolean' },
        },
        required: ['name', 'reason', 'urgency', 'category', 'signalLabel'],
        additionalProperties: false,
      },
    },
  },
  required: ['candidates'],
  additionalProperties: false,
} as const;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ candidates: [], status: 'no-api-key' });

  try {
    const body: TrendProductsRequest = await request.json();
    if (!body.insights?.length) return NextResponse.json({ candidates: [], status: 'ok' });

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: RESPONSE_SCHEMA } },
      messages: [{ role: 'user', content: buildTrendProductsPrompt(body) }],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ candidates: [], status: 'error' }, { status: 502 });
    }

    const raw = response.content.find(b => b.type === 'text')?.text ?? '';
    let parsed: { candidates: unknown[] };
    try { parsed = JSON.parse(raw); } catch { parsed = { candidates: [] }; }

    // 서버에서 id/source 부여 (클라이언트는 그대로 사용)
    const candidates = (parsed.candidates ?? []).map((c, i) => ({
      ...(c as object),
      id: `news-cand-${Date.now()}-${i}`,
      source: 'news' as const,
    }));

    return NextResponse.json({ candidates, status: 'ok' });
  } catch (err) {
    console.error('[trend-products] Error:', err);
    return NextResponse.json({ candidates: [], status: 'error', message: String(err) }, { status: 500 });
  }
}
```

**Step 4: 통과 확인** — Run: `npm test -- trend-products` → PASS

**Step 5: 타입 체크** — Run: `npx tsc --noEmit` → 에러 없음

**Step 6: Commit**

```bash
git add app/api/trend-products/route.ts test/trend-products-prompt.test.ts
git commit -m "feat: 뉴스 품목 추출 라우트(trend-products) + 프롬프트 테스트"
```

---

## Task 5: useCandidateCart 훅

**Files:**
- Create: `hooks/useCandidateCart.ts`

**Step 1: 구현** (useCustomEvents 패턴 미러링, localStorage)

```ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProductCandidate } from '@/lib/types';

const STORAGE_KEY = 'momq-candidate-cart';

function load(): ProductCandidate[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function save(items: ProductCandidate[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

export function useCandidateCart() {
  const [items, setItems] = useState<ProductCandidate[]>([]);
  useEffect(() => { setItems(load()); }, []);

  const add = useCallback((c: ProductCandidate) => {
    setItems(prev => {
      if (prev.some(p => p.id === c.id || p.name === c.name)) return prev;
      const next = [...prev, c]; save(next); return next;
    });
  }, []);
  const remove = useCallback((id: string) => {
    setItems(prev => { const next = prev.filter(p => p.id !== id); save(next); return next; });
  }, []);
  const clear = useCallback(() => { save([]); setItems([]); }, []);
  const has = useCallback((id: string) => items.some(p => p.id === id), [items]);

  return { items, add, remove, clear, has };
}
```

**Step 2: 타입 체크** — Run: `npx tsc --noEmit` → 에러 없음

**Step 3: Commit**

```bash
git add hooks/useCandidateCart.ts
git commit -m "feat: useCandidateCart 후보 장바구니 훅"
```

---

## Task 6: useTrendProducts 훅 (뉴스 후보 fetch)

**Files:**
- Create: `hooks/useTrendProducts.ts`

**Step 1: 구현**

```ts
'use client';

import { useState, useCallback } from 'react';
import type { ProductCandidate } from '@/lib/types';
import type { NewsInsight } from '@/hooks/useNewsEvents';

type FetchStatus = 'idle' | 'loading' | 'ok' | 'no-api-key' | 'error';

export function useTrendProducts() {
  const [candidates, setCandidates] = useState<ProductCandidate[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');

  const analyze = useCallback(async (insights: NewsInsight[], categories: string[]) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/trend-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insights: insights.map(i => ({ title: i.title, summary: i.summary, tag: i.tag, sourceLink: i.sourceLink })),
          categories,
        }),
      });
      const data = await res.json();
      setCandidates(data.candidates ?? []);
      setStatus(data.status ?? 'ok');
    } catch {
      setStatus('error');
    }
  }, []);

  return { candidates, status, analyze };
}
```

**Step 2: 타입 체크** — Run: `npx tsc --noEmit` → 에러 없음

**Step 3: Commit**

```bash
git add hooks/useTrendProducts.ts
git commit -m "feat: useTrendProducts 뉴스 후보 fetch 훅"
```

---

## Task 7: CandidateSection 공유 컴포넌트

**Files:**
- Create: `components/candidates/CandidateSection.tsx`

후보 카드 리스트 렌더 + "담기" 버튼. props: `{ candidates, onAdd, isInCart }`.
디자인 시스템 토큰만 사용(`var(--fs-*)`, `var(--surface)` 등). 각 카드: name, signalLabel,
reason, urgency 배지, estimated면 "추정가" 라벨, sourceLink 있으면 기사 링크, 담기 버튼
(이미 담겼으면 "담김" disabled). InsightsPanel의 기존 카드 스타일(`padding:'14px 16px'`,
`borderRadius:'var(--radius-md)'`, `border:'1px solid var(--border)'`)을 참고해 일관 유지.

**Step 1: 구현** (전체 컴포넌트 — 기존 InsightsPanel 카드 스타일 차용)

```tsx
'use client';

import React from 'react';
import Icon from '@/components/Icon';
import type { ProductCandidate } from '@/lib/types';

const URGENCY: Record<string, { label: string; bg: string; color: string }> = {
  high: { label: '높음', bg: 'oklch(0.94 0.06 145)', color: 'var(--success)' },
  mid:  { label: '보통', bg: 'var(--bg-subtle)', color: 'var(--text-muted)' },
  low:  { label: '낮음', bg: 'var(--bg-subtle)', color: 'var(--text-subtle)' },
};

interface Props {
  candidates: ProductCandidate[];
  onAdd: (c: ProductCandidate) => void;
  isInCart: (id: string) => boolean;
}

export default function CandidateSection({ candidates, onAdd, isInCart }: Props) {
  if (candidates.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {candidates.map(c => {
        const u = URGENCY[c.urgency] ?? URGENCY.mid;
        const inCart = isInCart(c.id);
        return (
          <div key={c.id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
                <span style={{ fontSize: 'var(--fs-2xs)', fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: u.bg, color: u.color }}>{u.label}</span>
                {c.estimated && <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-subtle)' }}>추정가</span>}
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-text)', marginBottom: 3 }}>{c.signalLabel}</div>
              <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.reason}</div>
              {c.sourceLink && (
                <a href={c.sourceLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Icon name="share" size={10} />기사 출처
                </a>
              )}
            </div>
            <button className={`btn sm ${inCart ? '' : 'primary'}`} disabled={inCart} onClick={() => onAdd(c)} style={{ flexShrink: 0 }}>
              {inCart ? <><Icon name="check" size={12} />담김</> : <><Icon name="plus" size={12} />담기</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: 타입 체크** — Run: `npx tsc --noEmit` → 에러 없음

**Step 3: Commit**

```bash
git add components/candidates/CandidateSection.tsx
git commit -m "feat: CandidateSection 후보 카드 공유 컴포넌트"
```

---

## Task 8: CandidateCartBar 공유 컴포넌트 (+ 도착지 액션)

**Files:**
- Create: `components/candidates/CandidateCartBar.tsx`

장바구니 카운트 + [캘린더 추가] [AI 기획서로] 버튼. AI 기획서 클릭 시 내부에서
`PromoPlanPanel`을 마운트. 캘린더 추가는 props로 받은 `onAddToCalendar(event)` 호출.

**Step 1: 구현**

```tsx
'use client';

import React, { useState } from 'react';
import Icon from '@/components/Icon';
import PromoPlanPanel from '@/components/PromoPlanPanel';
import { buildEventFromCandidates } from '@/lib/candidates';
import type { ProductCandidate, MarketingEvent } from '@/lib/types';

interface Props {
  items: ProductCandidate[];
  onAddToCalendar: (ev: MarketingEvent) => void;
  onClear: () => void;
}

function todayIso(): string { return new Date().toISOString().slice(0, 10); }

export default function CandidateCartBar({ items, onAddToCalendar, onClear }: Props) {
  const [planEvent, setPlanEvent] = useState<MarketingEvent | null>(null);
  const [added, setAdded] = useState(false);
  if (items.length === 0) return null;

  const handleCalendar = () => {
    onAddToCalendar(buildEventFromCandidates(items, todayIso()));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div style={{ position: 'sticky', bottom: 12, marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--accent-border)', boxShadow: 'var(--shadow-md)' }}>
        <Icon name="sparkles" size={14} />
        <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text)' }}>담은 후보 {items.length}</span>
        <button className="btn ghost sm" onClick={onClear} style={{ fontSize: 'var(--fs-xs)' }}>비우기</button>
        <div style={{ flex: 1 }} />
        <button className="btn sm" onClick={handleCalendar}>
          <Icon name={added ? 'check' : 'plus'} size={12} />{added ? '추가됨' : '캘린더 추가'}
        </button>
        <button className="btn primary sm" onClick={() => setPlanEvent(buildEventFromCandidates(items, todayIso()))}>
          <Icon name="sparkles" size={12} />AI 기획서로
        </button>
      </div>
      {planEvent && <PromoPlanPanel event={planEvent} onClose={() => setPlanEvent(null)} />}
    </>
  );
}
```

**Step 2: 타입 체크** — Run: `npx tsc --noEmit` → 에러 없음

**Step 3: Commit**

```bash
git add components/candidates/CandidateCartBar.tsx
git commit -m "feat: CandidateCartBar 장바구니 바 + 도착지 액션"
```

---

## Task 9: InsightsPanel 연결 (트렌드 + 뉴스)

**Files:**
- Modify: `components/tabs/InsightsPanel.tsx`

**변경 내용:**
1. import 추가: `useCandidateCart`, `useTrendProducts`, `useCustomEvents`, `CandidateSection`, `CandidateCartBar`, `getCandidateProductsByCategory`, `CATEGORIES`.
2. `TrendPanel`: 급등 카테고리(`changeVsPrevWeek >= 8`) 각 행 아래 접이식 "품목 후보 N" 영역.
   `getCandidateProductsByCategory(t.ourKey)`로 `Product[]`를 받아 `ProductCandidate`로 매핑
   (`source:'trend'`, `signalLabel: '${t.title} +${t.changeVsPrevWeek}% 급등'`,
   `id: 'trend-${t.ourKey}-${idx}'`). `CandidateSection`으로 렌더.
3. `NewsDetectionPanel`의 소비 트렌드 탭: "품목 후보 분석" 버튼 → `useTrendProducts().analyze(insights, CATEGORIES.map(c=>c.id))`.
   로딩/결과를 `CandidateSection`으로 렌더.
4. 상위 `InsightsPanel`에 `useCandidateCart` + `useCustomEvents` 두고, 하단에
   `<CandidateCartBar items={cart.items} onAddToCalendar={custom.add} onClear={cart.clear} />`.
   `cart.add`/`cart.has`를 두 패널에 prop으로 전달.

**Step 1: 위 변경 적용** (기존 카드 스타일·StatusBadge 재사용, 디자인 토큰 유지)

**Step 2: 타입 체크 + 빌드**

Run: `npx tsc --noEmit` → 에러 없음
Run: `npm run build` → 성공

**Step 3: Commit**

```bash
git add components/tabs/InsightsPanel.tsx
git commit -m "feat: InsightsPanel 트렌드/뉴스 품목 후보 연결"
```

---

## Task 10: SeasonPromos 연결 (시즌 기획전 탭)

**Files:**
- Modify: `components/tabs/SeasonPromos.tsx`

**변경 내용:**
1. import: `useTrendData`, `useCandidateCart`, `useCustomEvents`(이미 사용 중), `CandidateSection`, `CandidateCartBar`, `getCandidateProductsByCategory`.
2. "지금 주목할 기획전" 히어로 아래(또는 이벤트 목록 위)에 **"트렌드 기반 추천 후보"** 섹션 추가.
   `useTrendData()`의 급등 카테고리 → `getCandidateProductsByCategory` → `ProductCandidate` 매핑 →
   `CandidateSection`. 섹션 제목·여백은 기존 "지금 주목할 기획전" 헤더 스타일 차용.
3. 하단에 `CandidateCartBar` 추가 (캘린더 추가 = 기존 `useCustomEvents().add`).
4. 뉴스 기반 후보는 인사이트 탭에만(시즌 탭은 트렌드 후보만으로 가볍게 유지 — YAGNI).

**Step 1: 위 변경 적용**

**Step 2: 타입 체크 + 빌드**

Run: `npx tsc --noEmit` → 에러 없음
Run: `npm run build` → 성공

**Step 3: Commit**

```bash
git add components/tabs/SeasonPromos.tsx
git commit -m "feat: 시즌 기획전 탭에 트렌드 기반 품목 후보 섹션"
```

---

## Task 11: 전체 검증 + 수동 QA + 배포

**Step 1: 전체 테스트**

Run: `npm test`
Expected: 전체 PASS (candidates, trend-products, 기존 weather-parser/example)

**Step 2: 타입 + 빌드**

Run: `npx tsc --noEmit && npm run build`
Expected: 에러 없음, 빌드 성공

**Step 3: 수동 QA (dev 서버 또는 배포본)**

- 인사이트 > 트렌드 연동: 급등 카테고리 아래 "품목 후보" 노출, 담기 동작
- 인사이트 > 뉴스 감지 > 소비 트렌드: "품목 후보 분석" 클릭 → 후보 반환(또는 빈 결과 메시지)
- 시즌 기획전 탭: "트렌드 기반 추천 후보" 섹션 노출
- 장바구니 → 캘린더 추가 → 마케팅 캘린더/시즌 기획전에 카드로 노출 확인
- 장바구니 → AI 기획서로 → PromoPlanPanel 열림 + 생성 동작
- `ANTHROPIC_API_KEY`/`NAVER_*` 미설정 시 graceful 메시지(앱 안 깨짐)

**Step 4: 배포 (프로젝트 관례 — main 직접 push)**

```bash
git push origin main
```

Vercel 자동 배포. (CLAUDE.md: main → origin/main 직접 push)

---

## 참고 규칙 (구현 중 준수)

- 디자인 시스템: 폰트/컬러/라디우스/섀도 전부 CSS 변수. 반픽셀·하드코딩 hex 금지.
- 비즈니스 룰: 정기구독·배송 제안 금지(프롬프트·빌더에서 강제), 추정치 라벨, 맘큐 카테고리 한정.
- 새 컴포넌트 후 `grep -n "fontSize: [0-9]*\." <파일>`로 반픽셀 잔존 확인.
- 커밋은 태스크 단위로 자주.
