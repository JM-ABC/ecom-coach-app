import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

interface BriefAiRequest {
  categories: string[];
  trends: Array<{
    title: string;
    latestRatio: number;
    changeVsPrevWeek: number;
  }>;
  weatherEvents: Array<{
    title: string;
    summary: string;
  }>;
  platformEvents: Array<{
    title: string;
    platform: string;
    start: string;
    end: string;
    confidence: string;
  }>;
}

function buildPrompt(req: BriefAiRequest): string {
  const trendsStr = req.trends.length
    ? req.trends
        .map(t => {
          const dir =
            t.changeVsPrevWeek > 0
              ? `↑${t.changeVsPrevWeek}%`
              : t.changeVsPrevWeek < 0
              ? `↓${Math.abs(t.changeVsPrevWeek)}%`
              : '보합';
          return `· ${t.title} ${dir} (검색비율 ${t.latestRatio})`;
        })
        .join('\n')
    : '· 선택 카테고리 트렌드 데이터 없음';

  const weatherStr = req.weatherEvents.length
    ? req.weatherEvents.map(e => `· ${e.title}: ${e.summary}`).join('\n')
    : '· 특이 날씨 없음';

  const eventsStr = req.platformEvents.length
    ? req.platformEvents
        .map(e => `· ${e.title} (${e.platform}, ${e.start}~${e.end}, 신뢰도 ${e.confidence})`)
        .join('\n')
    : '· 감지된 플랫폼 행사 없음';

  return `당신은 한국 이커머스 MD의 주간 수요 신호 요약 AI입니다.
아래 실시간 데이터를 바탕으로 이번 주 핵심 수요 신호를 3-4문장으로 요약하세요.
수치와 카테고리를 구체적으로 언급하고, 마지막 문장에 MD가 바로 행동할 수 있는 타이밍 포인트를 포함하세요.

[분석 카테고리]
${req.categories.join(', ')}

[네이버 검색 트렌드 (전주 대비)]
${trendsStr}

[날씨 수요 신호]
${weatherStr}

[플랫폼 행사 감지]
${eventsStr}

출력: 3-4문장 한국어 요약. 수치 포함. 마지막 문장은 MD 행동 타이밍 포인트.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const body: BriefAiRequest = await request.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 600 },
    });

    const result = await model.generateContent(buildPrompt(body));
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('[brief-ai] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
