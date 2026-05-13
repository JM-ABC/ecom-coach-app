'use client';

import { useMemo } from 'react';
import { useTrendData } from './useTrendData';
import type { MarketingEvent, Product, ChecklistItem } from '@/lib/types';

export type AutoTrendStatus = 'loading' | 'ok' | 'no-api-key' | 'error';

export interface AutoTrendState {
  events: MarketingEvent[];
  status: AutoTrendStatus;
  updatedAt: string | null;
}

const SURGE_THRESHOLD = 20;

type CatConfig = {
  label: string;
  products: Product[];
  checklist: ChecklistItem[];
  pro: string;
};

const CAT_CONFIGS: Record<string, CatConfig> = {
  b_diaper: {
    label: '기저귀',
    products: [
      { name: '하기스 기저귀 대용량', reason: '검색 급등 — 브랜드 1위 선점 필요', urgency: 'high', category: 'b_diaper', prepDays: 2, momqTip: '맘큐 독점 단가로 경쟁 방어 가능' },
      { name: '기저귀+물티슈 번들 세트', reason: '교차 구매로 객단가 방어', urgency: 'mid', category: 'b_diaper', prepDays: 3 },
    ],
    checklist: [
      { d: 0, task: '기저귀 재고 긴급 점검 — 소진 예상일 산출', done: false },
      { d: 2, task: '번들(기저귀+물티슈) 기획 제안서 작성', done: false },
    ],
    pro: '기저귀 급등 시 단독 할인보다 번들 구성이 수익성 높음. 번들로 단가 방어 권장.',
  },
  b_wipe: {
    label: '유아물티슈',
    products: [
      { name: '유아물티슈 캡형 대용량', reason: '검색 급등 — 재구매율 1위 품목', urgency: 'high', category: 'b_wipe', prepDays: 1 },
      { name: '신생아 물티슈 리필팩', reason: '연령별 수요 세분화 대응', urgency: 'mid', category: 'b_wipe', prepDays: 2 },
    ],
    checklist: [
      { d: 0, task: '물티슈 재고·납기 점검', done: false },
      { d: 2, task: '기저귀 교차구매 번들 기획 검토', done: false },
    ],
    pro: '물티슈는 기저귀와 동반 검색 비율 60%+. 기저귀 상세페이지 교차 배너 즉시 추가.',
  },
  b_toy: {
    label: '완구/교구',
    products: [
      { name: '월령별 교구 세트', reason: '검색 급등 — 선물 시즌 전조 신호', urgency: 'high', category: 'b_toy', prepDays: 5 },
      { name: '인기 캐릭터 완구', reason: '위시리스트 상위 품목', urgency: 'mid', category: 'b_toy', prepDays: 7 },
    ],
    checklist: [
      { d: 0, task: '베스트셀러 완구 재고 확인', done: false },
      { d: 3, task: '연령별 추천 큐레이션 기획전 준비', done: false },
    ],
    pro: '완구 급등은 선물 시즌 전조. 랜딩에 연령 필터 강조 + 리뷰 UGC 강화.',
  },
  b_fashion: {
    label: '유아동패션',
    products: [
      { name: '환절기 아기 아우터', reason: '시즌 전환 검색 급등', urgency: 'high', category: 'b_fashion', prepDays: 7 },
      { name: '유아 코디 세트', reason: '코디셋 구성 시 객단가 +40%', urgency: 'mid', category: 'b_fashion', prepDays: 5 },
    ],
    checklist: [
      { d: 0, task: '시즌 아이템 입고·납기 확인', done: false },
      { d: 3, task: '코디셋 번들 기획 제안', done: false },
    ],
    pro: '유아동복 급등 시 코디셋 묶음 기획이 객단가 방어에 효과적 (+40% 이상).',
  },
  b_formula: {
    label: '분유/어린이식품',
    products: [
      { name: '1단계 신생아 분유', reason: '신생아 시즌 수요 신호', urgency: 'high', category: 'b_formula', prepDays: 3 },
      { name: '성장기 분유 대용량', reason: '재구매 고객 업셀링 기회', urgency: 'mid', category: 'b_formula', prepDays: 2 },
    ],
    checklist: [
      { d: 0, task: '분유 재고 긴급 점검', done: false },
      { d: 2, task: '수유용품 교차판매 배너 기획', done: false },
    ],
    pro: '분유 급등은 신생아 시즌 신호. 수유용품·신생아 케어 세트 교차판매 즉시 검토.',
  },
  l_laundry: {
    label: '세탁세제',
    products: [
      { name: '대용량 액체세탁세제', reason: '생필품 급등 — 대용량 선호', urgency: 'high', category: 'l_laundry', prepDays: 2 },
      { name: '세탁세제+섬유유연제 세트', reason: '번들 수요 높음', urgency: 'mid', category: 'l_laundry', prepDays: 3 },
    ],
    checklist: [
      { d: 0, task: '세탁세제 베스트셀러 재고 확인', done: false },
      { d: 2, task: '세제+유연제 번들 기획 검토', done: false },
    ],
    pro: '세탁세제 급등 시 대용량 번들 구성이 최고 전환 레버. 재구매율 25%+ 개선 가능.',
  },
  l_clean: {
    label: '청소/주방세제',
    products: [
      { name: '다목적 세정스프레이', reason: '검색 급등 — 청소 시즌 신호', urgency: 'high', category: 'l_clean', prepDays: 2 },
      { name: '욕실·주방 청소세트', reason: '구역별 세트 구성 수요', urgency: 'mid', category: 'l_clean', prepDays: 3 },
    ],
    checklist: [
      { d: 0, task: '청소세제 재고 점검', done: false },
      { d: 2, task: '주방+욕실 세트 기획 검토', done: false },
    ],
    pro: '청소 급등 시 구역별 세트(주방+욕실) 구성으로 단가 방어.',
  },
  l_hair: {
    label: '샴푸/헤어',
    products: [
      { name: '두피케어 샴푸', reason: '환절기 탈모 이슈 연동', urgency: 'high', category: 'l_hair', prepDays: 3 },
      { name: '샴푸+트리트먼트 세트', reason: '교차 구매 수요', urgency: 'mid', category: 'l_hair', prepDays: 3 },
    ],
    checklist: [
      { d: 0, task: '두피케어 라인업 재고 점검', done: false },
      { d: 2, task: '환절기 탈모 키워드 광고 점검', done: false },
    ],
    pro: '헤어 급등은 환절기 탈모 이슈 신호. 두피케어 키워드 광고 즉시 강화 권장.',
  },
  l_health: {
    label: '건강/의료용품',
    products: [
      { name: '안마기·마사지건', reason: '선물·자기관리 수요 급등', urgency: 'high', category: 'l_health', prepDays: 5 },
      { name: '체온계·혈압계', reason: '계절성 건강 관리 수요', urgency: 'mid', category: 'l_health', prepDays: 3 },
    ],
    checklist: [
      { d: 0, task: '베스트셀러 건강용품 재고 점검', done: false },
      { d: 3, task: '선물세트 번들 기획 검토', done: false },
    ],
    pro: '건강용품 급등 시 리뷰 UGC 강화가 전환 핵심. 실사용 후기 노출 즉시 강화.',
  },
  l_electric: {
    label: '생활전기용품',
    products: [
      { name: '이동식 에어컨·냉풍기', reason: '폭염 예고 — 검색 급등', urgency: 'high', category: 'l_electric', prepDays: 3 },
      { name: 'DC 선풍기 대용량', reason: '에너지효율 선호 수요', urgency: 'mid', category: 'l_electric', prepDays: 3 },
    ],
    checklist: [
      { d: 0, task: '냉방가전 재고 긴급 확인 — 48시간 내 소진 가능', done: false },
      { d: 1, task: '에너지효율 라벨 강조 상세페이지 점검', done: false },
    ],
    pro: '냉방가전 급등 후 48시간이 골든타임. 즉시 재고 확인 + 광고 상향 필수.',
  },
  l_air: {
    label: '탈취/방향/제습',
    products: [
      { name: '대용량 습기제거제', reason: '장마·습기 이슈 검색 급등', urgency: 'high', category: 'l_air', prepDays: 2 },
      { name: '전자 제습기', reason: '반복 사용 고단가 수요', urgency: 'mid', category: 'l_air', prepDays: 5 },
    ],
    checklist: [
      { d: 0, task: '제습 관련 재고 긴급 점검', done: false },
      { d: 1, task: '날씨 연동 광고 자동화 설정 확인', done: false },
    ],
    pro: '제습 수요는 장마 예보 발표 당일 급등. 날씨 트리거 광고 자동화 필수.',
  },
  l_body: {
    label: '바디/세안',
    products: [
      { name: '쿨링매트·아이스겔 베개', reason: '폭염 연동 검색 급등', urgency: 'high', category: 'l_body', prepDays: 3 },
      { name: '아이스팩 대용량 세트', reason: '쿨링 보조품 교차 수요', urgency: 'mid', category: 'l_body', prepDays: 2 },
    ],
    checklist: [
      { d: 0, task: '쿨링 아이템 재고 점검', done: false },
      { d: 2, task: '쿨링 테마 기획전 준비', done: false },
    ],
    pro: '쿨링 수요는 폭염 예보와 동시 급등. 날씨 트리거 광고 + 메인 배너 즉시 교체.',
  },
  l_tissue: {
    label: '화장지/물티슈',
    products: [
      { name: '두루마리 화장지 대용량', reason: '생필품 검색 급등', urgency: 'high', category: 'l_tissue', prepDays: 1 },
      { name: '미용티슈·키친타올 세트', reason: '티슈류 묶음 수요', urgency: 'mid', category: 'l_tissue', prepDays: 2 },
    ],
    checklist: [
      { d: 0, task: '화장지·티슈 대용량 재고 점검', done: false },
      { d: 1, task: '대용량 번들 기획전 준비', done: false },
    ],
    pro: '티슈 급등 시 대용량 번들이 최고 전환 레버. 묶음으로 객단가 방어.',
  },
};

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday;
}

function trendScoreFromChange(change: number): number {
  if (change >= 100) return 10;
  if (change >= 50) return 8;
  if (change >= 30) return 7;
  return 5;
}

export function useAutoTrendEvents(): AutoTrendState {
  const trendState = useTrendData();

  const events = useMemo<MarketingEvent[]>(() => {
    if (trendState.status !== 'ok' || trendState.trends.length === 0) return [];

    const today = new Date();
    const monday = getMondayOfWeek(today);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekOf = toISODate(monday);
    const endOf = toISODate(sunday);

    return trendState.trends
      .filter(t => t.changeVsPrevWeek >= SURGE_THRESHOLD)
      .flatMap((t): MarketingEvent[] => {
        const cfg = CAT_CONFIGS[t.ourKey];
        if (!cfg) return [];
        const sign = t.changeVsPrevWeek > 0 ? '+' : '';
        return [{
          id: `auto-trend-${t.ourKey}-${weekOf}`,
          title: `${cfg.label} 검색 급등 ${sign}${t.changeVsPrevWeek}%`,
          type: 'trend',
          start: weekOf,
          end: endOf,
          categories: [t.ourKey],
          platforms: ['momq', 'coupang', 'naver'],
          summary: `네이버 검색량 전주 대비 ${sign}${t.changeVsPrevWeek}% 급등. 재고 점검 및 프로모션 즉시 검토 필요.`,
          trendScore: trendScoreFromChange(t.changeVsPrevWeek),
          search: `전주比 ${sign}${t.changeVsPrevWeek}% (네이버 DataLab)`,
          gmv: '트렌드 연동 산출',
          products: cfg.products.map(p => ({ ...p })),
          checklist: cfg.checklist.map(c => ({ ...c })),
          pro: cfg.pro,
          source: 'naver-trend',
        }];
      });
  }, [trendState.trends, trendState.status]);

  return {
    events,
    status: trendState.status,
    updatedAt: trendState.updatedAt,
  };
}
