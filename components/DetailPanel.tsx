'use client';

import React, { useState } from 'react';
import Icon from './Icon';
import { PlatformInsights } from './calendar/CalendarParts';
import { CATEGORIES, PLATFORMS, catColor, typeLabel, typeChip, fmtDateFull, daysUntil, isActive } from '@/lib/data';
import type { MarketingEvent } from '@/lib/types';

const urgencyStyle = (u: string) => ({
  high: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  mid: { background: 'var(--warning-bg)', color: 'oklch(0.48 0.15 75)' },
  low: { background: 'var(--bg-subtle)', color: 'var(--text-muted)' },
}[u] ?? {});

const urgencyLabel = (u: string) => ({ high: '긴급', mid: '중요', low: '여유' }[u] ?? u);

interface DetailPanelProps {
  event: MarketingEvent;
  onClose: () => void;
  initialTab?: 'plan' | 'products' | 'insights';
}

export default function DetailPanel({ event, onClose, initialTab = 'plan' }: DetailPanelProps) {
  const [tab, setTab] = useState<'plan' | 'products' | 'insights'>(initialTab);
  const [checked, setChecked] = useState<Record<number, boolean>>(
    Object.fromEntries(event.checklist.map((c, i) => [i, c.done]))
  );

  const toggle = (i: number) => setChecked(p => ({ ...p, [i]: !p[i] }));
  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = event.checklist.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const dU = daysUntil(event.start);
  const active = isActive(event);

  const subtabs = [
    { id: 'plan' as const, label: '액션 플랜', icon: 'target' },
    { id: 'products' as const, label: `추천 품목 (${event.products.length})`, icon: 'package' },
    { id: 'insights' as const, label: '실무 인사이트', icon: 'lightbulb' },
  ];

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.35)', zIndex: 50, animation: 'fadeIn 180ms var(--easing)' }}
        onClick={onClose}
      />
      <div className="detail-panel" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 540,
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)', zIndex: 51,
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 220ms var(--easing)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: catColor(event.type) }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span className={`chip ${typeChip(event.type)}`}>{typeLabel(event.type)}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                {fmtDateFull(event.start)}
                {event.end !== event.start && ` – ${fmtDateFull(event.end)}`}
              </span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text)', marginBottom: 4 }}>
              {event.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{event.summary}</div>
          </div>
          <button className="btn ghost icon sm" onClick={onClose}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Sub tabs */}
        <div style={{ display: 'flex', padding: '0 20px', borderBottom: '1px solid var(--border)', gap: 2 }}>
          {subtabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 12px', fontSize: 12.5, fontWeight: 500,
                color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <Icon name={t.icon} size={12} />{t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {tab === 'plan' && (
            <>
              {/* Metrics */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                  <Icon name="trendUp" size={11} />기회 지표
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: '기회점수', value: `${event.trendScore}`, sub: '/100', color: 'var(--accent-text)' },
                    { label: '검색량', value: event.search, color: 'var(--success)' },
                    { label: '예상 GMV', value: event.gmv, color: 'var(--success)' },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: m.color, fontVariantNumeric: 'tabular-nums', marginTop: 3 }}>
                        {m.value}
                        {m.sub && <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 400 }}>{m.sub}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="checkCircle" size={11} />실행 체크리스트
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {doneCount}/{total} · {pct}%
                  </div>
                </div>
                <div style={{ height: 4, background: 'var(--bg-sunken)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 220ms' }} />
                </div>
                <div style={{ position: 'relative', paddingLeft: 24 }}>
                  <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
                  {event.checklist.map((item, i) => {
                    const isDone = checked[i];
                    const isActiveItem = !isDone && item.d <= 0 && item.d >= -3;
                    return (
                      <div key={i} style={{ position: 'relative', paddingBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div
                          style={{
                            position: 'absolute', left: -23, top: 3,
                            width: 20, height: 20, borderRadius: '50%',
                            background: isDone ? 'var(--success)' : isActiveItem ? 'var(--accent)' : 'var(--surface)',
                            border: `2px solid ${isDone ? 'var(--success)' : isActiveItem ? 'var(--accent)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, cursor: 'pointer',
                            color: isDone || isActiveItem ? '#fff' : undefined,
                          }}
                          onClick={() => toggle(i)}
                        >
                          {isDone && <Icon name="check" size={10} stroke={3} />}
                          {isActiveItem && !isDone && <Icon name="alert" size={10} stroke={2.5} />}
                        </div>
                        <div style={{ minWidth: 50, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', paddingTop: 2 }}>
                          {item.d === 0 ? 'D-DAY' : item.d > 0 ? `D+${item.d}` : `D${item.d}`}
                        </div>
                        <div style={{
                          flex: 1, fontSize: 13, paddingTop: 1, lineHeight: 1.5,
                          color: isDone ? 'var(--text-subtle)' : 'var(--text)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                          {item.task}
                          {isActiveItem && !isDone && (
                            <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 600, color: 'var(--danger)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                              지금 해야 함
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Platforms & categories */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                  <Icon name="tag" size={11} />연결 정보
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginRight: 4 }}>플랫폼:</span>
                  {event.platforms.length > 0 ? event.platforms.map(p => (
                    <span key={p} className="chip">{PLATFORMS[p] || p}</span>
                  )) : <span style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>해당 없음</span>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginRight: 4 }}>카테고리:</span>
                  {event.categories.length > 0 ? event.categories.map(c => {
                    const cat = CATEGORIES.find(x => x.id === c);
                    return <span key={c} className="chip">{cat?.label || c}</span>;
                  }) : <span style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>전체</span>}
                </div>
              </div>
            </>
          )}

          {tab === 'products' && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                이 이벤트에서 특히 잘 팔릴 가능성이 높은 품목을 기회점수·검색량 기반으로 제안합니다.
              </div>
              {event.products.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 6,
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-subtle)', flexShrink: 0,
                  }}>
                    <Icon name="box" size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        ...urgencyStyle(p.urgency),
                      }}>
                        {urgencyLabel(p.urgency)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.reason}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="btn sm"><Icon name="pen" size={11} />카피 생성</button>
                      <button className="btn sm"><Icon name="layout" size={11} />상세페이지</button>
                    </div>
                  </div>
                </div>
              ))}
              {event.products.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 12.5, color: 'var(--text-subtle)' }}>
                  이 이벤트는 품목별 제안보다는 브랜드 이미지 차원에서 접근하는 것을 추천합니다.
                </div>
              )}
            </div>
          )}

          {tab === 'insights' && (
            <div style={{ marginBottom: 22 }}>
              <div style={{
                padding: 14, borderRadius: 10,
                background: 'linear-gradient(135deg, oklch(0.97 0.03 75) 0%, var(--surface) 100%)',
                border: '1px solid var(--cat-season-border)',
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, color: 'var(--cat-season)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  실무 인사이트
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {event.pro}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg-subtle)' }}>
          <button className="btn sm ghost"><Icon name="share" size={12} />공유</button>
          <div style={{ flex: 1 }} />
          <button className="btn sm"><Icon name="copy" size={12} />복제</button>
          <button className="btn primary sm">
            <Icon name="plus" size={12} />내 계획에 추가
          </button>
        </div>
      </div>
    </>
  );
}
