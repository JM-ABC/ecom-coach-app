import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface InsightInput { title: string; summary: string; tag?: string; sourceLink?: string }
interface TrendProductsRequest { insights: InsightInput[]; categories: string[] }

export function buildTrendProductsPrompt(req: TrendProductsRequest): string {
  const articles = req.insights
    .map((a, i) => `${i + 1}. [${a.tag ?? '트렌드'}] ${a.title} — ${a.summary} (출처: ${a.sourceLink ?? '없음'})`)
    .join('\n');

  return `당신은 하기스 중심 유아동+생활용품 자사몰 "맘큐"의 MD입니다.
아래 소비 트렌드 기사에서 맘큐가 실제로 판매할 수 있는 구체적 "품목 후보"를 추출하세요.

[맘큐 카테고리 ID 목록] ${req.categories.join(', ')}

[소비 트렌드 기사]
${articles}

[규칙]
- 맘큐가 실제 취급 가능한 구체 품목만. 맘큐 카테고리와 무관한 품목은 제외하세요.
- 각 품목의 category는 위 맘큐 카테고리 ID 중 가장 맞는 것으로 매핑하세요.
- 맘큐는 정기구독 모델이 없습니다. 정기구독 제안 금지.
- 배송 운영(무료배송·배송보장 등) 제안 금지. 쿠팡 로켓배송 등 플랫폼 기능 언급도 하지 마세요.
- 가격대(priceRange)는 확정 데이터가 아니므로 추정할 경우 estimated를 true로 설정하세요.
- signalLabel은 "기사 핵심 (뉴스)" 형식으로 작성하세요.
- sourceLink는 해당 기사의 출처 링크를 그대로 넣으세요.
- 관련 품목이 없는 기사는 후보를 만들지 마세요(빈 결과 허용).`;
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          reason: { type: 'string' },
          urgency: { type: 'string', enum: ['high', 'mid', 'low'] },
          category: { type: 'string' },
          priceRange: {
            type: 'object',
            properties: { min: { type: 'number' }, max: { type: 'number' } },
            required: ['min', 'max'],
            additionalProperties: false,
          },
          signalLabel: { type: 'string' },
          sourceLink: { type: 'string' },
          estimated: { type: 'boolean' },
        },
        required: ['name', 'reason', 'urgency', 'category', 'signalLabel'],
        additionalProperties: false,
      },
    },
  },
  required: ['candidates'],
  additionalProperties: false,
} as const;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ candidates: [], status: 'no-api-key' });

  try {
    const body: TrendProductsRequest = await request.json();
    if (!body.insights?.length) return NextResponse.json({ candidates: [], status: 'ok' });

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: RESPONSE_SCHEMA } },
      messages: [{ role: 'user', content: buildTrendProductsPrompt(body) }],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ candidates: [], status: 'error' }, { status: 502 });
    }

    const raw = response.content.find(b => b.type === 'text')?.text ?? '';
    let parsed: { candidates: unknown[] };
    try { parsed = JSON.parse(raw); } catch { parsed = { candidates: [] }; }

    const candidates = (parsed.candidates ?? []).map((c, i) => ({
      ...(c as object),
      id: `news-cand-${Date.now()}-${i}`,
      source: 'news' as const,
    }));

    return NextResponse.json({ candidates, status: 'ok' });
  } catch (err) {
    console.error('[trend-products] Error:', err);
    return NextResponse.json({ candidates: [], status: 'error', message: String(err) }, { status: 500 });
  }
}
