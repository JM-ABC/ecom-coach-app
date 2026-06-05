# TODOS — 맘큐 MD 플래너

## Phase B 진입 조건 (미완료 시 Phase B 착수 금지)

### [P1] Phase B 진입 트리거 확인
- **What:** 외부 MD 5명 브리핑 확인 + 그 중 2명 행동 수요 신호 수집
- **Why:** 설계 문서의 Phase A 성공 기준. 수요 없이 인프라 투자 방지.
- **현재 상태:** 행동 신호 ≥1명 확인됨. 5명 목표 진행 중.
- **행동 수요 신호 정의:** "이거 매주 받을 수 있어요?" / "데이터 어디서 나온 거예요?" / "팀에 공유해도 돼요?"
- **Effort:** S (아웃리치 인적 노력) / CC: 없음
- **Depends on:** 외부 MD 네트워크 아웃리치

### [P1] 인증 방식 결정: **Clerk** (확정)
- **What:** Clerk으로 인증 구현 (Next.js App Router 네이티브 통합)
- **Why:** Open Question #3 — 결정 없이 멀티테넌트 착수 불가
- **Clerk 이유:** App Router SSR 지원, 무설정 OAuth, 무료 티어 1만 MAU
- **다음 단계:**
  1. `npm install @clerk/nextjs`
  2. `middleware.ts` 공개/보호 경로 분리
  3. `/` 및 `/brief` 보호, `/` (읽기전용 demo) 공개 검토
- **Effort:** M (human ~1일) / CC ~30분
- **Depends on:** Phase B 진입 트리거 완료

---

## Phase B 기술 부채

### [P2] `lib/data.ts` 맘큐 특화 데이터 외부화
- **What:** `PLATFORM_TIPS`, `PLATFORM_META`, 카테고리 ID 매핑 → 사용자 설정 기반으로 전환
- **Why:** 외부 브랜드 MD가 쓰려면 맘큐 특화 상수가 제거되어야 함
- **Scope:** 설계 문서 Constraint 참조 (Phase B 진입 시 상세 설계)
- **Effort:** L (human ~1주) / CC ~2시간
- **Depends on:** Clerk 인증 완료 (사용자별 설정 저장 필요)

### [P2] `MarketingCalendar.tsx:80` — isPro 실제 구독 상태 연동
- **What:** `const [isPro] = useState(false)` → Clerk 구독 상태로 교체
- **Why:** 멤버십 등급별 기능 차별화 (Pro 전용 기능 제어)
- **파일:** `components/tabs/MarketingCalendar.tsx:80`
- **Effort:** S (human ~2h) / CC ~10분
- **Depends on:** Clerk 인증 + 구독 시스템 설계

### [P3] brief-ai 서버사이드 입력 검증
- **What:** `/api/brief-ai` POST에서 `categories`, `platforms`를 알려진 enum 값으로 검증
- **Why:** 현재 임의 문자열이 Gemini 프롬프트에 들어갈 수 있음 (prompt injection 위험)
- **Fix:** `VALID_CATEGORIES`, `VALID_PLATFORMS` 상수로 필터링, `z.enum()` 또는 수동 검증
- **Effort:** S (human ~1h) / CC ~5분
- **Depends on:** 없음 (독립적으로 구현 가능)

### [P3] Vitest 테스트 기반 구축 (Phase B 블로커)
- **What:** `brief-ai` JSON 파싱 로직, `brief/page.tsx` 상태 흐름 최소 테스트
- **Why:** Phase B 스케일 시 회귀 방지. 현재 테스트 없음.
- **Priority 변경:** Phase B 착수 전 P1으로 격상
- **Effort:** M (human ~3일) / CC ~1시간
- **Depends on:** 없음

---

## Deferred (설계 문서 기준)

- 브리핑 히스토리 (localStorage, 최근 4주) — Phase A 재방문 행동 관찰 후
- 이메일 다이제스트 발송 — Phase B URL/카카오톡 공유로 수요 검증 후
- briefing → AI 기획서 직결 플로우 — Phase B에서 전체 UX 재설계
- Naver API 쿼터 Vercel KV 캐싱 — Phase B 멀티테넌트 시 재검토
