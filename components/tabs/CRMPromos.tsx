'use client';

import React, { useState } from 'react';
import { useCalendarSelections } from '@/hooks/useCalendarSelections';
import { LIFECYCLE_RECOS, CATEGORIES } from '@/lib/data';
import type { LifecycleReco, LifecycleTrigger } from '@/lib/types';

const TRIGGER_LABELS: Record<LifecycleTrigger, string> = {
  'pre-birth': '출산 준비 (임신 후기)',
  'newborn':   '신생아 (0-3개월)',
  'infant':    '영아 (3-12개월)',
  'toddler':   '유아 (1-3세)',
  'preschool': '미취학 (3-7세)',
  'always-on': '상시 추천',
};

const TRIGGER_ORDER: LifecycleTrigger[] = [
  'pre-birth', 'newborn', 'infant', 'toddler', 'preschool', 'always-on',
];

// Left-border accent colors per trigger — use CSS variable fallbacks
const TRIGGER_BORDER: Record<LifecycleTrigger, string> = {
  'pre-birth': 'oklch(0.62 0.18 25)',   // warm coral — matches var(--accent) typical
  'newborn':   'oklch(0.55 0.15 145)',  // soft green
  'infant':    'oklch(0.60 0.15 75)',   // amber
  'toddler':   'oklch(0.55 0.15 220)',  // blue
  'preschool': 'oklch(0.58 0.16 290)',  // purple
  'always-on': 'oklch(0.50 0.00 0)',    // neutral gray
};

// ── 트리거 배지 ────────────────────────────────────────────────
function TriggerBadge({ trigger }: { trigger: LifecycleTrigger }) {
  const color = TRIGGER_BORDER[trigger];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 999,
      fontSize: 'var(--fs-2xs)', fontWeight: 600, flexShrink: 0,
      background: 'var(--bg-subtle)',
      color: color,
      border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
    }}>
      {TRIGGER_LABELS[trigger]}
    </span>
  );
}

// ── 기획전 카드 ───────────────────────────────────────────────
function RecoCard({ reco }: { reco: LifecycleReco }) {
  const { toggle, isSelected } = useCalendarSelections();
  const [expanded, setExpanded] = useState(false);
  const selected = isSelected(reco.id);
  const borderColor = TRIGGER_BORDER[reco.trigger];

  const cats = CATEGORIES.filter(c => reco.categories.includes(c.id)).slice(0, 3);
  const extraCats = reco.categories.length - cats.length;

  return (
    <div style={{
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${borderColor}`,
      overflow: 'hidden',
    }}>
      {/* 카드 헤더 — 클릭 시 펼치기/접기 */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(v => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v); }}
        style={{
          padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12,
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        {/* 본문 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
            <TriggerBadge trigger={reco.trigger} />
            <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)' }}>
              {reco.title}
            </span>
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 6 }}>
            {reco.concept}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {cats.map(c => (
              <span key={c.id} style={{
                fontSize: 'var(--fs-xs)', padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)', color: 'var(--text-subtle)',
                border: '1px solid var(--border)',
              }}>
                {c.label}
              </span>
            ))}
            {extraCats > 0 && (
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>
                +{extraCats}
              </span>
            )}
            <span style={{
              fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)',
              marginLeft: 4,
            }}>
              추천상품 {reco.products.length}종
            </span>
          </div>
        </div>

        {/* 우측 액션 */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); toggle(reco.id); }}
            style={{
              padding: '5px 12px', borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--fs-sm)', fontWeight: 500, cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: selected ? 'var(--accent-bg)' : 'var(--bg-subtle)',
              color: selected ? 'var(--accent-text)' : 'var(--text-muted)',
              border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
              transition: 'background 0.15s',
            }}
          >
            {selected ? '추가됨 ✓' : '캘린더에 추가'}
          </button>
          <span style={{
            fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
            display: 'inline-block',
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* 펼쳐진 상세 영역 */}
      {expanded && (
        <div style={{
          padding: '0 14px 16px',
          borderTop: '1px solid var(--border)',
        }}>
          {/* 추천 상품 */}
          {reco.products.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-subtle)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
              }}>
                추천 상품
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reco.products.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: 'var(--radius-sm)',
                      background: p.urgency === 'high'
                        ? `color-mix(in oklch, ${borderColor} 20%, var(--surface))`
                        : 'var(--surface)',
                      border: `1px solid color-mix(in oklch, ${borderColor} 25%, transparent)`,
                      fontSize: 'var(--fs-2xs)', fontWeight: 700,
                      color: borderColor,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.reason}
                      </div>
                    </div>
                    {p.urgency === 'high' && (
                      <span style={{
                        fontSize: 'var(--fs-2xs)', padding: '1px 6px',
                        borderRadius: 999, flexShrink: 0,
                        background: `color-mix(in oklch, ${borderColor} 15%, var(--surface))`,
                        color: borderColor,
                        border: `1px solid color-mix(in oklch, ${borderColor} 30%, transparent)`,
                        fontWeight: 600,
                      }}>
                        핵심
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 체크리스트 */}
          {reco.checklist.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-subtle)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
              }}>
                실행 체크리스트
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {reco.checklist.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    fontSize: 'var(--fs-sm)', color: 'var(--text)',
                  }}>
                    <span style={{
                      fontSize: 'var(--fs-2xs)', color: 'var(--text-subtle)',
                      minWidth: 40, flexShrink: 0, marginTop: 2, fontVariantNumeric: 'tabular-nums',
                    }}>
                      {item.d === 0 ? 'D-Day' : item.d > 0 ? `D+${item.d}` : `D${item.d}`}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro 팁 */}
          {reco.pro && (
            <div style={{
              marginTop: 14, padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: `color-mix(in oklch, ${borderColor} 8%, var(--surface))`,
              border: `1px solid color-mix(in oklch, ${borderColor} 20%, var(--border))`,
            }}>
              <div style={{
                fontSize: 'var(--fs-xs)', fontWeight: 700, color: borderColor,
                marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Pro Tip
              </div>
              <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {reco.pro}
              </div>
            </div>
          )}

          {/* 플랫폼 팁 */}
          {reco.platformTips && Object.keys(reco.platformTips).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-subtle)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
              }}>
                플랫폼 전술
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(reco.platformTips).map(([platform, insight]) => (
                  <div key={platform} style={{
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      fontSize: 'var(--fs-xs)', fontWeight: 700,
                      color: 'var(--text)', marginBottom: 3,
                      textTransform: 'capitalize',
                    }}>
                      {platform === 'momq' ? '맘큐' : platform}
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
                      {insight.tip}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 'var(--fs-2xs)', padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        color: 'var(--text-subtle)',
                      }}>
                        {insight.action}
                      </span>
                      <span style={{
                        fontSize: 'var(--fs-2xs)', padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        color: 'var(--text-subtle)',
                      }}>
                        {insight.metric}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 트리거 그룹 섹션 ──────────────────────────────────────────
function TriggerGroup({ trigger, recos }: { trigger: LifecycleTrigger; recos: LifecycleReco[] }) {
  if (recos.length === 0) return null;
  const borderColor = TRIGGER_BORDER[trigger];

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
        paddingBottom: 8, borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          width: 4, height: 18, borderRadius: 2,
          background: borderColor, flexShrink: 0,
          display: 'inline-block',
        }} />
        <span style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--text)' }}>
          {TRIGGER_LABELS[trigger]}
        </span>
        <span style={{
          fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)',
          padding: '1px 7px', borderRadius: 999,
          background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        }}>
          {recos.length}건
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {recos.map(r => <RecoCard key={r.id} reco={r} />)}
      </div>
    </section>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
export default function CRMPromos() {
  // recos grouped by trigger
  const grouped = TRIGGER_ORDER.reduce<Record<LifecycleTrigger, LifecycleReco[]>>(
    (acc, t) => {
      acc[t] = LIFECYCLE_RECOS.filter(r => r.trigger === t);
      return acc;
    },
    {} as Record<LifecycleTrigger, LifecycleReco[]>,
  );

  return (
    <div style={{ padding: '20px 28px 60px' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 'var(--fs-xl)', fontWeight: 700,
          letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4,
        }}>
          CRM 기획전
        </div>
        <div style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)' }}>
          고객 라이프사이클 기반 상시 기획전 — 시즌과 무관하게 타겟 고객에게 맞춤 제안
        </div>
      </div>

      {/* 트리거 그룹 목록 */}
      {TRIGGER_ORDER.map(t => (
        <TriggerGroup key={t} trigger={t} recos={grouped[t]} />
      ))}
    </div>
  );
}
