# 맘큐 MD 플래너

맘큐(하기스 중심 유아동 자사몰) MD 담당자를 위한 이커머스 마케팅 플래닝 도구입니다.  
주요 플랫폼 행사·시즌 이슈를 한눈에 파악하고, AI 기획서·액션 플랜·실시간 트렌드 인사이트를 즉시 확인할 수 있습니다.

---

## 기획 의도

이커머스 MD는 매일 쏟아지는 경쟁사 행사와 시장 변화 속에서 "지금 어떤 행사를 어떻게 기획해야 하는가"를 빠르게 판단해야 합니다. 하지만 실무에서 경쟁사 행사 일정, 소비자 검색 트렌드, 날씨·시즌 변수를 한 화면에서 연결해 보여주는 도구는 거의 없습니다.

**맘큐 MD 플래너는 이 문제를 해결하기 위해 만들었습니다.**

- 쿠팡·네이버·G마켓 등 주요 플랫폼의 행사를 뉴스 기반으로 자동 감지하고
- 네이버 DataLab 데이터로 카테고리별 수요 신호를 실시간으로 파악하며
- 날씨·시즌·소비 트렌드까지 하나의 캘린더로 통합해
- MD가 "경쟁사가 행사를 여는 이 시점에 우리는 무엇을 해야 하는가"를 즉시 판단할 수 있게 합니다.

현재는 **맘큐(유아동 자사몰)** 에 맞게 카테고리·인사이트·대응 전략이 커스터마이징되어 있지만, 구조 자체는 어떤 자사몰이나 버티컬 플랫폼을 담당하는 MD에게도 적용할 수 있도록 설계했습니다. 카테고리 키워드, 플랫폼 목록, MD 인사이트 데이터만 교체하면 패션·뷰티·식품 등 다른 도메인에도 그대로 활용 가능합니다.

---

## 주요 기능

### 마케팅 캘린더
- **포커스 뷰** — 이번 주 핵심 이벤트 + 다음 2개월 주요 기회 정리
- **월간 뷰** — 달력 형태로 전체 이벤트 조망
- **타임라인 뷰** — 연말까지 전체 일정을 가로 스크롤로 확인
- **카테고리 필터** — 유아용품·생활용품 등 카테고리별 필터링

### 실시간 데이터 연동
| 소스 | 내용 | 필요 키 |
|------|------|---------|
| 기상청 단기예보 API | 폭염·한파·강수 등 날씨 이벤트 자동 생성 | `KMA_API_KEY` |
| 네이버 DataLab 쇼핑인사이트 | 카테고리별 수요 신호 (전주 대비 변화율 + MD 액션 가이드) | `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` |
| 네이버 DataLab 검색어트렌드 | 이벤트별 전년 동월 대비 검색량 변화 (실시간) | 동일 |
| 네이버 뉴스 검색 | 플랫폼 행사 감지 + 소비 트렌드 기사 수집 | 동일 |
| Google Gemini 2.5 Pro | AI 프로모션 기획서 자동 생성 (스트리밍) | `GOOGLE_GENERATIVE_AI_API_KEY` |

### 플랫폼별 인사이트
- **맘큐 운영 가이드** — 항상 펼쳐진 피처드 카드로 우선 표시
- **쿠팡·네이버 등** — 클릭 시 확장되는 아코디언 방식
- **카테고리 컨텍스트** — 이벤트 카테고리에 따라 맞는 인사이트 자동 선택 (유아/생활 구분)

### 이벤트 관리 탭
- **뉴스 감지** — 플랫폼 행사(쿠팡·G마켓·11번가 등) 자동 감지, 컴팩트 카드로 표시 (기사 요약 + 품목·컨셉·MD 인사이트 + 원문 링크)
- **소비 트렌드** — 육아·생활·이커머스 분야 최신 기사 수집
- **카테고리 수요 신호** — 급상승·상승·보합·하락·급하락 신호 배지 + 즉시 실행 액션 가이드 (완성된 직전 2주 비교)
- **날씨 자동화** — 기상청 API 기반 날씨 마케팅 이벤트 자동 생성
- **이벤트 직접 등록** — 커스텀 이벤트 생성 (localStorage 저장)

### AI 프로모션 기획서
- Gemini 2.5 Pro 기반 이벤트별 프로모션 기획서 자동 생성
- 스트리밍 응답으로 실시간 출력

---

## 기술 스택

- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: CSS Variables (oklch 컬러 시스템) + 인라인 스타일
- **AI**: Google Generative AI — Gemini 2.5 Pro
- **배포**: Vercel
- **상태 관리**: React useState / localStorage

---

## 로컬 개발 환경 설정

### 1. 저장소 클론
```bash
git clone https://github.com/JM-ABC/ecom-coach-app.git
cd ecom-coach-app
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 아래 키를 입력하세요:

```env
# 기상청 단기예보 API
# 발급: https://www.data.go.kr → "기상청_단기예보 조회서비스" 검색
KMA_API_KEY=your_key_here

# 네이버 개발자센터 API
# 발급: https://developers.naver.com → 애플리케이션 등록
# 필요 권한: 데이터랩(쇼핑인사이트, 검색어트렌드), 검색(뉴스)
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret

# Google AI Studio
# 발급: https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

### 3. 개발 서버 실행
```bash
npm run dev
```
→ http://localhost:3000

---

## Vercel 배포

1. [vercel.com](https://vercel.com) → GitHub 레포 `JM-ABC/ecom-coach-app` Import
2. Framework: Next.js 자동 감지
3. **Environment Variables** 에서 위 4개 키 등록
4. Deploy 클릭

---

## 이벤트 데이터 구조

기본 이벤트는 `lib/data.ts`의 `EVENTS` 배열에서 관리합니다.  
날씨·뉴스·직접등록 이벤트는 런타임에 병합됩니다.

```
allEvents = EVENTS (정적)
          + weatherEvents (기상청 API)
          + customEvents (localStorage)
          + newsEvents (네이버 뉴스 API, 배송·구독 키워드 자동 필터링)
```

뉴스 이벤트는 캘린더에서 **플랫폼 행사 현황** 컴팩트 카드로 표시됩니다.  
사용자가 이벤트 관리 탭에서 확정하면 `customEvents`로 이동하고 뉴스 자동 항목에서는 제거됩니다(중복 방지).

---

## 카테고리 구조

| 그룹 | ID | 설명 |
|------|----|------|
| 유아용품 | `b_diaper`, `b_wipe`, `b_toy`, `b_fashion`, `b_formula`, `b_bedding`, `b_safety` | 기저귀·물티슈·완구·유아동복·분유·침구·안전용품 |
| 생활용품 | `l_laundry`, `l_clean`, `l_hair`, `l_health`, `l_electric`, `l_air`, `l_body`, `l_tissue` | 세탁·청소·헤어·건강·냉방·공기청정·쿨링·화장지 |

## 플랫폼

`coupang` / `naver` / `11st` / `gmarket` / `kakao` / `wemakeprice` / `momq`
