'use client';

import React, { useState, CSSProperties } from 'react';
import Icon from '@/components/Icon';
import {
  PLATFORM_META, PLATFORMS, CATEGORIES, EVENTS, getPlatformInsight,
  catColor, typeLabel, typeChip, fmtDate, fmtDateFull, daysUntil, isActive,
} from '@/lib/data';
import type { MarketingEvent } from '@/lib/types';

function dDayBadge(dU: number, active: boolean): { text: string; urgent: boolean } | null {
  if (active) return { text: '진행중', urgent: true };
  if (dU <= 0) return null;
  return { text: `D-${dU}`, urgent: dU <= 3 };
}

// ---- PlatformInsights helpers ----

function getPlatformEventStatus(currentEvent: MarketingEvent, platformId: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const candidateEvents = EVENTS.filter(e =>
    e.type === 'platform' &&
    e.id !== currentEvent.id &&
    e.platforms.includes(platformId)
  );

  const cs = new Date(currentEvent.start).getTime();
  const ce = new Date(currentEvent.end).getTime();

  const overlapping = candidateEvents.filter(e => {
    const s = new Date(e.start).getTime();
    const en = new Date(e.end).getTime();
    return s <= ce && en >= cs;
  });
  if (overlapping.length > 0) return { status: 'overlap' as const, events: overlapping };

  const nearby = candidateEvents.filter(e => {
    const s = new Date(e.start).getTime();
    const en = new Date(e.end).getTime();
    const gap = Math.max(0, Math.max(cs - en, s - ce));
    return gap / msPerDay <= 90;
  });
  if (nearby.length > 0) return { status: 'opportunity' as const, events: nearby };

  return { status: 'none' as const, events: [] as MarketingEvent[] };
}

// ---- PlatformInsights ----
interface PlatformInsightsProps {
  event: MarketingEvent;
  compact?: boolean;
}

export function PlatformInsights({ event, compact = false }: PlatformInsightsProps) {
  const platforms = event.platforms || [];
  if (!platforms.length) return null;

  // 맘큐 먼저, 나머지는 뒤로
  const sortedPlatforms = [...platforms].sort((a, b) => {
    if (a === 'momq') return -1;
    if (b === 'momq') return 1;
    return 0;
  });

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['momq']));
  const toggle = (p: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(p)) next.delete(p); else next.add(p);
    return next;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: compact ? 10 : 14 }}>
      {sortedPlatforms.map(p => {
        const meta = PLATFORM_META[p];
        const tip = getPlatformInsight(event, p);
        if (!meta) return null;
        const isMomq = p === 'momq';
        const isOpen = expanded.has(p);

        if (isMomq) {
          return (
            <div key={p} style={{
              border: `1.5px solid ${meta.color}`,
              borderRadius: 10,
              background: meta.bg,
              padding: compact ? '11px 13px' : '13px 15px',
              display: 'flex', flexDirection: 'column', gap: 7,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 20, height: 20, borderRadius: 5,
                  background: meta.color, color: 'white',
                  fontSize: 11, fontWeight: 700,
                }}>{meta.label[0]}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                <span style={{
                  fontSize: 10, color: meta.color, fontWeight: 600,
                  padding: '2px 7px', borderRadius: 4,
                  border: `1px solid ${meta.color}`, opacity: 0.75,
                }}>운영 가이드</span>
                {tip?.metric && (
                  <span style={{ marginLeft: 'auto', fontSize: 10.5, color: meta.color, fontWeight: 600 }}>
                    {tip.metric}
                  </span>
                )}
              </div>
              {tip ? (
                <>
                  <div style={{ fontSize: 11.5, color: 'var(--text)', lineHeight: 1.55 }}>{tip.tip}</div>
                  {tip.action && (
                    <div style={{ fontSize: 11, color: meta.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="arrowRight" size={10} stroke={2.4} />
                      {tip.action}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                  맘큐 전략 가이드 준비 중
                </div>
              )}
              {event.counterStrategy && (
                <div style={{
                  marginTop: 8,
                  padding: '9px 11px',
                  borderRadius: 7,
                  background: 'oklch(0.96 0.025 15)',
                  border: '1px solid oklch(0.88 0.08 15)',
                }}>
                  <div style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--accent-text)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: 4,
                  }}>
                    ⚡ MomQ 대응 전략
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.55 }}>
                    {event.counterStrategy}
                  </div>
                </div>
              )}
            </div>
          );
        }

        const pStatus = getPlatformEventStatus(event, p);

        return (
          <div key={p} style={{
            border: '1px solid var(--border)', borderRadius: 8,
            background: 'var(--surface)', overflow: 'hidden',
          }}>
            {/* 행 헤더 */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                padding: compact ? '9px 11px' : '10px 13px',
                userSelect: 'none' as const,
              }}
              onClick={() => toggle(p)}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, borderRadius: 4,
                background: meta.bg, color: meta.color,
                fontSize: 10, fontWeight: 700,
              }}>{meta.label[0]}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{meta.label}</span>
              {tip?.metric && !isOpen && (
                <span style={{ fontSize: 10.5, color: 'var(--success)', fontWeight: 600 }}>
                  {tip.metric}
                  <span style={{ fontSize: 9.5, color: 'var(--text-subtle)', fontWeight: 400 }}> 추정</span>
                </span>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                {pStatus.status === 'overlap' && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: 'oklch(0.96 0.04 15)', color: 'oklch(0.52 0.20 15)',
                    border: '1px solid oklch(0.88 0.08 15)', whiteSpace: 'nowrap' as const,
                  }}>
                    행사 {pStatus.events.length}건 겹침
                  </span>
                )}
                {pStatus.status === 'opportunity' && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: 'oklch(0.95 0.04 240)', color: 'oklch(0.45 0.20 240)',
                    border: '1px solid oklch(0.85 0.08 240)', whiteSpace: 'nowrap' as const,
                  }}>
                    연동 기회 {pStatus.events.length}건
                  </span>
                )}
                {pStatus.status === 'none' && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 500, padding: '2px 7px', borderRadius: 999,
                    background: 'var(--bg-subtle)', color: 'var(--text-subtle)',
                    border: '1px solid var(--border)', whiteSpace: 'nowrap' as const,
                  }}>
                    기간 내 행사 없음
                  </span>
                )}
                <span style={{
                  fontSize: 11, color: 'var(--text-subtle)',
                  display: 'inline-flex', transition: 'transform 150ms',
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                }}>▾</span>
              </div>
            </div>

            {/* 펼친 상태 */}
            {isOpen && (
              <div style={{ padding: compact ? '0 11px 10px' : '0 13px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tip?.metric && (
                  <div style={{ fontSize: 10.5, color: 'var(--success)', fontWeight: 600 }}>
                    {tip.metric} <span style={{ fontSize: 9.5, color: 'var(--text-subtle)', fontWeight: 400 }}>추정</span>
                  </div>
                )}
                {tip ? (
                  <>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip.tip}</div>
                    {tip.action && (
                      <div style={{ fontSize: 11, color: meta.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="arrowRight" size={10} stroke={2.4} />
                        {tip.action}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                    플랫폼별 전략 가이드 준비 중
                  </div>
                )}

                {/* 플랫폼 행사 카드 섹션 */}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--divider)' }}>
                  <div style={{
                    fontSize: 10.5, fontWeight: 600, color: 'var(--text-subtle)',
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                    marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Icon name="share" size={10} stroke={2} />
                    플랫폼 행사
                  </div>

                  {pStatus.events.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {pStatus.events.map(pe => {
                        const isOverlap = pStatus.status === 'overlap';
                        const borderL = isOverlap ? 'oklch(0.78 0.12 15)' : 'oklch(0.68 0.15 240)';
                        const bg = isOverlap ? 'oklch(0.985 0.012 15)' : 'oklch(0.985 0.012 240)';
                        const accent = isOverlap ? 'oklch(0.52 0.20 15)' : 'oklch(0.45 0.20 240)';
                        const borderThin = isOverlap ? 'oklch(0.93 0.03 15)' : 'oklch(0.93 0.03 240)';
                        const catLabels = pe.categories.slice(0, 2)
                          .map(c => CATEGORIES.find(x => x.id === c)?.label ?? c)
                          .join(' · ');
                        return (
                          <div key={pe.id} style={{
                            padding: '9px 11px', borderRadius: 6,
                            background: bg,
                            border: `1px solid ${borderThin}`,
                            borderLeft: `3px solid ${borderL}`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                                {pe.title}
                              </span>
                              <span style={{ fontSize: 9.5, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                                {fmtDate(pe.start)}{pe.end !== pe.start && ` – ${fmtDate(pe.end)}`}
                              </span>
                            </div>
                            {catLabels && (
                              <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 3 }}>{catLabels}</div>
                            )}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 6 }}>
                              {pe.summary.length > 60 ? pe.summary.slice(0, 60) + '…' : pe.summary}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 10, color: accent, fontWeight: 600 }}>
                                {isOverlap ? '⚠ 경쟁 구간 — 입찰가·재고 점검 필요' : '◎ 연동 마케팅 기회'}
                              </span>
                              <button
                                onClick={e => e.stopPropagation()}
                                style={{
                                  marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                                  padding: '3px 8px', borderRadius: 5,
                                  background: 'transparent', color: accent,
                                  border: `1px solid ${borderL}`, cursor: 'pointer',
                                  whiteSpace: 'nowrap' as const,
                                }}
                              >
                                {isOverlap ? '입찰가 점검' : '참여 신청'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      padding: '8px 10px', borderRadius: 6,
                      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                        이 플랫폼의 기간 내 예정 행사가 없습니다.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface TrendHint {
  change: number;
  keyword: string;
}

// ---- EventHero ----
interface EventHeroProps {
  event: MarketingEvent;
  onOpen: (e: MarketingEvent, tab?: 'plan' | 'products' | 'insights') => void;
  onOpenPromoPlan?: (e: MarketingEvent) => void;
  trendHint?: TrendHint;
  overlappingEvents?: MarketingEvent[];
}

export const EventHero = React.memo(function EventHero({ event, onOpen, onOpenPromoPlan, trendHint, overlappingEvents }: EventHeroProps) {
  const [hover, setHover] = useState(false);
  const dU = daysUntil(event.start);
  const active = isActive(event);

  const heroCard: CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
    padding: 18, position: 'relative', overflow: 'hidden', cursor: 'pointer',
    transition: 'box-shadow 140ms, transform 140ms, border-color 140ms',
    ...(hover ? {
      borderColor: 'var(--border-strong)',
      boxShadow: '0 1px 2px oklch(0 0 0 / 0.04), 0 8px 20px oklch(0 0 0 / 0.06)',
      transform: 'translateY(-1px)',
    } : {}),
  };

  return (
    <div style={heroCard} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onOpen(event)}>
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
          color: 'var(--accent-text)', textTransform: 'uppercase', marginBottom: 8,
        }}>
          <Icon name="sparkles" size={11} stroke={1.5} />
          {active ? '지금 진행 중' : '가장 임박한 기회'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 6 }}>
          <span className="event-hero-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            {event.title}
          </span>
          {trendHint && Math.abs(trendHint.change) >= 5 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '3px 8px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
              background: trendHint.change > 0 ? 'oklch(0.94 0.06 145)' : 'oklch(0.96 0.04 15)',
              color: trendHint.change > 0 ? 'var(--success)' : 'var(--danger)',
            }}>
              {trendHint.change > 0 ? '↑' : '↓'} {trendHint.keyword} {trendHint.change > 0 ? '+' : ''}{trendHint.change}%
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: overlappingEvents && overlappingEvents.length > 0 ? 8 : 14 }}>
          {fmtDateFull(event.start)}
          {event.end !== event.start && ` — ${fmtDateFull(event.end)}`}
          {' · '}
          <span className={`chip ${typeChip(event.type)}`} style={{ marginLeft: 4 }}>
            {typeLabel(event.type)}
          </span>
        </div>
        {overlappingEvents && overlappingEvents.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12, flexWrap: 'wrap' as const }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', flexShrink: 0, whiteSpace: 'nowrap' as const }}>
              동시 진행
            </span>
            {overlappingEvents.map(e => (
              <button
                key={e.id}
                onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
                  background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor(e.type), flexShrink: 0 }} />
                {e.title}
              </button>
            ))}
          </div>
        )}
        <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.55, marginBottom: 14 }}>
          {event.summary}
        </div>
        <div className="event-hero-metrics" style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
          {[
            { label: '예상 GMV 증가', value: event.gmv, color: 'var(--success)', note: '추정치' },
            { label: '검색량 변화', value: event.search, color: 'var(--text)', note: '추정치' },
            { label: 'D-Day', value: active ? '진행중' : dU >= 0 ? `D-${dU}` : `D+${Math.abs(dU)}`, color: 'var(--accent-text)', note: '' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
              <div className="event-hero-metric-value" style={{ fontSize: 18, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
              {m.note && <div style={{ fontSize: 9.5, color: 'var(--text-subtle)' }}>{m.note}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          <button className="btn primary" onClick={(e) => { e.stopPropagation(); onOpen(event); }}>
            <Icon name="target" size={13} />액션 플랜 열기
          </button>
          <button className="btn" onClick={(e) => { e.stopPropagation(); onOpen(event, 'products'); }}>
            <Icon name="package" size={13} />추천 품목
          </button>
          {onOpenPromoPlan && (
            <button className="btn" onClick={(e) => { e.stopPropagation(); onOpenPromoPlan(event); }}>
              <Icon name="sparkles" size={13} />AI 기획서
            </button>
          )}
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--divider)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Icon name="share" size={12} stroke={2.2} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              플랫폼별 인사이트
            </span>
          </div>
          <PlatformInsights event={event} />
        </div>
      </div>
    </div>
  );
});

// ---- PlatformEventsCollapsible ----
function PlatformEventsCollapsible({ events }: { events: MarketingEvent[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: '0 16px 10px' }}>
      <div style={{ paddingTop: 10, borderTop: '1px solid var(--divider)' }}>
        <div
          style={{
            fontSize: 10.5, fontWeight: 600, color: 'var(--text-subtle)',
            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
            display: 'flex', alignItems: 'center', gap: 4,
            cursor: 'pointer', userSelect: 'none' as const,
            marginBottom: open ? 6 : 0,
          }}
          onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        >
          <Icon name="share" size={10} stroke={2} />
          동시 진행 플랫폼 행사 ({events.length})
          <span style={{
            marginLeft: 'auto', fontSize: 11, color: 'var(--text-subtle)',
            display: 'inline-flex', transition: 'transform 150ms',
            transform: open ? 'rotate(180deg)' : 'none',
          }}>▾</span>
        </div>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {events.map(pe => (
              <div key={pe.id} style={{
                padding: '8px 10px', borderRadius: 7,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--cat-platform)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2, flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{pe.title}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                    {fmtDate(pe.start)}{pe.end !== pe.start && ` – ${fmtDate(pe.end)}`}
                  </span>
                </div>
                <div style={{
                  fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                }}>
                  {pe.summary}
                </div>
                {pe.mdBrief && (
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 3 }}>
                    <span style={{ fontWeight: 600, color: 'oklch(0.55 0.15 280)' }}>MD</span> {pe.mdBrief.insight}
                  </div>
                )}
                {pe.sourceLink && (
                  <a
                    href={pe.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 5, fontSize: 10.5, color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 600 }}
                    onClick={e => e.stopPropagation()}
                  >
                    기사 원문 <Icon name="arrowRight" size={9} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- EventCard ----
interface EventCardProps {
  event: MarketingEvent;
  onOpen: (e: MarketingEvent, tab?: 'plan' | 'products' | 'insights') => void;
  onOpenPromoPlan?: (e: MarketingEvent) => void;
  filter: string;
  trendHint?: TrendHint;
  overlappingPlatformEvents?: MarketingEvent[];
}

export const EventCard = React.memo(function EventCard({ event, onOpen, onOpenPromoPlan, filter, trendHint, overlappingPlatformEvents = [] }: EventCardProps) {
  const [hover, setHover] = useState(false);
  const dU = daysUntil(event.start);
  const active = isActive(event);

  const productsToShow = filter === 'all'
    ? event.products.slice(0, 3)
    : event.products.filter(p => p.category === filter).slice(0, 3);
  const displayProducts = productsToShow.length > 0 ? productsToShow : event.products.slice(0, 3);

  const cardStyle: CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    overflow: 'hidden', cursor: 'pointer',
    transition: 'box-shadow 140ms, transform 140ms, border-color 140ms',
    ...(hover ? {
      borderColor: 'var(--border-strong)',
      boxShadow: '0 1px 2px oklch(0 0 0 / 0.04), 0 8px 20px oklch(0 0 0 / 0.06)',
      transform: 'translateY(-1px)',
    } : {}),
  };

  if (event.source === 'news') {
    return (
      <div style={cardStyle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <span className={`chip ${typeChip(event.type)}`}>
              <span className="dot" />
              플랫폼 행사 현황
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
              {fmtDate(event.start)}{event.end !== event.start && ` – ${fmtDate(event.end)}`}
            </span>
            {active && (
              <span style={{
                marginLeft: 'auto', fontSize: 9.5, fontWeight: 700,
                color: 'var(--danger)', letterSpacing: '0.06em',
              }}>LIVE</span>
            )}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 6 }}>
            {event.title}
          </div>
          <div style={{
            fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55,
            marginBottom: event.mdBrief ? 8 : 12,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {event.summary}
          </div>
          {event.mdBrief && (
            <div style={{
              display: 'flex', flexWrap: 'wrap' as const, gap: '4px 10px',
              marginBottom: 12, fontSize: 11.5, color: 'var(--text-subtle)', lineHeight: 1.4,
            }}>
              <span><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>품목</span> {event.mdBrief.items}</span>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <span><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>컨셉</span> {event.mdBrief.concept}</span>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <span><span style={{ fontWeight: 600, color: 'var(--accent-text)' }}>MD</span> {event.mdBrief.insight}</span>
            </div>
          )}
          {event.sourceLink && (
            <a
              href={event.sourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn sm"
              style={{ textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              기사 원문 보기 <Icon name="arrowRight" size={11} />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onOpen(event)}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          minWidth: 56, padding: '6px 8px',
          background: 'var(--bg-subtle)', borderRadius: 8,
        }}>
          <div style={{
            fontSize: 20, fontWeight: 700, lineHeight: 1,
            color: 'var(--text)', fontVariantNumeric: 'tabular-nums',
            fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em',
          }}>
            {active ? '●' : dU >= 0 ? dU : `+${Math.abs(dU)}`}
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-subtle)', marginTop: 3, letterSpacing: '0.04em' }}>
            {active ? 'LIVE' : dU >= 0 ? 'DAYS' : 'OVER'}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span className={`chip ${typeChip(event.type)}`}>
              <span className="dot" />
              {typeLabel(event.type)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
              {fmtDate(event.start)}
              {event.end !== event.start && ` – ${fmtDate(event.end)}`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const, marginBottom: 4 }}>
            <span style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {event.title}
            </span>
            {trendHint && Math.abs(trendHint.change) >= 5 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '2px 7px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
                background: trendHint.change > 0 ? 'oklch(0.94 0.06 145)' : 'oklch(0.96 0.04 15)',
                color: trendHint.change > 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                {trendHint.change > 0 ? '↑' : '↓'} {trendHint.keyword} {trendHint.change > 0 ? '+' : ''}{trendHint.change}%
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{event.summary}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--divider)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>기회점수</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: event.trendScore >= 80 ? 'var(--warning)' : 'var(--text-disabled)', display: 'flex' }}>
                  <Icon
                    name="star"
                    size={12}
                    stroke={1.5}
                    fill={event.trendScore >= 80 ? 'var(--warning)' : 'none'}
                  />
                </span>
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: event.trendScore >= 80 ? 'var(--accent-text)' : 'var(--text)',
                }}>
                  {event.trendScore}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-subtle)' }}>/100</span>
                </span>
              </div>
            </div>
            {[
              { label: '검색량', value: event.search, color: 'var(--success)' },
              { label: '예상 GMV', value: event.gmv, color: 'var(--success)' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums' }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {displayProducts.length > 0 && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="package" size={11} />
            추천 품목 ({displayProducts.length}/{event.products.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {displayProducts.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: p.urgency === 'high' ? 'var(--danger)' : p.urgency === 'mid' ? 'var(--warning)' : 'var(--text-subtle)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.reason}</div>
                </div>
                <button className="btn sm ghost" onClick={(e) => e.stopPropagation()}>
                  <Icon name="arrowRight" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {overlappingPlatformEvents.length > 0 && (
        <PlatformEventsCollapsible events={overlappingPlatformEvents} />
      )}

      <div className="event-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 11 }}>
          <Icon name="checkCircle" size={12} />
          {event.checklist.filter(c => c.done).length}/{event.checklist.length}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
          <button className="btn sm" onClick={(e) => { e.stopPropagation(); onOpen(event); }}>
            <Icon name="target" size={11} />액션 플랜
          </button>
          <button className="btn sm" onClick={(e) => { e.stopPropagation(); onOpen(event, 'products'); }}>
            <Icon name="package" size={11} />추천 품목
          </button>
          {onOpenPromoPlan && (
            <button
              className="btn sm"
              onClick={(e) => { e.stopPropagation(); onOpenPromoPlan(event); }}
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, oklch(0.55 0.25 280) 100%)', color: '#fff', border: 'none' }}
            >
              <Icon name="sparkles" size={11} />AI 기획서
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ---- MiniItem ----
interface MiniItemProps {
  event: MarketingEvent;
  onOpen: (e: MarketingEvent, tab?: 'plan' | 'products' | 'insights') => void;
}

export const MiniItem = React.memo(function MiniItem({ event, onOpen }: MiniItemProps) {
  const [hover, setHover] = useState(false);
  const dU = daysUntil(event.start);
  const active = isActive(event);
  const date = new Date(event.start);
  const badge = dDayBadge(dU, active);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
        transition: 'background 120ms',
        background: hover ? 'var(--bg-subtle)' : 'transparent',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(event)}
    >
      <div style={{ minWidth: 36, textAlign: 'center', fontSize: 10.5, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>{date.getDate()}</div>
        <div>{date.getMonth() + 1}월</div>
      </div>
      <div style={{ width: 3, height: 32, borderRadius: 2, background: catColor(event.type) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.title}
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          {badge && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
              background: badge.urgent ? 'var(--accent-bg)' : 'var(--bg-subtle)',
              color: badge.urgent ? 'var(--accent-text)' : 'var(--text-subtle)',
              border: `1px solid ${badge.urgent ? 'var(--accent-border)' : 'var(--border)'}`,
              whiteSpace: 'nowrap' as const,
            }}>
              {badge.text}
            </span>
          )}
          <span>{badge ? '· ' : ''}{typeLabel(event.type)}</span>
        </div>
      </div>
    </div>
  );
});
