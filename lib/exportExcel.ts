import * as XLSX from 'xlsx';
import type { MarketingEvent } from './types';

const URGENCY_LABEL: Record<string, string> = { high: '긴급', mid: '중요', low: '여유' };

const COMMON_CHECKLIST = [
  { d: -21, task: '전환율·매출 목표 KPI 설정 (이벤트 기간 목표 매출 확정)' },
  { d: -14, task: '상세페이지·대표 썸네일 시즌 버전 업데이트' },
  { d: -7,  task: '경쟁사 주요 상품 가격·기획전 현황 모니터링' },
  { d: -7,  task: '리뷰 수·평점 사전 점검 (목표 미달 시 체험단 즉시 투입)' },
  { d: -3,  task: '플랫폼별 가격 통일성 체크 (맘큐·쿠팡·네이버 격차 확인)' },
  { d: 0,   task: '광고 ROAS 기준치 설정 및 일일 예산 최종 확정' },
  { d: 3,   task: '품절 임박 상품 → 대체 상품 전환 또는 사전예약 오픈' },
  { d: 7,   task: '부정 리뷰·Q&A 실시간 모니터링 및 대응' },
  { d: 14,  task: '행사 성과 분석 (전환율·ROAS·신규/재구매 비율 리포트)' },
];

const CROSSSELL = [
  { name: '하기스 기저귀 (맞춤 사이즈)', reason: '맘큐 핵심 품목 — 이벤트 동반 구매 1위', urgency: '긴급' },
  { name: '하기스 물티슈 대용량 묶음', reason: '기저귀 동반 구매 최상위 조합, 반복 구매', urgency: '긴급' },
  { name: '분유·어린이 영양식 (월령별)', reason: '정기 보충 구매, 재구매 락인 핵심 품목', urgency: '중요' },
];

function dLabel(d: number) {
  return d === 0 ? 'D-DAY' : d > 0 ? `D+${d}` : `D${d}`;
}

export function exportDetailToExcel(
  event: MarketingEvent,
  checkedState: Record<number, boolean>,
  commonCheckedState: Record<number, boolean>,
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 추천 품목
  const productRows: (string | number)[][] = [
    ['번호', '제품명', '우선순위', '추천 이유', '가격(최소)', '가격(최대)'],
    ...event.products.map((p, i) => [
      i + 1,
      p.name,
      URGENCY_LABEL[p.urgency] ?? p.urgency,
      p.reason,
      p.priceRange?.min ?? '',
      p.priceRange?.max ?? '',
    ]),
    [],
    ['[맘큐 핵심 상시 크로스셀]'],
    ['번호', '제품명', '우선순위', '추천 이유'],
    ...CROSSSELL.map((p, i) => [i + 1, p.name, p.urgency, p.reason]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(productRows), '추천품목');

  // Sheet 2: 실행 체크리스트
  const checklistRows: string[][] = [
    ['시점', '업무 내용', '완료 여부', '구분'],
    ...event.checklist.map((item, i) => [
      dLabel(item.d),
      item.task,
      checkedState[i] ? '완료' : '미완료',
      '이벤트 전용',
    ]),
    [],
    ['[공통 MD 체크리스트 — Amazon MD 표준]'],
    ['시점', '업무 내용', '완료 여부', '구분'],
    ...COMMON_CHECKLIST.map((item, i) => [
      dLabel(item.d),
      item.task,
      commonCheckedState[i] ? '완료' : '미완료',
      '공통',
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(checklistRows), '실행체크리스트');

  // Sheet 3: 이벤트 기본 정보
  const infoRows: string[][] = [
    ['항목', '내용'],
    ['이벤트명', event.title],
    ['기간', event.start === event.end ? event.start : `${event.start} ~ ${event.end}`],
    ['요약', event.summary],
    ['기회점수', `${event.trendScore}/100`],
    ['검색량 변화', event.search],
    ['예상 GMV 변화', event.gmv],
    ['카테고리', event.categories.join(', ')],
    ['플랫폼', event.platforms.join(', ')],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(infoRows), '이벤트정보');

  XLSX.writeFile(wb, `${event.title}-기획.xlsx`);
}

export function exportPromoPlanToExcel(event: MarketingEvent, planText: string) {
  const wb = XLSX.utils.book_new();

  const rows = planText
    .split('\n')
    .map(line => [line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '')]);

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'AI기획서');
  XLSX.writeFile(wb, `${event.title}-AI기획서.xlsx`);
}
