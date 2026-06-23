# 트렌드/뉴스 신호 → 품목 후보 기능 설계

작성일: 2026-06-23

## 배경 / 문제

맘큐 MD 플래너의 이벤트 추천 품목은 `lib/data.ts`에 수기 큐레이션되어 있다. 네이버
DataLab 트렌드(`/api/trends`)와 네이버 뉴스(`/api/news-events`)는 트렌드 점수·뉴스 감지에만
쓰이고, 신흥 트렌드(예: 여름 휴가 기내 수분 마스크)는 누군가 직접 데이터에 넣어야만
품목으로 노출된다. 실시간 신호를 **품목 후보**로 자동 변환해 MD가 바로 검토·활용하게 한다.

## 결정 사항 (사용자 확정)

- **신호源**: 트렌드(DataLab 카테고리) + 뉴스(소비 트렌드 기사) 둘 다
- **생성 방식**: 하이브리드 — 트렌드 카테고리는 기존 큐레이션 재활용(무료), 뉴스 기사는
  Claude로 품목 추출(신흥 트렌드 포착)
- **도착지**: 캘린더 이벤트에 추가 + AI 기획서 입력으로 (둘 다)
- **노출 위치**: 인사이트 탭 + 시즌 기획전 탭 양쪽. 최종 생성 이벤트는 기존 카드 형태로 렌더

## 데이터 모델 (`lib/types.ts`)

```ts
interface ProductCandidate {
  id: string;
  name: string;
  reason: string;
  urgency: UrgencyLevel;
  category: string;            // 맘큐 ourKey (카테고리 ID)
  priceRange?: { min: number; max: number };
  source: 'trend' | 'news';
  signalLabel: string;         // "기저귀 +24% 급등" / "기내 수분 마스크 (뉴스)"
  sourceLink?: string;         // 뉴스 출처 링크
  estimated?: boolean;         // 추정 가격 여부 (룰: 추정치 표기)
}
```

## 후보 생성 — 하이브리드

### A. 트렌드 → 결정적 (무료)

- `lib/data.ts`에 `getCandidateProductsByCategory(ourKey: string, limit = 4): Product[]`
  추가. `EVENTS`·`LIFECYCLE_RECOS`의 `products` 중 `category === ourKey`를 이름 기준 dedupe,
  urgency(high>mid>low) → priceRange 보유 순으로 정렬해 상위 N개 반환.
- 기존 큐레이션 데이터 재활용 → 신규 콘텐츠 0, 토큰 0.
- 급등 카테고리(`changeVsPrevWeek >= 8`)에 대해 후보 생성. `signalLabel = "{title} +{change}% 급등"`.

### B. 뉴스 → Claude 추출 (AI)

- 신규 라우트 `app/api/trend-products/route.ts`
  - 입력: `{ insights: [{ title, summary, tag, sourceLink }], categories: 맘큐 카테고리 목록 }`
  - 모델: `claude-sonnet-4-6` + structured output(`output_config.format`) + `effort: low`
    (brief-ai 패턴 재사용 → 저비용)
  - 출력 스키마: `{ candidates: ProductCandidate[] }` (기사 sourceLink 패스스루)
  - 프롬프트 룰 주입: 맘큐가 실제 팔 수 있는 구체 품목만, 맘큐 카테고리(ourKey)로 매핑,
    맘큐 무관 품목 제외, 정기구독·배송 제안 금지, 추정 가격은 `estimated: true`
  - 호출은 **버튼 클릭 시에만** (로드 시 자동 X) → 수동적 토큰 소모 없음
- `no-api-key` / `error` 시 `{ candidates: [], status }` 반환, UI는 graceful 메시지.
  무관한 기사는 후보 0개 반환 가능(정상).

## 후보 장바구니 + 도착지

- 신규 `hooks/useCandidateCart.ts` — localStorage(`momq-candidate-cart`), useCustomEvents 패턴.
  `{ items, add, remove, clear, has }`.
- 공통 빌더 `buildEventFromCandidates(items: ProductCandidate[]): MarketingEvent`
  - `categories` = 후보 카테고리 합집합, `products` = 후보 매핑(Product),
    `start` = 오늘, `end` = +14d, `type: 'season'`, `source: 'custom'`,
    `summary` = "트렌드/뉴스 신호 기반 후보 모음 — 검토 후 확정 필요",
    `search`/`gmv` = "신호 기반", 최소 checklist, `trendScore` 적정값.
- 도착지 액션 (장바구니 바):
  1. **캘린더 추가** → `useCustomEvents.add(buildEventFromCandidates(items))`
  2. **AI 기획서로** → 로컬 `planEvent` state 설정 → `<PromoPlanPanel event={planEvent} />`
     (기존 흐름 100% 재사용, PromoPlanPanel 무수정)

## UI 배치 (공유 컴포넌트로 DRY)

- 신규 공유 컴포넌트:
  - `components/candidates/CandidateSection.tsx` — 후보 카드 리스트 + 담기 버튼
    (source/ signalLabel/ 출처 링크/ 추정치 라벨 표시)
  - `components/candidates/CandidateCartBar.tsx` — 장바구니 카운트 + [캘린더 추가]/[AI 기획서로]
    + `PromoPlanPanel` 마운트
- `hooks/useTrendProducts.ts` — `/api/trend-products` 호출 래퍼(상태/로딩)
- **인사이트 탭** (`InsightsPanel.tsx`):
  - 트렌드 연동: 급등 카테고리 아래 "품목 후보 N" (결정적)
  - 뉴스 감지 > 소비 트렌드: "품목 후보 분석" 버튼 → 기사별 후보(AI)
- **시즌 기획전 탭** (`SeasonPromos.tsx`):
  - 상단에 "트렌드 기반 추천 후보" 섹션을 카드 스타일로 추가 (`CandidateSection` 재사용)
- 두 탭 모두 `CandidateCartBar` + 동일 cart 공유(localStorage)

## 가드레일 / 비즈니스 룰

- 후보·생성 이벤트에 "검토 필요 / 추정치" 라벨.
- 뉴스 AI 프롬프트가 맘큐 룰 강제(정기구독·배송 제안 금지, 맘큐 카테고리 한정, 추정가 표기).
- 신규 env 없음 — 기존 `ANTHROPIC_API_KEY`, `NAVER_CLIENT_ID/SECRET` 재사용.
- 디자인 시스템: CSS 변수·토큰만 사용(반픽셀·하드코딩 hex 금지).

## 손대는 파일

| 파일 | 변경 |
|------|------|
| `lib/types.ts` | `ProductCandidate` 추가 |
| `lib/data.ts` | `getCandidateProductsByCategory` 헬퍼 추가 |
| `app/api/trend-products/route.ts` | 신규 — Claude Sonnet 품목 추출 |
| `hooks/useCandidateCart.ts` | 신규 — 후보 장바구니(localStorage) |
| `hooks/useTrendProducts.ts` | 신규 — 뉴스 후보 fetch 래퍼 |
| `components/candidates/CandidateSection.tsx` | 신규 — 후보 카드 UI |
| `components/candidates/CandidateCartBar.tsx` | 신규 — 장바구니 바 + 도착지 액션 |
| `components/tabs/InsightsPanel.tsx` | 후보 UI 연결(트렌드/뉴스) |
| `components/tabs/SeasonPromos.tsx` | 상단 후보 섹션 + 카트 바 연결 |

## 테스트

- Vitest 단위:
  - `getCandidateProductsByCategory` — dedupe / urgency 정렬 / limit
  - `buildEventFromCandidates` — MarketingEvent 유효성 / categories 합집합
  - `/api/trend-products` 프롬프트 빌더 + 스키마 파싱 (Claude mock)
- 수동 QA:
  - 급등 카테고리 → 후보 노출 / 뉴스 "분석" → 후보 반환
  - 장바구니 → 캘린더 추가 → 시즌 기획전·캘린더에 카드로 노출
  - 장바구니 → AI 기획서로 → PromoPlanPanel 생성

## YAGNI 컷

- 로드 시 AI 자동 실행 X (클릭 기반)
- 후보 인라인 편집 X (v1은 읽기 + 선택)
- 장바구니 단일 공유 리스트

## 비용

- 트렌드 후보: 0 (데이터 재활용)
- 뉴스 추출: "분석" 클릭당 Sonnet 1회(배치, effort low) — 저비용, 수동 트리거
