'use client';

import React, { useState, useMemo, CSSProperties } from 'react';
import Icon from '@/components/Icon';
import { EventHero, EventCard, MiniItem } from './CalendarParts';
import DetailPanel from '@/components/DetailPanel';
import {
  EVENTS, CATEGORIES, CATEGORY_GROUPS, EVENT_TYPES,
  TODAY, catColor, typeLabel, fmtDate, daysUntil, isActive,
} from '@/lib/data';
import type { MarketingEvent, ViewMode } from '@/lib/types';
import { useWeatherEvents } from '@/hooks/useWeatherEvents';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { useTrendData } from '@/hooks/useTrendData';
import type { TrendHint } from './CalendarParts';
import type { CategoryTrend } from '@/app/api/trends/route';

// ---- FilterBar ----
function FilterBar({ category, setCategory, filteredLen, totalLen }: {
  category: string;
  setCategory: (c: string) => void;
  filteredLen: number;
  totalLen: number;
}) {
  const catObj = CATEGORIES.find(c => c.id === category);
  const [openGroup, setOpenGroup] = useState<string | null>(catObj?.parent ?? null);
  const activeGroup = category === 'all' ? 'all' : catObj?.parent;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 10px', marginBottom: 12,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, flexWrap: 'wrap' as const,
    }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-subtle)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginRight: 2, paddingLeft: 4 }}>
        카테고리
      </span>
      {CATEGORY_GROUPS.map(g => (
        <button
          key={g.id}
          onClick={() => {
            if (g.id === 'all') { setCategory('all'); setOpenGroup(null); }
            else { setOpenGroup(openGroup === g.id ? null : g.id); }
          }}
          style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            color: activeGroup === g.id ? 'var(--text)' : 'var(--text-muted)',
            border: activeGroup === g.id ? '1px solid var(--border)' : '1px solid transparent',
            background: activeGroup === g.id ? 'var(--bg-subtle)' : 'transparent',
            cursor: 'pointer', transition: 'all 120ms',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {g.label}
          {g.id !== 'all' && <Icon name={openGroup === g.id ? 'chevUp' : 'chevDown'} size={10} />}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontVariantNumeric: 'tabular-nums', paddingRight: 4 }}>
        {category === 'all' ? `${totalLen}건` : `${filteredLen}건 필터됨`}
      </span>
      {openGroup && (
        <div style={{ flexBasis: '100%', display: 'flex', flexWrap: 'wrap' as const, gap: 6, paddingTop: 8, marginTop: 4, borderTop: '1px dashed var(--border)' }}>
          {CATEGORY_GROUPS.find(g => g.id === openGroup)?.items.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              style={{
                padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
                color: category === c.id ? 'var(--accent-text)' : 'var(--text-muted)',
                border: '1px solid ' + (category === c.id ? 'var(--accent-border)' : 'var(--border)'),
                background: category === c.id ? 'var(--accent-bg)' : 'var(--bg-subtle)',
                cursor: 'pointer', whiteSpace: 'nowrap' as const,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- 트렌드 힌트 헬퍼 ----
function getEventTrendHint(event: MarketingEvent, byKey: Record<string, CategoryTrend>): TrendHint | undefined {
  let best: TrendHint | undefined;
  for (const catId of event.categories) {
    const t = byKey[catId];
    if (!t) continue;
    if (!best || Math.abs(t.changeVsPrevWeek) > Math.abs(best.change)) {
      best = { change: t.changeVsPrevWeek, keyword: t.title };
    }
  }
  return best;
}

// ---- 동적 인사이트 카드 ----
function DynamicInsightCard({ thisWeek, upcoming, trendByKey, weatherEvents }: {
  thisWeek: MarketingEvent[];
  upcoming: MarketingEvent[];
  trendByKey: Record<string, CategoryTrend>;
  weatherEvents: MarketingEvent[];
}) {
  const topTrends = Object.values(trendByKey)
    .filter(t => Math.abs(t.changeVsPrevWeek) >= 5)
    .sort((a, b) => b.changeVsPrevWeek - a.changeVsPrevWeek)
    .slice(0, 3);

  const activeWeather = weatherEvents.filter(e => {
    const s = new Date(e.start); const en = new Date(e.end);
    return s <= TODAY && en >= TODAY;
  });

  const topEvent = [...thisWeek, ...upcoming]
    .sort((a, b) => b.trendScore - a.trendScore)[0];

  const hasTrendData = topTrends.length > 0;

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon name="lightbulb" size={14} stroke={2.2} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>이번 주 인사이트</span>
        {hasTrendData && (
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            실시간 연동
          </span>
        )}
      </div>

      {activeWeather.length > 0 && (
        <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 8, background: 'oklch(0.96 0.025 220)', border: '1px solid oklch(0.88 0.05 220)' }}>
          {activeWeather.map(w => (
            <div key={w.id} style={{ fontSize: 12.5, color: 'oklch(0.38 0.1 220)', lineHeight: 1.5 }}>
              <strong>{w.title}</strong> — {w.summary}
            </div>
          ))}
        </div>
      )}

      {hasTrendData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {topTrends.map(t => (
            <div key={t.ourKey} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, minWidth: 28,
                color: t.changeVsPrevWeek > 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                {t.changeVsPrevWeek > 0 ? '↑' : '↓'} {t.changeVsPrevWeek > 0 ? '+' : ''}{t.changeVsPrevWeek}%
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500 }}>{t.title}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>전주 대비 검색량</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
          네이버 트렌드 데이터 로딩 중...
        </div>
      )}

      {topEvent && (
        <div style={{ paddingTop: 10, borderTop: '1px solid var(--divider)', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          지금 집중할 것: <strong style={{ color: 'var(--text)' }}>{topEvent.title}</strong>
          {' '}(기회점수 {topEvent.trendScore})
        </div>
      )}
    </div>
  );
}

// ---- FocusView ----
function FocusView({ hero, thisWeek, upcoming, filter, onOpen, trendByKey, weatherEvents }: {
  hero: MarketingEvent | undefined;
  thisWeek: MarketingEvent[];
  upcoming: MarketingEvent[];
  filter: string;
  onOpen: (e: MarketingEvent, tab?: 'plan' | 'products' | 'insights') => void;
  trendByKey: Record<string, CategoryTrend>;
  weatherEvents: MarketingEvent[];
}) {
  const upcomingNotActive = upcoming.filter(e => e.id !== hero?.id);
  const thisWeekFiltered = thisWeek.filter(e => e.id !== hero?.id);

  return (
    <div className="focus-grid" style={{ gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {hero && <EventHero event={hero} onOpen={onOpen} trendHint={getEventTrendHint(hero, trendByKey)} />}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 2px' }}>
            <Icon name="flag" size={14} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>이번 주 핵심</span>
            <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{thisWeekFiltered.length} events</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {thisWeekFiltered.length > 0 ? (
              thisWeekFiltered.map(e => <EventCard key={e.id} event={e} onOpen={onOpen} filter={filter} trendHint={getEventTrendHint(e, trendByKey)} />)
            ) : (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 10 }}>
                이번 주에 해당하는 이벤트가 없습니다.
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 2px' }}>
            <Icon name="calendar" size={14} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>다음 4주</span>
            <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{upcomingNotActive.slice(0, 5).length} events</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingNotActive.slice(0, 5).map(e => (
              <EventCard key={e.id} event={e} onOpen={onOpen} filter={filter} trendHint={getEventTrendHint(e, trendByKey)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <DynamicInsightCard
          thisWeek={thisWeek}
          upcoming={upcoming}
          trendByKey={trendByKey}
          weatherEvents={weatherEvents}
        />

        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Icon name="calendar" size={14} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>다가오는 기회</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcomingNotActive.slice(0, 8).map(e => (
              <MiniItem key={e.id} event={e} onOpen={onOpen} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ---- GridView ----
function GridView({ year, monthIdx, monthOffset, setMonthOffset, events, onOpen }: {
  year: number; monthIdx: number; monthOffset: number;
  setMonthOffset: (n: number) => void;
  events: MarketingEvent[];
  onOpen: (e: MarketingEvent) => void;
}) {
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const weekdays = ['일','월','화','수','목','금','토'];
  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const getEvents = (day: number) => {
    const ds = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(ds);
    return events.filter(e => {
      const s = new Date(e.start); const en = new Date(e.end);
      return date >= s && date <= en;
    });
  };

  const isToday = (d: number) => d === TODAY.getDate() && monthIdx === TODAY.getMonth() && year === TODAY.getFullYear();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button className="btn icon sm" onClick={() => setMonthOffset(monthOffset - 1)}>
          <Icon name="chevLeft" size={14} />
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', minWidth: 110 }}>
          {year}년 {months[monthIdx]}
        </div>
        <button className="btn icon sm" onClick={() => setMonthOffset(monthOffset + 1)}>
          <Icon name="chevRight" size={14} />
        </button>
        <button className="btn sm" onClick={() => setMonthOffset(0)}>오늘</button>
      </div>
      <div className="grid-view-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {weekdays.map((w, i) => (
            <div key={w} style={{
              padding: '8px 6px', fontSize: 11, fontWeight: 500,
              textTransform: 'uppercase' as const, letterSpacing: '0.04em',
              color: i === 0 ? 'var(--danger)' : i === 6 ? 'var(--cat-platform)' : 'var(--text-subtle)',
              textAlign: 'center' as const,
            }}>
              {w}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(96px, auto)' }}>
          {cells.map((day, i) => {
            const dayEvents = day ? getEvents(day) : [];
            return (
              <div key={i} className="grid-view-cell" style={{
                padding: 6, borderRight: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)',
                display: 'flex', flexDirection: 'column', gap: 2,
                background: day === null ? 'var(--bg-subtle)' : isToday(day!) ? 'var(--accent-bg)' : 'var(--surface)',
              }}>
                {day && (
                  <>
                    <div className="grid-view-day-num" style={{
                      fontSize: 11.5, fontWeight: 500, fontVariantNumeric: 'tabular-nums',
                      padding: '1px 4px', borderRadius: 4, alignSelf: 'flex-start',
                      color: 'var(--text-muted)',
                      ...(isToday(day) ? { background: 'var(--accent)', color: '#fff' } : {}),
                    }}>
                      {day}
                    </div>
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        className="grid-view-event-chip"
                        style={{
                          padding: '2px 4px', borderRadius: 3, fontSize: 10.5, fontWeight: 500,
                          lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          cursor: 'pointer', background: catColor(ev.type), color: '#fff', opacity: 0.92,
                        }}
                        onClick={() => onOpen(ev)}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ fontSize: 10, color: 'var(--text-subtle)', padding: '0 3px' }}>
                        +{dayEvents.length - 3}건
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 12, fontSize: 11.5, color: 'var(--text-muted)' }}>
        {Object.entries(EVENT_TYPES).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: catColor(k) }} />
            {v.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- TimelineView ----
const PX_PER_DAY = 22;
const LABEL_W = 160;

function TimelineView({ events, onOpen }: { events: MarketingEvent[]; onOpen: (e: MarketingEvent) => void }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // 오늘부터 올해 12월 말까지
  const start = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  const end = new Date(TODAY.getFullYear(), 11, 31);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalW = totalDays * PX_PER_DAY;

  const dayDiff = (iso: string) => {
    const d = new Date(iso);
    return Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const sorted = [...events]
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .filter(e => dayDiff(e.end) >= 0 && dayDiff(e.start) < totalDays);

  // 월 마커
  const monthMarkers: { day: number; label: string }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    if (d.getDate() === 1 || i === 0) monthMarkers.push({ day: i, label: `${d.getMonth() + 1}월` });
  }

  const todayDay = dayDiff(TODAY.toISOString().slice(0, 10));

  // 오늘로 스크롤
  const scrollToToday = () => {
    scrollRef.current?.scrollTo({ left: Math.max(0, todayDay * PX_PER_DAY - 80), behavior: 'smooth' });
  };

  // 월 이동
  const scrollToMonth = (month: number) => {
    const target = new Date(TODAY.getFullYear(), month, 1);
    const day = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    scrollRef.current?.scrollTo({ left: day * PX_PER_DAY, behavior: 'smooth' });
  };

  React.useEffect(() => { scrollToToday(); }, []);

  return (
    <div>
      {/* 월 이동 버튼 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <button className="btn sm ghost" onClick={scrollToToday} style={{ fontWeight: 600, color: 'var(--accent)' }}>오늘</button>
        <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />
        {Array.from({ length: 12 }, (_, i) => i).map(m => (
          <button key={m} className="btn sm ghost" onClick={() => scrollToMonth(m)}
            style={{ color: m === TODAY.getMonth() ? 'var(--accent)' : 'var(--text-muted)', fontWeight: m === TODAY.getMonth() ? 600 : 400 }}>
            {m + 1}월
          </button>
        ))}
      </div>

      {/* 타임라인 */}
      <div ref={scrollRef} className="timeline-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)' }}>
        <div style={{ width: LABEL_W + totalW, minWidth: LABEL_W + totalW }}>
          {/* 헤더 */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 2 }}>
            <div style={{ width: LABEL_W, flexShrink: 0, padding: '8px 14px', fontSize: 11, fontWeight: 500, color: 'var(--text-subtle)', textTransform: 'uppercase' as const, letterSpacing: '0.04em', borderRight: '1px solid var(--border)' }}>
              이벤트
            </div>
            <div style={{ position: 'relative', height: 32, flex: 1 }}>
              {monthMarkers.map(m => (
                <div key={m.day} style={{ position: 'absolute', left: m.day * PX_PER_DAY, padding: '8px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', whiteSpace: 'nowrap' as const }}>
                  {m.label}
                </div>
              ))}
              {/* 오늘 선 */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: todayDay * PX_PER_DAY, width: 2, background: 'var(--accent)' }} />
            </div>
          </div>

          {/* 이벤트 행 */}
          {sorted.map(ev => {
            const s = Math.max(0, dayDiff(ev.start));
            const e = Math.min(totalDays, dayDiff(ev.end) + 1);
            const barW = Math.max(PX_PER_DAY, (e - s) * PX_PER_DAY);

            return (
              <div key={ev.id} style={{ display: 'flex', borderBottom: '1px solid var(--divider)', minHeight: 40 }}>
                <div style={{ width: LABEL_W, flexShrink: 0, padding: '0 14px', fontSize: 12, fontWeight: 500, color: 'var(--text)', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor(ev.type), flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{ev.title}</span>
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: todayDay * PX_PER_DAY, width: 1, background: 'var(--accent)', opacity: 0.2 }} />
                  <div
                    onClick={() => onOpen(ev)}
                    style={{
                      position: 'absolute', top: 7, bottom: 7,
                      left: s * PX_PER_DAY, width: barW,
                      background: catColor(ev.type), borderRadius: 4,
                      padding: '0 8px', display: 'flex', alignItems: 'center',
                      color: '#fff', fontSize: 11, fontWeight: 500,
                      overflow: 'hidden', whiteSpace: 'nowrap' as const,
                      cursor: 'pointer', opacity: 0.9,
                    }}
                  >
                    {barW > 60 ? `${fmtDate(ev.start)} – ${fmtDate(ev.end)}` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Source Status Bar ----
function SourceStatusBar({ weatherStatus, customCount }: { weatherStatus: string; customCount: number }) {
  const dot = (ok: boolean, pending: boolean) => (
    <span style={{
      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
      background: ok ? 'var(--success)' : pending ? 'var(--text-subtle)' : 'oklch(0.65 0.15 75)',
    }} />
  );
  return (
    <div className="source-status-bar">
      <span className="source-status-label">데이터 소스</span>
      <span className="source-status-item">
        {dot(true, false)}<span>기본 {EVENTS.length}건</span>
      </span>
      <span className="source-status-item">
        {dot(weatherStatus === 'ok', weatherStatus === 'loading')}
        <span>날씨 {weatherStatus === 'ok' ? '연동됨' : weatherStatus === 'loading' ? '로딩 중' : weatherStatus === 'no-api-key' ? 'API키 미설정' : '오류'}</span>
      </span>
      <span className="source-status-item">
        {dot(customCount > 0, false)}<span>직접 {customCount}건</span>
      </span>
    </div>
  );
}

// ---- Main MarketingCalendar ----
export default function MarketingCalendar() {
  const [view, setView] = useState<ViewMode>('focus');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<MarketingEvent | null>(null);
  const [selectedTab, setSelectedTab] = useState<'plan' | 'products' | 'insights'>('plan');

  const openPanel = (e: MarketingEvent, tab: 'plan' | 'products' | 'insights' = 'plan') => {
    setSelected(e);
    setSelectedTab(tab);
  };

  const exportCSV = () => {
    const header = ['제목', '타입', '시작일', '종료일', '요약', '트렌드점수', '검색량변화', 'GMV변화'];
    const rows = filteredEvents.map(e => [
      e.title, e.type, e.start, e.end,
      `"${e.summary.replace(/"/g, '""')}"`,
      e.trendScore, e.search, e.gmv,
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `marketing-calendar-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };
  const [monthOffset, setMonthOffset] = useState(0);

  const weatherState = useWeatherEvents();
  const { events: customEvents } = useCustomEvents();
  const { byKey: trendByKey } = useTrendData();

  const allEvents = useMemo(() => [
    ...EVENTS,
    ...weatherState.events,
    ...customEvents,
  ], [weatherState.events, customEvents]);

  const currentMonth = TODAY.getMonth() + monthOffset;
  const currentYear = TODAY.getFullYear() + Math.floor(currentMonth / 12);
  const monthIdx = ((currentMonth % 12) + 12) % 12;

  const filteredEvents = useMemo(() => {
    if (category === 'all') return allEvents;
    return allEvents.filter(e => e.categories.includes(category));
  }, [category, allEvents]);

  const activeEvents = useMemo(() => filteredEvents.filter(e => isActive(e)), [filteredEvents]);

  const upcoming = useMemo(() =>
    filteredEvents
      .filter(e => { const d = daysUntil(e.start); return d > 0 && d <= 45; })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [filteredEvents]);

  const hero = activeEvents.find(e => e.trendScore >= 80) || activeEvents[0] || upcoming[0];

  const thisWeek = useMemo(() =>
    filteredEvents.filter(e => {
      const d = daysUntil(e.start);
      const endD = daysUntil(e.end);
      return (d >= -3 && d <= 7) || (endD >= 0 && d <= 0);
    }), [filteredEvents]);

  const views = [
    { id: 'focus' as ViewMode, label: '포커스', icon: 'sparkles' },
    { id: 'grid' as ViewMode, label: '월간', icon: 'grid' },
    { id: 'timeline' as ViewMode, label: '타임라인', icon: 'list' },
  ];

  return (
    <div className="cal-body" style={{ padding: '20px 28px 60px' }}>
      <div className="cal-toolbar" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' as const }}>
          <div>
            <div className="cal-toolbar-title" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>
              마케팅 캘린더
            </div>
            <div className="cal-toolbar-meta" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '2px 8px', borderRadius: 999,
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                whiteSpace: 'nowrap' as const,
              }}>
                <Icon name="clock" size={10} />{fmtDate(TODAY.toISOString())}
              </span>
              <span style={{ whiteSpace: 'nowrap' as const }}>다가오는 기회 {upcoming.length}건 · 진행 중 {activeEvents.length}건</span>
            </div>
          </div>
          <div className="cal-toolbar-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button className="btn btn-export" onClick={exportCSV}><Icon name="download" size={13} />내보내기</button>
            <div style={{
              display: 'flex',
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}>
              {views.map(v => {
                const isActive = view === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 7,
                      border: 'none', cursor: 'pointer',
                      fontSize: 12,
                      background: isActive ? 'var(--accent)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-subtle)',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    <Icon name={v.icon} size={12} />{v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <SourceStatusBar weatherStatus={weatherState.status} customCount={customEvents.length} />
      <FilterBar category={category} setCategory={setCategory} filteredLen={filteredEvents.length} totalLen={allEvents.length} />

      {view === 'focus' && (
        <FocusView
          hero={hero} thisWeek={thisWeek} upcoming={upcoming}
          filter={category} onOpen={openPanel}
          trendByKey={trendByKey} weatherEvents={weatherState.events}
        />
      )}
      {view === 'grid' && (
        <GridView year={currentYear} monthIdx={monthIdx} monthOffset={monthOffset} setMonthOffset={setMonthOffset} events={filteredEvents} onOpen={openPanel} />
      )}
      {view === 'timeline' && (
        <TimelineView events={filteredEvents} onOpen={openPanel} />
      )}

      {selected && <DetailPanel event={selected} initialTab={selectedTab} onClose={() => setSelected(null)} />}
    </div>
  );
}
