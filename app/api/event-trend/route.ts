import { NextResponse } from 'next/server';

const NAVER_URL = 'https://openapi.naver.com/v1/datalab/search';

const CATEGORY_KEYWORDS: Record<string, { groupName: string; keywords: string[] }> = {
  b_diaper:  { groupName: '기저귀',      keywords: ['기저귀', '팸퍼스', '하기스', '일회용기저귀'] },
  b_wipe:    { groupName: '유아물티슈',   keywords: ['아기물티슈', '유아물티슈', '물티슈캡형'] },
  b_toy:     { groupName: '완구/장난감',  keywords: ['장난감', '유아완구', '어린이날선물', '교구'] },
  b_fashion: { groupName: '유아동복',    keywords: ['아기옷', '유아의류', '유아동복', '아동복'] },
  b_formula: { groupName: '분유',        keywords: ['분유', '액상분유', '성장기분유', '어린이분유'] },
  b_bedding: { groupName: '유아침구',    keywords: ['전기요', '온열매트', '유아침구', '아기이불'] },
  b_safety:  { groupName: '유아안전',    keywords: ['우비', '방수장화', '유아우비', '안전용품'] },
  l_laundry: { groupName: '세탁세제',    keywords: ['세탁세제', '섬유유연제', '액체세제', '세탁볼'] },
  l_clean:   { groupName: '청소세제',    keywords: ['청소세제', '주방세제', '다목적세제', '욕실세정제'] },
  l_hair:    { groupName: '샴푸/헤어',   keywords: ['샴푸', '린스', '헤어에센스', '두피케어'] },
  l_health:  { groupName: '건강용품',    keywords: ['안마기', '마사지건', '혈압계', '체온계'] },
  l_electric:{ groupName: '냉방/제습가전', keywords: ['제습기', '선풍기', '이동식에어컨', '냉풍기'] },
  l_air:     { groupName: '제습/습기제거', keywords: ['습기제거제', '제습제', '제습기', '방습제'] },
  l_body:    { groupName: '쿨링용품',    keywords: ['아이스팩', '쿨링매트', '쿨링패드', '냉감'] },
  l_tissue:  { groupName: '화장지/티슈', keywords: ['화장지', '두루마리', '미용티슈', '물티슈'] },
};

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryKeys = (searchParams.get('categories') ?? '').split(',').filter(Boolean);
  const eventStart = searchParams.get('start');

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ change: null, status: 'no-api-key' });
  }

  // 매핑된 첫 번째 카테고리 사용
  const categoryKey = categoryKeys.find(k => CATEGORY_KEYWORDS[k]);
  const category = categoryKey ? CATEGORY_KEYWORDS[categoryKey] : null;
  if (!category) {
    return NextResponse.json({ change: null, status: 'no-category' });
  }

  const eventDate = eventStart ? new Date(eventStart) : new Date();
  const eventMonth = eventDate.getMonth();   // 0-indexed
  const eventYear = eventDate.getFullYear();

  // 전년 동월 ~ 이벤트 월 (13개월, monthly)
  const queryStart = new Date(eventYear - 1, eventMonth, 1);
  const queryEnd   = new Date(eventYear, eventMonth + 1, 0); // 이벤트 월 말일
  const now = new Date();
  const safeEnd = queryEnd > now ? now : queryEnd;

  try {
    const res = await fetch(NAVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
      body: JSON.stringify({
        startDate: toDateStr(queryStart),
        endDate: toDateStr(safeEnd),
        timeUnit: 'month',
        keywordGroups: [{ groupName: category.groupName, keywords: category.keywords }],
        device: '', ages: [], gender: '',
      }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error(`Naver API HTTP ${res.status}`);
    const json = await res.json();
    const data: { period: string; ratio: number }[] = json.results?.[0]?.data ?? [];

    if (data.length < 2) {
      return NextResponse.json({ change: null, status: 'insufficient-data' });
    }

    const thisYearPrefix  = `${eventYear}-${String(eventMonth + 1).padStart(2, '0')}`;
    const lastYearPrefix  = `${eventYear - 1}-${String(eventMonth + 1).padStart(2, '0')}`;

    const thisYearPoint = data.find(d => d.period.startsWith(thisYearPrefix));
    const lastYearPoint = data.find(d => d.period.startsWith(lastYearPrefix));

    if (thisYearPoint && lastYearPoint && lastYearPoint.ratio > 0) {
      const pct = Math.round(((thisYearPoint.ratio - lastYearPoint.ratio) / lastYearPoint.ratio) * 100);
      return NextResponse.json({
        change: pct >= 0 ? `+${pct}%` : `${pct}%`,
        basis: '전년 동월 대비',
        status: 'ok',
      });
    }

    // 이벤트 월 데이터 없을 때 → 최근 데이터로 근사
    const latest = data[data.length - 1].ratio;
    const baseline = data[0].ratio;
    if (baseline > 0) {
      const pct = Math.round(((latest - baseline) / baseline) * 100);
      return NextResponse.json({
        change: pct >= 0 ? `+${pct}%` : `${pct}%`,
        basis: '최근 추이 기반',
        status: 'ok-approx',
      });
    }

    return NextResponse.json({ change: null, status: 'no-data' });
  } catch (err) {
    console.error('[event-trend] Error:', err);
    return NextResponse.json({ change: null, status: 'error', message: String(err) });
  }
}
