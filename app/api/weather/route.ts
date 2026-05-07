import { NextResponse } from 'next/server';
import type { MarketingEvent } from '@/lib/types';
import { parseApiHubResponse, tmefToDate, toIso, type ParsedRow, SEOUL_REG } from '@/lib/weather-parser';

// ──────────────────────────────────────────────────────
// 기상청 API허브 — 단기예보자료 조회
// https://apihub.kma.go.kr  >  예특보 > 단기예보 > 단기예보자료(2001년 2월 이후) 조회
// ──────────────────────────────────────────────────────
const KMA_HUB_URL = 'https://apihub.kma.go.kr/api/typ01/url/fct_shrt_reg.php';

// ──────────────────────────────────────────────────────
// 날씨 조건 → 마케팅 이벤트 변환 (기존 로직 유지)
// ──────────────────────────────────────────────────────

interface DayCond {
  date: string;
  maxTemp: number;
  minTemp: number;
  hasRain: boolean;
  hasSnow: boolean;
}

function generateWeatherEvents(rows: ParsedRow[]): MarketingEvent[] {
  // 날짜별 집계
  const byDate: Record<string, { temps: number[]; pres: number[] }> = {};
  for (const r of rows) {
    const d = tmefToDate(r.tmef);
    if (!byDate[d]) byDate[d] = { temps: [], pres: [] };
    if (!isNaN(r.temp)) byDate[d].temps.push(r.temp);
    byDate[d].pres.push(r.pre);
  }

  const dates = Object.keys(byDate).sort();
  const conds: DayCond[] = dates.map(d => ({
    date: d,
    maxTemp: byDate[d].temps.length ? Math.max(...byDate[d].temps) : -Infinity,
    minTemp: byDate[d].temps.length ? Math.min(...byDate[d].temps) : Infinity,
    hasRain: byDate[d].pres.some(v => v === 1 || v === 4),   // 비 or 소나기
    hasSnow: byDate[d].pres.some(v => v === 2 || v === 3),   // 비/눈 or 눈
  }));

  const events: MarketingEvent[] = [];

  // ── 폭염: 최고기온 33°C 이상 2일+ ──
  const heatDates = conds.filter(c => c.maxTemp >= 33);
  if (heatDates.length >= 2) {
    const maxT = Math.max(...heatDates.map(c => c.maxTemp));
    events.push({
      id: `weather-heat-${heatDates[0].date}`,
      title: `폭염 예보 (최고 ${maxT}°C)`,
      type: 'weather',
      start: toIso(heatDates[0].date),
      end: toIso(heatDates[heatDates.length - 1].date),
      categories: ['l_electric', 'l_air', 'l_body'],
      platforms: ['coupang', 'naver'],
      summary: `기상청 단기예보: 최고 ${maxT}°C 폭염 ${heatDates.length}일 지속. 냉방용품·쿨링 제품 수요 급증.`,
      trendScore: 80, search: '+88%', gmv: '+65%', source: 'weather-api',
      products: [
        { name: '이동식 에어컨·냉풍기', reason: '폭염 당일 즉시 구매 집중', urgency: 'high', category: 'l_electric' },
        { name: '아이스팩·쿨링 매트', reason: '유아·반려동물 쿨링 수요', urgency: 'high', category: 'l_body' },
        { name: '제습기·선풍기', reason: '폭염 복합 수요', urgency: 'mid', category: 'l_electric' },
      ],
      checklist: [
        { d: 0, task: '냉방용품 재고 즉시 확인 및 긴급 입고', done: false },
        { d: 0, task: '"폭염 특가" 배너 즉시 게시', done: false },
        { d: 1, task: '쿨링 키워드 광고 입찰가 +50% 상향', done: false },
      ],
      pro: '폭염 이슈는 예보 발표 당일이 전환율 피크입니다. 기상청 발표 당일 배너·광고를 즉시 반영하면 경쟁사 대비 1-2일 우위를 선점할 수 있습니다.',
    });
  }

  // ── 한파: 최저기온 0°C 이하 2일+ ──
  const coldDates = conds.filter(c => c.minTemp <= 0);
  if (coldDates.length >= 2) {
    const minT = Math.min(...coldDates.map(c => c.minTemp));
    events.push({
      id: `weather-cold-${coldDates[0].date}`,
      title: `한파 예보 (최저 ${minT}°C)`,
      type: 'weather',
      start: toIso(coldDates[0].date),
      end: toIso(coldDates[coldDates.length - 1].date),
      categories: ['b_fashion', 'b_bedding', 'l_electric'],
      platforms: ['coupang', 'naver', 'momq'],
      summary: `기상청 단기예보: 최저 ${minT}°C 한파 ${coldDates.length}일 지속. 방한용품·전기요 수요 급상승.`,
      trendScore: 74, search: '+65%', gmv: '+48%', source: 'weather-api',
      products: [
        { name: '전기요·온열 매트', reason: '한파 당일 검색 급증', urgency: 'high', category: 'l_electric' },
        { name: '유아 경량 패딩·방한복', reason: '외출 필수 방한 아이템', urgency: 'high', category: 'b_fashion' },
        { name: '수면 조끼·내복', reason: '취침 저온 대응 수요', urgency: 'mid', category: 'b_bedding' },
      ],
      checklist: [
        { d: 0, task: '"한파 긴급 세일" 배너 즉시 게시', done: false },
        { d: 0, task: '방한용품 재고 즉시 확인', done: false },
        { d: 1, task: '방한 키워드 광고 +40% 입찰 상향', done: false },
      ],
      pro: '한파 예보는 발표 당일 저녁 6-9시가 구매 피크입니다. 퇴근 후 트래픽에 맞춰 배너를 준비해두세요.',
    });
  }

  // ── 비: 강수 예보 1일+ ──
  const rainDates = conds.filter(c => c.hasRain);
  if (rainDates.length >= 1) {
    events.push({
      id: `weather-rain-${rainDates[0].date}`,
      title: `강수 예보 (${rainDates.length}일간)`,
      type: 'weather',
      start: toIso(rainDates[0].date),
      end: toIso(rainDates[rainDates.length - 1].date),
      categories: ['l_air', 'l_electric', 'b_safety'],
      platforms: ['coupang', 'naver'],
      summary: `기상청 단기예보: ${rainDates.length}일간 강수 예보. 제습기·방수용품·우비 수요 급증.`,
      trendScore: 65, search: '+48%', gmv: '+35%', source: 'weather-api',
      products: [
        { name: '휴대용 우산·우비', reason: '강수 당일 즉시 구매', urgency: 'high', category: 'b_safety' },
        { name: '제습기·제습제', reason: '실내 습도 관리 수요', urgency: 'mid', category: 'l_electric' },
        { name: '방수 매트·현관 발판', reason: '현관 보호용', urgency: 'mid', category: 'l_air' },
      ],
      checklist: [
        { d: 0, task: '우비·우산 재고 점검', done: false },
        { d: 0, task: '방수 제품 배너 게시', done: false },
        { d: 1, task: '빠른배송 배지 활성화 (모바일 CTR↑)', done: false },
      ],
      pro: '강수 예보 당일 모바일 검색이 급증합니다. "오늘 받는" 빠른 배송 배지 활성화가 전환율의 핵심입니다.',
    });
  }

  // ── 눈: 적설 예보 ──
  const snowDates = conds.filter(c => c.hasSnow);
  if (snowDates.length >= 1) {
    events.push({
      id: `weather-snow-${snowDates[0].date}`,
      title: `눈/적설 예보 (${snowDates.length}일간)`,
      type: 'weather',
      start: toIso(snowDates[0].date),
      end: toIso(snowDates[snowDates.length - 1].date),
      categories: ['l_electric', 'b_fashion', 'b_safety'],
      platforms: ['coupang', 'naver', 'momq'],
      summary: `기상청 단기예보: ${snowDates.length}일간 눈 예보. 방한용품·미끄럼 방지 제품 수요 급등.`,
      trendScore: 70, search: '+55%', gmv: '+40%', source: 'weather-api',
      products: [
        { name: '발열 내의·방한 장갑', reason: '적설 시 외출 준비 수요', urgency: 'high', category: 'b_fashion' },
        { name: '유아 방수 장화·방한화', reason: '어린이 등원 대비 필수', urgency: 'high', category: 'b_safety' },
        { name: '전기 히터·온열기구', reason: '갑작스러운 한파 대응', urgency: 'mid', category: 'l_electric' },
      ],
      checklist: [
        { d: 0, task: '방한·방수 제품 배너 즉시 게시', done: false },
        { d: 0, task: '유아 방수 장화 재고 확인', done: false },
      ],
      pro: '적설 예보는 전날 저녁 발표 직후 구매 급등합니다. 예보 즉시 배너를 올리면 경쟁사보다 12-24시간 앞서 수요를 선점합니다.',
    });
  }

  return events;
}

// ──────────────────────────────────────────────────────
// API Route Handler
// ──────────────────────────────────────────────────────

export async function GET() {
  const apiKey = process.env.KMA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ events: [], status: 'no-api-key' });
  }

  try {
    // tmfc=0 → 최신 발표자료 자동 조회
    const url = `${KMA_HUB_URL}?tmfc=0&reg=${SEOUL_REG}&disp=0&authKey=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`KMA API허브 HTTP ${res.status} — ${body.slice(0, 300)}`);
    }

    const text = await res.text();

    // API허브 에러 응답 감지 (에러 시 텍스트에 "ERROR" 또는 "authKey" 포함)
    if (text.includes('ERROR') || text.includes('error') || text.includes('인증키')) {
      throw new Error(`KMA API허브 응답 에러: ${text.slice(0, 300)}`);
    }

    const rows = parseApiHubResponse(text);

    // 파싱 결과가 없으면 디버깅용으로 raw 응답 일부 포함
    if (rows.length === 0) {
      console.warn('[weather/route] 파싱된 데이터 0건. raw 응답 앞부분:', text.slice(0, 500));
      return NextResponse.json({
        events: [],
        status: 'empty',
        message: '예보 데이터가 비어있습니다. API허브 응답 형식을 확인해주세요.',
        rawPreview: text.slice(0, 500),
        updatedAt: new Date().toISOString(),
      });
    }

    const events = generateWeatherEvents(rows);

    return NextResponse.json({
      events,
      status: 'ok',
      rowCount: rows.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[weather/route] Error:', err);
    return NextResponse.json({
      events: [],
      status: 'error',
      message: String(err),
    });
  }
}
