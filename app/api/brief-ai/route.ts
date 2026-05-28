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

  return `당신은 한국 이커머스 MD를 위한 주간 수요 신호 분석 전문가입니다.
아래 실시간 데이터를 분석하여 MD가 즉시 활용할 수 있는 구조화된 브리핑을 작성하세요.

[분석 카테고리]
${req.categories.join(', ')}

[네이버 검색 트렌드 (전주 대비)]
${trendsStr}

[날씨 수요 신호]
${weatherStr}

[플랫폼 행사 감지]
${eventsStr}

---

[출력 형식 — 정확히 아래 3개 섹션으로]

이번 주 핵심 신호
(가장 중요한 수요 변화 2문장. 반드시 수치 포함. "무엇이 왜 움직이는지" 시장 구조 관점으로.)

카테고리 기회
(선택된 카테고리마다 1줄. 형식: "▶ 카테고리명: 방향+수치, MD 시사점" — 예: "▶ 기저귀: ↑12%, 6월 초 재보충 수요 집중 → 선반영 D-3일")
(트렌드 데이터 없는 카테고리는 날씨·행사 데이터 기반으로 추론)

MD 행동 포인트
(이번 주 실행 액션 2개. 각 액션에 "D-N일 이내" 또는 "~요일까지" 같은 구체적 날짜/타이밍 명시.)

규칙: 수치 없는 문장 금지. "수요가 있다"가 아닌 "↑N% → 액션" 형식. 섹션 제목은 줄바꿈으로만 구분(마크다운 기호 없이).`;
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
      generationConfig: { maxOutputTokens: 900 },
    });

    const result = await model.generateContent(buildPrompt(body));
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('[brief-ai] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
