// ============================================
// DetailPanel — slide-over with action plan
// ============================================

const { useState: useStateDP } = React;

const dpStyles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(17, 24, 39, 0.35)',
    zIndex: 50,
    animation: 'fadeIn 180ms var(--easing)',
  },
  panel: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 540, background: 'var(--surface)',
    borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: 'var(--border)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 51,
    display: 'flex', flexDirection: 'column',
    animation: 'slideIn 220ms var(--easing)',
  },
  header: {
    padding: '16px 20px',
    borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border)',
    display: 'flex', alignItems: 'flex-start', gap: 12,
  },
  closeBtn: {
    width: 28, height: 28, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)',
  },
  body: { flex: 1, overflowY: 'auto', padding: '20px' },
  footer: {
    padding: '12px 20px', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'var(--border)',
    display: 'flex', gap: 8, background: 'var(--bg-subtle)',
  },
  section: { marginBottom: 22 },
  sectionLabel: {
    fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10,
  },
  metricGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
  },
  metricBox: {
    padding: '10px 12px', borderRadius: 8,
    background: 'var(--bg-subtle)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
  },
  metricBoxLabel: { fontSize: 10.5, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  metricBoxValue: { fontSize: 18, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', marginTop: 3 },

  productCard: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '10px 12px', borderRadius: 8,
    background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    marginBottom: 6,
    transition: 'border-color 120ms, background 120ms',
    cursor: 'pointer',
  },
  urgencyBadge: {
    fontSize: 10, fontWeight: 600,
    padding: '2px 6px', borderRadius: 4,
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },

  // Timeline checklist
  timelineTrack: {
    position: 'relative', paddingLeft: 24,
  },
  timelineLine: {
    position: 'absolute', left: 9, top: 0, bottom: 0,
    width: 2, background: 'var(--border)',
  },
  tlItem: {
    position: 'relative', paddingBottom: 12,
    display: 'flex', alignItems: 'flex-start', gap: 10,
  },
  tlDot: {
    position: 'absolute', left: -23, top: 3,
    width: 20, height: 20, borderRadius: '50%',
    background: 'var(--surface)',
    border: '2px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  tlDotDone: { background: 'var(--success)', borderColor: 'var(--success)', color: '#fff' },
  tlDotActive: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' },
  tlDDay: {
    minWidth: 50, fontSize: 11, fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    paddingTop: 2,
  },
  tlTask: { flex: 1, fontSize: 13, color: 'var(--text)', paddingTop: 1, lineHeight: 1.5 },
  tlTaskDone: { color: 'var(--text-subtle)', textDecoration: 'line-through' },

  proBox: {
    padding: 14, borderRadius: 10,
    background: 'linear-gradient(135deg, oklch(0.97 0.03 75) 0%, var(--surface) 100%)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--cat-season-border)',
    position: 'relative',
  },
  proLabel: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10.5, fontWeight: 600,
    color: 'var(--cat-season)', textTransform: 'uppercase', letterSpacing: '0.04em',
    marginBottom: 6,
  },
};

const urgencyStyle = (u) => ({
  high: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  mid: { background: 'var(--warning-bg)', color: 'oklch(0.48 0.15 75)' },
  low: { background: 'var(--bg-subtle)', color: 'var(--text-muted)' },
}[u] || {});

const urgencyLabel = (u) => ({ high: '긴급', mid: '중요', low: '여유' }[u] || u);

const DetailPanel = ({ event, onClose }) => {
  const [tab, setTab] = useStateDP('plan');
  const [checked, setChecked] = useStateDP(
    Object.fromEntries(event.checklist.map((c, i) => [i, c.done]))
  );

  const toggle = (i) => setChecked(p => ({ ...p, [i]: !p[i] }));

  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = event.checklist.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const dU = window.daysUntil(event.start);
  const active = window.isActive(event);

  return (
    <>
      <div style={dpStyles.overlay} onClick={onClose} />
      <div style={dpStyles.panel}>
        <div style={dpStyles.header}>
          <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: catColor(event.type) }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span className={`chip ${typeChip(event.type)}`}>{typeLabel(event.type)}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                {window.fmtDateFull(event.start)}
                {event.end !== event.start && ` – ${window.fmtDateFull(event.end)}`}
              </span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text)', marginBottom: 4 }}>
              {event.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {event.summary}
            </div>
          </div>
          <button style={dpStyles.closeBtn} className="btn ghost icon sm" onClick={onClose}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Sub tabs */}
        <div style={{ display: 'flex', padding: '0 20px', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border)', gap: 2 }}>
          {[
            { id: 'plan', label: '액션 플랜', icon: 'target' },
            { id: 'products', label: `추천 품목 (${event.products.length})`, icon: 'package' },
            { id: 'insights', label: '실무 인사이트', icon: 'lightbulb' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 12px',
                fontSize: 12.5, fontWeight: 500,
                color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <Icon name={t.icon} size={12} />
              {t.label}
            </button>
          ))}
        </div>

        <div style={dpStyles.body}>
          {tab === 'plan' && (
            <>
              {/* Metrics */}
              <div style={dpStyles.section}>
                <div style={dpStyles.sectionLabel}>
                  <Icon name="trendUp" size={11} />기회 지표
                </div>
                <div style={dpStyles.metricGrid}>
                  <div style={dpStyles.metricBox}>
                    <div style={dpStyles.metricBoxLabel}>기회점수</div>
                    <div style={{ ...dpStyles.metricBoxValue, color: 'var(--accent-text)' }}>
                      {event.trendScore}<span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 400 }}>/100</span>
                    </div>
                  </div>
                  <div style={dpStyles.metricBox}>
                    <div style={dpStyles.metricBoxLabel}>검색량</div>
                    <div style={{ ...dpStyles.metricBoxValue, color: 'var(--success)' }}>{event.search}</div>
                  </div>
                  <div style={dpStyles.metricBox}>
                    <div style={dpStyles.metricBoxLabel}>예상 GMV</div>
                    <div style={{ ...dpStyles.metricBoxValue, color: 'var(--success)' }}>{event.gmv}</div>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div style={dpStyles.section}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <div style={dpStyles.sectionLabel}>
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
                <div style={dpStyles.timelineTrack}>
                  <div style={dpStyles.timelineLine} />
                  {event.checklist.map((item, i) => {
                    const isDone = checked[i];
                    const targetDay = item.d;
                    const isActive = !isDone && targetDay <= 0 && targetDay >= -3;
                    return (
                      <div key={i} style={dpStyles.tlItem}>
                        <div
                          style={{
                            ...dpStyles.tlDot,
                            ...(isDone ? dpStyles.tlDotDone : {}),
                            ...(isActive && !isDone ? dpStyles.tlDotActive : {}),
                          }}
                          onClick={() => toggle(i)}
                        >
                          {isDone && <Icon name="check" size={10} stroke={3} />}
                          {isActive && !isDone && <Icon name="alert" size={10} stroke={2.5} />}
                        </div>
                        <div style={dpStyles.tlDDay}>
                          {targetDay === 0 ? 'D-DAY' : targetDay > 0 ? `D+${targetDay}` : `D${targetDay}`}
                        </div>
                        <div style={{ ...dpStyles.tlTask, ...(isDone ? dpStyles.tlTaskDone : {}) }}>
                          {item.task}
                          {isActive && !isDone && (
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

              {/* Platforms + categories */}
              <div style={dpStyles.section}>
                <div style={dpStyles.sectionLabel}>
                  <Icon name="tag" size={11} />연결 정보
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginRight: 4 }}>플랫폼:</span>
                  {event.platforms.length > 0 ? event.platforms.map(p => (
                    <span key={p} className="chip">{window.PLATFORMS[p]}</span>
                  )) : <span style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>해당 없음</span>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginRight: 4 }}>카테고리:</span>
                  {event.categories.length > 0 ? event.categories.map(c => {
                    const cat = window.CATEGORIES.find(x => x.id === c);
                    return <span key={c} className="chip">{cat?.label || c}</span>;
                  }) : <span style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>전체</span>}
                </div>
              </div>
            </>
          )}

          {tab === 'products' && (
            <div style={dpStyles.section}>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                이 이벤트에서 특히 잘 팔릴 가능성이 높은 품목을 기회점수·검색량 기반으로 제안합니다.
              </div>
              {event.products.map((p, i) => (
                <div key={i} style={dpStyles.productCard}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: 'var(--bg-subtle)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-subtle)', flexShrink: 0,
                  }}>
                    <Icon name="box" size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                      <span style={{ ...dpStyles.urgencyBadge, ...urgencyStyle(p.urgency) }}>
                        {urgencyLabel(p.urgency)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.reason}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="btn sm">
                        <Icon name="pen" size={11} />카피 생성
                      </button>
                      <button className="btn sm">
                        <Icon name="layout" size={11} />상세페이지
                      </button>
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
            <div style={dpStyles.section}>
              <div style={dpStyles.proBox}>
                <div style={dpStyles.proLabel}>
                  <Icon name="crown" size={10} stroke={2.4} />PRO 실무 인사이트
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {event.pro}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', marginTop: 10, fontStyle: 'italic' }}>
                  — 10년차 쿠팡 생활용품 BM 박지민
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={dpStyles.sectionLabel}>
                  <Icon name="users" size={11} />같은 이벤트 참여 경쟁사
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 12, background: 'var(--bg-subtle)', borderRadius: 8, border: '1px dashed var(--border)' }}>
                  Pro 업그레이드 시 카테고리별 경쟁사 참여 현황을 확인할 수 있습니다.
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={dpStyles.footer}>
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
};

window.DetailPanel = DetailPanel;
