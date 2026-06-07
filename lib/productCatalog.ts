// 맘큐 취급 카테고리별 대표 제품 + 시즌 신호
// MD가 직접 관리 — 제품명/시즌 특성 수정 시 이 파일만 편집

export interface ProductCategory {
  label: string;
  products: string[];       // 맘큐 대표 상품명
  seasonalSignal: string;   // 시즌별 수요 특성 (Gemini 컨텍스트용)
  momqFocus: string;        // 맘큐 기획 포인트
}

export const PRODUCT_CATALOG: Partial<Record<string, ProductCategory>> = {
  b_diaper: {
    label: '기저귀',
    products: ['하기스 네이처메이드 밴드', '하기스 매직팬티', '하기스 네이처메이드 팬티'],
    seasonalSignal: '여름(6-8월): 통기성·흡수력·뽀송함 소구, 얇고 시원한 여름 에디션 수요 ↑. 장마(6-7월): 습기 속 피부 보호·발진 예방 강조. 겨울: 밀착·보온 소구',
    momqFocus: '프리미엄 등급 번들, 용량별 단가 설계, 멤버십 등급 쿠폰 연계'
  },
  b_wipe: {
    label: '아기 물티슈',
    products: ['하기스 아기물티슈 순수한 내추럴', '하기스 아기물티슈 휴대팩'],
    seasonalSignal: '여름·야외활동 시즌(6-8월): 휴대팩 수요 급증. 장마철: 항균·보습 소구. 연중: 대용량 리필팩 꾸준',
    momqFocus: '기저귀+물티슈 번들, 계절 한정 휴대팩 기획전'
  },
  b_formula: {
    label: '분유',
    products: ['하이뮨 프로틴 밸런스', '매일아이 유기농 1단계'],
    seasonalSignal: '연중 꾸준. 여름: 냉장 보관 편의성 소구. 신학기(2-3월): 신규 이유식 전환 수요',
    momqFocus: '월령별 번들 기획, 정기 구매 유도 쿠폰'
  },
  b_fashion: {
    label: '유아 패션',
    products: ['하기스 여름 반팔 내의', '하기스 방수 턱받이'],
    seasonalSignal: '봄·여름(3-8월): 얇은 소재 내의·외출복 수요. 가을·겨울: 보온 내복·방한복 ↑',
    momqFocus: '시즌 기획전, 출생 선물세트 구성'
  },
  l_clean: {
    label: '청소',
    products: ['크리넥스 빨아쓰는 행주', '크리넥스 항균 주방 행주', '크리넥스 극세사 행주'],
    seasonalSignal: '장마 시즌(6-7월): 꿉꿉한 주방 위생 관심 급증 → 행주 교체 수요 최고조. 명절 대청소(1월·9월): 청소용품 전반 ↑. 봄 대청소(3-4월): 주방·욕실 청소 용품 수요 ↑',
    momqFocus: '장마 대비 주방 위생 기획전, 청소 번들 구성'
  },
  l_tissue: {
    label: '화장지·티슈',
    products: ['크리넥스 미용티슈', '크리넥스 스카트 키친타월', '크리넥스 3겹 화장지', '크리넥스 물티슈 70매'],
    seasonalSignal: '환절기·독감 시즌(10-2월): 미용티슈 수요 ↑. 키친타올: 연중 꾸준. 명절 전후: 대용량 기획세트 수요 ↑',
    momqFocus: '명절 기획세트, 대용량 가성비팩, 계절 한정 패키지'
  },
  l_body: {
    label: '바디케어·물티슈',
    products: ['크리넥스 바디물티슈', '크리넥스 쿨링물티슈', '크리넥스 체온유지 물티슈'],
    seasonalSignal: '여름(6-8월): 바디물티슈·쿨링물티슈 수요 급증, 체감 온도 높을수록 ↑. 장마·폭염: 상쾌함·쿨링 소구. 겨울: 체온유지 물티슈 수요',
    momqFocus: '여름 쿨링 기획전, 야외활동·물놀이 번들'
  },
  l_laundry: {
    label: '세탁세제',
    products: ['유한젠 베이비 세탁세제', '퍼실 파워젤 아기용'],
    seasonalSignal: '장마·여름: 땀 제거·항균·냄새 제거 강조. 봄 대청소(3-4월): 대용량 ↑. 연중: 아기 피부 안전 성분 소구',
    momqFocus: '아기 피부 안전 성분 강조, 세탁세제+섬유유연제 번들'
  },
  l_hair: {
    label: '헤어케어',
    products: ['하기스 아기 샴푸', '크리넥스 유아용 헤어 제품'],
    seasonalSignal: '여름: 땀·습기로 두피 케어 관심 ↑. 장마: 끈적임·냄새 제거 소구',
    momqFocus: '바디워시+샴푸 번들 기획'
  },
  l_health: {
    label: '건강용품',
    products: ['하기스 체온계', '아기 손 세정제'],
    seasonalSignal: '독감·감기 시즌(10-3월): 건강 관리 용품 ↑. 여름: 아기 모기 퇴치·야외 위생 용품',
    momqFocus: '시즌별 건강 관리 기획전'
  },
  l_air: {
    label: '공기 관리',
    products: ['공기청정기 필터', '탈취제'],
    seasonalSignal: '봄 미세먼지 시즌(3-5월): 공기청정 관련 ↑. 여름: 냉방·환기 연계. 장마: 습기 제거·탈취 수요',
    momqFocus: '계절별 공기 관리 기획전'
  },
};
