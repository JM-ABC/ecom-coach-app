// ============================================
// Marketing Calendar — flagship tab
// "다가오는 기회" 중심 대시보드
// 3 view modes: Focus (default), Grid, Timeline
// ============================================

const { useState: useStateMC, useMemo: useMemoMC } = React;

const mcStyles = {
  root: { padding: '20px 28px 60px' },
  pageHead: {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    gap: 16, marginBottom: 18, flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
    color: 'var(--text)', marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13, color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  todayChip: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '2px 8px', borderRadius: 999,
    background: 'var(--bg-subtle)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    fontVariantNumeric: 'tabular-nums',
  },
  headActions: { display: 'flex', gap: 8 },
  viewSwitch: {
    display: 'flex', padding: 2,
    background: 'var(--bg-sunken)', borderRadius: 8,
    borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
  },
  viewBtn: {
    padding: '5px 10px', borderRadius: 6,
    fontSize: 12.5, fontWeight: 500,
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5,
  },
  viewBtnActive: {
    background: 'var(--surface)', color: 'var(--text)',
    boxShadow: 'var(--shadow-sm)',
  },

  // Filter bar
  filterBar: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 10px', marginBottom: 12,
    background: 'var(--surface)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    borderRadius: 10,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 11, fontWeight: 500,
    color: 'var(--text-subtle)', textTransform: 'uppercase',
    letterSpacing: '0.04em', marginRight: 2, paddingLeft: 4,
  },
  filterGroupBtn: {
    padding: '4px 10px', borderRadius: 6,
    fontSize: 12, fontWeight: 500,
    color: 'var(--text-muted)', border: '1px solid transparent',
    background: 'transparent', cursor: 'pointer',
    transition: 'all 120ms',
  },
  filterGroupActive: {
    color: 'var(--text)',
    background: 'var(--bg-subtle)',
    borderColor: 'var(--border)',
  },
  filterDivider: {
    width: 1, height: 16, background: 'var(--border)', margin: '0 4px',
  },
  filterChip: {
    padding: '3px 9px', borderRadius: 999,
    fontSize: 11.5, fontWeight: 500,
    color: 'var(--text-muted)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    background: 'var(--bg-subtle)', cursor: 'pointer',
    transition: 'all 120ms',
    whiteSpace: 'nowrap',
  },
  filterChipActive: {
    color: 'var(--accent-text)',
    background: 'var(--accent-bg)',
    borderColor: 'var(--accent-border)',
  },

  // Focus view
  focusWrap: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 },
  focusMain: { display: 'flex', flexDirection: 'column', gap: 14 },
  focusSide: { display: 'flex', flexDirection: 'column', gap: 14 },

  sectionHead: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 10, padding: '0 2px',
  },
  sectionTitle: {
    fontSize: 13, fontWeight: 600,
    letterSpacing: '-0.005em', color: 'var(--text)',
  },
  sectionMeta: { fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' },

  // Event card (focus)
  evCard: {
    background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    borderRadius: 10, overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow 140ms var(--easing), transform 140ms var(--easing), border-color 140ms var(--easing)',
  },
  evCardHover: {
    borderColor: 'var(--border-strong)',
    boxShadow: '0 1px 2px oklch(0 0 0 / 0.04), 0 8px 20px oklch(0 0 0 / 0.06)',
    transform: 'translateY(-1px)',
  },
  evCardHead: {
    padding: '14px 16px 10px',
    display: 'flex', alignItems: 'flex-start', gap: 12,
  },
  evCardBody: { padding: '0 16px 14px' },
  evCardFoot: {
    padding: '10px 16px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'var(--divider)',
    background: 'var(--bg-subtle)',
    display: 'flex', alignItems: 'center', gap: 12, fontSize: 12,
  },
  countdown: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: 56, padding: '6px 8px',
    background: 'var(--bg-subtle)', borderRadius: 8,
  },
  countdownNum: {
    fontSize: 20, fontWeight: 700, lineHeight: 1,
    color: 'var(--text)', fontVariantNumeric: 'tabular-nums',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '-0.02em',
  },
  countdownLabel: { fontSize: 9.5, color: 'var(--text-subtle)', marginTop: 3, letterSpacing: '0.04em' },
  evTitle: { fontSize: 15.5, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 4 },
  evSummary: { fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 },
  metricsRow: {
    display: 'flex', gap: 16, marginTop: 10,
    padding: '10px 0', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'var(--divider)',
  },
  metric: { display: 'flex', flexDirection: 'column', gap: 2 },
  metricLabel: { fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  metricValue: { fontSize: 13.5, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' },
  metricUp: { color: 'var(--success)' },

  // Product pills
  productList: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  productRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', borderRadius: 8,
    background: 'var(--bg-subtle)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
  },
  productName: { fontSize: 13, fontWeight: 500, color: 'var(--text)', flex: 1 },
  productReason: { fontSize: 11.5, color: 'var(--text-muted)' },

  // Side: upcoming mini list
  miniItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 120ms',
  },
  miniDate: {
    minWidth: 36, textAlign: 'center',
    fontSize: 10.5, color: 'var(--text-subtle)',
    fontFamily: 'var(--font-mono)',
  },
  miniDateNum: {
    fontSize: 14, fontWeight: 600, color: 'var(--text)',
    lineHeight: 1, fontFamily: 'var(--font-mono)',
  },
  miniTitle: { fontSize: 12.5, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 },
  miniMeta: { fontSize: 10.5, color: 'var(--text-subtle)', marginTop: 1 },

  // Hero card (top priority event)
  heroCard: {
    background: 'var(--surface)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 12,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow 140ms var(--easing), transform 140ms var(--easing), border-color 140ms var(--easing)',
  },
  heroCardHover: {
    borderColor: 'var(--border-strong)',
    boxShadow: '0 1px 2px oklch(0 0 0 / 0.04), 0 8px 20px oklch(0 0 0 / 0.06)',
    transform: 'translateY(-1px)',
  },
  heroPattern: {
    position: 'absolute', top: -20, right: -20,
    width: 180, height: 180,
    opacity: 0.08,
    color: 'var(--accent)',
  },
  heroEyebrow: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
    color: 'var(--accent-text)', textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6 },
  heroMeta: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 },

  // Grid (month) view
  monthNav: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 12,
  },
  monthTitle: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', minWidth: 110 },
  weekdayRow: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border)',
  },
  weekday: {
    padding: '8px 10px', fontSize: 11, fontWeight: 500,
    color: 'var(--text-subtle)', textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  gridWrap: {
    background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    borderRadius: 10, overflow: 'hidden',
  },
  monthGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    gridAutoRows: 'minmax(96px, auto)',
  },
  dayCell: {
    padding: 6, borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: 'var(--divider)',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--divider)',
    display: 'flex', flexDirection: 'column', gap: 2,
    background: 'var(--surface)',
  },
  dayNum: {
    fontSize: 11.5, fontWeight: 500, color: 'var(--text-muted)',
    fontVariantNumeric: 'tabular-nums',
    padding: '1px 4px', borderRadius: 4,
    alignSelf: 'flex-start',
  },
  dayNumToday: { background: 'var(--accent)', color: '#fff' },
  dayEvent: {
    padding: '2px 6px', borderRadius: 4,
    fontSize: 10.5, fontWeight: 500, lineHeight: 1.35,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    cursor: 'pointer',
  },

  // Timeline view
  timelineHead: {
    display: 'grid',
    gridTemplateColumns: '180px repeat(30, 1fr)',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border)',
    background: 'var(--bg-subtle)',
    position: 'sticky', top: 0, zIndex: 2,
  },
  timelineHeadCell: {
    padding: '6px 0', textAlign: 'center', fontSize: 10.5,
    color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)',
    borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: 'var(--divider)',
  },
  timelineRow: {
    display: 'grid',
    gridTemplateColumns: '180px repeat(30, 1fr)',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--divider)',
    position: 'relative',
    minHeight: 42,
  },
  timelineLabel: {
    padding: '10px 12px', fontSize: 12.5, fontWeight: 500,
    color: 'var(--text)',
    borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: 'var(--border)',
    display: 'flex', alignItems: 'center',
  },
  timelineBar: {
    position: 'absolute', top: 10, bottom: 10,
    borderRadius: 4, padding: '0 8px',
    display: 'flex', alignItems: 'center',
    fontSize: 11, fontWeight: 500, color: '#fff',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
};

// ------- Platform insights block
const PlatformInsights = ({ event, compact = false }) => {
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
        const meta = window.PLATFORM_META[p];
        const tip = window.getPlatformInsight(event, p);
        if (!meta) return null;
        return (
          <div key={p} style={{
            borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
            borderRadius: 8,
            background: 'var(--surface)',
            padding: compact ? '10px 11px' : '11px 13px',
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
                <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--success)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
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
};

window.PlatformInsights = PlatformInsights;

const catColor = (type) => {
  const map = {
    holiday: 'var(--cat-holiday)',
    season: 'var(--cat-season)',
    platform: 'var(--cat-platform)',
    promo: 'var(--cat-promo)',
    trend: 'var(--cat-trend)',
    weather: 'var(--cat-weather)',
  };
  return map[type] || 'var(--accent)';
};

const typeLabel = (type) => window.EVENT_TYPES[type]?.label || type;
const typeChip = (type) => window.EVENT_TYPES[type]?.cls || '';

// ------- EventHero: the top upcoming opportunity
const EventHero = ({ event, onOpen }) => {
  const [hover, setHover] = useStateMC(false);
  const dU = window.daysUntil(event.start);
  const active = window.isActive(event);
  return (
    <div
      style={{ ...mcStyles.heroCard, ...(hover ? mcStyles.heroCardHover : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(event)}
    >
      <div style={{ position: 'relative' }}>
        <div style={mcStyles.heroEyebrow}>
          <Icon name="zap" size={11} stroke={2.4} />
          {active ? '지금 진행 중' : '가장 임박한 기회'}
        </div>
        <div style={mcStyles.heroTitle}>{event.title}</div>
        <div style={mcStyles.heroMeta}>
          {window.fmtDateFull(event.start)}
          {event.end !== event.start && ` — ${window.fmtDateFull(event.end)}`}
          {' · '}
          <span className={`chip ${typeChip(event.type)}`} style={{ marginLeft: 4 }}>
            {typeLabel(event.type)}
          </span>
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.55, marginBottom: 14 }}>
          {event.summary}
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
          <div style={mcStyles.metric}>
            <div style={mcStyles.metricLabel}>예상 GMV 증가</div>
            <div style={{ ...mcStyles.metricValue, ...mcStyles.metricUp, fontSize: 18 }}>{event.gmv}</div>
          </div>
          <div style={mcStyles.metric}>
            <div style={mcStyles.metricLabel}>검색량 변화</div>
            <div style={{ ...mcStyles.metricValue, fontSize: 18 }}>{event.search}</div>
          </div>
          <div style={mcStyles.metric}>
            <div style={mcStyles.metricLabel}>D-Day</div>
            <div style={{ ...mcStyles.metricValue, fontSize: 18, color: 'var(--accent-text)' }}>
              {active ? '진행중' : dU >= 0 ? `D-${dU}` : `D+${Math.abs(dU)}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn primary" onClick={(e) => { e.stopPropagation(); onOpen(event); }}>
            <Icon name="target" size={13} />
            액션 플랜 열기
          </button>
          <button className="btn" onClick={(e) => e.stopPropagation()}>
            <Icon name="package" size={13} />
            추천 품목
          </button>
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'var(--divider)' }}>
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
};

// ------- EventCard (full width)
const EventCard = ({ event, onOpen, filter }) => {
  const [hover, setHover] = useStateMC(false);
  const dU = window.daysUntil(event.start);
  const active = window.isActive(event);

  // Filter products by category
  const productsToShow = filter === 'all'
    ? event.products.slice(0, 3)
    : event.products.filter(p => p.category === filter).slice(0, 3);
  const displayProducts = productsToShow.length > 0 ? productsToShow : event.products.slice(0, 3);

  return (
    <div
      style={{ ...mcStyles.evCard, ...(hover ? mcStyles.evCardHover : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(event)}
    >
      <div style={mcStyles.evCardHead}>
        <div style={mcStyles.countdown}>
          <div style={mcStyles.countdownNum}>
            {active ? '●' : dU >= 0 ? dU : `+${Math.abs(dU)}`}
          </div>
          <div style={mcStyles.countdownLabel}>
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
              {window.fmtDate(event.start)}
              {event.end !== event.start && ` – ${window.fmtDate(event.end)}`}
            </span>
          </div>
          <div style={mcStyles.evTitle}>{event.title}</div>
          <div style={mcStyles.evSummary}>{event.summary}</div>

          <div style={mcStyles.metricsRow}>
            <div style={mcStyles.metric}>
              <div style={mcStyles.metricLabel}>기회점수</div>
              <div style={{ ...mcStyles.metricValue, color: event.trendScore >= 80 ? 'var(--accent-text)' : 'var(--text)' }}>
                {event.trendScore}
                <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontWeight: 400, marginLeft: 2 }}>/100</span>
              </div>
            </div>
            <div style={mcStyles.metric}>
              <div style={mcStyles.metricLabel}>검색량</div>
              <div style={{ ...mcStyles.metricValue, ...mcStyles.metricUp }}>{event.search}</div>
            </div>
            <div style={mcStyles.metric}>
              <div style={mcStyles.metricLabel}>예상 GMV</div>
              <div style={{ ...mcStyles.metricValue, ...mcStyles.metricUp }}>{event.gmv}</div>
            </div>
            <div style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      {displayProducts.length > 0 && (
        <div style={mcStyles.evCardBody}>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="package" size={11} />
            추천 품목 ({displayProducts.length}/{event.products.length})
          </div>
          <div style={mcStyles.productList}>
            {displayProducts.map((p, i) => (
              <div key={i} style={mcStyles.productRow}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: p.urgency === 'high' ? 'var(--danger)' : p.urgency === 'mid' ? 'var(--warning)' : 'var(--text-subtle)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={mcStyles.productName}>{p.name}</div>
                  <div style={mcStyles.productReason}>{p.reason}</div>
                </div>
                <button className="btn sm ghost" onClick={(e) => e.stopPropagation()}>
                  <Icon name="arrowRight" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={mcStyles.evCardFoot}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
          <Icon name="checkCircle" size={12} />
          체크리스트 {event.checklist.filter(c => c.done).length}/{event.checklist.length}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {event.platforms.slice(0, 3).map(p => (
            <span key={p} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 4px', background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: 4 }}>
              {window.PLATFORMS[p]}
            </span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn sm" onClick={(e) => { e.stopPropagation(); onOpen(event); }}>
          액션 플랜 보기
          <Icon name="arrowRight" size={11} />
        </button>
      </div>
    </div>
  );
};

// ---- Upcoming mini item
const MiniItem = ({ event, onOpen }) => {
  const dU = window.daysUntil(event.start);
  const active = window.isActive(event);
  const date = new Date(event.start);
  const [hover, setHover] = useStateMC(false);
  return (
    <div
      style={{ ...mcStyles.miniItem, ...(hover ? { background: 'var(--bg-subtle)' } : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(event)}
    >
      <div style={mcStyles.miniDate}>
        <div style={mcStyles.miniDateNum}>{date.getDate()}</div>
        <div>{date.getMonth() + 1}월</div>
      </div>
      <div style={{ width: 3, height: 32, borderRadius: 2, background: catColor(event.type) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={mcStyles.miniTitle} className="truncate">{event.title}</div>
        <div style={mcStyles.miniMeta}>
          {active ? '진행 중' : `D-${dU}`} · {typeLabel(event.type)}
        </div>
      </div>
    </div>
  );
};

window.mcStyles = mcStyles;
window.catColor = catColor;
window.typeLabel = typeLabel;
window.typeChip = typeChip;
window.EventHero = EventHero;
window.EventCard = EventCard;
window.MiniItem = MiniItem;
