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
      { name: '유아 책가방·백팩 (유치원·어린이집용)', reason: '입학 시즌 최고 수요 품목, 맘큐 커뮤니티 후기 구매 전환 강함', urgency: 'high', category: 'b_carry' },
      { name: '어린이 책상·의자 세트', reason: '새학기 공부 환경 세팅 수요, 가격대 높아 객단가 우수', urgency: 'high', category: 'b_furniture' },
      { name: '유아동 실내화·운동화', reason: '유치원·어린이집 필수품, 반복 구매', urgency: 'mid', category: 'b_fashion' },
      { name: '아동 학습교구·퍼즐 세트', reason: '입학 선물 포지션, 선물세트 구성 용이', urgency: 'mid', category: 'b_toy' },
    ],
    checklist: [
      { d: -21, task: '"새학기 입학 선물" 기획전 페이지 오픈', done: false },
      { d: -14, task: '맘큐 커뮤니티 게시판 협업 콘텐츠 업로드', done: false },
      { d: -7, task: '책가방·실내화 재고 3주치 확보', done: false },
      { d: 0, task: '입학식 당일 SNS 인증 이벤트 오픈', done: false },
      { d: 7, task: '입학 후기 리뷰 이벤트 마감', done: false },
    ],
    pro: '맘큐 커뮤니티 "육아템 후기" 게시판 노출이 전환율에 직결됩니다. 2월 초 커뮤니티 체험단을 먼저 모집하고, 후기 30개 이상 확보 후 광고를 올리세요. 쿠팡·네이버보다 맘큐 자사몰 유입이 2배 높은 시즌입니다.',
  },
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
    platforms: ['coupang', 'naver', '11st', 'momq'],
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
      { d: 0, task: '세제 대용량 정기구독 혜택 세팅', done: false },
    ],
    pro: '생활용품은 "정기구독"이 핵심입니다. 단발 할인보다 3회 연속 할인으로 습관화 유도하세요.',
  },
  {
    id: 'e-newborn-care', title: '임산부·신생아 케어 시즌', type: 'season',
    start: '2026-06-01', end: '2026-06-30',
    categories: ['b_diaper', 'b_wipe', 'b_formula', 'b_safety', 'l_body'],
    platforms: ['momq', 'coupang', 'naver'],
    summary: '임신 중후반·산후 조리 수요가 집중되는 시즌. 맘큐 D2C의 핵심 타깃인 0-12개월 신생아 케어 카테고리 전반 수요 상승.',
    trendScore: 76, search: '+52%', gmv: '+44%',
    products: [
      { name: '신생아 피부 전용 세정·로션 세트', reason: '태열·아토피 민감 피부 수요, 맘큐 커뮤니티 추천 상위', urgency: 'high', category: 'l_body' },
      { name: '기저귀 대용량 월정기구독 세트', reason: '신생아 가정 필수 소모품, 정기구독 락인 최적 시기', urgency: 'high', category: 'b_diaper' },
      { name: '임산부 배꼽 밴드·수면 쿠션', reason: '임신 중후반 필수템, 맘큐 산전 카테고리 대표 상품', urgency: 'mid', category: 'b_safety' },
      { name: '유기농 물티슈 대용량', reason: '신생아 전용 성분 인증 제품 수요, 반복 구매', urgency: 'mid', category: 'b_wipe' },
    ],
    checklist: [
      { d: -14, task: '"신생아 첫 달 필수템" 기획전 페이지 오픈', done: false },
      { d: -7, task: '맘큐 임신·출산 커뮤니티 게시판 협업 콘텐츠', done: false },
      { d: 0, task: '기저귀·물티슈 정기구독 첫 달 할인 프로모션', done: false },
      { d: 14, task: '산후 1개월 후기 이벤트 마감', done: false },
    ],
    pro: '맘큐 커뮤니티의 "신생아 용품 추천 후기"는 구매 전환율이 일반 광고의 3배입니다. 신제품 런칭 시 커뮤니티 체험단 20명 확보를 먼저 하고 광고를 집행하세요. 6월은 연간 출산율 피크 중 하나로 신생아 가정 DB 확보의 골든 타임입니다.',
  },
  {
    id: 'e-summer-vacation', title: '여름 휴가 시즌', type: 'season',
    start: '2026-07-01', end: '2026-08-31',
    categories: ['b_carry', 'b_safety', 'l_storage', 'l_body'],
    platforms: ['coupang', 'naver', 'momq'],
    summary: '물놀이·캠핑·여행 수요 급증. 유아 물놀이 용품·자외선 차단 제품 최성수기.',
    trendScore: 85, search: '+78%', gmv: '+55%',
    products: [
      { name: '유아 물놀이 용품 세트', reason: '물놀이 시즌 최대 수요', urgency: 'high', category: 'b_safety' },
      { name: '아기 자외선차단제 SPF50+', reason: '여름 필수품, 반복구매', urgency: 'high', category: 'l_body' },
      { name: '휴대용 유아 물통·보냉백', reason: '캠핑·나들이 필수 아이템', urgency: 'mid', category: 'b_carry' },
    ],
    checklist: [
      { d: -14, task: '"여름 물놀이 특집" 기획전 페이지', done: false },
      { d: -7, task: '자외선차단제 재고 2배 확보', done: false },
      { d: 0, task: '여름 키워드 광고 입찰 상향', done: false },
    ],
    pro: '유아 자외선차단제는 "무기자차", "EWG 등급" 키워드가 전환율 2배. 상세페이지에 성분 강조 필수.',
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
      { name: '건강기능식품 선물세트', reason: '명절 최고 판매 카테고리', urgency: 'high', category: 'l_health' },
      { name: '프리미엄 바디케어 세트', reason: '여성 가족 선물 포지션', urgency: 'high', category: 'l_body' },
      { name: '유아 선물 세트', reason: '손자녀 선물 수요', urgency: 'mid', category: 'b_formula' },
    ],
    checklist: [
      { d: -21, task: '추석 선물세트 페이지 오픈', done: false },
      { d: -14, task: '선물포장·메시지카드 옵션 추가', done: false },
      { d: -7, task: '배송 마감일 배너 게시', done: false },
    ],
    pro: '추석 선물 구매 피크는 9월 10~18일입니다. 9월 19일 이후 주문은 명절 전 도착 보장 불가 안내 필수.',
  },
  {
    id: 'e-immunity-season', title: '유아 면역·건강 시즌', type: 'season',
    start: '2026-09-28', end: '2026-10-20',
    categories: ['b_formula', 'l_health', 'b_safety', 'l_air'],
    platforms: ['momq', 'coupang', 'naver'],
    summary: '환절기 어린이집·유치원 개학 이후 감기·면역 관련 수요 급등. 맘큐 커뮤니티에서 "아이 면역력", "유아 영양제" 검색 연중 최고.',
    trendScore: 74, search: '+63%', gmv: '+47%',
    products: [
      { name: '유아 유산균·면역 영양제', reason: '환절기 맘 커뮤니티 검색 1위 품목, 정기구독 전환율 높음', urgency: 'high', category: 'b_formula' },
      { name: '어린이 코 세척·흡입기 세트', reason: '콧물·비염 시즌 필수템, 재구매 사이클 짧음', urgency: 'high', category: 'b_safety' },
      { name: '공기청정기·가습기 (유아 전용)', reason: '환절기 실내 공기질 관심 급증', urgency: 'mid', category: 'l_air' },
      { name: '유아 홍삼·비타민C 액상', reason: '면역력 챙기기 시즌, 선물 포지션도 가능', urgency: 'mid', category: 'l_health' },
    ],
    checklist: [
      { d: -10, task: '"환절기 아이 건강 챙기기" 기획전 오픈', done: false },
      { d: -5, task: '맘큐 커뮤니티 "우리 아이 면역력" 콘텐츠 업로드', done: false },
      { d: 0, task: '유산균·영양제 정기구독 첫 달 50% 프로모션', done: false },
      { d: 7, task: '구매 후기 이벤트 마감', done: false },
    ],
    pro: '환절기 유아 건강 수요는 "맘 커뮤니티 입소문"이 핵심입니다. 성분·안전성 인증을 강조한 카드뉴스를 맘큐 게시판에 먼저 올리고, 7일 후 쿠팡·네이버 광고를 집행하면 전환율이 40% 이상 높아집니다.',
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
      { name: '맘큐 단독 기저귀·물티슈 연간 구독 패키지', reason: '연중 최저가 포지셔닝, 자사몰 락인 효과 최대', urgency: 'high', category: 'b_diaper' },
      { name: '유아 스킨케어 풀세트 (맘큐 에디션)', reason: '자사몰 단독 구성, 커뮤니티 인플루언서 협업', urgency: 'high', category: 'l_body' },
      { name: '프리미엄 분유·이유식 3개월 세트', reason: '맘큐 회원 전용 가격, 재구매 전환 핵심', urgency: 'high', category: 'b_formula' },
      { name: '생활용품 묶음 기획세트', reason: '블랙프라이데이 전 선점 구매 유도', urgency: 'mid', category: 'l_clean' },
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
      { name: '생활용품 대용량 묶음세트', reason: '대규모 할인에 최적화된 구성', urgency: 'high', category: 'l_laundry' },
      { name: '기저귀·물티슈 박스 세트', reason: '연간 최저가 포지셔닝 기회', urgency: 'high', category: 'b_diaper' },
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
      { name: '어린이 인기 완구 선물세트', reason: '산타 선물 대표 카테고리', urgency: 'high', category: 'b_toy' },
      { name: '유아 의류·잠옷 세트', reason: '크리스마스 특별 패키지 수요', urgency: 'high', category: 'b_fashion' },
      { name: '프리미엄 건강 선물세트', reason: '어른 선물 포지션', urgency: 'mid', category: 'l_health' },
    ],
    checklist: [
      { d: -21, task: '크리스마스 기획전 페이지 오픈', done: false },
      { d: -14, task: '선물포장·리본 옵션 추가', done: false },
      { d: -7, task: '크리스마스 전 배송 마감일 배너', done: false },
    ],
    pro: '12월 15~20일이 크리스마스 선물 구매 피크입니다. 12/21 이후 주문은 도착 보장 불가 안내 필수.',
  },
];
