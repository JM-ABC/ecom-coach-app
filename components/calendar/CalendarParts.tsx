'use client';

import React, { useState, CSSProperties } from 'react';
import Icon from '@/components/Icon';
import {
  PLATFORM_META, PLATFORMS, getPlatformInsight,
  catColor, typeLabel, typeChip, fmtDate, fmtDateFull, daysUntil, isActive,
} from '@/lib/data';
import type { MarketingEvent } from '@/lib/types';

// ---- PlatformInsights ----
interface PlatformInsightsProps {
  event: MarketingEvent;
  compact?: boolean;
}

export function PlatformInsights({ event, compact = false }: PlatformInsightsProps) {
  const platforms = event.platforms || [];
  if (!platforms.length) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 8,
      marginTop: compact ? 10 : 14,
    }}>
      {platforms.map(p => {
        const meta = PLATFORM_META[p];
        const tip = getPlatformInsight(event, p);
        if (!meta) return null;
        return (
          <div key={p} style={{
            border: '1px solid var(--border)', borderRadius: 8,
            background: 'var(--surface)', padding: compact ? '10px 11px' : '11px 13px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, borderRadius: 4,
                background: meta.bg, color: meta.color,
                fontSize: 10, fontWeight: 700, letterSpacing: '-0.02em',
              }}>{meta.label[0]}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{meta.label}</span>
              {tip?.metric && (
                <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--success)', fontWeight: 600 }}>
                  {tip.metric}
                </span>
              )}
            </div>
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
          </div>
        );
      })}
    </div>
  );
}

// ---- EventHero ----
interface EventHeroProps {
  event: MarketingEvent;
  onOpen: (e: MarketingEvent) => void;
}

export function EventHero({ event, onOpen }: EventHeroProps) {
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
          <Icon name="zap" size={11} stroke={2.4} />
          {active ? '지금 진행 중' : '가장 임박한 기회'}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6 }}>
          {event.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          {fmtDateFull(event.start)}
          {event.end !== event.start && ` — ${fmtDateFull(event.end)}`}
          {' · '}
          <span className={`chip ${typeChip(event.type)}`} style={{ marginLeft: 4 }}>
            {typeLabel(event.type)}
          </span>
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.55, marginBottom: 14 }}>
          {event.summary}
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
          {[
            { label: '예상 GMV 증가', value: event.gmv, color: 'var(--success)' },
            { label: '검색량 변화', value: event.search, color: 'var(--text)' },
            { label: 'D-Day', value: active ? '진행중' : dU >= 0 ? `D-${dU}` : `D+${Math.abs(dU)}`, color: 'var(--accent-text)' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn primary" onClick={(e) => { e.stopPropagation(); onOpen(event); }}>
            <Icon name="target" size={13} />액션 플랜 열기
          </button>
          <button className="btn" onClick={(e) => e.stopPropagation()}>
            <Icon name="package" size={13} />추천 품목
          </button>
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
}

// ---- EventCard ----
interface EventCardProps {
  event: MarketingEvent;
  onOpen: (e: MarketingEvent) => void;
  filter: string;
}

export function EventCard({ event, onOpen, filter }: EventCardProps) {
  const [hover, setHover] = useState(false);
  const dU = daysUntil(event.start);
  const active = isActive(event);

  const productsToShow = filter === 'all'
    ? event.products.slice(0, 3)
    : event.products.filter(p => p.category === filter).slice(0, 3);
  const displayProducts = productsToShow.length > 0 ? productsToShow : event.products.slice(0, 3);

  const cardStyle: CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
    overflow: 'hidden', cursor: 'pointer',
    transition: 'box-shadow 140ms, transform 140ms, border-color 140ms',
    ...(hover ? {
      borderColor: 'var(--border-strong)',
      boxShadow: '0 1px 2px oklch(0 0 0 / 0.04), 0 8px 20px oklch(0 0 0 / 0.06)',
      transform: 'translateY(-1px)',
    } : {}),
  };

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
          <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 4 }}>
            {event.title}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{event.summary}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--divider)' }}>
            {[
              { label: '기회점수', value: `${event.trendScore}`, color: event.trendScore >= 80 ? 'var(--accent-text)' : 'var(--text)', sub: '/100' },
              { label: '검색량', value: event.search, color: 'var(--success)' },
              { label: '예상 GMV', value: event.gmv, color: 'var(--success)' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums' }}>
                  {m.value}
                  {m.sub && <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontWeight: 400, marginLeft: 2 }}>{m.sub}</span>}
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

      <div style={{
        padding: '10px 16px', borderTop: '1px solid var(--divider)',
        background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
          <Icon name="checkCircle" size={12} />
          체크리스트 {event.checklist.filter(c => c.done).length}/{event.checklist.length}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {event.platforms.slice(0, 3).map(p => (
            <span key={p} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 4px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
              {PLATFORMS[p] || p}
            </span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn sm" onClick={(e) => { e.stopPropagation(); onOpen(event); }}>
          액션 플랜 보기 <Icon name="arrowRight" size={11} />
        </button>
      </div>
    </div>
  );
}

// ---- MiniItem ----
interface MiniItemProps {
  event: MarketingEvent;
  onOpen: (e: MarketingEvent) => void;
}

export function MiniItem({ event, onOpen }: MiniItemProps) {
  const [hover, setHover] = useState(false);
  const dU = daysUntil(event.start);
  const active = isActive(event);
  const date = new Date(event.start);

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
        <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', marginTop: 1 }}>
          {active ? '진행 중' : `D-${dU}`} · {typeLabel(event.type)}
        </div>
      </div>
    </div>
  );
}
