'use client';

import React, { useState } from 'react';
import Icon from '@/components/Icon';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { useTrendData } from '@/hooks/useTrendData';
import { useAutoTrendEvents } from '@/hooks/useAutoTrendEvents';
import { useWeatherEvents } from '@/hooks/useWeatherEvents';
import { useNewsEvents } from '@/hooks/useNewsEvents';
import type { DetectedNewsEvent } from '@/hooks/useNewsEvents';
import { catColor } from '@/lib/data';

// ── 상태 배지 ─────────────────────────────────────────────────
function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, { bg: string; color: string; dot: string }> = {
    ok:           { bg: 'oklch(0.95 0.05 145)', color: 'var(--success)', dot: 'var(--success)' },
    loading:      { bg: 'var(--bg-subtle)', color: 'var(--text-muted)', dot: 'var(--text-subtle)' },
    'no-api-key': { bg: 'oklch(0.97 0.04 75)', color: 'oklch(0.48 0.15 75)', dot: 'oklch(0.65 0.15 75)' },
    error:        { bg: 'var(--danger-bg)', color: 'var(--danger)', dot: 'var(--danger)' },
  };
  const c = colors[status] ?? colors.loading;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      fontSize: 'var(--fs-sm)', fontWeight: 500,
      background: c.bg, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── 트렌드 신호 해석 ─────────────────────────────────────────
function signalInfo(change: number) {
  if (change >= 20)  return { label: '급상승', icon: '↑↑', color: 'oklch(0.40 0.14 145)', bg: 'oklch(0.93 0.06 145)', border: 'oklch(0.82 0.1 145)',  action: '재고 2주치 이상 선확보 + 광고 입찰가 즉시 상향' };
  if (change >= 8)   return { label: '상승',   icon: '↑',  color: 'var(--success)',         bg: 'oklch(0.96 0.04 145)', border: 'oklch(0.88 0.07 145)', action: '광고 예산 소폭 증액, 관련 기획전 준비 시작' };
  if (change >= -8)  return { label: '보합',   icon: '→',  color: 'var(--text-muted)',       bg: 'var(--bg-subtle)',     border: 'var(--border)',         action: '현 운영 유지, 다음 시즌·이벤트 기획 준비' };
  if (change >= -20) return { label: '하락',   icon: '↓',  color: 'oklch(0.55 0.18 25)',    bg: 'oklch(0.97 0.03 25)', border: 'oklch(0.91 0.06 25)',   action: '쿠폰·번들 프로모션으로 수요 방어, 재고 조정 검토' };
  return               { label: '급하락',  icon: '↓↓', color: 'var(--danger)',          bg: 'oklch(0.97 0.04 15)', border: 'oklch(0.90 0.07 15)',   action: '할인 판매로 재고 소진, 신규 발주 축소 검토' };
}

// ── 트렌드 패널 ───────────────────────────────────────────────
function TrendPanel() {
  const { trends, status, updatedAt } = useTrendData();
  const { events: autoEvents } = useAutoTrendEvents();

  const rising  = trends.filter(t => t.changeVsPrevWeek >= 8);
  const falling = trends.filter(t => t.changeVsPrevWeek <= -8);
  const stable  = trends.filter(t => t.changeVsPrevWeek > -8 && t.changeVsPrevWeek < 8);
  const sorted  = [...trends].sort((a, b) => b.changeVsPrevWeek - a.changeVsPrevWeek);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700, letterSpacing: '-0.01em' }}>카테고리별 네이버 검색량 변화</div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            판매량이 아닌 검색어 트렌드 기준 · 네이버 DataLab · 전주 대비 변화율
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <StatusBadge
          status={status}
          label={status === 'ok' ? '연동됨' : status === 'loading' ? '불러오는 중...' : status === 'no-api-key' ? 'API 키 미설정' : '오류'}
        />
      </div>

      {status === 'no-api-key' && (
        <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'oklch(0.97 0.04 75)', border: '1px solid oklch(0.88 0.08 75)', marginBottom: 16 }}>
          <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'oklch(0.48 0.15 75)', marginBottom: 4 }}>
            NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수를 설정하세요
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'oklch(0.55 0.12 75)', fontFamily: 'var(--font-mono)' }}>
            .env.local 파일에 키를 추가하고 서버를 재시작하세요
          </div>
        </div>
      )}

      {/* 요약 배너 */}
      {status === 'ok' && trends.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { icon: '↑', label: '수요 상승', count: rising.length,  sub: rising.length  > 0 ? rising.slice(0, 2).map(t => t.title).join(', ')  : '해당 없음', color: 'oklch(0.40 0.14 145)', bg: 'oklch(0.93 0.06 145)', border: 'oklch(0.82 0.1 145)' },
            { icon: '→', label: '보합',      count: stable.length,  sub: '안정적 수요 유지',                                                        color: 'var(--text-muted)',       bg: 'var(--bg-subtle)',     border: 'var(--border)' },
            { icon: '↓', label: '수요 하락', count: falling.length, sub: falling.length > 0 ? falling.slice(0, 2).map(t => t.title).join(', ') : '해당 없음', color: 'var(--danger)',          bg: 'oklch(0.97 0.04 15)', border: 'oklch(0.90 0.07 15)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: s.bg, border: `1px solid ${s.border}` }}>
              <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                {s.icon} {s.label}
              </div>
              <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                {s.count}<span style={{ fontSize: 'var(--fs-base)', fontWeight: 400, marginLeft: 3 }}>개</span>
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: s.color, marginTop: 3, opacity: 0.8, lineHeight: 1.4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* 카테고리 목록 */}
      {status === 'ok' && trends.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map(t => {
            const sig = signalInfo(t.changeVsPrevWeek);
            return (
              <div key={t.ourKey} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: sig.bg, border: `1px solid ${sig.border}`, minWidth: 52, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 'var(--fs-base)', fontWeight: 700, color: sig.color, lineHeight: 1 }}>{sig.icon}</div>
                  <div style={{ fontSize: 'var(--fs-2xs)', fontWeight: 700, color: sig.color, marginTop: 2, letterSpacing: '0.02em' }}>{sig.label}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)' }}>{t.title}</span>
                    <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: sig.color }}>
                      {t.changeVsPrevWeek >= 0 ? '+' : ''}{t.changeVsPrevWeek}%
                    </span>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>전주 대비</span>
                  </div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Icon name="arrowRight" size={10} stroke={2.4} />
                    {sig.action}
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>
                    {t.keywords?.slice(0, 3).join(' · ')}
                  </div>
                </div>
                {/* 스파크라인 */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28, width: 52, flexShrink: 0 }}>
                  {t.data.slice(-7).map((d, i, arr) => (
                    <div key={i} style={{ flex: 1, borderRadius: 2, background: i === arr.length - 1 ? sig.color : 'var(--bg-subtle)', height: `${Math.max(10, (d.ratio / 100) * 100)}%`, opacity: i === arr.length - 1 ? 1 : 0.5 }} title={`${d.period}: ${d.ratio}`} />
                  ))}
                </div>
                <div style={{ textAlign: 'right', minWidth: 44, flexShrink: 0 }}>
                  <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-subtle)', marginBottom: 2, whiteSpace: 'nowrap' }}>검색량 지수</div>
                  <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {Math.round(t.latestRatio)}
                  </div>
                  <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-disabled)', marginTop: 2 }}>최고치 = 100</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : status === 'ok' ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--fs-base)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
          트렌드 데이터가 없습니다.
        </div>
      ) : null}

      {updatedAt && (
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginTop: 12 }}>
          마지막 업데이트: {new Date(updatedAt).toLocaleString('ko-KR')}
        </div>
      )}

      {autoEvents.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="sparkles" size={13} />
            <div style={{ fontSize: 'var(--fs-base)', fontWeight: 700, letterSpacing: '-0.01em' }}>자동 생성된 트렌드 이벤트</div>
            <span style={{ fontSize: 'var(--fs-xs)', padding: '2px 7px', borderRadius: 4, background: 'oklch(0.93 0.06 280)', color: 'oklch(0.45 0.18 280)', fontWeight: 600 }}>
              {autoEvents.length}건
            </span>
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 12 }}>
            전주 대비 +20% 이상 급등 카테고리에서 자동 생성 — 캘린더에 즉시 반영됩니다
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {autoEvents.map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor(ev.type), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)' }}>{ev.title}</div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>{ev.start} ~ {ev.end}</div>
                </div>
                <span style={{ fontSize: 'var(--fs-xs)', padding: '2px 8px', borderRadius: 4, background: 'oklch(0.93 0.06 280)', color: 'oklch(0.45 0.18 280)', flexShrink: 0 }}>
                  자동 생성
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 날씨 패널 ─────────────────────────────────────────────────
function WeatherPanel() {
  const { events, status, updatedAt, error } = useWeatherEvents();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700, letterSpacing: '-0.01em' }}>기상청 날씨 연동</div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            단기예보 기반 자동 생성된 날씨 마케팅 이벤트
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <StatusBadge
          status={status}
          label={status === 'ok' ? `${events.length}건 자동 생성` : status === 'loading' ? '불러오는 중...' : status === 'no-api-key' ? 'API 키 미설정' : '오류'}
        />
      </div>

      {status === 'no-api-key' && (
        <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'oklch(0.97 0.04 75)', border: '1px solid oklch(0.88 0.08 75)', marginBottom: 16 }}>
          <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'oklch(0.48 0.15 75)', marginBottom: 4 }}>
            KMA_API_KEY 환경변수를 설정하세요
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'oklch(0.55 0.12 75)' }}>
            공공데이터포털(data.go.kr)에서 "기상청_단기예보" API 키를 발급받아 .env.local에 추가하세요.
          </div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid oklch(0.88 0.08 15)', marginBottom: 16 }}>
          <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>날씨 API 호출 실패</div>
          {error && <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' as const }}>{error}</div>}
        </div>
      )}

      {events.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor(ev.type), flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)' }}>{ev.title}</div>
                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{ev.start} ~ {ev.end}</div>
              </div>
              <span style={{ fontSize: 'var(--fs-xs)', padding: '2px 8px', borderRadius: 4, background: 'oklch(0.93 0.04 220)', color: 'oklch(0.45 0.12 220)' }}>
                자동 생성
              </span>
            </div>
          ))}
        </div>
      ) : status === 'ok' ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--fs-base)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
          현재 특이 날씨 이벤트가 없습니다. (폭염/한파/강수/적설 감지 시 자동 생성)
        </div>
      ) : null}

      {updatedAt && (
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginTop: 12 }}>
          마지막 업데이트: {new Date(updatedAt).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}

// ── 뉴스 감지 패널 ────────────────────────────────────────────
const PLATFORM_LABELS: Record<string, string> = {
  coupang: '쿠팡', naver: '네이버', '11st': '11번가',
  gmarket: 'G마켓', kakao: '카카오', wemakeprice: '위메프',
};

const CONFIDENCE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  high: { label: '날짜 확인됨', bg: 'oklch(0.94 0.06 145)', color: 'var(--success)' },
  mid:  { label: '날짜 추정',   bg: 'oklch(0.97 0.04 75)',  color: 'oklch(0.48 0.15 75)' },
  low:  { label: '날짜 미확인', bg: 'var(--bg-subtle)',     color: 'var(--text-muted)' },
};

const TAG_COLOR: Record<string, { bg: string; color: string }> = {
  blue:   { bg: 'oklch(0.94 0.04 230)', color: 'oklch(0.42 0.12 230)' },
  green:  { bg: 'oklch(0.94 0.05 145)', color: 'oklch(0.42 0.12 145)' },
  orange: { bg: 'oklch(0.96 0.05 60)',  color: 'oklch(0.48 0.14 60)' },
};

function NewsDetectionPanel() {
  const { events, insights, status, updatedAt } = useNewsEvents();
  const { add } = useCustomEvents();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [insightTab, setInsightTab] = useState<'events' | 'trends'>('events');

  const handleAdd = async (ev: DetectedNewsEvent) => {
    const { toMarketingEvent } = await import('@/app/api/news-events/route');
    add(toMarketingEvent(ev));
    setAdded(prev => new Set([...prev, ev.id]));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700, letterSpacing: '-0.01em' }}>뉴스 인사이트</div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            플랫폼 행사 일정 감지 · 소비 트렌드 기사 수집 (네이버 뉴스 자동)
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <StatusBadge
          status={status}
          label={status === 'ok' ? `행사 ${events.length}건 · 트렌드 ${insights.length}건` : status === 'loading' ? '검색 중...' : status === 'no-api-key' ? 'API 키 미설정' : '오류'}
        />
      </div>

      {/* 서브 탭 */}
      <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 18 }}>
        {([
          { id: 'events', label: '플랫폼 행사', icon: 'calendar' },
          { id: 'trends', label: '소비 트렌드', icon: 'trending' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setInsightTab(t.id)}
            style={{
              padding: '5px 14px', borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--fs-base)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 5,
              flexShrink: 0, whiteSpace: 'nowrap' as const,
              color: insightTab === t.id ? 'var(--text)' : 'var(--text-muted)',
              background: insightTab === t.id ? 'var(--surface)' : 'transparent',
              boxShadow: insightTab === t.id ? 'var(--shadow-sm)' : 'none',
              border: insightTab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            <Icon name={t.icon} size={12} />{t.label}
          </button>
        ))}
      </div>

      {/* 플랫폼 행사 탭 */}
      {insightTab === 'events' && (
        <>
          {events.length === 0 && status === 'ok' && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--fs-base)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
              현재 감지된 플랫폼 행사 일정이 없습니다.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map(ev => {
              const conf = CONFIDENCE_STYLE[ev.confidence];
              const isAdded = added.has(ev.id);
              return (
                <div key={ev.id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--text)' }}>{ev.title}</span>
                        <span style={{ fontSize: 'var(--fs-xs)', padding: '2px 7px', borderRadius: 999, fontWeight: 600, background: conf.bg, color: conf.color }}>
                          {conf.label}
                        </span>
                        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', padding: '1px 6px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                          {PLATFORM_LABELS[ev.platform] ?? ev.platform}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)', marginBottom: 6 }}>
                        {ev.start} ~ {ev.end}
                      </div>
                      <a href={ev.sourceLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 'var(--fs-sm)', color: 'var(--accent-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Icon name="share" size={11} />
                        {ev.sourceTitle.slice(0, 60)}{ev.sourceTitle.length > 60 ? '…' : ''}
                      </a>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginTop: 4 }}>
                        뉴스 발행: {ev.pubDate}
                        {ev.confidence !== 'high' && (
                          <span style={{ marginLeft: 8, color: 'oklch(0.55 0.12 75)' }}>
                            * 날짜가 추정값입니다. 공식 공지를 확인하세요.
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`btn sm ${isAdded ? '' : 'primary'}`}
                      disabled={isAdded}
                      onClick={() => handleAdd(ev)}
                      style={{ flexShrink: 0 }}
                    >
                      {isAdded ? <><Icon name="check" size={12} />추가됨</> : <><Icon name="plus" size={12} />캘린더 추가</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 소비 트렌드 탭 */}
      {insightTab === 'trends' && (
        <>
          {insights.length === 0 && status === 'ok' && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--fs-base)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
              수집된 트렌드 기사가 없습니다.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map(ins => {
              const tc = TAG_COLOR[ins.tagColor] ?? TAG_COLOR.blue;
              return (
                <div key={ins.id} style={{ padding: '13px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: tc.bg, color: tc.color }}>
                          {ins.tag}
                        </span>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{ins.pubDate}</span>
                      </div>
                      <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)', marginBottom: 5, lineHeight: 1.4 }}>
                        {ins.title}
                      </div>
                      {ins.summary && (
                        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>
                          {ins.summary}{ins.summary.length >= 120 ? '…' : ''}
                        </div>
                      )}
                      <a href={ins.sourceLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 'var(--fs-sm)', color: 'var(--accent-text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Icon name="share" size={11} />기사 원문 보기
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {updatedAt && (
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginTop: 12 }}>
          마지막 검색: {new Date(updatedAt).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}

// ── 경쟁사 모니터링 패널 ──────────────────────────────────────
const COMPETITORS = [
  {
    group: '대형 플랫폼',
    items: [
      { label: '쿠팡',     short: '쿠',  url: 'https://www.coupang.com',         color: 'oklch(0.62 0.18 25)',  desc: '로켓배송·로켓그로스 행사 및 딜 확인' },
      { label: '네이버쇼핑', short: 'N', url: 'https://shopping.naver.com',      color: 'oklch(0.55 0.15 150)', desc: '브랜드스토어·기획전·검색광고 동향' },
      { label: 'SSG닷컴',  short: 'SSG', url: 'https://www.ssg.com',            color: 'oklch(0.52 0.20 20)',  desc: '이마트 온라인 유아·생활용품 기획전 확인' },
      { label: '롯데온',   short: '롯데', url: 'https://www.lotteon.com',        color: 'oklch(0.50 0.22 15)',  desc: '롯데마트 온라인 연계 유아동 행사 모니터링' },
    ],
  },
  {
    group: '오픈마켓·커머스',
    items: [
      { label: '11번가',  short: '11', url: 'https://www.11st.co.kr',            color: 'oklch(0.62 0.18 15)',  desc: '11절·슈퍼딜 등 플랫폼 행사 모니터링' },
      { label: 'G마켓',   short: 'G',  url: 'https://www.gmarket.co.kr',         color: 'oklch(0.55 0.14 155)', desc: '슈퍼위크·빅세일 기획전 확인' },
      { label: '카카오',  short: 'K',  url: 'https://gift.kakao.com',            color: 'oklch(0.62 0.13 90)',  desc: '카카오 선물하기·톡딜 행사 동향' },
    ],
  },
  {
    group: '전문몰',
    items: [
      { label: '컬리',      short: '컬',  url: 'https://www.kurly.com',          color: 'oklch(0.44 0.22 310)', desc: '생활/유아 카테고리 기획전·PB 동향' },
      { label: '올리브영',  short: '올리', url: 'https://www.oliveyoung.co.kr',  color: 'oklch(0.48 0.18 145)', desc: '생리대·바디케어 트렌드·기획전 참고' },
      { label: '무신사',    short: '무',  url: 'https://www.musinsa.com',        color: 'oklch(0.22 0 0)',      desc: '패션·라이프 트렌드 참고' },
      { label: 'GS샵',     short: 'GS',  url: 'https://www.gsshop.com',         color: 'oklch(0.50 0.18 250)', desc: 'TV홈쇼핑 연계 유아동 기획전 확인' },
      { label: '알리',      short: 'A',   url: 'https://ko.aliexpress.com',      color: 'oklch(0.65 0.18 50)',  desc: '가격 경쟁력·해외직구 트렌드 참고' },
    ],
  },
];

function CompetitorPanel() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4 }}>경쟁사 모니터링</div>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          주요 플랫폼 기획전·행사를 빠르게 확인하세요.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {COMPETITORS.map(group => (
          <div key={group.group}>
            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              {group.group}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {group.items.map(p => (
                <a
                  key={p.label}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    textDecoration: 'none', transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <span style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: p.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--fs-sm)', fontWeight: 700, flexShrink: 0,
                    letterSpacing: '-0.02em',
                  }}>
                    {p.short}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{p.label}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.desc}</div>
                  </div>
                  <Icon name="arrowRight" size={12} stroke={2} />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
type PanelId = 'news' | 'trends' | 'weather' | 'competitor';

export default function InsightsPanel() {
  const [panel, setPanel] = useState<PanelId>('news');

  const panels: { id: PanelId; label: string; icon: string }[] = [
    { id: 'news',       label: '뉴스 감지',       icon: 'search' },
    { id: 'trends',     label: '트렌드 연동',     icon: 'trending' },
    { id: 'weather',    label: '날씨 자동화',     icon: 'cloud' },
    { id: 'competitor', label: '경쟁사 모니터링', icon: 'eye' },
  ];

  return (
    <div className="tab-page">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>
          인사이트
        </div>
        <div style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)' }}>
          뉴스 감지, 네이버 트렌드, 날씨 API 연동 데이터를 확인하세요.
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', maxWidth: '100%', overflowX: 'auto', marginBottom: 24 }}>
        {panels.map(p => (
          <button
            key={p.id}
            onClick={() => setPanel(p.id)}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--fs-base)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0, whiteSpace: 'nowrap' as const,
              color: panel === p.id ? 'var(--text)' : 'var(--text-muted)',
              background: panel === p.id ? 'var(--surface)' : 'transparent',
              boxShadow: panel === p.id ? 'var(--shadow-sm)' : 'none',
              border: panel === p.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            <Icon name={p.icon} size={13} />{p.label}
          </button>
        ))}
      </div>

      {panel === 'news'       && <NewsDetectionPanel />}
      {panel === 'trends'     && <TrendPanel />}
      {panel === 'weather'    && <WeatherPanel />}
      {panel === 'competitor' && <CompetitorPanel />}
    </div>
  );
}
