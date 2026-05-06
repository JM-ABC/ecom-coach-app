# 아이콘 & 컬러 시스템 리디자인

**날짜:** 2026-05-07  
**상태:** 승인됨

---

## 개요

마케팅 캘린더 UI의 아이콘 라이브러리를 교체하고 브랜드 컬러를 업그레이드한다. 변경은 `Icon.tsx` 단일 파일 교체와 CSS 변수 수정으로 처리하여 앱 전체에 일괄 반영한다.

---

## 결정 사항

### 1. 아이콘 라이브러리

| 항목 | 현재 | 변경 |
|---|---|---|
| 라이브러리 | 커스텀 SVG 경로 (Icon.tsx 내 하드코딩) | Heroicons 2 (`@heroicons/react` — 이미 설치됨) |
| stroke-width | 1.8px | 1.5px |
| 크기 | 24×24 | 24×24 유지 |
| API | `<Icon name="calendar" />` 문자열 API | 동일하게 유지 |

### 2. 특정 아이콘 변경

| 위치 | 현재 | 변경 |
|---|---|---|
| 포커스 탭 | target (동심원) | `SparklesIcon` |
| 트렌드 점수 옆 | zap (번개) | `StarIcon` (채움/아웃라인 분기) |

**StarIcon 분기 규칙:**
- `trendScore >= 80` → 채움 별 (fill: #f59e0b, stroke: #f59e0b)
- 그 외 → 아웃라인 별 (fill: none, stroke: #d1d5db)

### 3. 브랜드 컬러

파일: `app/globals.css` (CSS 변수)

| 변수 | 현재 | 변경 |
|---|---|---|
| `--accent` | `oklch(0.62 0.18 10)` | `oklch(0.65 0.22 15)` (~#f43f5e 로즈) |
| `--accent-hover` | `oklch(0.56 0.19 10)` | `oklch(0.59 0.22 15)` |
| `--accent-bg` | `oklch(0.97 0.025 10)` | `oklch(0.97 0.025 15)` |
| `--accent-border` | `oklch(0.88 0.07 10)` | `oklch(0.88 0.08 15)` |
| `--accent-text` | `oklch(0.52 0.18 10)` | `oklch(0.52 0.20 15)` |

> **이유:** 맘큐(momq.co.kr) 플랫폼 색상과의 친화성 및 트렌디함 향상. 기존 레드(hue 10)보다 부드럽고 현대적인 로즈(hue 15)로 업그레이드.

### 4. UI 폴리시

| 항목 | 현재 | 변경 |
|---|---|---|
| 카드 border-radius | 8px | 12px |
| 카드 그림자 | 없음 | `0 1px 6px rgba(244,63,94,.07)` |
| 탭 컨테이너 | 개별 버튼 | 로즈 배경 pill 컨테이너 |
| D-day 표시 | 일반 텍스트 | 컬러 pill 배지 (D-3 이하: 로즈, 그 외: 회색) |

---

## 변경 범위

### 변경 파일
- `components/Icon.tsx` — Heroicons 2 경로로 전면 교체, 기존 name 키 유지
- `app/globals.css` — `--accent` 계열 변수 5개 수정 (hue 10→15)
- `components/calendar/CalendarParts.tsx` — StarIcon 분기 로직, 카드 스타일
- `components/calendar/MarketingCalendar.tsx` — 탭 스타일, D-day 배지

### 변경하지 않는 것
- `<Icon name="...">` 문자열 API — 그대로 유지
- 데이터 지표 색상 (하락 -59% 등 빨간 수치) — 시맨틱 컬러이므로 유지
- GMV 상승 초록색 — 유지
- 아이콘 크기(size) prop — 유지

---

## 구현 순서

1. `Icon.tsx` — Heroicons 경로 교체 (name 매핑 유지)
2. CSS 변수 — primary 컬러 `#f43f5e`로 수정
3. `CalendarParts.tsx` — StarIcon 분기, 카드 radius/그림자
4. `MarketingCalendar.tsx` — 탭 컨테이너, D-day 배지
5. 브라우저 확인 후 완료
