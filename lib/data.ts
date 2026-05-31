import type { Category, CategoryGroup, MarketingEvent, PlatformMeta, PlatformInsight, EventType } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', label: '전체' },
  { id: 'l_hair', label: '헤어', parent: 'living' },
  { id: 'l_body', label: '바디/세안', parent: 'living' },
  { id: 'l_oral', label: '구강/면도', parent: 'living' },
  { id: 'l_tissue', label: '화장지/물티슈', parent: 'living' },
  { id: 'l_sanitary', label: '생리대/성인기저귀', parent: 'living' },
  { id: 'l_laundry', label: '세탁세제', parent: 'living' },
  { id: 'l_clean', label: '청소/주방세제', parent: 'living' },
  { id: 'l_air', label: '탈취/방향/살충', parent: 'living' },
  { id: 'l_health', label: '건강/의료용품', parent: 'living' },
  { id: 'l_bath', label: '욕실용품', parent: 'living' },
  { id: 'l_storage', label: '수납/정리', parent: 'living' },
  { id: 'l_electric', label: '생활전기용품', parent: 'living' },
  { id: 'b_fashion', label: '유아동패션', parent: 'baby' },
  { id: 'b_diaper', label: '기저귀', parent: 'baby' },
  { id: 'b_wipe', label: '물티슈', parent: 'baby' },
  { id: 'b_formula', label: '분유/어린이식품', parent: 'baby' },
  { id: 'b_suppl', label: '어린이 건강식품', parent: 'baby' },
  { id: 'b_feed', label: '수유용품', parent: 'baby' },
  { id: 'b_wean', label: '이유용품/유아식기', parent: 'baby' },
  { id: 'b_carry', label: '아기띠/외출용품', parent: 'baby' },
  { id: 'b_stroller', label: '유모차/웨건', parent: 'baby' },
  { id: 'b_carseat', label: '카시트', parent: 'baby' },
  { id: 'b_bath', label: '욕실/스킨케어', parent: 'baby' },
  { id: 'b_hygiene', label: '위생/건강/세제', parent: 'baby' },
  { id: 'b_furniture', label: '유아가구/인테리어', parent: 'baby' },
  { id: 'b_bedding', label: '유아동침구', parent: 'baby' },
  { id: 'b_safety', label: '매트/안전용품', parent: 'baby' },
  { id: 'b_toy', label: '완구/교구', parent: 'baby' },
];

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: 'all', label: '전체', items: [] },
  { id: 'living', label: '생활용품', items: CATEGORIES.filter(c => c.parent === 'living') },
  { id: 'baby', label: '출산/유아동', items: CATEGORIES.filter(c => c.parent === 'baby') },
];

export const EVENT_TYPES: Record<string, { label: string; cls: string }> = {
  holiday: { label: '공휴일·기념일', cls: 'holiday' },
  season: { label: '시즌', cls: 'season' },
  platform: { label: '플랫폼 행사', cls: 'platform' },
  promo: { label: '프로모션', cls: 'promo' },
  trend: { label: '사회 이슈', cls: 'trend' },
  weather: { label: '날씨', cls: 'weather' },
};

export const PLATFORMS: Record<string, string> = {
  coupang: '쿠팡', naver: '네이버', '11st': '11번가',
  kakao: '카카오', gmarket: 'G마켓', wemakeprice: '위메프',
};

export const TODAY = new Date();

export const PLATFORM_META: Record<string, PlatformMeta> = {
  coupang:  { label: '쿠팡',   color: 'oklch(0.62 0.18 25)',  bg: 'oklch(0.97 0.025 25)' },
  naver:    { label: '네이버', color: 'oklch(0.58 0.14 150)', bg: 'oklch(0.97 0.025 150)' },
  '11st':   { label: '11번가', color: 'oklch(0.62 0.18 15)',  bg: 'oklch(0.97 0.025 15)' },
  gmarket:  { label: 'G마켓',  color: 'oklch(0.58 0.14 155)', bg: 'oklch(0.97 0.025 155)' },
  kakao:    { label: '카카오', color: 'oklch(0.65 0.13 90)',  bg: 'oklch(0.97 0.03 90)' },
  wemakeprice: { label: '위메프', color: 'oklch(0.60 0.16 310)', bg: 'oklch(0.97 0.025 310)' },
  momq:     { label: '맘큐',   color: 'oklch(0.68 0.15 20)',  bg: 'oklch(0.97 0.028 20)', note: '하기스 중심 유아동 자사몰' },
};

const PLATFORM_TIPS: Record<string, Partial<Record<EventType, PlatformInsight>>> = {
  coupang: {
    holiday: { tip: '로켓배송 당일 도착 강조가 전환 1순위. 공휴일 전일까지 재고 2배 확보.', action: '로켓 재고 확보', metric: '로켓 점유율 +15%' },
    season: { tip: '카테고리 TOP 20에 알고리즘이 트래픽을 몰아줍니다. 시즌 시작 2주 전부터 광고 공격적으로.', action: '시즌 키워드 광고 입찰 +30%', metric: '노출수 +40%' },
    platform: { tip: '메가위크·와우 행사는 "재고 품절 → 순위 급락" 리스크. 평소 2.5배 재고 준비 + 매일 점검.', action: '대표이미지 쿠팡 가이드 재검토', metric: 'GMV +100%' },
    weather: { tip: '날씨 이슈 발표 당일 광고 상향 안 하면 기회 소멸. 자동 입찰 규칙 설정 권장.', action: '당일 광고 +50% 상향', metric: '전환율 +28%' },
  },
  naver: {
    holiday: { tip: '스마트스토어 기획전 배너 노출이 핵심. 공휴일 14일 전 MD 기획전 신청.', action: '기획전 페이지 오픈', metric: '기획전 유입 +50%' },
    season: { tip: '블로그·쇼핑인사이트 검색 트렌드를 1~2주 먼저 반영. 숏폼·블로그 리뷰 동시 진행.', action: '쇼핑검색광고·파워링크 세팅', metric: '리뷰 전환 +18%' },
    platform: { tip: '네이버 도착보장 + N페이 적립이 전환 훅. 라이브쇼핑 편성 시 GMV 3배.', action: '도착보장 라벨 부착', metric: 'N페이 결제 +40%' },
    weather: { tip: '모바일 검색 비중이 높은 만큼 "오늘 받는" 배송 훅이 효과적입니다.', action: '빠른배송 배지 활성화', metric: '모바일 CTR +25%' },
  },
  '11st': {
    holiday: { tip: 'SK페이·T우주 회원 대상 타깃 쿠폰이 강력. 행사 3일 전 타깃팅 설정.', action: 'T우주 전용 쿠폰 세팅', metric: '회원 GMV +35%' },
    season: { tip: '11번가 "쇼킹딜" 편성 기회. MD 제안은 시즌 4주 전.', action: '쇼킹딜 입점 제안', metric: '노출 +80%' },
    platform: { tip: '십일절·슈퍼특가 등 대형 행사 중심. 단일 행사 집중 투자가 유리합니다.', action: '대형 행사 선택 집중', metric: 'GMV +70%' },
  },
  gmarket: {
    platform: { tip: '스마일클럽 멤버십 타깃 광고 효율 최고. 빅스마일데이 1달 전 입점 신청.', action: '스마일클럽 쿠폰 세팅', metric: '노출 +28%' },
    season: { tip: '40~50대 구매층이 두텁습니다. "가성비·대용량" 프레임이 유리.', action: '대용량 패키지 구성', metric: '객단가 +15%' },
  },
  kakao: {
    holiday: { tip: '카카오톡 선물하기 연계가 폭발적. 공휴일 2주 전 선물세트 등록.', action: '선물하기 MD 제안', metric: '선물하기 GMV +120%' },
    season: { tip: '카카오톡 채널 메시지 발송이 가장 효율적인 타깃 광고입니다.', action: '채널 친구 메시지 발송', metric: '오픈율 +45%' },
  },
  momq: {
    holiday: { tip: '자사몰 CRM이 핵심 레버. 공휴일 10일 전 구매 이력 기반 세그먼트별 맞춤 쿠폰을 발송해 재구매를 유도하세요.', action: '세그먼트 타깃 쿠폰 발송', metric: '재구매 전환 유도' },
    season: { tip: '월령별(0~6 / 7~12 / 13~24개월) 상품 추천 배너로 교체. 육아 단계별 니즈가 다르므로 세분화된 기획전이 전환 훅입니다.', action: '월령 맞춤 기획전 오픈', metric: '방문자 체류 개선' },
    platform: { tip: '대형 플랫폼 행사 기간은 맘큐 신규 기능·서비스 런칭 타이밍. 번들 기획전·회원 전용 혜택 페이지를 새로 오픈해 자사몰 차별화를 강화하세요.', action: '신규 기획전 / 기능 런칭', metric: '자사몰 차별화' },
    weather: { tip: '기저귀·물티슈는 날씨 민감도가 낮습니다. 환절기에는 스킨케어·유아용품 크로스셀 배너 교체와 커뮤니티 포스팅을 연계하면 자연 유입이 증가합니다.', action: '환절기 케어 배너 + 커뮤니티 연계', metric: '객단가 및 유입 향상' },
  },
};

// 맘큐 유아 카테고리 집합
const MOMQ_BABY_CATS = new Set(['b_diaper', 'b_wipe', 'b_toy', 'b_fashion', 'b_formula', 'b_bedding', 'b_safety']);

// 이벤트 카테고리가 생활/가전(l_*) 계열일 때 맘큐 대체 인사이트
const MOMQ_HOUSEHOLD_TIPS: Partial<Record<EventType, PlatformInsight>> = {
  season: {
    tip: '봄 대청소·환절기 시즌, 맘큐에선 "성분 걱정 없는" 유아 안심 세정제·물티슈 기획전이 기회입니다. 영유아 가구의 청결 니즈와 직결됩니다.',
    action: '유아 안심 세정용품 기획전',
    metric: '신규 카테고리 유입',
  },
  holiday: {
    tip: '명절·공휴일 시즌, 유아 청결·위생용품 선물세트 기획으로 맘큐만의 차별화 포인트를 만드세요.',
    action: '유아 위생 선물세트 기획',
    metric: '객단가 향상',
  },
  platform: {
    tip: '대형 플랫폼 행사 기간, 유아 안심 세정·위생용품 번들로 자사몰 단독 기획전을 런칭하세요.',
    action: '유아 안심 번들 기획전',
    metric: '자사몰 차별화',
  },
  weather: {
    tip: '날씨 변화 시즌, 유아 피부에 안전한 세정·보습 제품 기획전이 영유아 부모의 니즈와 직결됩니다.',
    action: '유아 피부 케어 기획전',
    metric: '시즌 신규 유입',
  },
};

export function getPlatformInsight(event: MarketingEvent, platform: string): PlatformInsight | null {
  const tips = PLATFORM_TIPS[platform];
  if (!tips) return null;

  // 맘큐: 이벤트 카테고리가 유아 계열이 아니면 카테고리 맥락에 맞는 대체 인사이트 사용
  if (platform === 'momq' && event.categories.length > 0) {
    const hasBabyCat = event.categories.some(c => MOMQ_BABY_CATS.has(c));
    if (!hasBabyCat) {
      return MOMQ_HOUSEHOLD_TIPS[event.type as EventType] ?? tips[event.type as EventType] ?? null;
    }
  }

  return tips[event.type as EventType] ?? null;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function fmtDateFull(iso: string): string {
  const d = new Date(iso);
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function daysUntil(iso: string): number {
  const t = new Date(iso);
  const todayMid = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const targetMid = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((targetMid.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
}

export function isActive(ev: MarketingEvent): boolean {
  const start = new Date(ev.start);
  const end = new Date(ev.end);
  return start <= TODAY && end >= TODAY;
}

export function isUpcoming(ev: MarketingEvent, days = 30): boolean {
  const diff = daysUntil(ev.start);
  return diff > 0 && diff <= days;
}

export const catColor = (type: string): string => {
  const map: Record<string, string> = {
    holiday: 'var(--cat-holiday)',
    season: 'var(--cat-season)',
    platform: 'var(--cat-platform)',
    promo: 'var(--cat-promo)',
    trend: 'var(--cat-trend)',
    weather: 'var(--cat-weather)',
  };
  return map[type] || 'var(--accent)';
};

export const typeLabel = (type: string): string => EVENT_TYPES[type]?.label || type;
export const typeChip = (type: string): string => EVENT_TYPES[type]?.cls || '';

export const EVENTS: MarketingEvent[] = [
  {
    id: 'e-new-semester', title: '신학기·유치원 입학 시즌', type: 'season',
    start: '2026-02-16', end: '2026-03-31',
    categories: ['b_furniture', 'b_fashion', 'b_carry', 'b_toy'],
    platforms: ['momq', 'coupang', 'naver'],
    summary: '3월 새학기·유치원 입학 대비 구매 집중. 맘 커뮤니티에서 "입학 선물", "유아 책가방" 검색 폭증.',
    trendScore: 87, search: '+94%', gmv: '+72%',
    products: [
      { name: '유아 책가방·백팩 (유치원·어린이집용)', reason: '입학 시즌 최고 수요 품목, 맘큐 커뮤니티 후기 구매 전환 강함', urgency: 'high', category: 'b_carry', priceRange: { min: 25000, max: 65000 }, prepDays: 21, momqTip: '프리미엄 회원 5% 추가 할인 + 맘큐 커뮤니티 포토리뷰 200건 확보 후 상단 배치.' },
      { name: '어린이 책상·의자 세트', reason: '새학기 공부 환경 세팅 수요, 가격대 높아 객단가 우수', urgency: 'high', category: 'b_furniture', priceRange: { min: 120000, max: 350000 }, prepDays: 28, momqTip: '스탠다드 이상 회원 무료 설치 서비스 제공. 고객단가 방어 핵심 상품.' },
      { name: '유아동 실내화·운동화', reason: '유치원·어린이집 필수품, 반복 구매', urgency: 'mid', category: 'b_fashion', priceRange: { min: 15000, max: 35000 }, prepDays: 14, momqTip: '3개월 교체 주기 기반 재구매 유도. 라이트 회원 업그레이드 훅으로 활용.' },
      { name: '아동 학습교구·퍼즐 세트', reason: '입학 선물 포지션, 선물세트 구성 용이', urgency: 'mid', category: 'b_toy', priceRange: { min: 20000, max: 55000 }, prepDays: 14, momqTip: '선물포장 무료 옵션 추가. 맘큐 단독 번들(교구+퍼즐) 구성으로 차별화.' },
    ],
    checklist: [
      { d: -21, task: '"새학기 입학 선물" 기획전 페이지 오픈', done: false },
      { d: -14, task: '맘큐 커뮤니티 게시판 협업 콘텐츠 업로드', done: false },
      { d: -7, task: '책가방·실내화 재고 3주치 확보', done: false },
      { d: 0, task: '입학식 당일 SNS 인증 이벤트 오픈', done: false },
      { d: 7, task: '입학 후기 리뷰 이벤트 마감', done: false },
    ],
    pro: '맘큐 커뮤니티 "육아템 후기" 게시판 노출이 전환율에 직결됩니다. 2월 초 커뮤니티 체험단을 먼저 모집하고, 후기 30개 이상 확보 후 광고를 올리세요. 신학기 시즌은 맘큐 자사몰 유입이 특히 활발한 시기입니다.',
  },
  {
    id: 'e-spring-picnic', title: '봄 피크닉 시즌', type: 'season',
    start: '2026-04-01', end: '2026-04-30',
    categories: ['l_storage', 'b_carry', 'b_safety'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '주말 나들이·공원 피크닉 수요 절정. 가볍고 실용적인 휴대 용품이 급상승.',
    trendScore: 82, search: '+34%', gmv: '+21%',
    products: [
      { name: '피크닉 매트 (대형·방수)', reason: '가족 단위 수요 ↑, 방수 기능 필수', urgency: 'high', category: 'l_storage', priceRange: { min: 15000, max: 45000 }, prepDays: 14, momqTip: '맘큐 단독 "대형 방수" 키워드 썸네일 운영. 프리미엄 회원 쇼핑지원금 활용 유도.' },
      { name: '휴대용 아기 방수매트', reason: '기저귀 교체+식사 겸용 수요', urgency: 'high', category: 'b_safety', priceRange: { min: 8000, max: 22000 }, prepDays: 7, momqTip: '기저귀 구매 고객 대상 크로스셀. 장바구니 추천 배너 삽입.' },
      { name: '아기띠·힙시트', reason: '짧은 나들이 필수템, 봄 신상 구매 집중', urgency: 'mid', category: 'b_carry', priceRange: { min: 35000, max: 120000 }, prepDays: 21, momqTip: '고가 상품이므로 스탠다드→프리미엄 업그레이드 훅으로 활용. 가입비 대비 이득 프레임.' },
      { name: '유아 외출용 보냉백', reason: '이유식·간식 보관 수요', urgency: 'mid', category: 'b_carry', priceRange: { min: 12000, max: 30000 }, prepDays: 7, momqTip: '이유식 카테고리 묶음 할인과 연계. 맘큐 커뮤니티 "나들이템 추천" 게시판 노출.' },
      { name: '아기 자외선차단제 SPF30~50 (봄 외출용)', reason: '4월 봄 햇살 강화, 피크닉 외출 필수품', urgency: 'mid', category: 'l_body', priceRange: { min: 10000, max: 25000 }, prepDays: 7, momqTip: '"봄 나들이 필수템" 피크닉 매트 번들 구성. 무기자차·저자극 성분 강조.' },
    ],
    checklist: [
      { d: -21, task: '상세페이지 봄 버전 리뉴얼 (피크닉 연출컷)', done: true },
      { d: -14, task: '쿠팡 로켓 재고 2주치 입고', done: true },
      { d: -7, task: '썸네일 A/B 테스트 시작', done: true },
      { d: 0, task: '검색광고 키워드 "피크닉 매트" CPC 상향', done: false },
      { d: 3, task: '주말 쿠폰 5% 발행', done: false },
      { d: 7, task: '후기 이벤트 (포토리뷰) 오픈', done: false },
    ],
    pro: '피크닉 매트는 4월 2주차부터 "대형/방수/경량" 키워드 검색이 급증합니다. 가족 단위는 "방수", 연인/혼자는 "경량" 훅을 분리해 썸네일 2개 운영하세요.',
  },
  {
    id: 'e-earth-day', title: '지구의 날', type: 'holiday',
    start: '2026-04-22', end: '2026-04-22',
    categories: ['l_clean', 'l_body', 'b_wipe'],
    platforms: ['naver', 'coupang', 'momq'],
    summary: '친환경 소비 트렌드 연결. MZ 중심으로 "제로웨이스트" 검색 상승.',
    trendScore: 58, search: '+18%', gmv: '+6%',
    products: [
      { name: '리필형 세탁세제 / 주방세제', reason: '지구의 날 기획전 단골, 재구매 유도', urgency: 'mid', category: 'l_clean' },
      { name: '천연 수세미 / 대나무 칫솔', reason: '친환경 훅 연출 용이, 객단가 낮지만 마진 높음', urgency: 'mid', category: 'l_oral' },
      { name: '친환경 아기 물티슈 (비건 인증)', reason: '엄마 타깃 "무해함" 프레임 강력', urgency: 'low', category: 'b_wipe' },
    ],
    checklist: [
      { d: -10, task: '"제로웨이스트 챌린지" 기획전 페이지', done: true },
      { d: -3, task: 'SNS 카드뉴스 (인스타 릴스) 업로드', done: false },
      { d: 0, task: '당일 한정 5% 쿠폰', done: false },
    ],
    pro: '지구의 날 단일 매출보다는 "브랜드 인식" 용도로 접근하세요. 친환경 메시지는 단기 GMV보다 장기 브랜드 신뢰도 구축에 효과적입니다.',
  },
  {
    id: 'e-children-prep', title: '어린이날 선물 수요 시작', type: 'season',
    start: '2026-04-15', end: '2026-05-04',
    categories: ['b_toy', 'b_furniture', 'b_fashion'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '어린이날 3주 전부터 "선물", "장난감" 검색 급증. 4월 4주차가 구매 피크.',
    trendScore: 88, search: '+67%', gmv: '+95%',
    products: [
      { name: '4-7세 학습 완구·교구', reason: '검색량 최상위 (교육 + 재미)', urgency: 'high', category: 'b_toy', priceRange: { min: 15000, max: 89000 }, prepDays: 18, momqTip: '맘큐 포토리뷰 200건 이상 상품 상단 배치. 프리미엄 회원 5% 추가 할인으로 전환 유도.' },
      { name: '캐릭터 완구 선물세트', reason: '포장 단위 구매, 객단가 높음', urgency: 'high', category: 'b_toy', priceRange: { min: 30000, max: 79000 }, prepDays: 14, momqTip: '맘큐 단독 선물포장 무료 옵션. 비회원→라이트 전환 시 즉시 할인 쿠폰 지급.' },
      { name: '유아 자전거·킥보드', reason: '5월 초 야외활동과 연결', urgency: 'mid', category: 'b_toy', priceRange: { min: 50000, max: 180000 }, prepDays: 21, momqTip: '고가 상품 — 프리미엄 멤버십 쇼핑지원금(매달 3,000원) 활용 안내로 가입 유도.' },
      { name: '캐릭터 유아동 의류세트', reason: '실용 선물 포지션, 리뷰 전환 좋음', urgency: 'mid', category: 'b_fashion', priceRange: { min: 20000, max: 45000 }, prepDays: 10, momqTip: '완구+의류 크로스셀 번들. 맘큐 커뮤니티 "선물 추천" 게시판 협업 콘텐츠.' },
    ],
    checklist: [
      { d: -18, task: '"어린이날 선물 TOP 10" 기획전 페이지', done: true },
      { d: -10, task: '선물포장 옵션 추가', done: true },
      { d: -7, task: '배송일 강조 배너 (5/4까지 도착)', done: false },
      { d: -3, task: '로켓·재고 점검 (쿠팡·맘큐)', done: false },
      { d: 0, task: '마감 임박 리마케팅 캠페인', done: false },
    ],
    pro: '유아용품은 "엄마 후기 전환율"이 핵심입니다. 4월 3주차부터 리뷰 수 500개 이상 확보한 상품에 집중하세요. 신상은 5월까진 밀어도 밑빠진 독입니다.',
  },
  {
    id: 'e-children-day', title: '어린이날', type: 'holiday',
    start: '2026-05-05', end: '2026-05-05',
    categories: ['b_toy', 'b_furniture', 'b_fashion', 'b_safety'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '유아용품 연중 최대 이벤트. 5/2-5/5 집중 구매.',
    trendScore: 98, search: '+210%', gmv: '+320%',
    products: [
      { name: '완구·교구 (D-1 급구매 대응)', reason: '5/4 오후 재고 소진 전 막바지 구매 집중', urgency: 'high', category: 'b_toy', priceRange: { min: 15000, max: 70000 }, prepDays: 7, momqTip: '맘큐 회원 전용 "긴급 쿠폰" D-1~D-0 한정 발행. 재고 마감 임박 배너 운영.' },
      { name: '보드게임·플레이매트', reason: '가족 동반 활동용', urgency: 'high', category: 'b_safety', priceRange: { min: 25000, max: 65000 }, prepDays: 7, momqTip: '가족 활동 프레임 — 맘큐 커뮤니티 "우리집 놀이" 챌린지 이벤트 연계.' },
      { name: '아동 책상·의자 세트', reason: '선물 + 학습 준비 겸용 구매', urgency: 'mid', category: 'b_furniture', priceRange: { min: 120000, max: 350000 }, prepDays: 21, momqTip: '프리미엄 회원 무료 설치 + 얼리버드 보너스 활용. 고객단가 최상위 상품.' },
      { name: '캐릭터 유아동 의류', reason: '선물 포장 단위 구매 증가', urgency: 'mid', category: 'b_fashion', priceRange: { min: 18000, max: 40000 }, prepDays: 10, momqTip: '선물포장 무료 + 스탠다드 회원 전용 10% 추가 할인. 포장 퀄리티가 전환 핵심.' },
    ],
    checklist: [
      { d: -7, task: '어린이날 메인 페이지 오픈', done: false },
      { d: -3, task: 'D-1 급구매 대응 상품 별도 전시', done: false },
      { d: 0, task: '실시간 재고 모니터링', done: false },
    ],
    pro: '5월 4일 오후 3시~6시가 "급구매" 골든타임입니다. 재고 확보된 상품만 상단 노출시키고, 재고 0인 상품은 숨기세요.',
  },
  {
    id: 'e-parents-day', title: '어버이날', type: 'holiday',
    start: '2026-05-08', end: '2026-05-08',
    categories: ['l_health', 'l_body', 'l_bath'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '부모님 선물. 안마기·건강용품·프리미엄 생활용품 최상위.',
    trendScore: 92, search: '+156%', gmv: '+180%',
    products: [
      { name: '안마기·마사지건', reason: '중장년 선호 최상위', urgency: 'high', category: 'l_health', priceRange: { min: 40000, max: 150000 }, prepDays: 14, momqTip: '프리미엄 회원 전용 선물포장+메시지카드 무료. "체면" 프레임 강조.' },
      { name: '혈압계·체온계·건강 측정기', reason: '실용 선물 + 재구매 유도', urgency: 'high', category: 'l_health', priceRange: { min: 25000, max: 80000 }, prepDays: 10, momqTip: '실용 선물 포지션 — 맘큐 프리미엄 회원 전용 추가 할인 + 건강 카테고리 재구매 혜택 강조.' },
      { name: '프리미엄 바디로션·핸드크림', reason: '여성 부모 대상 실용 선물', urgency: 'mid', category: 'l_body', priceRange: { min: 15000, max: 45000 }, prepDays: 10, momqTip: '맘큐 단독 기프트 세트 구성. 스탠다드 회원 가입축하 포인트로 실질 무료 체험 유도.' },
    ],
    checklist: [
      { d: -14, task: '"효도 선물" 기획전 페이지', done: false },
      { d: -10, task: '메시지카드 옵션 추가', done: false },
      { d: -5, task: '라이브커머스 편성 확정', done: false },
      { d: 0, task: '재고 마감 임박 긴급 푸시알림', done: false },
    ],
    pro: '40-50대 자녀가 주 구매층이므로 "가성비"보다 "체면"이 먹힙니다. 포장 퀄리티와 브랜드감을 강조하세요.',
  },
  {
    id: 'e-spring-cleaning', title: '봄맞이 대청소 시즌', type: 'season',
    start: '2026-05-01', end: '2026-05-31',
    categories: ['l_clean', 'l_air', 'l_laundry', 'l_storage'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '환절기 대청소·정리 수요 급상승. "살림템" 검색량 피크 시즌.',
    trendScore: 78, search: '+58%', gmv: '+42%',
    products: [
      { name: '다용도 청소세제·얼룩제거제', reason: '봄 대청소 필수템, 재구매 유도', urgency: 'high', category: 'l_clean' },
      { name: '침구청소기·진드기 제거제', reason: '환절기 알레르기 이슈로 수요 급증', urgency: 'high', category: 'l_air' },
      { name: '리필형 세탁세제 대용량', reason: '이불빨래 수요 동반', urgency: 'mid', category: 'l_laundry' },
    ],
    checklist: [
      { d: -7, task: '"봄맞이 살림템" 기획전 페이지', done: false },
      { d: 0, task: '세제 대용량 장기 할인 혜택 세팅', done: false },
    ],
    pro: '생활용품은 반복구매 습관화가 핵심입니다. 단발 할인보다 "대용량 묶음 구매 → 재구매 혜택" 구조로 고객을 장기 고객으로 육성하세요. CRM 재구매 쿠폰과 번들 기획으로 충성 고객층을 쌓으세요.',
  },
  {
    id: 'e-rainy-season', title: '장마·제습 시즌', type: 'season',
    start: '2026-06-15', end: '2026-07-15',
    categories: ['l_electric', 'l_air', 'l_body', 'b_wipe'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '장마 시작으로 고온다습 환경이 본격화되는 시즌. 제습기·습기제거제·쿨링용품 수요가 연중 최고점에 달하며, 영유아 위생·피부 관련 수요도 함께 상승합니다.',
    trendScore: 84, search: '실시간 연동', gmv: '실시간 연동',
    products: [
      { name: '습기제거제·제습제 대용량', reason: '장마철 반복 구매 필수품, 소모품 특성상 번들 구성 효과적', urgency: 'high', category: 'l_air' },
      { name: '소형 제습기·냉풍기', reason: '6월 장마 시작과 함께 검색량 급등, 선제 재고 확보 필요', urgency: 'high', category: 'l_electric' },
      { name: '아기 쿨링매트·냉감 속싸개', reason: '영아 체온 관리 필수품, 고온다습 환경에서 수요 급증', urgency: 'high', category: 'l_body' },
      { name: '유아 항균·저자극 물티슈', reason: '고온다습 환경에서 위생 니즈 증가, 반복 구매', urgency: 'mid', category: 'b_wipe' },
    ],
    checklist: [
      { d: -14, task: '"장마 대비 필수템" 기획전 페이지 오픈', done: false },
      { d: -10, task: '제습제·쿨링용품 재고 2주치 선확보', done: false },
      { d: -3, task: '제습·쿨링 키워드 광고 입찰가 상향', done: false },
      { d: 0, task: '유아 여름 위생용품 번들 기획전 오픈', done: false },
    ],
    pro: '습기제거제·제습기는 네이버 DataLab 기준 6월 중순~7월이 연중 검색량 최고점입니다. 맘큐에선 "아기방 습도 관리" 커뮤니티 콘텐츠와 쿨링·위생 번들을 연계하면 자연 유입이 증가합니다. 제습제는 소모품이므로 대용량 번들 구성이 객단가 향상에 효과적입니다.',
  },
  {
    id: 'e-summer-vacation', title: '여름 휴가 시즌', type: 'season',
    start: '2026-07-01', end: '2026-08-31',
    categories: ['b_carry', 'b_safety', 'l_storage', 'l_body'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '물놀이·캠핑·여행 수요 급증. 유아 물놀이 용품·자외선 차단 제품 최성수기.',
    trendScore: 85, search: '+78%', gmv: '+55%',
    products: [
      { name: '유아 물놀이 용품 세트', reason: '물놀이 시즌 최대 수요', urgency: 'high', category: 'b_safety', priceRange: { min: 20000, max: 60000 }, prepDays: 14, momqTip: '맘큐 커뮤니티 "물놀이 필수템" 체험단 30명 선행 투입. 리뷰 확보 후 광고.' },
      { name: '아기 자외선차단제 SPF50+', reason: '여름 필수품, 반복구매', urgency: 'high', category: 'l_body', priceRange: { min: 12000, max: 28000 }, prepDays: 7, momqTip: '3개월치 대용량 묶음 세트 구성. 프리미엄 회원 매달 쇼핑지원금으로 실질 할인 강조.' },
      { name: '휴대용 유아 물통·보냉백', reason: '캠핑·나들이 필수 아이템', urgency: 'mid', category: 'b_carry', priceRange: { min: 10000, max: 25000 }, prepDays: 7, momqTip: '물놀이 세트 + 보냉백 크로스셀 번들. 맘큐 단독 여름 패키지 구성.' },
    ],
    checklist: [
      { d: -14, task: '"여름 물놀이 특집" 기획전 페이지', done: false },
      { d: -7, task: '자외선차단제 재고 2배 확보', done: false },
      { d: 0, task: '여름 키워드 광고 입찰 상향', done: false },
    ],
    pro: '유아 자외선차단제는 "무기자차", "EWG 등급" 키워드가 구매 결정에 직결됩니다. 상세페이지에 성분과 안전성 인증 강조 필수.',
  },
  {
    id: 'e-back-to-school', title: '개학 준비 시즌', type: 'season',
    start: '2026-08-15', end: '2026-08-31',
    categories: ['b_toy', 'b_furniture', 'b_fashion'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '9월 개학 대비 학용품·책상·의류 구매 집중. 학부모 타깃 실용템 수요.',
    trendScore: 72, search: '+48%', gmv: '+38%',
    products: [
      { name: '어린이 책상·의자 세트', reason: '개학 전 필수 구매, 가구 카테고리 최성수기', urgency: 'high', category: 'b_furniture' },
      { name: '유아동 가방·백팩', reason: '새 학기 새 가방 수요', urgency: 'high', category: 'b_carry' },
      { name: '아동 실내화·운동화', reason: '학교·어린이집 입학용', urgency: 'mid', category: 'b_fashion' },
    ],
    checklist: [
      { d: -14, task: '"새 학기 준비" 기획전 오픈', done: false },
      { d: -7, task: '학용품 묶음 세트 구성', done: false },
      { d: 0, task: '개학 키워드 광고 집행', done: false },
    ],
    pro: '개학 준비는 엄마들이 SNS 후기를 보고 결정합니다. 블로그·인스타 리뷰 선발대 확보가 핵심.',
  },
  {
    id: 'e-chuseok-2026', title: '추석 연휴', type: 'holiday',
    start: '2026-09-23', end: '2026-09-26',
    categories: ['l_health', 'l_body', 'l_bath', 'b_formula'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '명절 선물세트 수요. 건강식품·프리미엄 생활용품·유아 선물 급증.',
    trendScore: 94, search: '+185%', gmv: '+210%',
    products: [
      { name: '건강기능식품 선물세트', reason: '명절 최고 판매 카테고리', urgency: 'high', category: 'l_health', priceRange: { min: 30000, max: 120000 }, prepDays: 21, momqTip: '프리미엄 회원 전용 "추석 한정 선물세트" 단독 구성. 선물포장+배송일 보장 강조.' },
      { name: '프리미엄 바디케어 세트', reason: '여성 가족 선물 포지션', urgency: 'high', category: 'l_body', priceRange: { min: 25000, max: 65000 }, prepDays: 14, momqTip: '맘큐 에디션 리본 포장. 스탠다드 회원 가입축하 15,000P로 실질 할인 체감 극대화.' },
      { name: '유아 선물 세트', reason: '손자녀 선물 수요', urgency: 'mid', category: 'b_formula', priceRange: { min: 20000, max: 50000 }, prepDays: 14, momqTip: '조부모→손자녀 선물 프레임. 맘큐 회원 초대 시 얼리버드 보너스 1,000원 활용.' },
    ],
    checklist: [
      { d: -21, task: '추석 선물세트 페이지 오픈', done: false },
      { d: -14, task: '선물포장·메시지카드 옵션 추가', done: false },
      { d: -7, task: '배송 마감일 배너 게시', done: false },
    ],
    pro: '추석 선물 구매 피크는 명절 약 2주 전부터 집중됩니다. 명절 1주일 전 이후 주문은 도착 보장 불가 안내를 미리 배너에 표시하세요.',
  },
  {
    id: 'e-immunity-season', title: '유아 면역·건강 시즌', type: 'season',
    start: '2026-09-28', end: '2026-10-20',
    categories: ['b_formula', 'l_health', 'b_safety', 'l_air'],
    platforms: ['momq', 'coupang', 'naver'],
    summary: '환절기 어린이집·유치원 개학 이후 감기·면역 관련 수요 급등. 맘큐 커뮤니티에서 "아이 면역력", "유아 영양제" 검색 연중 최고.',
    trendScore: 74, search: '+63%', gmv: '+47%',
    products: [
      { name: '유아 유산균·면역 영양제', reason: '환절기 맘 커뮤니티 검색 1위 품목, 반복 구매율 높음', urgency: 'high', category: 'b_formula' },
      { name: '어린이 코 세척·흡입기 세트', reason: '콧물·비염 시즌 필수템, 재구매 사이클 짧음', urgency: 'high', category: 'b_safety' },
      { name: '공기청정기·가습기 (유아 전용)', reason: '환절기 실내 공기질 관심 급증', urgency: 'mid', category: 'l_air' },
      { name: '유아 홍삼·비타민C 액상', reason: '면역력 챙기기 시즌, 선물 포지션도 가능', urgency: 'mid', category: 'l_health' },
    ],
    checklist: [
      { d: -10, task: '"환절기 아이 건강 챙기기" 기획전 오픈', done: false },
      { d: -5, task: '맘큐 커뮤니티 "우리 아이 면역력" 콘텐츠 업로드', done: false },
      { d: 0, task: '유산균·영양제 첫 구매 50% 할인 + 2회차 20% 할인 연속 기획', done: false },
      { d: 7, task: '구매 후기 이벤트 마감', done: false },
    ],
    pro: '환절기 유아 건강 수요는 "맘 커뮤니티 입소문"이 핵심입니다. 성분·안전성 인증을 강조한 카드뉴스를 맘큐 게시판에 먼저 올리고, 커뮤니티 신뢰도가 쌓인 후 쿠팡·네이버 광고를 집행하면 전환율이 유의미하게 높아집니다.',
  },
  {
    id: 'e-halloween-2026', title: '핼러윈', type: 'holiday',
    start: '2026-10-31', end: '2026-10-31',
    categories: ['b_toy', 'b_fashion'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '유아동 핼러윈 코스튬·소품 수요. MZ 부모 세대 중심으로 수요 증가 추세.',
    trendScore: 55, search: '+92%', gmv: '+30%',
    products: [
      { name: '유아 핼러윈 코스튬', reason: '10/20 이후 급증', urgency: 'mid', category: 'b_fashion' },
      { name: '핼러윈 파티 소품 세트', reason: '가족 파티용', urgency: 'low', category: 'b_toy' },
    ],
    checklist: [
      { d: -14, task: '핼러윈 코스튬 기획전', done: false },
      { d: -3, task: '파티 소품 묶음 세트 구성', done: false },
    ],
    pro: '핼러윈은 GMV 임팩트는 제한적. 브랜드 SNS 콘텐츠 용도로 접근하세요.',
  },
  {
    id: 'e-pepero-2026', title: '빼빼로데이', type: 'holiday',
    start: '2026-11-11', end: '2026-11-11',
    categories: ['b_toy', 'b_fashion'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '11/11 과자·선물 특수. 어린이집 단체 답례품 수요.',
    trendScore: 60, search: '+75%', gmv: '+25%',
    products: [
      { name: '어린이집·유치원 답례품 세트', reason: '단체 구매 수요', urgency: 'mid', category: 'b_toy' },
    ],
    checklist: [
      { d: -7, task: '소량 포장 답례품 세트 구성', done: false },
      { d: 0, task: '당일 한정 쿠폰 발행', done: false },
    ],
    pro: '어린이집 단체 구매 수요가 핵심. 20개 이상 묶음 구성으로 학부모 공동구매 유도.',
  },
  {
    id: 'e-momq-grand-sale', title: '맘큐 연간 최대 기획전', type: 'platform',
    start: '2026-11-10', end: '2026-11-13',
    categories: ['b_diaper', 'b_wipe', 'b_formula', 'l_body', 'b_toy', 'l_clean'],
    platforms: ['momq'],
    summary: '맘큐 자사몰 연간 최대 D2C 기획전. 블랙프라이데이 직전 4일간 맘큐 회원 전용 특가로 자사몰 매출 극대화.',
    trendScore: 89, search: '+110%', gmv: '+145%',
    products: [
      { name: '맘큐 단독 기저귀·물티슈 대용량 연간 묶음', reason: '연중 최저가 포지셔닝, 자사몰 락인 효과 최대', urgency: 'high', category: 'b_diaper', priceRange: { min: 150000, max: 350000 }, prepDays: 21, momqTip: '프리미엄 회원 전용 연간 최저가 묶음. 비회원→프리미엄 원스텝 가입 유도 (가입비 6,000원 < 절감액).' },
      { name: '유아 스킨케어 풀세트 (맘큐 에디션)', reason: '자사몰 단독 구성, 커뮤니티 인플루언서 협업', urgency: 'high', category: 'l_body', priceRange: { min: 45000, max: 89000 }, prepDays: 14, momqTip: '맘큐에서만 살 수 있는 단독 구성이 핵심. 커뮤니티 인플루언서 언박싱 영상 5편 이상 확보.' },
      { name: '프리미엄 분유·이유식 3개월 세트', reason: '맘큐 회원 전용 가격, 재구매 전환 핵심', urgency: 'high', category: 'b_formula', priceRange: { min: 80000, max: 180000 }, prepDays: 14, momqTip: '재구매율 최상위 상품. 프리미엄 회원 매달 쇼핑지원금 3,000원 적용으로 체감가 극대화.' },
      { name: '생활용품 묶음 기획세트', reason: '블랙프라이데이 전 선점 구매 유도', urgency: 'mid', category: 'l_clean', priceRange: { min: 25000, max: 55000 }, prepDays: 7, momqTip: '대용량 묶음으로 마진 방어. 라이트→스탠다드 업그레이드 시 추가 5% 할인 제공.' },
    ],
    checklist: [
      { d: -21, task: '맘큐 회원 대상 기획전 사전 알림 푸시 발송', done: false },
      { d: -14, task: '단독 기획 상품 구성 및 맘큐 에디션 패키지 제작', done: false },
      { d: -7, task: '커뮤니티 인플루언서 사전 공개 콘텐츠 업로드', done: false },
      { d: -3, task: '위시리스트 기능으로 수요 예측 후 재고 확정', done: false },
      { d: 0, task: '기획전 오픈 + 실시간 재고 모니터링', done: false },
      { d: 3, task: '기획전 마감 후 재구매 쿠폰 자동 발송', done: false },
    ],
    pro: '블랙프라이데이 직전에 여는 것이 핵심입니다. "맘큐 회원만을 위한 특가"라는 소속감 마케팅이 D2C 자사몰의 무기입니다. 쿠팡·네이버에서 살 수 없는 단독 구성을 최소 1개 이상 포함해야 이탈을 막을 수 있습니다.',
  },
  {
    id: 'e-blackfriday-2026', title: '블랙프라이데이', type: 'platform',
    start: '2026-11-27', end: '2026-11-30',
    categories: ['l_laundry', 'l_clean', 'l_electric', 'b_diaper', 'b_wipe'],
    platforms: ['coupang', 'naver', '11st', 'gmarket', 'momq'],
    summary: '11월 말 글로벌 할인 시즌. 국내 플랫폼 대규모 쿠폰·특가 진행.',
    trendScore: 80, search: '+60%', gmv: '+75%',
    products: [
      { name: '생활용품 대용량 묶음세트', reason: '대규모 할인에 최적화된 구성', urgency: 'high', category: 'l_laundry', priceRange: { min: 30000, max: 70000 }, prepDays: 14, momqTip: '맘큐 자사몰 블프 전용 가격. 대용량 묶음으로 객단가+마진 동시 방어.' },
      { name: '기저귀·물티슈 박스 세트', reason: '연간 최저가 포지셔닝 기회', urgency: 'high', category: 'b_diaper', priceRange: { min: 40000, max: 95000 }, prepDays: 14, momqTip: '프리미엄 회원 대상 추가 할인 적용. 맘큐 기획전 직전 구매 유도.' },
    ],
    checklist: [
      { d: -14, task: '블랙프라이데이 특가 상품 선정', done: false },
      { d: -7, task: '최저가 설정 및 광고 예산 확대', done: false },
      { d: 0, task: '실시간 재고·광고 모니터링', done: false },
    ],
    pro: '마진 방어를 위해 대용량·묶음 구성으로 단가를 높이세요.',
  },
  {
    id: 'e-christmas-2026', title: '크리스마스 시즌', type: 'holiday',
    start: '2026-12-15', end: '2026-12-25',
    categories: ['b_toy', 'b_fashion', 'b_furniture', 'l_health'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '연말 최대 선물 시즌. 유아용품·장난감 선물 수요 연중 최고조.',
    trendScore: 96, search: '+220%', gmv: '+280%',
    products: [
      { name: '어린이 인기 완구 선물세트', reason: '산타 선물 대표 카테고리', urgency: 'high', category: 'b_toy', priceRange: { min: 25000, max: 89000 }, prepDays: 21, momqTip: '완구 선물세트 단독 구성 + 크리스마스 포장 옵션으로 객단가 상승' },
      { name: '유아 의류·잠옷 세트', reason: '크리스마스 특별 패키지 수요', urgency: 'high', category: 'b_fashion', priceRange: { min: 19000, max: 59000 }, prepDays: 21, momqTip: '크리스마스 한정 패키지(잠옷+양말+헤어밴드) 묶음 구성으로 선물 수요 공략' },
      { name: '프리미엄 건강 선물세트', reason: '어른 선물 포지션', urgency: 'mid', category: 'l_health', priceRange: { min: 35000, max: 120000 }, prepDays: 14, momqTip: '프리미엄 멤버십 회원 전용 연말 감사 가격으로 재구매율 확보' },
    ],
    checklist: [
      { d: -21, task: '크리스마스 기획전 페이지 오픈', done: false },
      { d: -14, task: '선물포장·리본 옵션 추가', done: false },
      { d: -7, task: '크리스마스 전 배송 마감일 배너', done: false },
    ],
    pro: '12월 15~20일이 크리스마스 선물 구매 피크입니다. 12/21 이후 주문은 도착 보장 불가 안내 필수.',
  },

  // ─── 마이크로 시즌 & 사회 이슈 이벤트 ─────────────────────────

  {
    id: 'e-spring-transition', title: '봄 환절기 건강·보습', type: 'season',
    start: '2026-03-01', end: '2026-03-20',
    categories: ['b_bath', 'b_suppl', 'l_health'],
    platforms: ['momq', 'coupang', 'naver'],
    summary: '겨울→봄 환절기, 실내 건조로 유아 피부 트러블·면역 저하 이슈 급증. 보습·유산균 관련 맘큐 커뮤니티 질문이 연간 최고점.',
    trendScore: 70, search: '+44%', gmv: '+31%',
    products: [
      { name: '유아 저자극 보습 크림·로션', reason: '환절기 유아 피부 건조 필수 대응', urgency: 'high', category: 'b_bath', priceRange: { min: 10000, max: 28000 }, prepDays: 10, momqTip: '맘큐 커뮤니티 "환절기 아기 피부" 게시글과 상품 페이지 연동. EWG 등급·무자극 인증 강조.' },
      { name: '유아 유산균·면역 영양제', reason: '환절기 면역력 저하 선제 구매', urgency: 'high', category: 'b_suppl', priceRange: { min: 15000, max: 45000 }, prepDays: 10, momqTip: '첫 구매 체험 팩→정기 구매 전환 구조. 커뮤니티 후기 선확보 후 CRM 발송.' },
      { name: '유아 가습기 (초음파·저소음)', reason: '실내 건조함 해소, 환절기 필수템', urgency: 'mid', category: 'l_health', priceRange: { min: 25000, max: 75000 }, prepDays: 14, momqTip: '고가 상품 → 프리미엄 쇼핑지원금 활용 안내로 멤버십 업셀.' },
    ],
    checklist: [
      { d: -10, task: '"봄 환절기 아이 케어" 기획전 오픈', done: false },
      { d: -5, task: '커뮤니티 "환절기 육아템 추천" 콘텐츠 업로드', done: false },
      { d: 0, task: '보습·유산균 크로스셀 번들 CRM 발송', done: false },
    ],
    pro: '환절기는 맘큐 커뮤니티 활성도가 높아지는 시기입니다. "아이 피부가 너무 건조해요" 게시글이 올라올 때 관련 상품 배너를 게시판 옆에 노출하면 자연스러운 전환이 일어납니다.',
  },
  {
    id: 'e-yellow-dust', title: '황사·미세먼지 시즌', type: 'trend',
    start: '2026-03-15', end: '2026-04-30',
    categories: ['l_air', 'l_laundry', 'b_hygiene', 'b_wipe'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '봄 황사·미세먼지로 실내 공기질·위생 수요 급등. 유아 있는 가정 중심 공기청정기·세탁세제·물티슈 검색량 연중 최고점.',
    trendScore: 83, search: '+71%', gmv: '+48%',
    products: [
      { name: '공기청정기 헤파 필터 (유아 안심)', reason: '황사 시즌 필터 교체 수요, 반복 구매', urgency: 'high', category: 'l_air', priceRange: { min: 15000, max: 45000 }, prepDays: 14, momqTip: '기기 보유 고객 대상 필터 교체 CRM. "영유아 방 공기질" 프레임으로 전환률 극대화.' },
      { name: '유아 안심 세탁세제 (무향·저자극)', reason: '황사 후 이불·옷 세탁 수요 급증', urgency: 'high', category: 'l_laundry', priceRange: { min: 12000, max: 32000 }, prepDays: 7, momqTip: '맘큐 커뮤니티 "황사 세탁 꿀팁" 콘텐츠와 상품 연동. 리필형 대용량으로 객단가 방어.' },
      { name: '유아 물티슈 (항균·저자극 대용량)', reason: '외출 후 손·얼굴 닦기 수요 증가', urgency: 'mid', category: 'b_wipe', priceRange: { min: 8000, max: 22000 }, prepDays: 7, momqTip: '기저귀 구매 고객 자동 크로스셀. 봄철 대용량 묶음으로 재고 회전.' },
    ],
    checklist: [
      { d: -14, task: '"황사 대비 유아 건강 필수템" 기획전 오픈', done: false },
      { d: -7, task: '공기청정기 필터·세탁세제 재고 2주치 확보', done: false },
      { d: 0, task: '황사 주의보 발령 당일 CRM 타깃 푸시 발송', done: false },
    ],
    pro: '황사·미세먼지 예보 발령 당일 검색량이 30~50% 폭등합니다. 뉴스 이벤트 감지 탭의 황사 키워드 모니터링과 연동해 발령 즉시 CRM 푸시와 광고 입찰가를 올리는 루틴을 미리 세팅하세요.',
  },
  {
    id: 'e-family-month', title: '가정의달 통합 프로모션', type: 'holiday',
    start: '2026-05-01', end: '2026-05-20',
    categories: ['b_toy', 'l_health', 'b_fashion', 'b_formula'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '어린이날(5/5)·어버이날(5/8)·스승의날(5/15)이 집중된 5월 선물 러시. 하나의 기획전으로 묶어 다양한 구매 목적을 흡수하는 통합 전략.',
    trendScore: 90, search: '+130%', gmv: '+160%',
    products: [
      { name: '가족 선물 세트 (어린이+어버이 묶음)', reason: '한 번에 두 가지 선물 해결, 객단가 극대화', urgency: 'high', category: 'b_toy', priceRange: { min: 45000, max: 120000 }, prepDays: 18, momqTip: '맘큐 단독 "가족 세트" 기획. 어린이 완구 + 부모님 건강용품 묶음으로 차별화.' },
      { name: '유아 건강식품 선물세트', reason: '어버이날 겸 아이 선물 포지션', urgency: 'high', category: 'b_formula', priceRange: { min: 25000, max: 65000 }, prepDays: 14, momqTip: '프리미엄 선물포장 + 메시지카드 무료. 맘큐 회원 전용 가격 강조.' },
      { name: '어린이 완구·교구 선물세트', reason: '5/5 어린이날 선물 최상위 품목', urgency: 'high', category: 'b_toy', priceRange: { min: 20000, max: 75000 }, prepDays: 14, momqTip: '선물포장 무료. 맘큐 커뮤니티 "5월 선물 추천" 협업 콘텐츠.' },
      { name: '부모님 프리미엄 바디케어 세트', reason: '어버이날 실용 선물', urgency: 'mid', category: 'l_health', priceRange: { min: 30000, max: 80000 }, prepDays: 14, momqTip: '스탠다드→프리미엄 업그레이드 시 추가 10% 할인 쿠폰.' },
    ],
    checklist: [
      { d: -18, task: '"가정의달 선물 통합 기획전" 페이지 오픈', done: false },
      { d: -10, task: '가족 세트 번들 상품 구성 확정', done: false },
      { d: -5, task: '어린이날 배송 마감 배너 (5/3까지 주문)', done: false },
      { d: 3, task: '어버이날 D-5 재구매 CRM 발송', done: false },
      { d: 10, task: '스승의날 답례품 기획전 오픈', done: false },
    ],
    pro: '5월은 선물 구매 목적이 3개(어린이날·어버이날·스승의날)가 겹칩니다. "가족 선물 한 큐 해결" 프레임의 통합 기획전이 객단가를 높이면서 맘큐만의 차별화 포지션을 만듭니다.',
  },
  {
    id: 'e-teachers-day', title: '스승의날 답례품 시즌', type: 'holiday',
    start: '2026-05-11', end: '2026-05-15',
    categories: ['b_wipe', 'l_body', 'l_health'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '5/15 스승의날 앞두고 유치원·어린이집 선생님 단체 답례품 수요. 소포장·단체 구매에 최적화된 품목 집중.',
    trendScore: 62, search: '+48%', gmv: '+22%',
    products: [
      { name: '소포장 물티슈·핸드크림 답례품 세트', reason: '단체 답례품 최적 품목, 소포장 구성 필요', urgency: 'high', category: 'b_wipe', priceRange: { min: 3000, max: 12000 }, prepDays: 7, momqTip: '10개·20개·30개 단위 묶음 구성. "선생님 감사 답례품" 맘큐 단독 기획.' },
      { name: '미니 바디로션·핸드크림 소포장', reason: '실용적·고급스러운 선물 포지션', urgency: 'mid', category: 'l_body', priceRange: { min: 5000, max: 18000 }, prepDays: 7, momqTip: '맘큐 커뮤니티 "스승의날 답례품 추천" 게시판 콘텐츠 연동.' },
    ],
    checklist: [
      { d: -7, task: '"스승의날 답례품" 소포장 세트 구성', done: false },
      { d: -3, task: '단체 구매 할인 옵션 세팅 (10개 이상 5% 추가 할인)', done: false },
      { d: 0, task: '당일 한정 쿠폰 발행', done: false },
    ],
    pro: '어린이집·유치원 학부모 단체 구매는 맘큐 커뮤니티 "공동구매" 게시판 활용이 가장 효과적입니다. 20개 이상 묶음 할인 구조를 미리 준비하세요.',
  },
  {
    id: 'e-uv-season-start', title: '초여름 자외선 본격화 — 썬크림 시즌', type: 'season',
    start: '2026-05-20', end: '2026-06-20',
    categories: ['l_body', 'b_safety', 'b_carry', 'b_wipe'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '5월 중순부터 UV 지수가 급등해 야외 활동 시 자외선 차단이 필수가 됩니다. 아기 피부 특성상 "무기자차·저자극" 수요가 집중되며, 물놀이 시즌 본격화 전 재고 확보 타이밍.',
    trendScore: 76, search: '+68%', gmv: '+44%',
    products: [
      { name: '아기 자외선차단제 SPF50+ (무기자차·EWG)', reason: '5월 UV 지수 급등, 초여름 최고 검색 품목', urgency: 'high', category: 'l_body', priceRange: { min: 12000, max: 30000 }, prepDays: 10, momqTip: '"무기자차·EWG 그린등급" 키워드 상단 노출. 3개월 대용량 묶음으로 구성해 재구매 주기 단축.' },
      { name: '성인용 자외선차단제 SPF50+ (가족 공용)', reason: '아기 썬크림과 함께 가족 세트 구매 수요', urgency: 'high', category: 'l_body', priceRange: { min: 10000, max: 25000 }, prepDays: 7, momqTip: '아기+성인 패밀리 세트 번들로 객단가 상승. 커뮤니티 "우리 가족 썬크림" 추천 콘텐츠.' },
      { name: '유아 자외선 차단 래쉬가드·모자 세트', reason: '야외 활동 증가, 물리적 차단 병행 수요', urgency: 'mid', category: 'b_safety', priceRange: { min: 15000, max: 45000 }, prepDays: 14, momqTip: '래쉬가드+썬크림 번들 기획전. 물놀이 시즌 전 재고 선점 메시지.' },
      { name: '아기 쿨링 물티슈 (냉감형)', reason: '초여름 외출 쿨링·피부 진정 수요', urgency: 'mid', category: 'b_wipe', priceRange: { min: 5000, max: 15000 }, prepDays: 5, momqTip: '썬크림 구매 고객 크로스셀. "외출 후 피부 진정" 키워드 연계.' },
      { name: '유아 외출용 보냉백·쿨팩 세트', reason: '이유식 보관+썬크림 후 피부 쿨링 용도 병행', urgency: 'low', category: 'b_carry', priceRange: { min: 10000, max: 28000 }, prepDays: 7, momqTip: '외출 준비 올인원 번들 구성. 맘큐 단독 "여름 외출 키트".' },
    ],
    checklist: [
      { d: -14, task: '"썬크림 시즌 특집" 기획전 페이지 준비', done: false },
      { d: -10, task: '무기자차 자외선차단제 재고 선점 (물놀이 시즌 전)', done: false },
      { d: -7, task: '"아기 자외선차단제 EWG 비교" 커뮤니티 콘텐츠 발행', done: false },
      { d: 0, task: '자외선차단제 검색광고 입찰가 +40% 상향', done: false },
      { d: 7, task: '패밀리 세트 번들 기획전 오픈', done: false },
    ],
    pro: '아기 자외선차단제는 "무기자차", "EWG 그린등급", "벤조페논 프리" 키워드가 구매 결정 1~3위입니다. 성분 비교표를 상세페이지에 넣고 커뮤니티 체험단을 선행 투입해 리뷰 50건 이상 확보 후 광고 집행하세요.',
  },
  {
    id: 'e-local-election-day', title: '지방선거 공휴일', type: 'holiday',
    start: '2026-06-03', end: '2026-06-03',
    categories: ['l_laundry', 'l_clean', 'b_diaper', 'b_wipe', 'l_tissue'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '6월 3일 지방선거 공휴일. 투표 참여로 외출이 줄고 모바일 쇼핑 체류 시간이 늘어납니다. 선거일 전주(5/28~6/2) 선반영 프로모션이 핵심.',
    trendScore: 52, search: '+18%', gmv: '+12%',
    products: [
      { name: '생활필수품 대용량 세트 (세탁세제·화장지)', reason: '공휴일 집콕 재보충 구매 수요', urgency: 'mid', category: 'l_laundry', priceRange: { min: 15000, max: 45000 }, prepDays: 5, momqTip: '"선거일 연휴 집콕 정리" 프레임. 대용량 번들 + 맘큐 쇼핑지원금 활용 안내.' },
      { name: '기저귀·물티슈 정기 보충', reason: '공휴일 집에서 아기 돌봄 수요', urgency: 'mid', category: 'b_diaper', priceRange: { min: 20000, max: 55000 }, prepDays: 3, momqTip: '선거 당일 재고 보충 알림 푸시. 맘큐 프리미엄 회원 혜택 강조.' },
    ],
    checklist: [
      { d: -5, task: '"선거일 연휴 집콕 세일" 기획전 오픈', done: false },
      { d: -2, task: '생활필수품 재고 확인 및 프로모션 배너 예약', done: false },
      { d: 0, task: '모바일 전용 당일 쿠폰 발행', done: false },
    ],
    pro: '선거일은 이동 자제로 모바일 쇼핑 세션이 평소 대비 20~30% 증가합니다(추정치). 선거 전주(5/28~6/2)에 "선반영 프로모션"을 집행하고, 당일은 모바일 전용 쿠폰으로 전환을 극대화하세요.',
  },
  {
    id: 'e-early-summer-cooling', title: '초여름 냉방·위생 준비', type: 'season',
    start: '2026-06-01', end: '2026-06-14',
    categories: ['l_electric', 'l_clean', 'l_air', 'b_wipe'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '본격 더위 전 에어컨 청소·냉방 준비 수요 급등. 유아 있는 가정은 에어컨 필터 교체·항균 청소를 먼저 챙깁니다.',
    trendScore: 68, search: '+52%', gmv: '+34%',
    products: [
      { name: '에어컨 필터·청소 스프레이', reason: '6월 에어컨 가동 전 청소 수요 피크', urgency: 'high', category: 'l_clean', priceRange: { min: 8000, max: 25000 }, prepDays: 7, momqTip: '"아기 있는 집 에어컨 청소" 커뮤니티 콘텐츠 연동. 유아 안심 성분 강조.' },
      { name: '탈취·항균 스프레이 (유아 안심 성분)', reason: '여름 시작 전 실내 항균 수요', urgency: 'mid', category: 'l_air', priceRange: { min: 6000, max: 18000 }, prepDays: 7, momqTip: '에어컨 청소 세트와 번들 구성. "유아 안심 성분" 인증 강조.' },
      { name: '아기 쿨링 물티슈 (냉감형)', reason: '초여름 외출 쿨링 수요 시작', urgency: 'mid', category: 'b_wipe', priceRange: { min: 5000, max: 15000 }, prepDays: 5, momqTip: '기저귀·일반 물티슈 구매 고객 크로스셀. "여름 외출 필수템" 프레임.' },
      { name: '소형 써큘레이터 (유아 전용)', reason: '에어컨 직풍 우려 영유아 가정 수요', urgency: 'mid', category: 'l_electric', priceRange: { min: 20000, max: 55000 }, prepDays: 14, momqTip: '프리미엄 쇼핑지원금 활용 안내. "직풍 없는 순환" 키워드.' },
      { name: '아기 자외선차단제 SPF50+ (초여름 본격화)', reason: '6월 UV 지수 급등, 외출 필수품으로 수요 시작', urgency: 'high', category: 'l_body', priceRange: { min: 12000, max: 28000 }, prepDays: 7, momqTip: '"무기자차·EWG 등급" 키워드. 에어컨 청소 세트와 "여름 외출 준비" 번들 구성.' },
    ],
    checklist: [
      { d: -10, task: '"본격 더위 전 냉방 준비" 기획전 오픈', done: false },
      { d: -5, task: '에어컨 청소 세트 번들 구성', done: false },
      { d: 0, task: '쿨링 아이템 여름 키워드 광고 집행 시작', done: false },
    ],
    pro: '에어컨 시즌 전 청소 수요는 "아기 방 공기질"이 구매 결정 1위 이유입니다. 유아 안심 성분 강조와 커뮤니티 콘텐츠 연동이 자사몰 전환 핵심. 장마 기획전(6/15)으로 자연스럽게 연결하세요.',
  },
  {
    id: 'e-water-play-peak', title: '물놀이·야외활동 피크', type: 'season',
    start: '2026-07-01', end: '2026-07-20',
    categories: ['b_safety', 'b_carry', 'l_body', 'b_fashion'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '여름방학 시작과 함께 물놀이·해수욕·캠핑 수요 최고점. 유아 물놀이 안전용품·자외선차단제 구매 집중. 장마 기획전과 연계해 매출 연속성 확보.',
    trendScore: 86, search: '+85%', gmv: '+62%',
    products: [
      { name: '유아 물놀이 안전조끼·튜브 세트', reason: '물놀이 안전 필수품, 맘 커뮤니티 구매 1위', urgency: 'high', category: 'b_safety', priceRange: { min: 15000, max: 45000 }, prepDays: 10, momqTip: 'KC 안전 인증 강조. 커뮤니티 "물놀이 준비" 게시판 협업 콘텐츠.' },
      { name: '아기 자외선차단제 (물에 강한 SPF50+)', reason: '물놀이 겸용, 여름 반복 구매', urgency: 'high', category: 'l_body', priceRange: { min: 12000, max: 30000 }, prepDays: 7, momqTip: '"무기자차·EWG 등급" 키워드 상단 노출. 3개월 대용량 묶음 구성.' },
      { name: '유아 워터슈즈·래쉬가드', reason: '물놀이 필수 아이템, 7월 초 급등', urgency: 'mid', category: 'b_fashion', priceRange: { min: 10000, max: 35000 }, prepDays: 10, momqTip: '물놀이 세트 번들 구성. 맘큐 단독 여름 패키지.' },
    ],
    checklist: [
      { d: -14, task: '"여름방학 물놀이 특집" 기획전 오픈', done: false },
      { d: -7, task: '물놀이 안전용품 재고 2주치 선확보', done: false },
      { d: 0, task: '여름방학 시작일 자외선차단제 CRM 발송', done: false },
      { d: 7, task: '물놀이 후기 포토리뷰 이벤트 오픈', done: false },
    ],
    pro: '물놀이 구매 결정은 "안전"이 1순위입니다. KC 인증·안전 기준을 상세페이지 최상단에 배치하고, 맘큐 커뮤니티 안전 가이드 콘텐츠와 연동하면 전환율이 높아집니다.',
  },
  {
    id: 'e-typhoon-heat-prep', title: '태풍·폭염 마무리 대비', type: 'trend',
    start: '2026-08-11', end: '2026-08-25',
    categories: ['l_electric', 'l_clean', 'l_storage'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '8월 중순 태풍 시즌 및 폭염 지속. 여름 상품 재고 소진과 동시에 9월 개학 준비 상품으로 자연스럽게 전환하는 브리지 기간.',
    trendScore: 62, search: '+35%', gmv: '+20%',
    products: [
      { name: '다용도 청소세제 (태풍 후 청소 수요)', reason: '태풍 후 집 청소 수요', urgency: 'mid', category: 'l_clean', priceRange: { min: 5000, max: 18000 }, prepDays: 5, momqTip: '태풍 예보 발령 시 즉시 CRM 발송. "아기 있는 집 안심 성분" 프레임.' },
      { name: '쿨링매트·냉감 침구 (재고 소진)', reason: '폭염 마지막 수요 흡수, 재고 소진 기회', urgency: 'mid', category: 'l_electric', priceRange: { min: 15000, max: 55000 }, prepDays: 5, momqTip: '재고 소진 전 CRM 발송. 개학 전 여름 상품 마지막 판매 기회.' },
      { name: '수납·정리 박스 (개학 준비 겸용)', reason: '태풍 대비 정리 + 개학 준비 수요 동시 흡수', urgency: 'low', category: 'l_storage', priceRange: { min: 8000, max: 22000 }, prepDays: 5, momqTip: '개학 준비 수납 용품과 크로스셀. 여름→가을 전환 기획전 연계.' },
    ],
    checklist: [
      { d: -7, task: '여름 시즌 재고 소진 할인 기획', done: false },
      { d: 0, task: '태풍 예보 발령 시 즉시 CRM 발송 루틴 준비', done: false },
      { d: 5, task: '가을 개학 준비 기획전으로 전환', done: false },
    ],
    pro: '8월 중하순은 여름 상품 재고 소진 + 개학 준비 브리지 기간입니다. 여름 재고 할인과 개학 준비 기획전을 동시에 오픈해 고객이 한 번 방문에 두 가지 쇼핑 목적을 해결하도록 유도하세요.',
  },
  {
    id: 'e-autumn-transition', title: '가을 환절기 케어', type: 'season',
    start: '2026-09-01', end: '2026-09-22',
    categories: ['b_suppl', 'b_bath', 'l_health', 'b_bedding'],
    platforms: ['momq', 'coupang', 'naver'],
    summary: '여름→가을 환절기, 유아 면역 저하 및 피부 건조 이슈 시작. 추석 선물 수요와 겹쳐 건강식품·보습 제품 구매 집중.',
    trendScore: 71, search: '+47%', gmv: '+35%',
    products: [
      { name: '유아 면역 영양제·유산균', reason: '환절기 선제 구매, 맘 커뮤니티 1위 관심 품목', urgency: 'high', category: 'b_suppl', priceRange: { min: 15000, max: 48000 }, prepDays: 10, momqTip: '추석 전 건강 챙기기 프레임. 선물세트 구성 가능. 커뮤니티 후기 선행 확보 필수.' },
      { name: '유아 보습 크림·스킨케어 세트', reason: '가을 건조 시작, 환절기 필수 보습 수요', urgency: 'high', category: 'b_bath', priceRange: { min: 12000, max: 35000 }, prepDays: 7, momqTip: '봄 환절기 구매 고객 재구매 CRM. "EWG 등급" 인증 강조.' },
      { name: '유아동 가을 이불 (얇은 이불)', reason: '여름 이불→가을 이불 교체 수요', urgency: 'mid', category: 'b_bedding', priceRange: { min: 25000, max: 75000 }, prepDays: 14, momqTip: '세탁세제 + 침구 크로스셀 번들. 추석 전 배송 보장 강조.' },
    ],
    checklist: [
      { d: -10, task: '"가을 환절기 아이 케어" 기획전 오픈', done: false },
      { d: -5, task: '유산균·보습 크로스셀 번들 CRM 발송', done: false },
      { d: 0, task: '추석 선물세트와 동시 건강 기획전 연계 오픈', done: false },
    ],
    pro: '가을 환절기는 추석 선물 수요와 겹쳐 9월 초~중순이 건강식품 구매 골든타임입니다. 추석 기획전 오픈 시 "환절기 건강 챙기기 세트"를 묶으면 객단가를 자연스럽게 높일 수 있습니다.',
  },
  {
    id: 'e-suneung-gift', title: '수능 D-30 선물 시즌', type: 'trend',
    start: '2026-10-16', end: '2026-11-14',
    categories: ['b_suppl', 'l_health', 'b_toy'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '수능(11/12 예정) D-30부터 건강·집중력 관련 제품 수요 급등. 조부모→손자 선물 수요 및 수능 후 아이 교육 관심 전환 기회 동시 포착.',
    trendScore: 66, search: '+55%', gmv: '+32%',
    products: [
      { name: '어린이 건강기능식품 선물세트', reason: '수능 시즌 조부모→손자 선물 수요', urgency: 'mid', category: 'b_suppl', priceRange: { min: 25000, max: 65000 }, prepDays: 14, momqTip: '맘큐 프리미엄 선물포장 + 메시지카드 무료. 기존 고객 리타깃팅 CRM.' },
      { name: '어린이 면역·비타민 영양제', reason: '환절기 + 수능 시즌 건강 관심 최고조', urgency: 'mid', category: 'l_health', priceRange: { min: 15000, max: 48000 }, prepDays: 10, momqTip: '유산균 구매 고객 크로스셀. "겨울 대비 미리 챙기기" 프레임.' },
      { name: '유아 학습 교구·완구 세트', reason: '수능 후 학부모 아이 교육 관심 전환', urgency: 'low', category: 'b_toy', priceRange: { min: 20000, max: 65000 }, prepDays: 14, momqTip: '수능 이후 "내 아이 교육 준비" 프레임 전환. 12월 크리스마스 선물 브리지.' },
    ],
    checklist: [
      { d: -14, task: '"수능 응원·건강 선물" 기획전 오픈', done: false },
      { d: -7, task: '선물포장 옵션 활성화', done: false },
      { d: 0, task: '수능 당일 SNS 응원 콘텐츠 발행', done: false },
      { d: 3, task: '"수능 후 아이 교육 준비" 기획전으로 자연 전환', done: false },
    ],
    pro: '맘큐 타깃에서는 조부모가 손자 건강 선물을 사는 패턴이 유효합니다. 기존 구매 이력 고객 중 조부모 세그먼트에 건강 선물세트 CRM을 발송해 보세요.',
  },
  {
    id: 'e-kimchi-winter-clean', title: '김장·겨울 주방 대비', type: 'season',
    start: '2026-11-01', end: '2026-11-20',
    categories: ['l_clean', 'l_laundry', 'l_storage'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '11월 김장 시즌. 주방세제·청소용품·수납 수요 급등. 유아 있는 가정은 "아이 안심 성분" 주방세제 교체 수요도 동반 상승.',
    trendScore: 69, search: '+43%', gmv: '+28%',
    products: [
      { name: '유아 안심 주방세제 (무향·저자극)', reason: '김장 시즌 대용량 수요 + 유아 안심 성분 교체', urgency: 'high', category: 'l_clean', priceRange: { min: 8000, max: 25000 }, prepDays: 7, momqTip: '"아이 그릇 씻는 세제" 프레임. 무향·저자극 인증 강조. 대용량 묶음으로 객단가 방어.' },
      { name: '수납 박스·주방 정리대', reason: '김장 후 냉장고 정리·주방 수납 수요', urgency: 'mid', category: 'l_storage', priceRange: { min: 10000, max: 35000 }, prepDays: 7, momqTip: '주방세제 구매 고객 크로스셀. "김장 후 정리" 큐레이션 번들.' },
      { name: '항균 세탁세제 대용량 (겨울용)', reason: '김장 의류 + 겨울 이불 세탁 동반 수요', urgency: 'mid', category: 'l_laundry', priceRange: { min: 15000, max: 40000 }, prepDays: 7, momqTip: '유아 안심 성분 강조. 리필형 대용량으로 마진 방어.' },
    ],
    checklist: [
      { d: -10, task: '"김장·겨울 주방 준비" 기획전 오픈', done: false },
      { d: -5, task: '주방세제·세탁세제 대용량 묶음 구성', done: false },
      { d: 0, task: '수납 정리 번들 CRM 발송', done: false },
    ],
    pro: '김장 시즌은 생활용품 대용량 구매의 자연스러운 계기입니다. "아이 있는 집 주방세제"라는 맘큐 특화 프레임으로 접근하면 일반 마트와 차별화됩니다.',
  },
  {
    id: 'e-flu-immunity', title: '독감·겨울 면역 시즌', type: 'trend',
    start: '2026-11-15', end: '2026-12-20',
    categories: ['b_suppl', 'l_health', 'b_hygiene', 'l_air'],
    platforms: ['momq', 'coupang', 'naver'],
    summary: '독감 유행 시즌 진입. 유아 면역력 + 실내 공기질 + 위생 관련 맘큐 커뮤니티 질문 폭증. 유아 있는 가정의 "예방" 소비가 집중되는 시기.',
    trendScore: 81, search: '+68%', gmv: '+52%',
    products: [
      { name: '유아 유산균·면역 영양제 (겨울 집중)', reason: '독감 시즌 면역 관리 필수품, 재구매율 최상위', urgency: 'high', category: 'b_suppl', priceRange: { min: 18000, max: 55000 }, prepDays: 7, momqTip: '독감 유행 뉴스 감지 즉시 CRM 발송. "유아원 집단 감염 예방" 프레임이 전환 촉진.' },
      { name: '유아 가습기 (항균 필터·저소음)', reason: '겨울 건조 + 바이러스 예방 동시 수요', urgency: 'high', category: 'l_air', priceRange: { min: 25000, max: 80000 }, prepDays: 10, momqTip: '프리미엄 쇼핑지원금 활용 멤버십 업셀 기회. "항균 필터" 인증 강조.' },
      { name: '손소독제·항균 물티슈 대용량', reason: '독감 시즌 위생 수요, 반복 구매', urgency: 'high', category: 'b_hygiene', priceRange: { min: 5000, max: 18000 }, prepDays: 5, momqTip: '물티슈 구매 고객 자동 크로스셀. 대용량 묶음으로 재방문 유도.' },
      { name: '체온계·비강 세척기 세트', reason: '발열 관리 필수 육아템, 겨울 재구매 사이클', urgency: 'mid', category: 'l_health', priceRange: { min: 15000, max: 45000 }, prepDays: 7, momqTip: '면역 영양제 구매 시 묶음 할인. "아플 때 당황하지 말자" 프레임.' },
    ],
    checklist: [
      { d: -14, task: '"독감 예방·유아 면역 챙기기" 기획전 오픈', done: false },
      { d: -7, task: '유산균·가습기 재고 2주치 선확보', done: false },
      { d: 0, task: '독감 유행 첫 보도 즉시 CRM 타깃 발송', done: false },
      { d: 7, task: '재구매 쿠폰 자동 발송 세팅 (30일 후)', done: false },
    ],
    pro: '독감 시즌은 뉴스 발표 당일이 검색량 피크입니다. 뉴스 감지 탭의 "독감 유행" 키워드가 잡히면 즉시 CRM 발송과 광고 입찰 상향이 가능한 루틴을 미리 준비하세요.',
  },
  {
    id: 'e-year-end-prep', title: '연말 정리·새해 준비', type: 'season',
    start: '2026-12-26', end: '2027-01-07',
    categories: ['l_storage', 'b_furniture', 'b_bedding', 'b_toy'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '연말 대청소·정리 + 새해 맞이 용품 수요. 육아 공간 재정비와 아이 새해 선물 잔여 수요. 맘큐는 "새해 육아 준비" 프레임으로 접근.',
    trendScore: 67, search: '+38%', gmv: '+25%',
    products: [
      { name: '수납·정리 박스 세트 (유아 장난감 정리)', reason: '연말 대청소·정리 수요, 아이 물건 정리 필수', urgency: 'mid', category: 'l_storage', priceRange: { min: 15000, max: 45000 }, prepDays: 7, momqTip: '"아이 장난감 정리" 맘큐 커뮤니티 꿀팁 콘텐츠 연동. 수납 세트 묶음 할인.' },
      { name: '유아 침구 새해 에디션 (이불+베개)', reason: '새해 맞이 침구 교체 수요', urgency: 'mid', category: 'b_bedding', priceRange: { min: 30000, max: 80000 }, prepDays: 10, momqTip: '크리스마스 완구 구매 고객 침구 크로스셀. 새해 선물 프레임.' },
      { name: '새해 학습 교구·책 세트', reason: '새해 "이제 공부 시작" 학부모 심리 활용', urgency: 'low', category: 'b_toy', priceRange: { min: 20000, max: 60000 }, prepDays: 10, momqTip: '크리스마스 완구 잔여 재고 소진 + 새해 교구 전환. 2월 신학기 브리지 역할.' },
    ],
    checklist: [
      { d: -7, task: '"연말 대청소·육아 공간 정리" 기획전 오픈', done: false },
      { d: 0, task: '새해 맞이 수납·침구 CRM 발송', done: false },
      { d: 5, task: '2월 신학기 준비 기획전 사전 예고 배너', done: false },
    ],
    pro: '연말~신년 기간은 고객이 "새해 다짐"으로 구매하는 심리가 강합니다. "우리 아이 새해 맞이 육아 공간 리셋"이라는 프레임이 맘큐 타깃에 잘 먹힙니다. 2월 신학기 준비 기획전으로의 자연스러운 전환도 미리 준비하세요.',
  },
];
