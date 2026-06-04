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
  seasonEvents?: Array<{
    title: string;
    dday: string;
    start: string;
    end: string;
  }>;
}

export interface ConceptItem {
  title: string;
  hook: string;
  why: string;
  products: string[];
}

function buildSummaryPrompt(req: BriefAiRequest): string {
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

function buildConceptsPrompt(req: BriefAiRequest): string {
  const trendsStr = req.trends.length
    ? req.trends.map(t => {
        const dir = t.changeVsPrevWeek > 0 ? `↑${t.changeVsPrevWeek}%` : t.changeVsPrevWeek < 0 ? `↓${Math.abs(t.changeVsPrevWeek)}%` : '보합';
        return `· ${t.title} ${dir}`;
      }).join('\n')
    : '· 없음';

  const weatherStr = req.weatherEvents.length
    ? req.weatherEvents.map(e => `· ${e.title}: ${e.summary.slice(0, 60)}`).join('\n')
    : '· 없음';

  const seasonStr = (req.seasonEvents ?? []).length
    ? req.seasonEvents!.map(e => `· ${e.title} (${e.dday}, ${e.start}~${e.end})`).join('\n')
    : '· 없음';

  const platformStr = req.platformEvents.length
    ? req.platformEvents.map(e => `· ${e.title} (${e.platform}, ${e.start}~${e.end})`).join('\n')
    : '· 없음';

  return `당신은 한국 이커머스 MD 전략 컨설턴트입니다.
아래 이번 주 실시간 데이터를 교차 분석하여, MD가 혼자서는 연결하기 어려운 역발상 기획전 컨셉 2~3개를 제안하세요.

[분석 카테고리] ${req.categories.join(', ')}
[검색 트렌드]
${trendsStr}
[날씨 신호]
${weatherStr}
[다가오는 시즌 이슈]
${seasonStr}
[플랫폼 행사]
${platformStr}

조건:
- "시즌이니까 이 제품"이 아닌, 2개 이상 신호를 교차한 인사이트 기반 컨셉
- 각 컨셉에 "왜 지금인지" 수치/타이밍 근거 명시
- 맘큐(유아동 자사몰) 컨텍스트: 구독 없음, 배송 제안 금지, CRM/번들/기획전 위주

아래 JSON 배열만 출력 (코드블록·설명 텍스트 없이, 순수 JSON만):
[
  {
    "title": "기획전 이름 (5~15자)",
    "hook": "소비자 언어로 된 한 줄 메시지",
    "why": "지금 기획해야 하는 이유 — 교차 데이터 근거 1~2문장",
    "products": ["추천 상품 또는 카테고리 1", "추천 상품 또는 카테고리 2", "추천 상품 또는 카테고리 3"]
  }
]`;
}

function parseConceptsJson(text: string): ConceptItem[] {
  // 코드블록이 있으면 그 안을 먼저 시도
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = codeBlock ? codeBlock[1] : text;

  const start = candidate.indexOf('[');
  const end = candidate.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as ConceptItem[];
  } catch {
    return [];
  }
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
      generationConfig: { maxOutputTokens: 2000 },
    });
    const conceptsModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 1200,
        responseMimeType: 'application/json',
      },
    });

    const [summaryResult, conceptsResult] = await Promise.all([
      model.generateContent(buildSummaryPrompt(body)),
      conceptsModel.generateContent(buildConceptsPrompt(body)),
    ]);

    const summary = summaryResult.response.text();
    const concepts = parseConceptsJson(conceptsResult.response.text());

    return NextResponse.json({ summary, concepts });
  } catch (err) {
    console.error('[brief-ai] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
