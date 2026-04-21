import { NextResponse } from 'next/server';

const NAVER_URL = 'https://openapi.naver.com/v1/datalab/search';

// 실제 검색어 기반 키워드 그룹 (한 요청당 최대 5개, 그룹당 최대 5개 키워드)
// 같은 요청 내 숫자는 상호 비교 가능 (100 = 해당 요청 내 최고 검색량)
const KEYWORD_GROUPS: { groupName: string; keywords: string[]; ourKey: string }[][] = [
  // 배치 1: 유아용품 핵심
  [
    { groupName: '기저귀', keywords: ['기저귀', '팸퍼스', '하기스', '일회용기저귀'], ourKey: 'b_diaper' },
    { groupName: '유아물티슈', keywords: ['아기물티슈', '유아물티슈', '물티슈캡형'], ourKey: 'b_wipe' },
    { groupName: '완구/장난감', keywords: ['장난감', '유아완구', '어린이날선물', '교구'], ourKey: 'b_toy' },
    { groupName: '유아동복', keywords: ['아기옷', '유아의류', '유아동복', '아동복'], ourKey: 'b_fashion' },
    { groupName: '분유', keywords: ['분유', '액상분유', '성장기분유', '어린이분유'], ourKey: 'b_formula' },
  ],
  // 배치 2: 생활용품 핵심
  [
    { groupName: '세탁세제', keywords: ['세탁세제', '섬유유연제', '액체세제', '세탁볼'], ourKey: 'l_laundry' },
    { groupName: '청소세제', keywords: ['청소세제', '주방세제', '다목적세제', '욕실세정제'], ourKey: 'l_clean' },
    { groupName: '샴푸/헤어', keywords: ['샴푸', '린스', '헤어에센스', '두피케어'], ourKey: 'l_hair' },
    { groupName: '건강용품', keywords: ['안마기', '마사지건', '혈압계', '체온계'], ourKey: 'l_health' },
    { groupName: '냉방/제습', keywords: ['제습기', '선풍기', '이동식에어컨', '냉풍기'], ourKey: 'l_electric' },
  ],
];

export interface TrendDataPoint {
  period: string;
  ratio: number;
}

export interface CategoryTrend {
  title: string;
  ourKey: string;
  keywords: string[];
  data: TrendDataPoint[];
  latestRatio: number;
  changeVsPrevWeek: number;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ trends: [], status: 'no-api-key' });
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);

    const headers = {
      'Content-Type': 'application/json',
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    };

    const batchResults = await Promise.all(
      KEYWORD_GROUPS.map(batch =>
        fetch(NAVER_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            startDate: toDateStr(startDate),
            endDate: toDateStr(endDate),
            timeUnit: 'week',
            keywordGroups: batch.map(g => ({ groupName: g.groupName, keywords: g.keywords })),
            device: '',
            ages: [],
            gender: '',
          }),
          next: { revalidate: 86400 },
        }).then(r => {
          if (!r.ok) return r.text().then(t => { throw new Error(`Naver API HTTP ${r.status}: ${t}`); });
          return r.json();
        })
      )
    );

    const trends: CategoryTrend[] = batchResults.flatMap((json, batchIdx) =>
      (json.results ?? []).map(
        (result: { title: string; data: TrendDataPoint[] }, i: number) => {
          const meta = KEYWORD_GROUPS[batchIdx][i];
          const data: TrendDataPoint[] = result.data ?? [];
          const latest = data[data.length - 1]?.ratio ?? 0;
          const prev = data[data.length - 2]?.ratio ?? latest;
          const changeVsPrevWeek = prev > 0 ? Math.round(((latest - prev) / prev) * 100) : 0;
          return {
            title: result.title,
            ourKey: meta?.ourKey ?? result.title,
            keywords: meta?.keywords ?? [],
            data,
            latestRatio: latest,
            changeVsPrevWeek,
          };
        }
      )
    );

    return NextResponse.json({ trends, status: 'ok', updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[trends/route] Error:', err);
    return NextResponse.json({ trends: [], status: 'error', message: String(err) });
  }
}
