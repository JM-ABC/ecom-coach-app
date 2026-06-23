'use client';

import React, { useState } from 'react';
import Icon from '@/components/Icon';
import PromoPlanPanel from '@/components/PromoPlanPanel';
import { buildEventFromCandidates } from '@/lib/candidates';
import type { ProductCandidate, MarketingEvent } from '@/lib/types';

interface Props {
  items: ProductCandidate[];
  onAddToCalendar: (ev: MarketingEvent) => void;
  onClear: () => void;
}

function todayIso(): string { return new Date().toISOString().slice(0, 10); }

export default function CandidateCartBar({ items, onAddToCalendar, onClear }: Props) {
  const [planEvent, setPlanEvent] = useState<MarketingEvent | null>(null);
  const [added, setAdded] = useState(false);
  if (items.length === 0) return null;

  const handleCalendar = () => {
    onAddToCalendar(buildEventFromCandidates(items, todayIso()));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div style={{ position: 'sticky', bottom: 12, marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--accent-border)', boxShadow: 'var(--shadow-md)' }}>
        <Icon name="sparkles" size={14} />
        <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text)' }}>담은 후보 {items.length}</span>
        <button className="btn ghost sm" onClick={onClear} style={{ fontSize: 'var(--fs-xs)' }}>비우기</button>
        <div style={{ flex: 1 }} />
        <button className="btn sm" onClick={handleCalendar}>
          <Icon name={added ? 'check' : 'plus'} size={12} />{added ? '추가됨' : '캘린더 추가'}
        </button>
        <button className="btn primary sm" onClick={() => setPlanEvent(buildEventFromCandidates(items, todayIso()))}>
          <Icon name="sparkles" size={12} />AI 기획서로
        </button>
      </div>
      {planEvent && <PromoPlanPanel event={planEvent} onClose={() => setPlanEvent(null)} />}
    </>
  );
}
