'use client';

import { useState } from 'react';

const CATEGORIES = [
  { id: 'b_diaper', label: '기저귀', group: '유아' },
  { id: 'b_wipe', label: '유아물티슈', group: '유아' },
  { id: 'b_toy', label: '완구/장난감', group: '유아' },
  { id: 'b_fashion', label: '유아동복', group: '유아' },
  { id: 'b_formula', label: '분유', group: '유아' },
  { id: 'l_laundry', label: '세탁세제', group: '생활' },
  { id: 'l_clean', label: '청소세제', group: '생활' },
  { id: 'l_hair', label: '샴푸/헤어', group: '생활' },
  { id: 'l_health', label: '건강용품', group: '생활' },
  { id: 'l_electric', label: '냉방/제습가전', group: '생활' },
  { id: 'l_air', label: '제습/습기제거', group: '생활' },
  { id: 'l_body', label: '쿨링용품', group: '생활' },
  { id: 'l_tissue', label: '화장지/티슈', group: '생활' },
] as const;

const PLATFORMS = [
  { id: 'coupang', label: '쿠팡' },
  { id: 'naver', label: '네이버' },
  { id: '11st', label: '11번가' },
  { id: 'gmarket', label: 'G마켓' },
  { id: 'kakao', label: '카카오' },
  { id: 'momq', label: '맘큐' },
] as const;

const GROUPS = ['유아', '생활'] as const;

interface TrendItem {
  title: string;
  ourKey: string;
  latestRatio: number;
  changeVsPrevWeek: number;
  keywords: string[];
}

interface WeatherEvent {
  id: string;
  title: string;
  summary: string;
  start: string;
  end: string;
}

interface PlatformEvent {
  id: string;
  title: string;
  platform: string;
  start: string;
  end: string;
  confidence: 'high' | 'mid' | 'low';
  summary: string;
}

interface TrendInsight {
  id: string;
  tag: string;
  title: string;
  summary: string;
}

interface BriefResult {
  trends: TrendItem[] | null;
  trendsError: boolean;
  weather: WeatherEvent[] | null;
  weatherError: boolean;
  events: PlatformEvent[] | null;
  insights: TrendInsight[] | null;
  eventsError: boolean;
  aiSummary: string | null;
  aiLoading: boolean;
  aiError: boolean;
}

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{ fontSize: '15px' }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{title}</span>
      </div>
      <div style={{ padding: '14px 16px' }}>{children}</div>
    </div>
  );
}

function ErrorBlock() {
  return <div style={{ fontSize: '12.5px', color: 'var(--danger)' }}>데이터 로드 실패 — 잠시 후 다시 시도해주세요</div>;
}

function LoadingText({ text = '불러오는 중...' }: { text?: string }) {
  return <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{text}</div>;
}

function AiSummaryBlock({ text }: { text: string }) {
  const paragraphs = text.trim().split(/\n{2,}/);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {paragraphs.map((para, i) => {
        const lines = para.trim().split('\n');
        const firstLine = lines[0].replace(/^\*+|\*+$/g, '').trim();
        const isHeader = firstLine.length <= 20 && !/^[▶•\d]/.test(firstLine) && lines.length > 1;
        if (isHeader) {
          const bodyLines = lines.slice(1).join('\n');
          return (
            <div key={i}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{firstLine}</div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{bodyLines}</div>
            </div>
          );
        }
        return (
          <div key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{para}</div>
        );
      })}
    </div>
  );
}

export default function BriefPage() {
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(['b_diaper']));
  const [selectedPlats, setSelectedPlats] = useState<Set<string>>(new Set(['coupang', 'naver', 'momq']));
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<BriefResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toggleCat = (id: string) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const togglePlat = (id: string) => {
    setSelectedPlats(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setBrief(null);

    const catIds = [...selectedCats];
    const platIds = [...selectedPlats];

    try {
      const [trendsRes, weatherRes, newsRes] = await Promise.allSettled([
        fetch('/api/trends').then(r => r.json()),
        fetch('/api/weather').then(r => r.json()),
        fetch('/api/news-events').then(r => r.json()),
      ]);

      const allTrends: TrendItem[] = trendsRes.status === 'fulfilled' ? (trendsRes.value?.trends ?? []) : [];
      const filteredTrends = allTrends.filter(t => catIds.includes(t.ourKey));

      const allWeather: WeatherEvent[] = weatherRes.status === 'fulfilled' ? (weatherRes.value?.events ?? []) : [];

      const allEvents: PlatformEvent[] = newsRes.status === 'fulfilled' ? (newsRes.value?.events ?? []) : [];
      const filteredEvents = allEvents.filter(e => platIds.includes(e.platform));
      const insights: TrendInsight[] = newsRes.status === 'fulfilled' ? ((newsRes.value?.insights ?? []) as TrendInsight[]).slice(0, 2) : [];

      setBrief({
        trends: trendsRes.status === 'fulfilled' ? filteredTrends : null,
        trendsError: trendsRes.status === 'rejected',
        weather: weatherRes.status === 'fulfilled' ? allWeather : null,
        weatherError: weatherRes.status === 'rejected',
        events: newsRes.status === 'fulfilled' ? filteredEvents : null,
        insights: newsRes.status === 'fulfilled' ? insights : null,
        eventsError: newsRes.status === 'rejected',
        aiSummary: null,
        aiLoading: true,
        aiError: false,
      });

      try {
        const catLabels = CATEGORIES.filter(c => catIds.includes(c.id)).map(c => c.label);
        const aiRes = await fetch('/api/brief-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categories: catLabels,
            trends: filteredTrends,
            weatherEvents: allWeather.map(e => ({ title: e.title, summary: e.summary.slice(0, 80) })),
            platformEvents: filteredEvents.map(e => ({ title: e.title, platform: e.platform, start: e.start, end: e.end, confidence: e.confidence })),
          }),
        });
        if (!aiRes.ok) throw new Error(`HTTP ${aiRes.status}`);
        const aiJson = await aiRes.json();
        setBrief(prev => prev ? { ...prev, aiSummary: aiJson.summary ?? null, aiLoading: false } : prev);
      } catch {
        setBrief(prev => prev ? { ...prev, aiError: true, aiLoading: false } : prev);
      }
    } catch {
      setBrief({ trends: null, trendsError: true, weather: null, weatherError: true, events: null, insights: null, eventsError: true, aiSummary: null, aiLoading: false, aiError: true });
    } finally {
      setLoading(false);
    }
  };

  const copyBrief = async () => {
    if (!brief) return;
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const catLabels = [...selectedCats].map(id => CATEGORIES.find(c => c.id === id)?.label ?? id).join(', ');

    const trendLines = (brief.trends ?? []).slice(0, 3).map(t => {
      const dir = t.changeVsPrevWeek > 0 ? `↑${t.changeVsPrevWeek}%` : t.changeVsPrevWeek < 0 ? `↓${Math.abs(t.changeVsPrevWeek)}%` : '→';
      return `${t.title} ${dir}`;
    }).join(' | ') || '-';

    const weatherLine = (brief.weather ?? []).slice(0, 1).map(e => e.title).join('') || '특이없음';
    const eventLine = (brief.events ?? []).slice(0, 2).map(e => `${e.title} ${e.start.slice(5)}`).join(', ') || '-';
    const aiLine = brief.aiSummary?.split('\n').find(l => l.trim()) ?? '';

    const text = [
      `📊 맘큐 주간 수요 브리핑 (${today})`,
      `📌 ${catLabels}`,
      `📈 트렌드: ${trendLines}`,
      `🌤 날씨: ${weatherLine}`,
      `🛒 행사: ${eventLine}`,
      aiLine ? `💡 ${aiLine}` : '',
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setToast('카카오톡 형식으로 복사되었습니다 ✓');
    } catch {
      setToast('복사 실패 — 텍스트를 직접 선택해주세요');
    }
    setTimeout(() => setToast(null), 2500);
  };

  const isComplete = brief !== null && !brief.aiLoading;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '80px' }}>

      {/* 상단 헤더 */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '13px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ fontSize: '12.5px', color: 'var(--text-muted)', flexShrink: 0 }}>← 메인</a>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>주간 수요 브리핑</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>트렌드 · 날씨 · 행사 실시간 수요 신호</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '16px' }}>

        {/* 폼 카드 */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* 카테고리 선택 */}
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-subtle)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
              카테고리 선택
            </div>
            {GROUPS.map(group => (
              <div key={group} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-disabled)', marginBottom: '5px' }}>{group}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CATEGORIES.filter(c => c.group === group).map(cat => {
                    const sel = selectedCats.has(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCat(cat.id)}
                        style={{
                          padding: '7px 13px',
                          minHeight: '38px',
                          borderRadius: '999px',
                          border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                          background: sel ? 'var(--accent-bg)' : 'var(--surface)',
                          color: sel ? 'var(--accent-text)' : 'var(--text-muted)',
                          fontSize: '13px',
                          fontWeight: sel ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'border-color 120ms, background 120ms, color 120ms',
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 플랫폼 선택 */}
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-subtle)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
              플랫폼 선택
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PLATFORMS.map(plat => {
                const sel = selectedPlats.has(plat.id);
                return (
                  <button
                    key={plat.id}
                    onClick={() => togglePlat(plat.id)}
                    style={{
                      padding: '7px 13px',
                      minHeight: '38px',
                      borderRadius: '999px',
                      border: `1.5px solid ${sel ? 'var(--cat-platform)' : 'var(--border)'}`,
                      background: sel ? 'var(--cat-platform-bg)' : 'var(--surface)',
                      color: sel ? 'var(--cat-platform)' : 'var(--text-muted)',
                      fontSize: '13px',
                      fontWeight: sel ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'border-color 120ms, background 120ms, color 120ms',
                    }}
                  >
                    {plat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: loading ? 'var(--text-disabled)' : 'var(--accent)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 150ms',
            }}
          >
            {loading ? '브리핑 생성 중...' : '브리핑 생성'}
          </button>
        </div>

        {/* 결과 섹션 */}
        {brief && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* 1. 네이버 트렌드 */}
            <SectionCard icon="📈" title="네이버 검색 트렌드">
              {brief.trendsError ? <ErrorBlock /> :
               brief.trends === null ? <LoadingText /> :
               brief.trends.length === 0 ? <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>선택 카테고리에 트렌드 데이터 없음</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {brief.trends.map(t => {
                    const up = t.changeVsPrevWeek > 0;
                    const down = t.changeVsPrevWeek < 0;
                    const color = up ? 'var(--success)' : down ? 'var(--danger)' : 'var(--text-muted)';
                    const dir = up ? `↑${t.changeVsPrevWeek}%` : down ? `↓${Math.abs(t.changeVsPrevWeek)}%` : '→ 보합';
                    return (
                      <div key={t.ourKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{t.title}</span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-subtle)', marginLeft: '6px' }}>비율 {t.latestRatio}</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color, whiteSpace: 'nowrap', flexShrink: 0 }}>{dir}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* 2. 날씨 수요 신호 */}
            <SectionCard icon="🌤" title="날씨 수요 신호">
              {brief.weatherError ? <ErrorBlock /> :
               brief.weather === null ? <LoadingText /> :
               brief.weather.length === 0 ? <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>이번 주 특이 날씨 없음</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {brief.weather.map(e => (
                    <div key={e.id}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cat-weather)', marginBottom: '3px' }}>{e.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55 }}>{e.summary}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* 3. 플랫폼 행사 */}
            <SectionCard icon="🛒" title="플랫폼 행사 감지">
              {brief.eventsError ? <ErrorBlock /> :
               brief.events === null ? <LoadingText /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {brief.events.length === 0 && (brief.insights ?? []).length === 0 && (
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>선택 플랫폼 행사 없음</div>
                  )}
                  {brief.events.map(e => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                        background: e.confidence === 'high' ? 'var(--success)' : e.confidence === 'mid' ? 'var(--warning)' : 'var(--text-disabled)',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, wordBreak: 'break-word' }}>{e.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)', marginTop: '2px' }}>{e.start} ~ {e.end}</div>
                      </div>
                    </div>
                  ))}
                  {(brief.insights ?? []).length > 0 && (
                    <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '10px', marginTop: '2px' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>소비 트렌드</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(brief.insights ?? []).map(ins => (
                          <div key={ins.id}>
                            <div style={{ fontSize: '12.5px', fontWeight: 500, lineHeight: 1.4 }}>{ins.title}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>{ins.summary}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* 4. AI 수요 요약 */}
            <SectionCard icon="🤖" title="AI 수요 요약">
              {brief.aiError ? <ErrorBlock /> :
               brief.aiLoading ? <LoadingText text="Gemini 분석 중..." /> :
               brief.aiSummary ? (
                <AiSummaryBlock text={brief.aiSummary} />
               ) : (
                <div style={{ fontSize: '12.5px', color: 'var(--danger)' }}>AI 요약 생성 실패 — API 키를 확인하거나 잠시 후 다시 시도해주세요</div>
               )}
            </SectionCard>

            {/* 복사 CTA */}
            {isComplete && (
              <button
                onClick={copyBrief}
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-strong)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  transition: 'background 120ms, border-color 120ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
              >
                📋 카카오톡 형식으로 복사
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          background: 'oklch(0.18 0.012 260)', color: '#fff',
          padding: '10px 20px', borderRadius: 'var(--radius-md)',
          fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-lg)', zIndex: 100, animation: 'fadeIn 150ms ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
