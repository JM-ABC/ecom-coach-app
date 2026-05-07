import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

interface TrendInput {
  category: string;
  latestRatio: number;
  changeVsPrevWeek: number;
  keywords: string[];
}

interface ProductInput {
  name: string;
  reason: string;
  urgency: string;
  category: string;
  priceRange?: { min: number; max: number };
  prepDays?: number;
  momqTip?: string;
}

interface PromoPlanRequest {
  eventId: string;
  title: string;
  date: string;
  products: ProductInput[];
  trendScore: number;
  summary: string;
  naverTrends?: TrendInput[];
  weatherHint?: string;
}

function buildPrompt(req: PromoPlanRequest): string {
  const productsStr = req.products
    .map(p => {
      let line = `- ${p.name} (${p.urgency} | ${p.category}): ${p.reason}`;
      if (p.priceRange) line += ` / ${p.priceRange.min.toLocaleString()}~${p.priceRange.max.toLocaleString()}원`;
      if (p.prepDays) line += ` / D-${p.prepDays} 준비`;
      if (p.momqTip) line += `\n  → 맘큐 전략: ${p.momqTip}`;
      return line;
    })
    .join('\n');

  const trendsStr = req.naverTrends?.length
    ? req.naverTrends
        .map(t => {
          const dir = t.changeVsPrevWeek > 0 ? '↑' : t.changeVsPrevWeek < 0 ? '↓' : '→';
          return `- ${t.category}: 검색비율 ${t.latestRatio} (전주 대비 ${dir}${Math.abs(t.changeVsPrevWeek)}%) | 키워드: ${t.keywords.join(', ')}`;
        })
        .join('\n')
    : '(트렌드 데이터 없음)';

  const weatherStr = req.weatherHint || '(날씨 데이터 없음)';

  return `당신은 맘큐(momq.co.kr) D2C 브랜드의 시니어 MD입니다.
아래 이벤트와 실시간 검색 트렌드 데이터를 기반으로 맘큐 자사몰 전용 프로모션 기획서를 작성하세요.

[이벤트 정보]
- 행사명: ${req.title}
- 일정: ${req.date}
- 기회점수: ${req.trendScore}/100
- 요약: ${req.summary}
- 추천 상품:
${productsStr}

[네이버 검색 트렌드 — 최근 4주]
${trendsStr}

[날씨 힌트]
${weatherStr}

[맘큐 프리미엄 멤버십 체계]
유료 가입제, 3등급 구성. 혜택 설계 시 이 등급 체계를 활용하세요.

| 등급 | 가입비 | 이용기간 | 주요 혜택 |
|------|--------|----------|-----------|
| 라이트 | 무료~저가 | 100일 | 기본 쿠폰·포인트 |
| 스탠다드 | 20,000원 | 100일 | 가입축하 포인트 15,000P, 총 혜택 ~24,745원 (가입비 대비 이득 프레임) |
| 프리미엄 | 6,000원 | 100일 | 가입축하 선물 + 당근포인트 4,000P, 매달 쇼핑지원금 3,000원(총 12,000원), 얼리버드 보너스 1,000원, 재가입 보너스, 5% 추가 할인 |

프리미엄 멤버십 전용 혜택:
- 가입 즉시 현금처럼 사용하는 포인트 축하선물
- 매일 MY 가게방문 적립
- 1년 내내 쇼핑지원금 (매달 3,000원)
- 친구 (신규)회원 추가 시 얼리버드 보너스
- 멤버십 재가입 보너스
- 멤버십(유아 기간 5% 더 할인)
- 대한교과서 적립금 강화혜택
- 프리미엄 멤버십 추가적립

[출력 형식 — 마크다운]
## 행사 개요
(2-3문장, 검색 트렌드 인사이트 포함)

## 트렌드 기반 기회 분석
(네이버 검색량 기반 상승/하강 카테고리, 주력 키워드 제안)

## 맘큐 자사몰 프로모션 전략
### 체험단 & 커뮤니티 후기 전략
### 멤버십 등급별 혜택 설계
(라이트/스탠다드/프리미엄 등급별 차등 쿠폰·포인트·단독가 설계. 비회원→라이트, 라이트→스탠다드, 스탠다드→프리미엄 업그레이드 유도 시나리오 포함)
### 라이브방송 / 콘텐츠 마케팅 계획
### MD 단독 기획전 구성

## 준비 타임라인 (D-day 기준)
(D-21, D-14, D-7, D-3, D-0)

## SNS 카피 초안
(맘 커뮤니티 감성 2개, 네이버 인기 키워드 반영)

주의: 쿠팡·네이버 등 외부 채널 전략은 제외. 맘큐 자사몰 프로모션에 집중.
단, 네이버 검색 트렌드 데이터는 시장 수요 근거로 적극 인용하세요.
멤버십 등급 업그레이드를 프로모션의 핵심 전환 목표 중 하나로 설정하세요.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: PromoPlanRequest = await request.json();

    if (!body.eventId || !body.title) {
      return new Response(
        JSON.stringify({ error: 'eventId와 title은 필수입니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildPrompt(body);

    const result = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          console.error('[promo-plan] Stream error:', err);
          controller.enqueue(
            encoder.encode(`\n\n---\n⚠️ 생성 중 오류가 발생했습니다: ${String(err)}`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('[promo-plan] Error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
