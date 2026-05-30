# 맘큐 MD 플래너 — 디자인 시스템

> **하네스 규칙**: 새 컴포넌트를 작성할 때 이 파일을 먼저 확인하세요.
> 토큰 외 하드코딩 값 사용은 코딩 규칙 위반입니다.

소스: `design/tokens.css` · `app/globals.css`

---

## 타입 스케일

CSS 변수로만 사용. 인라인 스타일에서는 `fontSize: 'var(--fs-sm)'` 형식.

| 변수 | 값 | 용도 |
|------|----|------|
| `--fs-2xs` | 10px | 배지 라벨, 그리드 날짜 번호 |
| `--fs-xs` | 11px | chip 라벨, 보조 메타 정보 |
| `--fs-sm` | 12px | 소형 UI 라벨, 카드 푸터 |
| `--fs-base` | 13px | 본문, UI 기본값 (body 기본) |
| `--fs-md` | 15px | 약간 큰 본문, 강조 텍스트 |
| `--fs-lg` | 18px | 섹션 헤딩 |
| `--fs-xl` | 22px | 페이지/패널 타이틀 |
| `--fs-2xl` | 24px | 히어로 숫자 |

**금지:**
- 반픽셀 값: `9.5`, `10.5`, `11.5`, `12.5`, `13.5`, `15.5` 등
- 문자열 px 포맷: `fontSize: '13px'` (→ `fontSize: 'var(--fs-base)'` 또는 `fontSize: 13`)
- 스케일 외 임의 값 추가

---

## 컬러 시스템

### 텍스트
| 변수 | 용도 |
|------|------|
| `--text` | 기본 본문 |
| `--text-muted` | 보조 텍스트 |
| `--text-subtle` | 더 약한 보조, 레이블 |
| `--text-disabled` | 비활성 |

### 서피스 / 배경
| 변수 | 용도 |
|------|------|
| `--bg` | 페이지 배경 |
| `--bg-subtle` | 섹션 배경, 카드 내 서브영역 |
| `--bg-sunken` | 인셋 영역 |
| `--surface` | 카드, 패널, 모달 배경 |
| `--surface-hover` | 호버 상태 서피스 |

### 보더
| 변수 | 용도 |
|------|------|
| `--border` | 기본 보더 |
| `--border-strong` | 강조 보더 (호버, 포커스) |
| `--divider` | 구분선 |

### 액센트 (indigo)
| 변수 | 용도 |
|------|------|
| `--accent` | 주요 CTA, 활성 상태 |
| `--accent-hover` | 액센트 호버 |
| `--accent-bg` | 액센트 배경 틴트 |
| `--accent-border` | 액센트 보더 |
| `--accent-text` | 액센트 텍스트 |

### 이벤트 카테고리
`--cat-holiday`, `--cat-season`, `--cat-platform`, `--cat-promo`, `--cat-trend`, `--cat-weather`
각각 `-bg`, `-border` 변형 존재.

### 시맨틱
`--success` / `--success-bg` · `--warning` / `--warning-bg` · `--danger` / `--danger-bg`

---

## 간격 · 라디우스

### Border Radius
| 변수 | 값 | 용도 |
|------|----|------|
| `--radius-sm` | 4px | 버튼 sm, kbd |
| `--radius` | 6px | 버튼 기본, input |
| `--radius-md` | 8px | 소형 카드 |
| `--radius-lg` | 10px | 카드, 패널 |
| `--radius-xl` | 14px | 모달, 큰 카드 |

### Shadow
`--shadow-sm` · `--shadow` · `--shadow-md` · `--shadow-lg`

---

## 타이포그래피 기타

- **폰트**: `--font-sans` (Pretendard Variable 우선), `--font-mono` (JetBrains Mono)
- **body**: `font-size: var(--fs-base)`, `font-weight: 420`, `letter-spacing: -0.005em`
- **line-height**: 본문 `1.5`, 헤딩 `1.2~1.3`

---

## 컴포넌트 토큰

### 버튼 `.btn`
- 기본: `height: 30px`, `font-size: 13px`, `padding: 6px 11px`
- `.btn.sm`: `height: 26px`, `font-size: 12px`
- `.btn.lg`: `height: 36px`, `font-size: 14px`

### 입력 `.input`
- `height: 30px`, `font-size: 13px`

### 칩 `.chip`
- `font-size: 11px`, `border-radius: 999px`

### kbd `.kbd`
- `font-size: var(--fs-2xs)` (10px), mono 폰트

---

## 애니메이션

| 변수 | 값 | 용도 |
|------|----|------|
| `--duration-fast` | 120ms | 호버, 색상 전환 |
| `--duration` | 180ms | 패널 열림/닫힘 |
| `--easing` | `cubic-bezier(0.2, 0.0, 0.2, 1.0)` | 기본 이징 |

- 진입: `ease-out` / 퇴장: `ease-in`
- `transform`, `opacity`만 애니메이션 (layout 속성 제외)
- `prefers-reduced-motion` 존중
