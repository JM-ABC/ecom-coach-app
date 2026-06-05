import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 30;

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

function buildPrompt(req: BriefAiRequest): string {
  const trendsStr = req.trends.length
    ? req.trends.map(t => {
        const dir = t.changeVsPrevWeek > 0 ? `↑${t.changeVsPrevWeek}%` : t.changeVsPrevWeek < 0 ? `↓${Math.abs(t.changeVsPrevWeek)}%` : '보합';
        return `· ${t.title} ${dir} (검색지수 ${t.latestRatio})`;
      }).join('\n')
    : '· 트렌드 데이터 없음';

  const weatherStr = req.weatherEvents.length
    ? req.weatherEvents.map(e => `· ${e.title}: ${e.summary}`).join('\n')
    : '· 특이 날씨 없음';

  const eventsStr = req.platformEvents.length
    ? req.platformEvents.map(e => `· ${e.title} (${e.platform}, ${e.start}~${e.end}, 신뢰도 ${e.confidence})`).join('\n')
    : '· 감지된 행사 없음';

  const seasonStr = (req.seasonEvents ?? []).length
    ? req.seasonEvents!.map(e => `· ${e.title} (${e.dday}, ${e.start}~${e.end})`).join('\n')
    : '· 없음';

  return `당신은 한국 이커머스 MD 전략 전문가입니다. 아래 데이터를 분석하여 브리핑 요약과 기획전 컨셉을 작성하세요.

[분석 카테고리] ${req.categories.join(', ')}
[검색 트렌드]
${trendsStr}
[날씨 신호]
${weatherStr}
[플랫폼 행사]
${eventsStr}
[다가오는 시즌 이슈]
${seasonStr}

---

[summary 작성 지침]
3개 섹션: "이번 주 핵심 신호" / "카테고리 기회" / "MD 행동 포인트"
- 핵심 신호: 가장 중요한 수요 변화 2문장, 수치 반드시 포함
- 카테고리 기회: 카테고리마다 1줄, "▶ 카테고리명: ↑N%, 시사점 → 액션" 형식
- 행동 포인트: 이번 주 실행 액션 2개, 구체적 타이밍 명시
- 규칙: 수치 없는 문장 금지, 섹션 제목은 줄바꿈으로만 구분

[concepts 작성 지침]
- 맘큐(유아동 자사몰) 담당 MD를 위한 기획전 컨셉 정확히 3개
- 단순 시즌 상품 나열이 아닌, 여러 신호를 교차한 역발상 컨셉
- 맘큐 규칙: 구독 없음, 배송 제안 금지, CRM/번들/기획전 위주
- 각 컨셉 title은 5~15자, products는 3개`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RESPONSE_SCHEMA: any = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: '3섹션 브리핑 요약 텍스트',
    },
    concepts: {
      type: SchemaType.ARRAY,
      description: '기획전 컨셉 3개',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: '기획전 이름 5~15자' },
          hook: { type: SchemaType.STRING, description: '소비자 언어 한 줄 메시지' },
          why: { type: SchemaType.STRING, description: '지금 기획해야 하는 이유 1~2문장' },
          products: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: '추천 상품 3개',
          },
        },
        required: ['title', 'hook', 'why', 'products'],
      },
    },
  },
  required: ['summary', 'concepts'],
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const body: BriefAiRequest = await request.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 4000,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const result = await model.generateContent(buildPrompt(body));
    const rawText = result.response.text();
    // Gemini sometimes wraps JSON in markdown code fences — strip them
    const raw = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    let parsed: { summary: string; concepts: ConceptItem[] };
    try {
      parsed = JSON.parse(raw);
      // Guard: if summary is itself a JSON string (double-encoded), unwrap it
      if (typeof parsed.summary === 'string' && parsed.summary.trimStart().startsWith('{')) {
        try {
          const inner = JSON.parse(parsed.summary);
          if (inner.summary) parsed = inner;
        } catch { /* not JSON, keep as-is */ }
      }
    } catch {
      parsed = { summary: raw, concepts: [] };
    }

    return NextResponse.json({
      summary: parsed.summary ?? null,
      concepts: parsed.concepts ?? [],
    });
  } catch (err) {
    console.error('[brief-ai] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
