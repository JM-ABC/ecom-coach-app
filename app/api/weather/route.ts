import { NextResponse } from 'next/server';
import type { MarketingEvent } from '@/lib/types';

// 공공데이터포털 기상청 단기예보 API
const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

// 서울 격자 좌표
const NX = 60;
const NY = 127;

function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const h = kst.getUTCHours();

  // 발표 시각: 02, 05, 08, 11, 14, 17, 20, 23시 (1시간 후 제공)
  const slots = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseHour = -1;
  for (const t of slots) {
    if (h - 1 >= t) baseHour = t;
  }

  // KST 03:00 이전(baseHour=-1)이면 전날 23:00 슬롯 사용
  const target = baseHour === -1
    ? new Date(kst.getTime() - 24 * 60 * 60 * 1000)
    : kst;
  if (baseHour === -1) baseHour = 23;

  const baseDate = [
    target.getUTCFullYear(),
    String(target.getUTCMonth() + 1).padStart(2, '0'),
    String(target.getUTCDate()).padStart(2, '0'),
  ].join('');

  return { baseDate, baseTime: String(baseHour).padStart(2, '0') + '00' };
}

interface FcstItem {
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

function toIso(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function generateWeatherEvents(items: FcstItem[]): MarketingEvent[] {
  const byDate: Record<string, { temps: number[]; maxTemps: number[]; minTemps: number[]; ptyCodes: number[] }> = {};

  for (const item of items) {
    const d = item.fcstDate;
    if (!byDate[d]) byDate[d] = { temps: [], maxTemps: [], minTemps: [], ptyCodes: [] };

    if (item.category === 'TMP') {
      const v = parseFloat(item.fcstValue);
      if (!isNaN(v)) byDate[d].temps.push(v);
    }
    if (item.category === 'TMX') {
      const v = parseFloat(item.fcstValue);
      if (!isNaN(v)) byDate[d].maxTemps.push(v);
    }
    if (item.category === 'TMN') {
      const v = parseFloat(item.fcstValue);
      if (!isNaN(v)) byDate[d].minTemps.push(v);
    }
    if (item.category === 'PTY') {
      const v = parseInt(item.fcstValue, 10);
      if (v > 0) byDate[d].ptyCodes.push(v);
    }
  }

  const conds = Object.keys(byDate).sort().map(d => {
    const data = byDate[d];
    const maxTemp = data.maxTemps[0] ?? (data.temps.length ? Math.max(...data.temps) : -Infinity);
    const minTemp = data.minTemps[0] ?? (data.temps.length ? Math.min(...data.temps) : Infinity);
    return {
      date: d,
      maxTemp,
      minTemp,
      hasRain: data.ptyCodes.some(v => v === 1 || v === 4),
      hasSnow: data.ptyCodes.some(v => v === 2 || v === 3),
    };
  });

  const events: MarketingEvent[] = [];

  // 폭염: 최고기온 33°C 이상 2일+
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

  // 한파: 최저기온 0°C 이하 2일+
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

  // 강수: 1일+
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

  // 눈/적설
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
      pro: '적설 예보는 전날 저녁 발표 직후 구매 급등합니다.',
    });
  }

  return events;
}

export async function GET() {
  const serviceKey = process.env.KMA_API_KEY;

  if (!serviceKey) {
    return NextResponse.json({ events: [], status: 'no-api-key' });
  }

  try {
    const { baseDate, baseTime } = getBaseDateTime();

    const params = new URLSearchParams({
      serviceKey,
      pageNo: '1',
      numOfRows: '1000',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(NX),
      ny: String(NY),
    });

    const res = await fetch(`${BASE_URL}?${params}`, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();

    // data.go.kr 인증 오류 시 JSON 대신 XML 반환 — 파싱 전 체크
    if (text.trimStart().startsWith('<')) {
      const code = text.match(/<returnReasonCode>(\w+)<\/returnReasonCode>/)?.[1] ?? 'UNKNOWN';
      const msg  = text.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/)?.[1] ?? 'XML 오류 응답';
      throw new Error(`KMA API 인증 오류 [${code}]: ${msg} — KMA_API_KEY를 확인하세요`);
    }

    const json = JSON.parse(text);
    const resultCode = json?.response?.header?.resultCode;
    const resultMsg = json?.response?.header?.resultMsg;

    if (resultCode !== '00') {
      throw new Error(`API 오류 [${resultCode}]: ${resultMsg}`);
    }

    const items: FcstItem[] = json?.response?.body?.items?.item ?? [];

    if (items.length === 0) {
      return NextResponse.json({
        events: [], status: 'empty',
        message: '예보 데이터가 없습니다.',
        updatedAt: new Date().toISOString(),
      });
    }

    const events = generateWeatherEvents(items);

    return NextResponse.json({
      events,
      status: 'ok',
      rowCount: items.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[weather/route] Error:', err);
    return NextResponse.json({ events: [], status: 'error', message: String(err) });
  }
}
