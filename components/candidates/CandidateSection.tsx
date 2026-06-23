'use client';

import React from 'react';
import Icon from '@/components/Icon';
import type { ProductCandidate } from '@/lib/types';

const URGENCY: Record<string, { label: string; bg: string; color: string }> = {
  high: { label: '높음', bg: 'oklch(0.94 0.06 145)', color: 'var(--success)' },
  mid:  { label: '보통', bg: 'var(--bg-subtle)', color: 'var(--text-muted)' },
  low:  { label: '낮음', bg: 'var(--bg-subtle)', color: 'var(--text-subtle)' },
};

interface Props {
  candidates: ProductCandidate[];
  onAdd: (c: ProductCandidate) => void;
  isInCart: (id: string) => boolean;
}

export default function CandidateSection({ candidates, onAdd, isInCart }: Props) {
  if (candidates.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {candidates.map(c => {
        const u = URGENCY[c.urgency] ?? URGENCY.mid;
        const inCart = isInCart(c.id);
        return (
          <div key={c.id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
                <span style={{ fontSize: 'var(--fs-2xs)', fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: u.bg, color: u.color }}>{u.label}</span>
                {c.estimated && <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-subtle)' }}>추정가</span>}
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-text)', marginBottom: 3 }}>{c.signalLabel}</div>
              <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.reason}</div>
              {c.sourceLink && (
                <a href={c.sourceLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Icon name="share" size={10} />기사 출처
                </a>
              )}
            </div>
            <button className={`btn sm ${inCart ? '' : 'primary'}`} disabled={inCart} onClick={() => onAdd(c)} style={{ flexShrink: 0 }}>
              {inCart ? <><Icon name="check" size={12} />담김</> : <><Icon name="plus" size={12} />담기</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
