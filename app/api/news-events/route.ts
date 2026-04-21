import { NextResponse } from 'next/server';
import type { MarketingEvent } from '@/lib/types';

const NAVER_NEWS_URL = 'https://openapi.naver.com/v1/search/news.json';

// 플랫폼별 검색 쿼리
const QUERIES = [
  { query: '쿠팡 메가위크 날짜', platform: 'coupang', title: '쿠팡 메가위크' },
  { query: '쿠팡 로켓와우 행사', platform: 'coupang', title: '쿠팡 와우 행사' },
  { query: 'G마켓 빅스마일데이', platform: 'gmarket', title: 'G마켓 빅스마일데이' },
  { query: '11번가 십일절 행사', platform: '11st', title: '11번가 십일절' },
  { query: '네이버 쇼핑 빅세일', platform: 'naver', title: '네이버 쇼핑 빅세일' },
  { query: '카카오 선물하기 행사', platform: 'kakao', title: '카카오 선물하기 행사' },
  { query: '위메프 특가데이', platform: 'wemakeprice', title: '위메프 특가' },
];

interface NaverNewsItem {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  originallink: string;
}

interface DetectedEvent {
  id: string;
  title: string;
  platform: string;
  start: string;
  end: string;
  confidence: 'high' | 'mid' | 'low';
  sourceTitle: string;
  sourceLink: string;
  pubDate: string;
  summary: string;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'");
}

// 뉴스 텍스트에서 날짜 추출
function extractDates(text: string, pubDateStr: string): { start: string; end: string; confidence: 'high' | 'mid' | 'low' } | null {
  const pub = new Date(pubDateStr);
  const year = pub.getFullYear();

  // YYYY.MM.DD ~ YYYY.MM.DD 또는 YYYY-MM-DD
  const fullRange = text.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\s*[~\-–]\s*(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (fullRange) {
    return {
      start: `${fullRange[1]}-${fullRange[2].padStart(2,'0')}-${fullRange[3].padStart(2,'0')}`,
      end: `${fullRange[4]}-${fullRange[5].padStart(2,'0')}-${fullRange[6].padStart(2,'0')}`,
      confidence: 'high',
    };
  }

  // MM.DD~MM.DD 또는 M월 D일~D일
  const monthRange = text.match(/(\d{1,2})월\s*(\d{1,2})일\s*[~\-–]\s*(\d{1,2})월?\s*(\d{1,2})일/);
  if (monthRange) {
    const m1 = monthRange[1].padStart(2,'0'), d1 = monthRange[2].padStart(2,'0');
    const m2 = (monthRange[3] || monthRange[1]).padStart(2,'0'), d2 = monthRange[4].padStart(2,'0');
    return {
      start: `${year}-${m1}-${d1}`,
      end: `${year}-${m2}-${d2}`,
      confidence: 'high',
    };
  }

  // M/D~M/D 또는 M.D~M.D
  const slashRange = text.match(/(\d{1,2})[./](\d{1,2})\s*[~\-–]\s*(\d{1,2})[./](\d{1,2})/);
  if (slashRange) {
    return {
      start: `${year}-${slashRange[1].padStart(2,'0')}-${slashRange[2].padStart(2,'0')}`,
      end: `${year}-${slashRange[3].padStart(2,'0')}-${slashRange[4].padStart(2,'0')}`,
      confidence: 'high',
    };
  }

  // 단일 날짜 (M월 D일부터 / M월 D일 시작)
  const singleMonth = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (singleMonth) {
    const m = singleMonth[1].padStart(2,'0'), d = singleMonth[2].padStart(2,'0');
    const start = `${year}-${m}-${d}`;
    const endDate = new Date(`${start}`);
    endDate.setDate(endDate.getDate() + 7); // 행사 기간 7일 추정
    return {
      start,
      end: endDate.toISOString().slice(0, 10),
      confidence: 'mid',
    };
  }

  // 날짜 미감지 → 발행일 기준
  const startDate = new Date(pub);
  const endDate = new Date(pub);
  endDate.setDate(endDate.getDate() + 7);
  return {
    start: startDate.toISOString().slice(0, 10),
    end: endDate.toISOString().slice(0, 10),
    confidence: 'low',
  };
}

function toIsoDate(pubDate: string): string {
  return new Date(pubDate).toISOString().slice(0, 10);
}

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ events: [], status: 'no-api-key' });
  }

  try {
    const headers = {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    };

    // 모든 쿼리 병렬 요청
    const results = await Promise.all(
      QUERIES.map(async q => {
        const params = new URLSearchParams({ query: q.query, display: '5', sort: 'date' });
        const res = await fetch(`${NAVER_NEWS_URL}?${params}`, {
          headers,
          next: { revalidate: 3600 }, // 1시간 캐시
        });
        if (!res.ok) return { query: q, items: [] as NaverNewsItem[] };
        const json = await res.json();
        return { query: q, items: (json.items ?? []) as NaverNewsItem[] };
      })
    );

    const detected: DetectedEvent[] = [];
    const seenTitles = new Set<string>();

    for (const { query: q, items } of results) {
      for (const item of items.slice(0, 3)) {
        const title = stripHtml(item.title);
        const desc = stripHtml(item.description);
        const fullText = `${title} ${desc}`;

        // 관련 없는 기사 필터링
        const platformKeywords: Record<string, string[]> = {
          coupang: ['쿠팡'],
          gmarket: ['G마켓', 'g마켓', '지마켓'],
          '11st': ['11번가'],
          naver: ['네이버 쇼핑', '네이버쇼핑'],
          kakao: ['카카오', '선물하기'],
          wemakeprice: ['위메프'],
        };
        const kws = platformKeywords[q.platform] ?? [];
        if (!kws.some(kw => fullText.includes(kw))) continue;

        const dateResult = extractDates(fullText, item.pubDate);
        if (!dateResult) continue;

        const key = `${q.platform}-${dateResult.start}`;
        if (seenTitles.has(key)) continue;
        seenTitles.add(key);

        detected.push({
          id: `news-${q.platform}-${toIsoDate(item.pubDate)}-${Math.random().toString(36).slice(2, 6)}`,
          title: q.title,
          platform: q.platform,
          start: dateResult.start,
          end: dateResult.end,
          confidence: dateResult.confidence,
          sourceTitle: title,
          sourceLink: item.originallink || item.link,
          pubDate: toIsoDate(item.pubDate),
          summary: desc.slice(0, 100),
        });
      }
    }

    // 신뢰도 순 정렬
    const order = { high: 0, mid: 1, low: 2 };
    detected.sort((a, b) => order[a.confidence] - order[b.confidence]);

    return NextResponse.json({ events: detected, status: 'ok', updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[news-events] Error:', err);
    return NextResponse.json({ events: [], status: 'error', message: String(err) });
  }
}

// 감지된 이벤트 → MarketingEvent 변환 (확정 시 사용)
export function toMarketingEvent(detected: DetectedEvent): MarketingEvent {
  return {
    id: `custom-news-${detected.id}`,
    title: detected.title,
    type: 'platform',
    start: detected.start,
    end: detected.end,
    categories: ['l_laundry', 'l_clean', 'l_tissue', 'b_diaper', 'b_wipe'],
    platforms: [detected.platform],
    summary: detected.summary || `${detected.title} 행사. 뉴스 기반 자동 감지.`,
    trendScore: 80,
    search: '+40%',
    gmv: '+70%',
    products: [],
    checklist: [
      { d: -7, task: '행사 입점 신청 확인', done: false },
      { d: -3, task: '재고 2주치 확보', done: false },
      { d: 0, task: '광고 입찰가 +30% 상향', done: false },
    ],
    pro: `${detected.title} 행사입니다. 뉴스 기반으로 자동 감지된 일정이므로 공식 공지를 반드시 확인하세요.`,
    source: 'custom',
  };
}
