# AI 프로모션 기획서 + 큐레이션 강화 + 날씨 위젯

**날짜:** 2026-05-07  
**상태:** 승인됨 (리뷰 반영 수정)

---

## 개요

네이버 DataLab 검색 트렌드·뉴스 이벤트 감지·기상청 예보 데이터를 인풋으로 활용하여, 마케팅 캘린더 이벤트별 맘큐 자사몰 프로모션 기획서를 Gemini API로 자동 생성한다. 추천 상품 데이터를 강화하고, 날씨 기반 마케팅 힌트 위젯을 추가한다.

**핵심 원칙:** 네이버 검색량 데이터는 프로모션 기회 발굴의 **인풋**, 기획서 산출물은 **맘큐 자사몰 전용**.

---

## 서브시스템 구성

| 서브시스템 | 역할 | 주요 파일 |
|---|---|---|
| 큐레이션 강화 | 추천 상품에 가격대·플랫폼 팁·준비 D-day 추가 | `lib/types.ts`, `lib/data.ts` |
| 네이버 트렌드 연동 기획서 생성 | 네이버 검색 트렌드 + 이벤트 → Gemini API → 맘큐 자사몰 기획서 | `app/api/promo-plan/route.ts`, `components/PromoPlanPanel.tsx` |
| 날씨 기반 마케팅 힌트 위젯 | 기상청 예보 → 캘린더 상단 상품 수요 힌트 | `components/WeatherWidget.tsx` |

---

## 서브시스템 1: 큐레이션 강화

### 타입 변경 (`lib/types.ts`)

기존 `Product` 인터페이스에 선택적 필드 추가 (기존 타입명 유지):

```ts
export interface Product {
  name: string;
  reason: string;
  urgency: UrgencyLevel;
  category: string;
  priceRange?: { min: number; max: number };   // 원 단위
  prepDays?: number;                            // 행사 D-day 기준 준비 시작일
  momqTip?: string;                             // 맘큐 자사몰 한 줄 전략
}
```

> **주의:** 기존 코드에서 `Product`로 정의되어 있으며 `MarketingEvent.products: Product[]`로 참조됨. 타입명 변경 시 전체 타입 체인이 깨지므로 기존 이름 유지 필수.

### 데이터 확장 (`lib/data.ts`)

기존 17개 이벤트의 `products[]`에 위 필드를 점진적으로 추가. 우선 trendScore 80 이상 이벤트(어린이날, 크리스마스, 신학기, 맘큐기획전, 추석 등)부터 채운다.

---

## 서브시스템 2: Gemini 기획서 생성

### API Route (`app/api/promo-plan/route.ts`)

- `POST /api/promo-plan`
- 입력: `{ eventId, title, date, products, trendScore, summary, naverTrends?, weatherHint? }`
- 출력: 스트리밍 텍스트 (`ReadableStream` + Next.js `new Response(stream)` 패턴)
- 모델: `gemini-1.5-flash`
- API 키: `process.env.GEMINI_API_KEY` (`.env.local`)
- 패키지: `@google/generative-ai`

**네이버 트렌드 데이터 주입 (핵심):**

기획서 생성 요청 시, 클라이언트에서 기존 `/api/trends` 응답의 관련 카테고리 트렌드를 함께 전달한다:

```ts
// 클라이언트에서 promo-plan 요청 시
const trendsRes = await fetch('/api/trends');
const { trends } = await trendsRes.json();

// 이벤트의 categories와 매칭되는 트렌드만 필터
const relevantTrends = trends.filter((t: CategoryTrend) =>
  event.categories.includes(t.ourKey)
);

// promo-plan 요청에 포함
fetch('/api/promo-plan', {
  method: 'POST',
  body: JSON.stringify({
    ...eventData,
    naverTrends: relevantTrends.map(t => ({
      category: t.title,
      latestRatio: t.latestRatio,
      changeVsPrevWeek: t.changeVsPrevWeek,
      keywords: t.keywords,
    })),
  }),
});
```

**프롬프트 구조:**

```
당신은 맘큐(momq.co.kr) D2C 브랜드의 시니어 MD입니다.
아래 이벤트와 실시간 검색 트렌드 데이터를 기반으로 맘큐 자사몰 전용 프로모션 기획서를 작성하세요.

[이벤트 정보]
- 행사명: {title}
- 일정: {date}
- 기회점수: {trendScore}/100
- 요약: {summary}
- 추천 상품: {products}

[네이버 검색 트렌드 — 최근 4주]
{naverTrends 데이터: 카테고리별 검색량 비율, 전주 대비 변화율, 주요 키워드}

[날씨 힌트]
{weatherHint: 기상청 예보 기반 상품 수요 예측 — 있을 경우만}

[맘큐 프리미엄 멤버십 체계]
유료 가입제, 3등급 구성. 혜택 설계 시 이 등급 체계를 활용하세요.

| 등급 | 가입비 | 이용기간 | 주요 혜택 |
|------|--------|----------|-----------|
| 라이트 | 무료~저가 | 100일 | 기본 쿠폰·포인트 |
| 스탠다드 | 20,000원 | 100일 | 가입축하 포인트 15,000P, 총 혜택 ~24,745원 (가입비 대비 이득 프레임) |
| 프리미엄 | 6,000원 | 100일 | 가입축하 선물 + 당근포인트 4,000P, 매달 쇼핑지원금 3,000원(총 12,000원), 얼리버드 보너스 1,000원, 재가입 보너스, 5% 추가 할인 |

프리미엄 멤버십 전용 혜택:
- 가입 즉시 현금처럼 사용하는 포인트 축하선물
- 매일 MY 가게방문 적립
- 1년 내내 쇼핑지원금 (매달 3,000원)
- 친구 (신규)회원 추가 시 얼리버드 보너스
- 멤버십 재가입 보너스
- 멤버십(유아 기간 5% 더 할인)
- 대한교과서 적립금 강화혜택
- 프리미엄 멤버십 추가적립

[출력 형식 — 마크다운]
## 행사 개요
(2-3문장, 검색 트렌드 인사이트 포함)

## 트렌드 기반 기회 분석
(네이버 검색량 기반 상승/하강 카테고리, 주력 키워드 제안)

## 맘큐 자사몰 프로모션 전략
### 체험단 & 커뮤니티 후기 전략
### 멤버십 등급별 혜택 설계
(라이트/스탠다드/프리미엄 등급별 차등 쿠폰·포인트·단독가 설계. 비회원→라이트, 라이트→스탠다드, 스탠다드→프리미엄 업그레이드 유도 시나리오 포함)
### 라이브방송 / 콘텐츠 마케팅 계획
### MD 단독 기획전 구성

## 준비 타임라인 (D-day 기준)
(D-21, D-14, D-7, D-3, D-0)

## SNS 카피 초안
(맘 커뮤니티 감성 2개, 네이버 인기 키워드 반영)

주의: 쿠팡·네이버 등 외부 채널 전략은 제외. 맘큐 자사몰 프로모션에 집중.
단, 네이버 검색 트렌드 데이터는 시장 수요 근거로 적극 인용하세요.
멤버십 등급 업그레이드를 프로모션의 핵심 전환 목표 중 하나로 설정하세요.
```

**확장성:** 응답 구조를 `channels: { momq: {...} }` JSON으로 파싱 가능하도록 나중에 네이버·쿠팡 채널 추가 시 `channels.naver`, `channels.coupang`만 추가하면 됨.

### UI 컴포넌트 (`components/PromoPlanPanel.tsx`)

- `DetailPanel` 우측에 슬라이드 패널로 오픈
- 상태: 닫힘 / 로딩(스트리밍 중) / 완료
- 완료 상태 액션 버튼 2개:
  - **복사** — `navigator.clipboard.writeText(planText)`
  - **다운로드** — `.md` 파일로 저장 (`{title}-promo-plan.md`)
- "기획서 생성" 버튼: `DetailPanel.tsx`의 Footer 영역에 추가

### 환경변수

`.env.local`:
```
GEMINI_API_KEY=your_key_here
```

---

## 서브시스템 3: 날씨 기반 마케팅 힌트 위젯

### 컴포넌트 (`components/WeatherWidget.tsx`)

- 기존 `app/api/weather/route.ts` 재사용
- **주의:** 이 API는 원시 날씨 데이터(온도·맑음 등)가 아닌 `MarketingEvent[]`를 반환함 (폭염·한파·강수·적설 이벤트). 위젯은 이 MarketingEvent를 요약 표시하는 형태로 구현해야 함.
- 마케팅 캘린더 헤더 상단에 작은 배너로 표시
- 표시 형식 예시:
  - 날씨 이벤트 있을 때: `"⚡ 폭염 예보 (최고 35°C) — 냉방용품·쿨링 제품 수요 급증 예상"`
  - 날씨 이벤트 없을 때: `"☀️ 이번 주 특이 날씨 없음 — 시즌 기본 전략 유지"`
- 데이터 캐시: API route에서 `next: { revalidate: 3600 }` 서버 캐시가 이미 적용되어 있으므로, 클라이언트는 단순 `useState` + `useEffect`로 fetch 후 보관. `localStorage` 불필요.

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|---|---|---|
| `lib/types.ts` | 수정 | `Product`에 `priceRange`, `prepDays`, `momqTip` 선택 필드 추가 |
| `lib/data.ts` | 수정 | trendScore 80+ 이벤트 products 큐레이션 강화 |
| `app/api/promo-plan/route.ts` | 신규 | Gemini API 호출 + 네이버 트렌드 데이터 인풋, 스트리밍 응답 |
| `components/PromoPlanPanel.tsx` | 신규 | 기획서 패널 (스트리밍·복사·다운로드) |
| `components/DetailPanel.tsx` | 수정 | "기획서 생성" 버튼 추가, PromoPlanPanel 연결 |
| `components/WeatherWidget.tsx` | 신규 | 날씨 기반 마케팅 힌트 위젯 |
| `design/MarketingCalendar.jsx` | 수정 | WeatherWidget 삽입 |
| `.env.local` | 수정 | `GEMINI_API_KEY` 추가 |
| `package.json` | 수정 | `@google/generative-ai` 추가 |

> **참고:** 기존 `app/api/trends/route.ts`, `app/api/weather/route.ts`, `app/api/news-events/route.ts`는 변경 없이 재사용. 이 API들이 이미 네이버 DataLab·기상청·네이버 뉴스 데이터를 제공하고 있음.

---

## 변경하지 않는 것

- 기존 이벤트 데이터 구조 (`id`, `title`, `checklist`, `pro` 등) — 그대로 유지
- `<Icon>` API — 변경 없음
- 기존 API routes (`trends`, `weather`, `news-events`) — 변경 없이 데이터 소스로 재사용
- 쿠팡·네이버 등 외부 채널 운영 전략 — 다음 스텝 (이번 범위는 자사몰 기획서 생성)
- 공동구매 기능 — 맘큐 자사몰에 없으므로 제외

---

## 구현 순서

1. `lib/types.ts` — `Product` 인터페이스에 선택 필드 추가
2. `lib/data.ts` — trendScore 80+ 이벤트 큐레이션 데이터 추가
3. `package.json` — `@google/generative-ai` 설치
4. `app/api/promo-plan/route.ts` — Gemini 스트리밍 API route (네이버 트렌드 인풋 포함)
5. `components/PromoPlanPanel.tsx` — 기획서 패널 UI (트렌드 데이터 fetch → promo-plan 전달)
6. `components/DetailPanel.tsx` — "기획서 생성" 버튼 + 패널 연결
7. `components/WeatherWidget.tsx` — 날씨 마케팅 힌트 위젯 (MarketingEvent[] 기반)
8. `design/MarketingCalendar.jsx` — WeatherWidget 삽입
9. 브라우저 확인 후 완료
