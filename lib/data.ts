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

export const TODAY = new Date(2026, 3, 18);

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
    platform: { tip: '스마일클럽 타깃 정기구독 유입 최적. 빅스마일데이 1달 전 입점 신청.', action: '스마일클럽 쿠폰 세팅', metric: '정기구독 +28%' },
    season: { tip: '40~50대 구매층이 두텁습니다. "가성비·대용량" 프레임이 유리.', action: '대용량 패키지 구성', metric: '객단가 +15%' },
  },
  kakao: {
    holiday: { tip: '카카오톡 선물하기 연계가 폭발적. 공휴일 2주 전 선물세트 등록.', action: '선물하기 MD 제안', metric: '선물하기 GMV +120%' },
    season: { tip: '카카오톡 채널 메시지 발송이 가장 효율적인 타깃 광고입니다.', action: '채널 친구 메시지 발송', metric: '오픈율 +45%' },
  },
  momq: {
    holiday: { tip: '자사몰 핵심은 CRM. 공휴일 10일 전 기존 구매자 대상 맞춤 쿠폰 발송.', action: '세그먼트별 타깃 쿠폰', metric: '재구매율 +32%' },
    season: { tip: '월령별(0~6/7~12/13~24개월) 상품 추천 배너 교체. 육아 단계 맞춤이 핵심 훅.', action: '월령 맞춤 기획전', metric: '전환율 +45%' },
    platform: { tip: '자사몰 행사는 마진 방어 가능. 하기스 번들·세트가 오픈마켓 대비 이익률 2배.', action: '번들·세트 기획 확대', metric: '영업이익 +60%' },
    weather: { tip: '기저귀·물티슈는 날씨 민감도 낮음. 대신 환절기 스킨케어·용품 크로스셀 타이밍.', action: '환절기 케어 크로스셀', metric: '객단가 +18%' },
  },
};

export function getPlatformInsight(event: MarketingEvent, platform: string): PlatformInsight | null {
  return PLATFORM_TIPS[platform]?.[event.type as EventType] ?? null;
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
  const target = new Date(iso);
  return Math.floor((target.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
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
    id: 'e-spring-picnic', title: '봄 피크닉 시즌', type: 'season',
    start: '2026-04-01', end: '2026-04-30',
    categories: ['l_storage', 'b_carry', 'b_safety'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '주말 나들이·공원 피크닉 수요 절정. 가볍고 실용적인 휴대 용품이 급상승.',
    trendScore: 82, search: '+34%', gmv: '+21%',
    products: [
      { name: '피크닉 매트 (대형·방수)', reason: '가족 단위 수요 ↑, 방수 기능 필수', urgency: 'high', category: 'l_storage' },
      { name: '휴대용 아기 방수매트', reason: '기저귀 교체+식사 겸용 수요', urgency: 'high', category: 'b_safety' },
      { name: '아기띠·힙시트', reason: '짧은 나들이 필수템, 봄 신상 구매 집중', urgency: 'mid', category: 'b_carry' },
      { name: '유아 외출용 보냉백', reason: '이유식·간식 보관 수요', urgency: 'mid', category: 'b_carry' },
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
    pro: '지구의 날 단일 매출보다는 "브랜드 인식" 용도로 접근하세요. 실제 GMV 임팩트는 ±5% 수준입니다.',
  },
  {
    id: 'e-children-prep', title: '어린이날 선물 수요 시작', type: 'season',
    start: '2026-04-15', end: '2026-05-04',
    categories: ['b_toy', 'b_furniture', 'b_fashion'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '어린이날 3주 전부터 "선물", "장난감" 검색 급증. 4월 4주차가 구매 피크.',
    trendScore: 88, search: '+67%', gmv: '+95%',
    products: [
      { name: '4-7세 학습 완구·교구', reason: '검색량 최상위 (교육 + 재미)', urgency: 'high', category: 'b_toy' },
      { name: '캐릭터 완구 선물세트', reason: '포장 단위 구매, 객단가 높음', urgency: 'high', category: 'b_toy' },
      { name: '유아 자전거·킥보드', reason: '5월 초 야외활동과 연결', urgency: 'mid', category: 'b_toy' },
      { name: '캐릭터 유아동 의류세트', reason: '실용 선물 포지션, 리뷰 전환 좋음', urgency: 'mid', category: 'b_fashion' },
    ],
    checklist: [
      { d: -18, task: '"어린이날 선물 TOP 10" 기획전 페이지', done: true },
      { d: -10, task: '선물포장 옵션 추가', done: true },
      { d: -7, task: '배송일 강조 배너 (5/4까지 도착)', done: false },
      { d: -3, task: '당일배송·로켓 재고 점검', done: false },
      { d: 0, task: '마감 임박 리마케팅 캠페인', done: false },
    ],
    pro: '유아용품은 "엄마 후기 전환율"이 핵심입니다. 4월 3주차부터 리뷰 수 500개 이상 확보한 상품에 집중하세요. 신상은 5월까진 밀어도 밑빠진 독입니다.',
  },
  {
    id: 'e-weather-rain', title: '이상저온·꽃샘추위', type: 'weather',
    start: '2026-04-19', end: '2026-04-22',
    categories: ['b_fashion', 'b_bedding', 'l_electric'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '기상청 4/19-22 영하권 예보. 겨울 재고 소진 기회 + 환절기 방한 수요.',
    trendScore: 65, search: '+41%', gmv: '+28%',
    products: [
      { name: '유아 경량 패딩·바람막이', reason: '환절기 구매, 재고 처분 기회', urgency: 'high', category: 'b_fashion' },
      { name: '전기요·온열 매트', reason: '단기 4일간 검색 급증 예상', urgency: 'high', category: 'l_electric' },
      { name: '유아 수면조끼·수면가운', reason: '밤사이 온도 변화 대응 수요', urgency: 'mid', category: 'b_bedding' },
    ],
    checklist: [
      { d: 0, task: '"꽃샘추위 긴급 세일" 배너 즉시 게시', done: false },
      { d: 0, task: '쿠팡 로켓 긴급 재입고 요청', done: false },
      { d: 1, task: '"오늘 받는 방한용품" 키워드 광고 상향', done: false },
      { d: 4, task: '한파 종료 후 재고 정리 쿠폰', done: false },
    ],
    pro: '날씨 이슈는 반응 속도가 전부입니다. 기상청 예보 발표 당일 배너/광고 반영 못하면 기회 완전 소멸. 자동화 알림 설정하세요.',
  },
  {
    id: 'e-children-day', title: '어린이날', type: 'holiday',
    start: '2026-05-05', end: '2026-05-05',
    categories: ['b_toy', 'b_furniture', 'b_fashion', 'b_safety'],
    platforms: ['coupang', 'naver', '11st', 'momq'],
    summary: '유아용품 연중 최대 이벤트. 5/2-5/5 집중 구매.',
    trendScore: 98, search: '+210%', gmv: '+320%',
    products: [
      { name: '당일배송 가능 완구·교구', reason: '5/4 오후 급구매 대응', urgency: 'high', category: 'b_toy' },
      { name: '보드게임·플레이매트', reason: '가족 동반 활동용', urgency: 'high', category: 'b_safety' },
      { name: '아동 책상·의자 세트', reason: '선물 + 학습 준비 겸용 구매', urgency: 'mid', category: 'b_furniture' },
      { name: '캐릭터 유아동 의류', reason: '선물 포장 단위 구매 증가', urgency: 'mid', category: 'b_fashion' },
    ],
    checklist: [
      { d: -7, task: '어린이날 메인 페이지 오픈', done: false },
      { d: -3, task: '당일배송 상품 별도 전시', done: false },
      { d: 0, task: '실시간 재고 모니터링', done: false },
    ],
    pro: '5월 4일 오후 3시~6시가 "급구매" 골든타임입니다. 당일 배송 가능 상품만 상단 노출시키고, 재고 0인 상품은 숨기세요.',
  },
  {
    id: 'e-parents-day', title: '어버이날', type: 'holiday',
    start: '2026-05-08', end: '2026-05-08',
    categories: ['l_health', 'l_body', 'l_bath'],
    platforms: ['coupang', 'naver', '11st'],
    summary: '부모님 선물. 안마기·건강용품·프리미엄 생활용품 최상위.',
    trendScore: 92, search: '+156%', gmv: '+180%',
    products: [
      { name: '안마기·마사지건', reason: '중장년 선호 최상위', urgency: 'high', category: 'l_health' },
      { name: '혈압계·체온계·건강 측정기', reason: '실용 선물 + 재구매 유도', urgency: 'high', category: 'l_health' },
      { name: '프리미엄 바디로션·핸드크림', reason: '여성 부모 대상 실용 선물', urgency: 'mid', category: 'l_body' },
    ],
    checklist: [
      { d: -14, task: '"효도 선물" 기획전 페이지', done: false },
      { d: -10, task: '메시지카드 옵션 추가', done: false },
      { d: -5, task: '라이브커머스 편성 확정', done: false },
      { d: 0, task: '당일배송 푸시알림', done: false },
    ],
    pro: '40-50대 자녀가 주 구매층이므로 "가성비"보다 "체면"이 먹힙니다. 포장 퀄리티와 브랜드감을 강조하세요.',
  },
  {
    id: 'e-spring-cleaning', title: '봄맞이 대청소 시즌', type: 'season',
    start: '2026-05-01', end: '2026-05-31',
    categories: ['l_clean', 'l_air', 'l_laundry', 'l_storage'],
    platforms: ['coupang', 'naver'],
    summary: '환절기 대청소·정리 수요 급상승. "살림템" 검색량 피크 시즌.',
    trendScore: 78, search: '+58%', gmv: '+42%',
    products: [
      { name: '다용도 청소세제·얼룩제거제', reason: '봄 대청소 필수템, 재구매 유도', urgency: 'high', category: 'l_clean' },
      { name: '침구청소기·진드기 제거제', reason: '환절기 알레르기 이슈로 수요 급증', urgency: 'high', category: 'l_air' },
      { name: '리필형 세탁세제 대용량', reason: '이불빨래 수요 동반', urgency: 'mid', category: 'l_laundry' },
    ],
    checklist: [
      { d: -7, task: '"봄맞이 살림템" 기획전 페이지', done: false },
      { d: 0, task: '세제 대용량 정기구독 혜택 세팅', done: false },
    ],
    pro: '생활용품은 "정기구독"이 핵심입니다. 단발 할인보다 3회 연속 할인으로 습관화 유도하세요.',
  },
  {
    id: 'e-rainy-season', title: '장마 시즌', type: 'weather',
    start: '2026-06-20', end: '2026-07-20',
    categories: ['l_air', 'l_electric', 'l_storage', 'b_safety'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '제습기·탈취제·방수용품 폭증. 기상청 예보 확정 후 1주 이내 준비.',
    trendScore: 88, search: '+125%', gmv: '+85%',
    products: [
      { name: '제습기·제습제', reason: '장마 1주 전부터 검색 급증', urgency: 'high', category: 'l_electric' },
      { name: '곰팡이 제거제·탈취제', reason: '욕실·베란다 집중 수요', urgency: 'high', category: 'l_air' },
      { name: '진공 압축팩·수납정리함', reason: '겨울이불 보관 수요', urgency: 'mid', category: 'l_storage' },
    ],
    checklist: [
      { d: -7, task: '"장마 대비" 큐레이션 페이지 오픈', done: false },
      { d: 0, task: '쿠팡 로켓 재고 1.5배 확보', done: false },
    ],
    pro: '제습기는 "층수별 면적 가이드"를 상세페이지에 넣으면 전환율 2배 이상 차이 납니다.',
  },
  {
    id: 'e-gmarket-bigsmile', title: 'G마켓 빅스마일데이', type: 'platform',
    start: '2026-06-15', end: '2026-06-25',
    categories: ['l_laundry', 'l_clean', 'l_tissue', 'b_diaper', 'b_wipe', 'b_formula'],
    platforms: ['gmarket', 'momq'],
    summary: 'G마켓 연중 최대 행사. 스마일페이 적립 + 대형 쿠폰.',
    trendScore: 85, search: '+45%', gmv: '+90%',
    products: [
      { name: '세제·섬유유연제 TOP10', reason: 'G마켓 알고리즘이 TOP 10에 트래픽 몰아줌', urgency: 'high', category: 'l_laundry' },
      { name: '기저귀·물티슈 대용량', reason: '스마일클럽 정기구독 유입 최적', urgency: 'high', category: 'b_diaper' },
    ],
    checklist: [
      { d: -30, task: 'G마켓 빅스마일 입점 신청', done: false },
      { d: -7, task: '스마일클럽 전용 쿠폰 세팅', done: false },
      { d: 0, task: '광고 단가 입찰 공격적 조정', done: false },
    ],
    pro: 'G마켓은 "리뷰+평점 4.5 이상"이 상단 노출 조건입니다. 행사 전 평점 관리 필수.',
  },
];
