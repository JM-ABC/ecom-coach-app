'use client';

import React, { useState, useMemo } from 'react';
import { useCalendarSelections } from '@/hooks/useCalendarSelections';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { EVENTS, CATEGORIES, EVENT_TYPES, AUTO_DISPLAY_TYPES, catColor, typeLabel, fmtDate, daysUntil, isActive } from '@/lib/data';
import type { MarketingEvent, EventType } from '@/lib/types';
import DetailPanel from '@/components/DetailPanel';
import PromoPlanPanel from '@/components/PromoPlanPanel';
import { EventHero, EventCard as FocusEventCard } from '@/components/calendar/CalendarParts';

// ── 유틸 ────────────────────────────────────────────────────
function genId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyDraft() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: '',
    type: 'season' as EventType,
    start: today,
    end: today,
    categories: [] as string[],
    summary: '',
  };
}


// ── 타입 배지 ───────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999,
      fontSize: 'var(--fs-2xs)', fontWeight: 600, flexShrink: 0,
      background: `color-mix(in oklch, ${catColor(type)} 15%, var(--surface))`,
      color: catColor(type),
      border: `1px solid color-mix(in oklch, ${catColor(type)} 30%, transparent)`,
    }}>
      {typeLabel(type)}
    </span>
  );
}

// ── 이벤트 카드 ─────────────────────────────────────────────
function SeasonEventCard({ event, onOpen }: { event: MarketingEvent; onOpen: (e: MarketingEvent) => void }) {
  const { toggle, isSelected } = useCalendarSelections();
  const isAuto = (AUTO_DISPLAY_TYPES as readonly string[]).includes(event.type);
  const selected = isSelected(event.id);

  const cats = CATEGORIES.filter(c => event.categories.includes(c.id)).slice(0, 3);

  return (
    <div
      onClick={() => onOpen(event)}
      style={{
        padding: '12px 14px', borderRadius: 'var(--radius-md)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        cursor: 'pointer', transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* 색상 도트 */}
      <span style={{
        width: 10, height: 10, borderRadius: '50%',
        background: catColor(event.type), flexShrink: 0, marginTop: 4,
      }} />

      {/* 본문 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' as const, marginBottom: 3 }}>
          <TypeBadge type={event.type} />
          <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)' }}>
            {event.title}
          </span>
        </div>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 5 }}>
          {fmtDate(event.start)} ~ {fmtDate(event.end)}
        </div>
        {cats.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
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
            {event.categories.length > 3 && (
              <span style={{
                fontSize: 'var(--fs-xs)', padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-subtle)',
              }}>
                +{event.categories.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 추가 버튼 영역 */}
      <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        {isAuto ? (
          <span style={{
            fontSize: 'var(--fs-xs)', padding: '4px 10px',
            borderRadius: 'var(--radius-sm)', fontWeight: 500,
            background: 'var(--bg-subtle)', color: 'var(--text-subtle)',
            border: '1px solid var(--border)',
            display: 'inline-block', whiteSpace: 'nowrap' as const,
          }}>
            캘린더 자동 표시
          </span>
        ) : (
          <button
            onClick={() => toggle(event.id)}
            style={{
              padding: '5px 12px', borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--fs-sm)', fontWeight: 500, cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
              background: selected ? 'var(--accent-bg)' : 'var(--bg-subtle)',
              color: selected ? 'var(--accent-text)' : 'var(--text-muted)',
              border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
              transition: 'background 0.15s',
            }}
          >
            {selected ? '추가됨 ✓' : '캘린더에 추가'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── 직접 등록 폼 ───────────────────────────────────────────
function DirectRegisterSection() {
  const { events: customEvents, add, remove } = useCustomEvents();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [catInput, setCatInput] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'var(--bg-subtle)',
    fontSize: 'var(--fs-base)', color: 'var(--text)', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-subtle)',
    textTransform: 'uppercase' as const, letterSpacing: '0.04em',
    marginBottom: 4, display: 'block',
  };

  const handleSubmit = () => {
    if (!draft.title.trim()) { alert('이벤트 제목을 입력하세요.'); return; }
    const categories = catInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    add({
      id: genId(),
      source: 'custom',
      title: draft.title,
      type: draft.type,
      start: draft.start,
      end: draft.end,
      categories,
      platforms: [],
      summary: draft.summary,
      trendScore: 50,
      search: '+0%',
      gmv: '+0%',
      products: [],
      checklist: [],
      pro: '',
    });
    setDraft(emptyDraft());
    setCatInput('');
    setOpen(false);
  };

  return (
    <div style={{ marginTop: 32 }}>
      {/* 헤더 토글 */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)',
          cursor: 'pointer', textAlign: 'left' as const,
        }}
      >
        <span>직접 이벤트 등록 +</span>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 400 }}>
          {open ? '접기 ▲' : '펼치기 ▼'}
        </span>
      </button>

      {open && (
        <div style={{
          marginTop: 8, padding: '18px 16px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          background: 'var(--surface)',
        }}>
          {/* 폼 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>이벤트명 *</label>
              <input
                style={inputStyle}
                placeholder="예: 여름 시즌 기획전"
                value={draft.title}
                onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>유형</label>
              <select
                style={inputStyle}
                value={draft.type}
                onChange={e => setDraft(p => ({ ...p, type: e.target.value as EventType }))}
              >
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>시작일</label>
              <input
                type="date" style={inputStyle} value={draft.start}
                onChange={e => setDraft(p => ({ ...p, start: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>종료일</label>
              <input
                type="date" style={inputStyle} value={draft.end}
                onChange={e => setDraft(p => ({ ...p, end: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>카테고리 (쉼표 구분)</label>
            <input
              style={inputStyle}
              placeholder="예: b_diaper, b_wipe"
              value={catInput}
              onChange={e => setCatInput(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>요약</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 60 }}
              placeholder="이벤트 핵심 기회를 한 줄로 설명하세요."
              value={draft.summary}
              onChange={e => setDraft(p => ({ ...p, summary: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setOpen(false); setDraft(emptyDraft()); setCatInput(''); }}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', background: 'var(--bg-subtle)',
                fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--accent-border)', background: 'var(--accent-bg)',
                fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--accent-text)', cursor: 'pointer',
              }}
            >
              등록
            </button>
          </div>
        </div>
      )}

      {/* 직접 등록된 이벤트 목록 */}
      {customEvents.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 8 }}>
            직접 등록된 이벤트 {customEvents.length}건
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {customEvents.map(ev => (
              <div key={ev.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: catColor(ev.type), flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text)' }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 1 }}>
                    {ev.start} ~ {ev.end} · {typeLabel(ev.type)}
                  </div>
                </div>
                <button
                  onClick={() => { if (confirm(`"${ev.title}" 이벤트를 삭제할까요?`)) remove(ev.id); }}
                  style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)', background: 'transparent',
                    fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', cursor: 'pointer',
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
export default function SeasonPromos() {
  const [catFilter, setCatFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<MarketingEvent | null>(null);
  const [promoPlanEvent, setPromoPlanEvent] = useState<MarketingEvent | null>(null);

  const catOptions = useMemo(() => [
    { id: 'all', label: '전체 카테고리' },
    ...CATEGORIES.filter(c => c.id !== 'all'),
  ], []);

  // 이번 주 주요 기획전: 활성 중이거나 14일 이내 시작, trendScore 높은 순
  const spotlight = useMemo(() => {
    return EVENTS
      .filter(e => {
        const d = daysUntil(e.start);
        return isActive(e) || (d >= 0 && d <= 14);
      })
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 4);
  }, []);

  const filtered = useMemo(() => {
    return [...EVENTS]
      .filter(ev => daysUntil(ev.end) >= 0 && daysUntil(ev.start) <= 62)
      .filter(ev => catFilter === 'all' || ev.categories.includes(catFilter))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [catFilter]);

  return (
    <div className="tab-page">
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>
          시즌 프로모션
        </div>
        <div style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)' }}>
          연간 마케팅 이벤트를 탐색하고 캘린더에 추가하세요.
        </div>
      </div>

      {/* ── 이번 주 주요 기획전 ── */}
      {spotlight.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-subtle)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
            지금 주목할 기획전
          </div>

          {/* 히어로 카드 */}
          {(() => {
            const [hero, ...rest] = spotlight;
            if (!hero) return null;
            const openEvent = (e: MarketingEvent) => setSelectedEvent(e);
            return (
              <>
                <EventHero
                  event={hero}
                  onOpen={openEvent}
                  onOpenPromoPlan={setPromoPlanEvent}
                />
                {rest.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 10 }}>
                    {rest.map(ev => (
                      <FocusEventCard
                        key={ev.id}
                        event={ev}
                        onOpen={openEvent}
                        onOpenPromoPlan={setPromoPlanEvent}
                        filter="all"
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </section>
      )}

      {/* ── Section 1: EVENTS 브라우징 ── */}
      <section>
        {/* 필터 바 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const, marginBottom: 16 }}>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-subtle)',
              fontSize: 'var(--fs-sm)', color: 'var(--text)', cursor: 'pointer',
              outline: 'none',
            }}
          >
            {catOptions.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-subtle)' }}>
            {filtered.length}건
          </span>
        </div>

        {/* 이벤트 목록 */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(ev => (
              <SeasonEventCard key={ev.id} event={ev} onOpen={setSelectedEvent} />
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px 24px', textAlign: 'center',
            background: 'var(--surface)', border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--fs-base)', color: 'var(--text-subtle)',
          }}>
            조건에 맞는 이벤트가 없습니다.
          </div>
        )}
      </section>

      {/* ── Section 2: 직접 등록 ── */}
      <DirectRegisterSection />

      {/* ── 상세 패널 ── */}
      {selectedEvent && (
        <DetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onOpenPromoPlan={(e) => { setSelectedEvent(null); setPromoPlanEvent(e); }}
        />
      )}
      {promoPlanEvent && (
        <PromoPlanPanel
          event={promoPlanEvent}
          onClose={() => setPromoPlanEvent(null)}
        />
      )}
    </div>
  );
}
