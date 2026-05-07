// ============================================
// MarketingCalendar — main orchestrator
// ============================================

const { useState: useStateMain, useMemo: useMemoMain } = React;

// ---- Grouped filter bar
const FilterBar = ({ category, setCategory, filteredLen }) => {
  const mcStyles = window.mcStyles;
  const Icon = window.Icon;
  const groups = window.CATEGORY_GROUPS;
  // Which group is the current category in?
  const catObj = window.CATEGORIES.find(c => c.id === category);
  const [openGroup, setOpenGroup] = useStateMain(catObj?.parent || (category === 'all' ? null : 'living'));

  const activeGroup = category === 'all' ? 'all' : catObj?.parent;

  return (
    <div style={mcStyles.filterBar}>
      <span style={mcStyles.filterLabel}>카테고리</span>
      {groups.map(g => (
        <button
          key={g.id}
          onClick={() => {
            if (g.id === 'all') { setCategory('all'); setOpenGroup(null); }
            else { setOpenGroup(openGroup === g.id ? null : g.id); }
          }}
          style={{
            ...mcStyles.filterGroupBtn,
            ...(activeGroup === g.id ? mcStyles.filterGroupActive : {}),
          }}
        >
          {g.label}
          {g.id !== 'all' && (
            <Icon name={openGroup === g.id ? 'chevUp' : 'chevDown'} size={10} />
          )}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontVariantNumeric: 'tabular-nums', paddingRight: 4 }}>
        {category === 'all' ? `${window.EVENTS.length}건` : `${filteredLen}건 필터됨`}
      </span>

      {openGroup && (
        <div style={{ flexBasis: '100%', display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopStyle: 'dashed', borderTopColor: 'var(--border)' }}>
          {groups.find(g => g.id === openGroup)?.items.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              style={{ ...mcStyles.filterChip, ...(category === c.id ? mcStyles.filterChipActive : {}) }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Weather marketing hint widget (inline)
const WeatherHintBanner = () => {
  const [hint, setHint] = useStateMain(null);

  React.useEffect(() => {
    fetch('/api/weather')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const evts = data.events || [];
        if (evts.length === 0) {
          setHint({ icon: '☀️', text: '이번 주 특이 날씨 없음 — 시즌 기본 전략 유지', count: 0 });
        } else {
          const top = evts.sort((a, b) => b.trendScore - a.trendScore)[0];
          const prods = (top.products || []).slice(0, 3).map(p => p.name).join('·');
          const icons = { '폭염': '☀️', '한파': '❄️', '강수': '🌧️', '적설': '🌨️' };
          const icon = Object.entries(icons).find(([k]) => top.title.includes(k))?.[1] || '⚡';
          setHint({ icon, text: `${top.title} — ${prods ? prods + ' 수요 급증 예상' : top.summary}`, count: evts.length });
        }
      })
      .catch(() => {});
  }, []);

  if (!hint) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 14px', borderRadius: 8, fontSize: 12.5, color: 'var(--text)', marginBottom: 12,
      background: hint.count > 0 ? 'linear-gradient(90deg, oklch(0.95 0.04 250) 0%, var(--surface) 100%)' : 'var(--bg-subtle)',
      border: `1px solid ${hint.count > 0 ? 'oklch(0.85 0.06 250)' : 'var(--border)'}`,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{hint.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{hint.text}</span>
      {hint.count > 1 && (
        <span style={{ fontSize: 10.5, color: 'var(--text-subtle)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
          +{hint.count - 1}건
        </span>
      )}
    </div>
  );
};

const MarketingCalendar = () => {
  const [view, setView] = useStateMain(window.CALENDAR_VIEW_DEFAULT || 'focus');
  const [category, setCategory] = useStateMain('all');
  const [selected, setSelected] = useStateMain(null);
  const [monthOffset, setMonthOffset] = useStateMain(0); // 0 = current month of TODAY

  const today = window.TODAY;
  const currentMonth = today.getMonth() + monthOffset;
  const currentYear = today.getFullYear() + Math.floor(currentMonth / 12);
  const monthIdx = ((currentMonth % 12) + 12) % 12;

  const filteredEvents = useMemoMain(() => {
    if (category === 'all') return window.EVENTS;
    return window.EVENTS.filter(e => e.categories.includes(category));
  }, [category]);

  const activeEvents = useMemoMain(() =>
    filteredEvents.filter(e => window.isActive(e)), [filteredEvents]);

  const upcoming = useMemoMain(() =>
    filteredEvents
      .filter(e => {
        const d = window.daysUntil(e.start);
        return d > 0 && d <= 45;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start)),
    [filteredEvents]);

  const hero = activeEvents.find(e => e.trendScore >= 80) || activeEvents[0] || upcoming[0];

  const thisWeek = useMemoMain(() =>
    filteredEvents.filter(e => {
      const d = window.daysUntil(e.start);
      const endD = window.daysUntil(e.end);
      return (d >= -3 && d <= 7) || (endD >= 0 && d <= 0);
    }), [filteredEvents]);

  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  return (
    <div style={mcStyles.root}>
      {/* Page header */}
      <div style={mcStyles.pageHead}>
        <div>
          <div style={mcStyles.pageTitle}>마케팅 캘린더</div>
          <div style={mcStyles.pageSubtitle}>
            <span style={mcStyles.todayChip}>
              <Icon name="clock" size={10} />
              2026.04.18 (토)
            </span>
            <span>다가오는 기회 {upcoming.length}건 · 진행 중 {activeEvents.length}건</span>
          </div>
        </div>
        <div style={mcStyles.headActions}>
          <button className="btn"><Icon name="download" size={13} />내보내기</button>
          <div style={mcStyles.viewSwitch}>
            {[
              { id: 'focus', label: '포커스', icon: 'target' },
              { id: 'grid', label: '월간', icon: 'grid' },
              { id: 'timeline', label: '타임라인', icon: 'list' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                style={{ ...mcStyles.viewBtn, ...(view === v.id ? mcStyles.viewBtnActive : {}) }}
              >
                <Icon name={v.icon} size={12} />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weather marketing hint */}
      <WeatherHintBanner />

      {/* Filter bar — grouped by 대카테고리 */}
      <FilterBar category={category} setCategory={setCategory} filteredLen={filteredEvents.length} />

      {view === 'focus' && (
        <FocusView
          hero={hero}
          thisWeek={thisWeek}
          upcoming={upcoming}
          filter={category}
          onOpen={setSelected}
        />
      )}
      {view === 'grid' && (
        <GridView
          year={currentYear}
          monthIdx={monthIdx}
          monthOffset={monthOffset}
          setMonthOffset={setMonthOffset}
          events={filteredEvents}
          months={months}
          onOpen={setSelected}
        />
      )}
      {view === 'timeline' && (
        <TimelineView
          events={filteredEvents}
          onOpen={setSelected}
        />
      )}

      {selected && (
        <DetailPanel event={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

// ---- Focus view
const FocusView = ({ hero, thisWeek, upcoming, filter, onOpen }) => {
  const upcomingNotActive = upcoming.filter(e => e.id !== hero?.id);
  const thisWeekFiltered = thisWeek.filter(e => e.id !== hero?.id);

  return (
    <div style={mcStyles.focusWrap}>
      <div style={mcStyles.focusMain}>
        {hero && <EventHero event={hero} onOpen={onOpen} />}

        <div>
          <div style={mcStyles.sectionHead}>
            <Icon name="flag" size={14} />
            <span style={mcStyles.sectionTitle}>이번 주 핵심</span>
            <span style={mcStyles.sectionMeta}>{thisWeekFiltered.length} events</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {thisWeekFiltered.length > 0 ? (
              thisWeekFiltered.map(e => (
                <EventCard key={e.id} event={e} onOpen={onOpen} filter={filter} />
              ))
            ) : (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 10 }}>
                이번 주에 해당하는 이벤트가 없습니다.
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={mcStyles.sectionHead}>
            <Icon name="calendar" size={14} />
            <span style={mcStyles.sectionTitle}>다음 4주</span>
            <span style={mcStyles.sectionMeta}>{upcomingNotActive.slice(0, 5).length} events</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingNotActive.slice(0, 5).map(e => (
              <EventCard key={e.id} event={e} onOpen={onOpen} filter={filter} />
            ))}
          </div>
        </div>
      </div>

      {/* Side: insights panel */}
      <div style={mcStyles.focusSide}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Icon name="lightbulb" size={14} stroke={2.2} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>이번 주 인사이트</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={{ color: 'var(--text)' }}>꽃샘추위(4/19-22)</strong>로 유아 경량패딩 검색이 전주 대비 <span style={{ color: 'var(--success)', fontWeight: 600 }}>+41%</span>. 동시에 <strong style={{ color: 'var(--text)' }}>쿠팡 메가위크(4/20-26)</strong> 시작 — 겨울 재고 정리 + 로켓배송 메인 노출 기회가 겹칩니다.
            </p>
            <p style={{ margin: 0 }}>
              지금 가장 먼저 할 일: <strong style={{ color: 'var(--text)' }}>로켓 재고 긴급 재입고</strong> → 배너 게시 → 광고 단가 상향 (오늘 중).
            </p>
          </div>
        </div>

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

        <div className="card" style={{ padding: 14, background: 'linear-gradient(135deg, var(--accent-bg) 0%, var(--surface) 70%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon name="crown" size={14} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Pro로 더 보기</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
            경쟁사 프로모션 일정, 카테고리별 GMV 예측, 자동 캠페인 생성까지.
          </div>
          <button className="btn primary sm" style={{ width: '100%' }}>
            <Icon name="crown" size={11} />Pro 체험하기
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Grid view
const GridView = ({ year, monthIdx, monthOffset, setMonthOffset, events, months, onOpen }) => {
  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const getEvents = (day) => {
    const ds = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(ds);
    return events.filter(e => {
      const s = new Date(e.start); const en = new Date(e.end);
      return date >= s && date <= en;
    });
  };

  const today = window.TODAY;
  const isToday = (d) => d === today.getDate() && monthIdx === today.getMonth() && year === today.getFullYear();

  const weekdays = ['일','월','화','수','목','금','토'];

  return (
    <div>
      <div style={mcStyles.monthNav}>
        <button className="btn icon sm" onClick={() => setMonthOffset(monthOffset - 1)}>
          <Icon name="chevLeft" size={14} />
        </button>
        <div style={mcStyles.monthTitle}>
          {year}년 {months[monthIdx]}
        </div>
        <button className="btn icon sm" onClick={() => setMonthOffset(monthOffset + 1)}>
          <Icon name="chevRight" size={14} />
        </button>
        <button className="btn sm" onClick={() => setMonthOffset(0)}>오늘</button>
      </div>
      <div style={mcStyles.gridWrap}>
        <div style={mcStyles.weekdayRow}>
          {weekdays.map((w, i) => (
            <div key={w} style={{ ...mcStyles.weekday, color: i === 0 ? 'var(--danger)' : i === 6 ? 'var(--cat-platform)' : 'var(--text-subtle)' }}>
              {w}
            </div>
          ))}
        </div>
        <div style={mcStyles.monthGrid}>
          {cells.map((day, i) => {
            const dayEvents = day ? getEvents(day) : [];
            return (
              <div
                key={i}
                style={{
                  ...mcStyles.dayCell,
                  ...(day === null ? { background: 'var(--bg-subtle)' } : {}),
                  ...(isToday(day) ? { background: 'var(--accent-bg)' } : {}),
                }}
              >
                {day && (
                  <>
                    <div style={{ ...mcStyles.dayNum, ...(isToday(day) ? mcStyles.dayNumToday : {}) }}>
                      {day}
                    </div>
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        style={{
                          ...mcStyles.dayEvent,
                          background: catColor(ev.type),
                          color: '#fff',
                          opacity: 0.92,
                        }}
                        onClick={() => onOpen(ev)}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ fontSize: 10, color: 'var(--text-subtle)', padding: '0 4px' }}>
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

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12, fontSize: 11.5, color: 'var(--text-muted)' }}>
        {Object.entries(window.EVENT_TYPES).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: catColor(k) }} />
            {v.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---- Timeline view
const TimelineView = ({ events, onOpen }) => {
  // Show 60 days from TODAY - 7
  const start = new Date(window.TODAY);
  start.setDate(start.getDate() - 7);
  const totalDays = 60;

  const dayDiff = (iso) => {
    const d = new Date(iso);
    return Math.floor((d - start) / (1000 * 60 * 60 * 24));
  };

  const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start))
    .filter(e => {
      const s = dayDiff(e.start); const en = dayDiff(e.end);
      return en >= 0 && s < totalDays;
    });

  const monthMarkers = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d.getDate() === 1 || i === 0) {
      monthMarkers.push({ day: i, label: `${d.getMonth() + 1}월` });
    }
  }

  const todayCol = dayDiff(window.TODAY.toISOString().slice(0, 10));

  return (
    <div style={{ background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Month header */}
      <div style={{ display: 'grid', gridTemplateColumns: `180px 1fr`, background: 'var(--bg-subtle)', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border)' }}>
        <div style={{ padding: '8px 14px', fontSize: 11, fontWeight: 500, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: 'var(--border)' }}>
          이벤트
        </div>
        <div style={{ position: 'relative', height: 30 }}>
          {monthMarkers.map(m => (
            <div key={m.day} style={{
              position: 'absolute',
              left: `${(m.day / totalDays) * 100}%`,
              padding: '8px 10px', fontSize: 11, fontWeight: 500, color: 'var(--text-subtle)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {m.label}
            </div>
          ))}
          {/* Today line */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${(todayCol / totalDays) * 100}%`,
            width: 1, background: 'var(--accent)',
            borderRightWidth: 1, borderRightStyle: 'dashed', borderRightColor: 'var(--accent)',
          }} />
        </div>
      </div>

      {sorted.map(ev => {
        const s = Math.max(0, dayDiff(ev.start));
        const e = Math.min(totalDays, dayDiff(ev.end) + 1);
        const left = (s / totalDays) * 100;
        const width = Math.max(1.5, ((e - s) / totalDays) * 100);

        return (
          <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: `180px 1fr`, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--divider)', minHeight: 42, position: 'relative' }}>
            <div style={{ padding: '10px 14px', fontSize: 12.5, fontWeight: 500, color: 'var(--text)', borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: 'var(--border)', display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor(ev.type), flexShrink: 0 }} />
              <span className="truncate">{ev.title}</span>
            </div>
            <div style={{ position: 'relative' }}>
              {/* Today line */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${(todayCol / totalDays) * 100}%`,
                width: 1, background: 'var(--accent)', opacity: 0.35,
              }} />
              <div
                onClick={() => onOpen(ev)}
                style={{
                  position: 'absolute', top: 9, bottom: 9,
                  left: `${left}%`, width: `${width}%`,
                  background: catColor(ev.type), borderRadius: 4,
                  padding: '0 8px', display: 'flex', alignItems: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 500,
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  cursor: 'pointer',
                }}
              >
                {width > 6 ? `${window.fmtDate(ev.start)} – ${window.fmtDate(ev.end)}` : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

window.MarketingCalendar = MarketingCalendar;
