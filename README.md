# 셀러 마케팅 툴킷 (Sellerkit)

이커머스 셀러를 위한 마케팅 캘린더 & 실무 인사이트 툴킷입니다.  
쿠팡·네이버·G마켓 등 주요 플랫폼 행사 일정과 시즌 이슈를 한눈에 파악하고, 액션 플랜·추천 품목을 즉시 확인할 수 있습니다.

---

## 주요 기능

### 마케팅 캘린더
- **포커스 뷰** — 가장 임박한 이벤트를 중심으로 이번 주·다가오는 기회 정리
- **월간 뷰** — 달력 형태로 전체 이벤트 조망
- **타임라인 뷰** — 연말(12월)까지 전체 일정을 가로 스크롤로 확인, 월 이동 버튼 제공
- **CSV 내보내기** — 필터된 이벤트 목록을 엑셀 호환 CSV로 다운로드

### 실시간 데이터 연동
| 소스 | 내용 | 필요 키 |
|------|------|---------|
| 기상청 단기예보 API | 폭염·한파·강수 등 날씨 이벤트 자동 생성 | `KMA_API_KEY` |
| 네이버 데이터랩 | 카테고리별 검색량 트렌드 (전주 대비 변화율) | `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` |
| 네이버 뉴스 검색 | 플랫폼 행사 일정 자동 감지 (쿠팡·G마켓·11번가 등) | 동일 |

### 이벤트 관리 탭
- **뉴스 감지** — 네이버 뉴스 기반으로 플랫폼 행사 자동 탐지 → 캘린더 추가
- **이벤트 직접 등록** — 커스텀 이벤트 생성 (localStorage 저장)
- **날씨 자동화 / 트렌드 연동** — API 연결 상태 확인

### 액션 플랜 & 추천 품목
- 이벤트별 D-Day 체크리스트
- 카테고리·플랫폼별 추천 품목 + 긴급도 표시
- 실무 인사이트 (BM 관점 전략 가이드)

---

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Variables (oklch 컬러 시스템) + 인라인 스타일
- **배포**: Netlify (Next.js Runtime)
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
```bash
cp .env.local.example .env.local
```

`.env.local`에 아래 키를 입력하세요:

```env
# 기상청 단기예보 API
# 발급: https://www.data.go.kr → "기상청_단기예보 조회서비스" 검색
KMA_API_KEY=your_key_here

# 네이버 개발자센터 API
# 발급: https://developers.naver.com → 애플리케이션 등록
# 필요 권한: 데이터랩(검색어트렌드), 검색
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

### 3. 개발 서버 실행
```bash
npm run dev
```
→ http://localhost:3000

---

## Netlify 배포

1. GitHub 레포 연결 후 자동 배포 설정
2. **Site configuration → Environment variables** 에서 위 3개 키 등록
3. Redeploy 실행

---

## 이벤트 데이터 구조

기본 이벤트는 `lib/data.ts`의 `EVENTS` 배열에서 관리합니다.  
날씨·뉴스·직접등록 이벤트는 런타임에 병합됩니다.

```
allEvents = EVENTS (정적) + weatherState.events (기상청 API) + customEvents (localStorage)
```

**더미 데이터 없음**: 모든 공휴일·시즌 이벤트는 실제 날짜 기준. 플랫폼 행사(쿠팡·G마켓 등)는 네이버 뉴스 API로 실시간 감지.

---

## 카테고리 구조

| 그룹 | 카테고리 |
|------|---------|
| 생활용품 | 세탁·청소·화장지·공기청정·욕실·전기용품·수납 등 |
| 출산·유아동 | 기저귀·물티슈·분유·장난감·패션·이동·침구·안전용품 등 |
