# AI 프로모션 기획서 + 큐레이션 강화 + 날씨 위젯

**날짜:** 2026-05-07  
**상태:** 승인됨

---

## 개요

마케팅 캘린더의 이벤트별로 Gemini API 기반 프로모션 기획서를 자동 생성하고, 추천 상품 데이터를 강화하며, 기상청 API 날씨 위젯을 추가한다.

---

## 서브시스템 구성

| 서브시스템 | 역할 | 주요 파일 |
|---|---|---|
| 큐레이션 강화 | 추천 상품에 가격대·플랫폼 팁·준비 D-day 추가 | `lib/types.ts`, `lib/data.ts` |
| Gemini 기획서 생성 | 이벤트 → Gemini API → 맘큐 채널 기획서 | `app/api/promo-plan/route.ts`, `components/PromoPlanPanel.tsx` |
| 기상청 날씨 위젯 | 캘린더 상단 시즌 날씨 힌트 표시 | `components/WeatherWidget.tsx` |

---

## 서브시스템 1: 큐레이션 강화

### 타입 변경 (`lib/types.ts`)

`ProductRec` 타입에 선택적 필드 추가:

```ts
interface ProductRec {
  name: string;
  reason: string;
  urgency: 'high' | 'mid' | 'low';
  category: string;
  priceRange?: { min: number; max: number };   // 원 단위
  prepDays?: number;                            // 행사 D-day 기준 준비 시작일
  momqTip?: string;                             // 맘큐 자사몰 한 줄 전략
}
```

### 데이터 확장 (`lib/data.ts`)

기존 17개 이벤트의 `products[]`에 위 필드를 점진적으로 추가. 우선 trendScore 80 이상 이벤트(어린이날, 크리스마스, 신학기, 맘큐기획전, 추석 등)부터 채운다.

---

## 서브시스템 2: Gemini 기획서 생성

### API Route (`app/api/promo-plan/route.ts`)

- `POST /api/promo-plan`
- 입력: `{ eventId, title, date, products, trendScore, summary }`
- 출력: 스트리밍 텍스트 (`ReadableStream` + Next.js `new Response(stream)` 패턴)
- 모델: `gemini-1.5-flash`
- API 키: `process.env.GEMINI_API_KEY` (`.env.local`)
- 패키지: `@google/generative-ai`

**프롬프트 구조:**

```
당신은 맘큐(momq.co.kr) D2C 브랜드의 시니어 MD입니다.
아래 이벤트에 대한 맘큐 자사몰 전용 프로모션 기획서를 작성하세요.

[이벤트 정보]
- 행사명: {title}
- 일정: {date}
- 기회점수: {trendScore}/100
- 요약: {summary}
- 추천 상품: {products}

[출력 형식 — 마크다운]
## 행사 개요
(2-3문장)

## 맘큐 자사몰 프로모션 전략
### 체험단 & 커뮤니티 후기 전략
### 회원 전용 혜택 설계 (쿠폰·포인트·단독가)
### 라이브방송 / 콘텐츠 마케팅 계획
### MD 단독 기획전 구성

## 준비 타임라인 (D-day 기준)
(D-21, D-14, D-7, D-3, D-0)

## SNS 카피 초안
(맘 커뮤니티 감성 2개)

주의: 쿠팡·네이버 채널 언급 금지. 맘큐 자사몰 중심으로만 작성.
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

## 서브시스템 3: 기상청 날씨 위젯

### 컴포넌트 (`components/WeatherWidget.tsx`)

- 기존 `app/api/weather/route.ts` 재사용
- 마케팅 캘린더 헤더 상단에 작은 배너로 표시
- 표시 형식: `"이번 주 서울 22°C · 맑음 → 야외활동 상품 수요 예상 ↑"`
- 날씨 데이터와 이벤트 카테고리 매핑:
  - 맑음/고온 → 야외·물놀이·자외선차단 상품 강조
  - 흐림/저온 → 실내·건강·면역 상품 강조
- 데이터 캐시: 1시간 (`useState` + `useEffect` + `localStorage` timestamp 체크)

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|---|---|---|
| `lib/types.ts` | 수정 | `ProductRec`에 `priceRange`, `prepDays`, `momqTip` 추가 |
| `lib/data.ts` | 수정 | trendScore 80+ 이벤트 products 큐레이션 강화 |
| `app/api/promo-plan/route.ts` | 신규 | Gemini API 호출, 스트리밍 응답 |
| `components/PromoPlanPanel.tsx` | 신규 | 기획서 패널 (스트리밍·복사·다운로드) |
| `components/DetailPanel.tsx` | 수정 | "기획서 생성" 버튼 추가, PromoPlanPanel 연결 |
| `components/WeatherWidget.tsx` | 신규 | 날씨 위젯 |
| `components/calendar/MarketingCalendar.tsx` | 수정 | WeatherWidget 삽입 |
| `.env.local` | 수정 | `GEMINI_API_KEY` 추가 |
| `package.json` | 수정 | `@google/generative-ai` 추가 |

---

## 변경하지 않는 것

- 기존 이벤트 데이터 구조 (`id`, `title`, `checklist`, `pro` 등) — 그대로 유지
- `<Icon>` API — 변경 없음
- 네이버·쿠팡 채널 전략 — 다음 스텝
- 공동구매 기능 — 맘큐 자사몰에 없으므로 제외

---

## 구현 순서

1. `lib/types.ts` — `ProductRec` 타입 확장
2. `lib/data.ts` — trendScore 80+ 이벤트 큐레이션 데이터 추가
3. `package.json` — `@google/generative-ai` 설치
4. `app/api/promo-plan/route.ts` — Gemini 스트리밍 API route
5. `components/PromoPlanPanel.tsx` — 기획서 패널 UI
6. `components/DetailPanel.tsx` — "기획서 생성" 버튼 + 패널 연결
7. `components/WeatherWidget.tsx` — 날씨 위젯
8. `components/calendar/MarketingCalendar.tsx` — WeatherWidget 삽입
9. 브라우저 확인 후 완료
