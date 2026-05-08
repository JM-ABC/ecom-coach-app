# 맘큐 MD 플래너 — CLAUDE.md

## 프로젝트 개요
**맘큐 MD 플래너** — 맘큐(하기스 중심 유아동 자사몰) MD 담당자를 위한 이커머스 마케팅 플래닝 도구.
- 마케팅 캘린더, 이벤트 관리, AI 프로모션 기획서, 네이버 트렌드 연동, 날씨 연동 기능 포함
- GitHub: `https://github.com/JM-ABC/ecom-coach-app`
- 배포: Vercel (Netlify 크레딧 소진으로 Vercel로 이전)

## 기술 스택
- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Styling**: CSS Variables 기반 커스텀 디자인 시스템 (Tailwind 미사용)
- **AI**: Google Generative AI (`@google/generative-ai`) — Gemini 2.5 Pro
- **Test**: Vitest

## 주요 파일 구조

```
app/
  api/
    weather/route.ts        # 기상청 단기예보 (data.go.kr)
    trends/route.ts         # 네이버 DataLab 쇼핑인사이트 (주간 트렌드)
    event-trend/route.ts    # 네이버 DataLab 검색어트렌드 (이벤트별 YoY)
    news-events/route.ts    # 네이버 뉴스 API (플랫폼 행사 감지 + 소비 트렌드)
    promo-plan/route.ts     # Gemini 2.5 Pro AI 프로모션 기획서 스트리밍

components/
  calendar/
    MarketingCalendar.tsx   # 메인 캘린더 (FocusView / GridView / Timeline)
    CalendarParts.tsx       # EventHero, EventCard, MiniItem, PlatformInsights
  tabs/
    EventManager.tsx        # 이벤트 관리 탭 (뉴스감지/날씨/트렌드/직접등록)
  DetailPanel.tsx           # 이벤트 상세 패널 (액션플랜/추천품목/인사이트)
  Sidebar.tsx               # 사이드바 + 검색 모달 (⌘K)
  PromoPlanPanel.tsx        # AI 기획서 패널
  WeatherWidget.tsx         # 날씨 위젯

hooks/
  useTrendData.ts           # 네이버 DataLab 쇼핑인사이트 훅
  useEventTrend.ts          # 이벤트별 검색량 변화 훅
  useNewsEvents.ts          # 뉴스 감지 + 소비 트렌드 훅
  useWeatherEvents.ts       # 날씨 이벤트 훅
  useCustomEvents.ts        # 사용자 직접 등록 이벤트 (localStorage)

lib/
  data.ts                   # 이벤트 데이터, PLATFORM_TIPS, PLATFORM_META, 카테고리
  types.ts                  # MarketingEvent, PlatformInsight 등 타입 정의
```

## 환경변수 (필수)

```env
NAVER_CLIENT_ID=            # 네이버 오픈API (DataLab + 뉴스)
NAVER_CLIENT_SECRET=        # 네이버 오픈API
KMA_API_KEY=                # 공공데이터포털 기상청 단기예보 API
GOOGLE_GENERATIVE_AI_API_KEY=  # Gemini AI (AI 기획서)
```

## 핵심 데이터 구조

### 카테고리 ID
- 유아: `b_diaper`, `b_wipe`, `b_toy`, `b_fashion`, `b_formula`, `b_bedding`, `b_safety`
- 생활: `l_laundry`, `l_clean`, `l_hair`, `l_health`, `l_electric`, `l_air`, `l_body`, `l_tissue`

### 플랫폼 ID
`coupang`, `naver`, `11st`, `gmarket`, `kakao`, `wemakeprice`, `momq`

### 이벤트 타입
`holiday` / `season` / `platform` / `weather`

## 주요 비즈니스 규칙

- **맘큐는 정기구독 모델 없음** → 구독 관련 인사이트 제안 금지. 대신 신규 서비스 런칭, CRM 쿠폰, 번들 기획 제안
- **맘큐는 당일배송 없음** → "당일배송" 제안 금지. 맘큐 배송 서비스명은 **맘쑹배송** (오늘 주문 → 내일 도착 보장, 배송 지연 시 포인트 1,000원 보상). 주문 마감: 평일 24시 / 주말·공휴일 13시
- **플랫폼 인사이트 우선순위**: 맘큐 → 쿠팡/네이버 (맘큐가 항상 피처드 카드로 펼쳐짐)
- **맘큐 카테고리 컨텍스트**: 이벤트 카테고리가 생활/청소(l_*) 계열이면 `MOMQ_HOUSEHOLD_TIPS` 사용, 유아(b_*) 계열이면 기본 팁 사용
- **수치 표기**: 하드코딩 추정치는 반드시 "추정치" 라벨 표기. 실제 API 데이터와 명확히 구분
- **이벤트 범위**: 메인 화면에서 D+62일(약 2개월)까지 표시

## 날씨 API
- 서비스: `data.go.kr` 기상청 단기예보 (`getVilageFcst`)
- 서울 격자: `nx=60, ny=127`
- 발표 시각: 02/05/08/11/14/17/20/23시 슬롯

## 코딩 규칙
- 주석 최소화 (WHY가 명확할 때만)
- CSS-in-JS: inline style + CSS Variables (`var(--text)`, `var(--surface)` 등)
- 새 파일 생성보다 기존 파일 수정 우선
- 타입 체크: `npx tsc --noEmit`으로 항상 확인 후 커밋
- 브랜치: `master` → `origin/master` 직접 push
