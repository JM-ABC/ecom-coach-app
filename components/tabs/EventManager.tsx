'use client';

import React, { useState } from 'react';
import Icon from '@/components/Icon';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { useTrendData } from '@/hooks/useTrendData';
import { useWeatherEvents } from '@/hooks/useWeatherEvents';
import { useNewsEvents } from '@/hooks/useNewsEvents';
import type { DetectedNewsEvent } from '@/hooks/useNewsEvents';
import { CATEGORIES, PLATFORMS, EVENT_TYPES, catColor, typeLabel } from '@/lib/data';
import type { MarketingEvent, EventType, UrgencyLevel } from '@/lib/types';

// ── 빈 이벤트 템플릿 ──────────────────────────────────────────
function emptyEvent(): Omit<MarketingEvent, 'id' | 'source'> {
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: '',
    type: 'season',
    start: today,
    end: today,
    categories: [],
    platforms: [],
    summary: '',
    trendScore: 50,
    search: '+0%',
    gmv: '+0%',
    products: [],
    checklist: [],
    pro: '',
  };
}

function genId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── 상태 배지 ─────────────────────────────────────────────────
function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, { bg: string; color: string; dot: string }> = {
    ok: { bg: 'var(--success-bg, oklch(0.95 0.05 145))', color: 'var(--success)', dot: 'var(--success)' },
    loading: { bg: 'var(--bg-subtle)', color: 'var(--text-muted)', dot: 'var(--text-subtle)' },
    'no-api-key': { bg: 'var(--warning-bg, oklch(0.97 0.04 75))', color: 'oklch(0.48 0.15 75)', dot: 'oklch(0.65 0.15 75)' },
    error: { bg: 'var(--danger-bg)', color: 'var(--danger)', dot: 'var(--danger)' },
  };
  const c = colors[status] ?? colors.loading;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
      background: c.bg, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── 트렌드 신호 해석 ─────────────────────────────────────────
function signalInfo(change: number): { label: string; icon: string; color: string; bg: string; border: string; action: string } {
  if (change >= 20) return {
    label: '급상승', icon: '↑↑',
    color: 'oklch(0.40 0.14 145)', bg: 'oklch(0.93 0.06 145)', border: 'oklch(0.82 0.1 145)',
    action: '재고 2주치 이상 선확보 + 광고 입찰가 즉시 상향',
  };
  if (change >= 8) return {
    label: '상승', icon: '↑',
    color: 'var(--success)', bg: 'oklch(0.96 0.04 145)', border: 'oklch(0.88 0.07 145)',
    action: '광고 예산 소폭 증액, 관련 기획전 준비 시작',
  };
  if (change >= -8) return {
    label: '보합', icon: '→',
    color: 'var(--text-muted)', bg: 'var(--bg-subtle)', border: 'var(--border)',
    action: '현 운영 유지, 다음 시즌·이벤트 기획 준비',
  };
  if (change >= -20) return {
    label: '하락', icon: '↓',
    color: 'oklch(0.55 0.18 25)', bg: 'oklch(0.97 0.03 25)', border: 'oklch(0.91 0.06 25)',
    action: '쿠폰·번들 프로모션으로 수요 방어, 재고 조정 검토',
  };
  return {
    label: '급하락', icon: '↓↓',
    color: 'var(--danger)', bg: 'oklch(0.97 0.04 15)', border: 'oklch(0.90 0.07 15)',
    action: '할인 판매로 재고 소진, 신규 발주 축소 검토',
  };
}

// ── 트렌드 패널 ───────────────────────────────────────────────
function TrendPanel() {
  const { trends, status, updatedAt } = useTrendData();

  const rising  = trends.filter(t => t.changeVsPrevWeek >= 8);
  const falling = trends.filter(t => t.changeVsPrevWeek <= -8);
  const stable  = trends.filter(t => t.changeVsPrevWeek > -8 && t.changeVsPrevWeek < 8);
  const sorted  = [...trends].sort((a, b) => b.changeVsPrevWeek - a.changeVsPrevWeek);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>카테고리 수요 신호</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            네이버 데이터랩 기반 전주 대비 수요 변화 · MD 액션 가이드
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <StatusBadge
          status={status}
          label={
            status === 'ok' ? '연동됨' :
            status === 'loading' ? '불러오는 중...' :
            status === 'no-api-key' ? 'API 키 미설정' : '오류'
          }
        />
      </div>

      {status === 'no-api-key' && (
        <div style={{ padding: 16, borderRadius: 10, background: 'var(--warning-bg, oklch(0.97 0.04 75))', border: '1px solid oklch(0.88 0.08 75)', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'oklch(0.48 0.15 75)', marginBottom: 4 }}>
            NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수를 설정하세요
          </div>
          <div style={{ fontSize: 12, color: 'oklch(0.55 0.12 75)', fontFamily: 'var(--font-mono)' }}>
            .env.local 파일에 키를 추가하고 서버를 재시작하세요
          </div>
        </div>
      )}

      {/* 요약 배너 */}
      {status === 'ok' && trends.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            {
              icon: '↑', label: '수요 상승', count: rising.length,
              sub: rising.length > 0 ? rising.slice(0, 2).map(t => t.title).join(', ') : '해당 없음',
              color: 'oklch(0.40 0.14 145)', bg: 'oklch(0.93 0.06 145)', border: 'oklch(0.82 0.1 145)',
            },
            {
              icon: '→', label: '보합', count: stable.length,
              sub: '안정적 수요 유지',
              color: 'var(--text-muted)', bg: 'var(--bg-subtle)', border: 'var(--border)',
            },
            {
              icon: '↓', label: '수요 하락', count: falling.length,
              sub: falling.length > 0 ? falling.slice(0, 2).map(t => t.title).join(', ') : '해당 없음',
              color: 'var(--danger)', bg: 'oklch(0.97 0.04 15)', border: 'oklch(0.90 0.07 15)',
            },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 14px', borderRadius: 10, background: s.bg, border: `1px solid ${s.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                {s.icon} {s.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                {s.count}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 3 }}>개</span>
              </div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 3, opacity: 0.8, lineHeight: 1.4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* 카테고리 목록 */}
      {status === 'ok' && trends.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map(t => {
            const sig = signalInfo(t.changeVsPrevWeek);
            return (
              <div key={t.ourKey} style={{
                padding: '12px 14px', borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                {/* 신호 배지 */}
                <div style={{
                  padding: '5px 10px', borderRadius: 7,
                  background: sig.bg, border: `1px solid ${sig.border}`,
                  minWidth: 52, textAlign: 'center', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: sig.color, lineHeight: 1 }}>{sig.icon}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: sig.color, marginTop: 2, letterSpacing: '0.02em' }}>{sig.label}</div>
                </div>

                {/* 카테고리 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{t.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: sig.color }}>
                      {t.changeVsPrevWeek >= 0 ? '+' : ''}{t.changeVsPrevWeek}%
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-subtle)' }}>전주 대비</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Icon name="arrowRight" size={10} stroke={2.4} />
                    {sig.action}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-subtle)' }}>
                    {t.keywords?.slice(0, 3).join(' · ')}
                  </div>
                </div>

                {/* 스파크라인 */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28, width: 52, flexShrink: 0 }}>
                  {t.data.slice(-7).map((d, i, arr) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: 2,
                      background: i === arr.length - 1 ? sig.color : 'var(--bg-sunken)',
                      height: `${Math.max(10, (d.ratio / 100) * 100)}%`,
                      opacity: i === arr.length - 1 ? 1 : 0.5,
                    }} title={`${d.period}: ${d.ratio}`} />
                  ))}
                </div>

                {/* 수치 */}
                <div style={{ textAlign: 'right', minWidth: 38, flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {Math.round(t.latestRatio)}
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-subtle)', marginTop: 2 }}>/ 100</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : status === 'ok' ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13, background: 'var(--surface)', borderRadius: 10, border: '1px dashed var(--border)' }}>
          트렌드 데이터가 없습니다.
        </div>
      ) : null}

      {updatedAt && (
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 12 }}>
          마지막 업데이트: {new Date(updatedAt).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}

// ── 날씨 상태 패널 ─────────────────────────────────────────────
function WeatherPanel() {
  const { events, status, updatedAt } = useWeatherEvents();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>기상청 날씨 연동</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            단기예보 기반 자동 생성된 날씨 마케팅 이벤트
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <StatusBadge
          status={status}
          label={
            status === 'ok' ? `${events.length}건 자동 생성` :
            status === 'loading' ? '불러오는 중...' :
            status === 'no-api-key' ? 'API 키 미설정' : '오류'
          }
        />
      </div>

      {status === 'no-api-key' && (
        <div style={{ padding: 16, borderRadius: 10, background: 'var(--warning-bg, oklch(0.97 0.04 75))', border: '1px solid oklch(0.88 0.08 75)', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'oklch(0.48 0.15 75)', marginBottom: 4 }}>
            KMA_API_KEY 환경변수를 설정하세요
          </div>
          <div style={{ fontSize: 12, color: 'oklch(0.55 0.12 75)' }}>
            공공데이터포털(data.go.kr)에서 "기상청_단기예보" API 키를 발급받아 .env.local에 추가하세요.
          </div>
        </div>
      )}

      {events.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor(ev.type), flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ev.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{ev.start} ~ {ev.end}</div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--cat-weather, oklch(0.93 0.04 220))', color: 'oklch(0.45 0.12 220)' }}>
                자동 생성
              </span>
            </div>
          ))}
        </div>
      ) : status === 'ok' ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13, background: 'var(--surface)', borderRadius: 10, border: '1px dashed var(--border)' }}>
          현재 특이 날씨 이벤트가 없습니다. (폭염/한파/강수/적설 감지 시 자동 생성)
        </div>
      ) : null}

      {updatedAt && (
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 12 }}>
          마지막 업데이트: {new Date(updatedAt).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}

// ── 이벤트 폼 ─────────────────────────────────────────────────
interface EventFormProps {
  initial?: MarketingEvent;
  onSave: (ev: MarketingEvent) => void;
  onCancel: () => void;
}

function EventForm({ initial, onSave, onCancel }: EventFormProps) {
  const base = initial ?? emptyEvent() as MarketingEvent;
  const [form, setForm] = useState({ ...base });
  const [newProduct, setNewProduct] = useState({ name: '', reason: '', urgency: 'mid' as UrgencyLevel, category: '' });
  const [newTask, setNewTask] = useState({ d: 0, task: '' });

  const set = <K extends keyof MarketingEvent>(k: K, v: MarketingEvent[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const toggleArr = (key: 'categories' | 'platforms', val: string) =>
    set(key, form[key].includes(val) ? form[key].filter(x => x !== val) : [...form[key], val]);

  const handleSave = () => {
    if (!form.title.trim()) return alert('이벤트 제목을 입력하세요.');
    onSave({ ...form, id: form.id || genId(), source: 'custom' });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)',
    background: 'var(--bg-subtle)', fontSize: 13, color: 'var(--text)', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 600, color: 'var(--text-subtle)',
    textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5, display: 'block',
  };
  const sectionStyle: React.CSSProperties = { marginBottom: 20 };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.01em' }}>
        {initial ? '이벤트 수정' : '새 이벤트 추가'}
      </div>

      {/* 기본 정보 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>이벤트 제목 *</label>
          <input style={inputStyle} placeholder="예: 봄맞이 환절기 시즌" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>유형</label>
          <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value as EventType)}>
            {Object.entries(EVENT_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>시작일</label>
          <input type="date" style={inputStyle} value={form.start} onChange={e => set('start', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>종료일</label>
          <input type="date" style={inputStyle} value={form.end} onChange={e => set('end', e.target.value)} />
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>요약 설명</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }} placeholder="이 이벤트의 핵심 마케팅 기회를 한 줄로 설명하세요." value={form.summary} onChange={e => set('summary', e.target.value)} />
      </div>

      {/* 지표 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>기회점수 (0-100)</label>
          <input type="number" min={0} max={100} style={inputStyle} value={form.trendScore} onChange={e => set('trendScore', Number(e.target.value))} />
        </div>
        <div>
          <label style={labelStyle}>검색량 변화</label>
          <input style={inputStyle} placeholder="+45%" value={form.search} onChange={e => set('search', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>예상 GMV</label>
          <input style={inputStyle} placeholder="+30%" value={form.gmv} onChange={e => set('gmv', e.target.value)} />
        </div>
      </div>

      {/* 카테고리 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>카테고리</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.filter(c => c.id !== 'all').map(c => (
            <button
              key={c.id}
              onClick={() => toggleArr('categories', c.id)}
              style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: form.categories.includes(c.id) ? 'var(--accent-bg)' : 'var(--bg-subtle)',
                color: form.categories.includes(c.id) ? 'var(--accent-text)' : 'var(--text-muted)',
                border: `1px solid ${form.categories.includes(c.id) ? 'var(--accent-border)' : 'var(--border)'}`,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 플랫폼 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>플랫폼</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(PLATFORMS).map(([k, label]) => (
            <button
              key={k}
              onClick={() => toggleArr('platforms', k)}
              style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: form.platforms.includes(k) ? 'var(--accent-bg)' : 'var(--bg-subtle)',
                color: form.platforms.includes(k) ? 'var(--accent-text)' : 'var(--text-muted)',
                border: `1px solid ${form.platforms.includes(k) ? 'var(--accent-border)' : 'var(--border)'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 추천 품목 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>추천 품목</label>
        {form.products.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 7, border: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.reason}</div>
            </div>
            <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-sunken)', color: 'var(--text-muted)' }}>
              {p.urgency === 'high' ? '긴급' : p.urgency === 'mid' ? '중요' : '여유'}
            </span>
            <button className="btn ghost icon sm" onClick={() => set('products', form.products.filter((_, j) => j !== i))}>
              <Icon name="x" size={11} />
            </button>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: 6, marginTop: 6 }}>
          <input style={inputStyle} placeholder="품목명" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
          <input style={inputStyle} placeholder="추천 이유" value={newProduct.reason} onChange={e => setNewProduct(p => ({ ...p, reason: e.target.value }))} />
          <select style={inputStyle} value={newProduct.urgency} onChange={e => setNewProduct(p => ({ ...p, urgency: e.target.value as UrgencyLevel }))}>
            <option value="high">긴급</option>
            <option value="mid">중요</option>
            <option value="low">여유</option>
          </select>
          <button className="btn sm" onClick={() => {
            if (!newProduct.name.trim()) return;
            set('products', [...form.products, { ...newProduct, category: newProduct.category || form.categories[0] || '' }]);
            setNewProduct({ name: '', reason: '', urgency: 'mid', category: '' });
          }}>
            <Icon name="plus" size={12} />추가
          </button>
        </div>
      </div>

      {/* 체크리스트 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>실행 체크리스트</label>
        {form.checklist.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 7, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 40 }}>
              {item.d === 0 ? 'D-DAY' : item.d > 0 ? `D+${item.d}` : `D${item.d}`}
            </span>
            <span style={{ flex: 1, fontSize: 13 }}>{item.task}</span>
            <button className="btn ghost icon sm" onClick={() => set('checklist', form.checklist.filter((_, j) => j !== i))}>
              <Icon name="x" size={11} />
            </button>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 6, marginTop: 6 }}>
          <input type="number" style={inputStyle} placeholder="D+일수" value={newTask.d} onChange={e => setNewTask(p => ({ ...p, d: Number(e.target.value) }))} />
          <input style={inputStyle} placeholder="할 일" value={newTask.task} onChange={e => setNewTask(p => ({ ...p, task: e.target.value }))} />
          <button className="btn sm" onClick={() => {
            if (!newTask.task.trim()) return;
            set('checklist', [...form.checklist, { ...newTask, done: false }]);
            setNewTask({ d: 0, task: '' });
          }}>
            <Icon name="plus" size={12} />추가
          </button>
        </div>
      </div>

      {/* Pro 인사이트 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Pro 인사이트</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} placeholder="실무 경험 기반의 핵심 인사이트를 작성하세요." value={form.pro} onChange={e => set('pro', e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={onCancel}>취소</button>
        <button className="btn primary" onClick={handleSave}>
          <Icon name="check" size={13} />저장
        </button>
      </div>
    </div>
  );
}

// ── 커스텀 이벤트 목록 ─────────────────────────────────────────
function CustomEventList() {
  const { events, add, update, remove } = useCustomEvents();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MarketingEvent | null>(null);

  const handleSave = (ev: MarketingEvent) => {
    if (editing) {
      update(ev.id, ev);
      setEditing(null);
    } else {
      add(ev);
      setShowForm(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>직접 등록 이벤트</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            시즌이슈·업계 이벤트를 직접 추가하면 캘린더에 자동 반영됩니다.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {!showForm && !editing && (
          <button className="btn primary sm" onClick={() => setShowForm(true)}>
            <Icon name="plus" size={13} />이벤트 추가
          </button>
        )}
      </div>

      {(showForm && !editing) && (
        <div style={{ marginBottom: 20 }}>
          <EventForm onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editing && (
        <div style={{ marginBottom: 20 }}>
          <EventForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
        </div>
      )}

      {events.length === 0 && !showForm ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 12 }}>
            아직 등록된 이벤트가 없습니다.<br />시즌이슈, 업계 행사 등을 직접 추가해보세요.
          </div>
          <button className="btn primary sm" onClick={() => setShowForm(true)}>
            <Icon name="plus" size={13} />첫 이벤트 추가
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor(ev.type), flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ev.title}</span>
                  <span className={`chip`} style={{ fontSize: 10.5 }}>{typeLabel(ev.type)}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  {ev.start} ~ {ev.end} · 기회점수 {ev.trendScore}
                </div>
              </div>
              <button className="btn sm ghost" onClick={() => setEditing(ev)}>
                <Icon name="pen" size={12} />수정
              </button>
              <button className="btn sm ghost" style={{ color: 'var(--danger)' }} onClick={() => {
                if (confirm(`"${ev.title}" 이벤트를 삭제할까요?`)) remove(ev.id);
              }}>
                <Icon name="x" size={12} />삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 뉴스 감지 패널 ────────────────────────────────────────────
const PLATFORM_LABELS: Record<string, string> = {
  coupang: '쿠팡', naver: '네이버', '11st': '11번가',
  gmarket: 'G마켓', kakao: '카카오', wemakeprice: '위메프',
};

const CONFIDENCE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  high: { label: '날짜 확인됨', bg: 'oklch(0.94 0.06 145)', color: 'var(--success)' },
  mid:  { label: '날짜 추정', bg: 'oklch(0.97 0.04 75)', color: 'oklch(0.48 0.15 75)' },
  low:  { label: '날짜 미확인', bg: 'var(--bg-subtle)', color: 'var(--text-muted)' },
};

const TAG_COLOR: Record<string, { bg: string; color: string }> = {
  blue:   { bg: 'oklch(0.94 0.04 230)', color: 'oklch(0.42 0.12 230)' },
  green:  { bg: 'oklch(0.94 0.05 145)', color: 'oklch(0.42 0.12 145)' },
  orange: { bg: 'oklch(0.96 0.05 60)',  color: 'oklch(0.48 0.14 60)' },
};

function NewsDetectionPanel() {
  const { events, insights, status, updatedAt } = useNewsEvents();
  const { add } = useCustomEvents();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [insightTab, setInsightTab] = useState<'events' | 'trends'>('events');

  const handleAdd = async (ev: DetectedNewsEvent) => {
    const { toMarketingEvent } = await import('@/app/api/news-events/route');
    add(toMarketingEvent(ev));
    setAdded(prev => new Set([...prev, ev.id]));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>뉴스 인사이트</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            플랫폼 행사 일정 감지 · 소비 트렌드 기사 수집 (네이버 뉴스 자동)
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <StatusBadge
          status={status}
          label={status === 'ok' ? `행사 ${events.length}건 · 트렌드 ${insights.length}건` : status === 'loading' ? '검색 중...' : status === 'no-api-key' ? 'API 키 미설정' : '오류'}
        />
      </div>

      {/* 서브 탭 */}
      <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--bg-sunken)', borderRadius: 8, border: '1px solid var(--border)', maxWidth: '100%', overflowX: 'auto', marginBottom: 18 }}>
        {([
          { id: 'events', label: '플랫폼 행사', icon: 'calendar' },
          { id: 'trends', label: '소비 트렌드', icon: 'trending' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setInsightTab(t.id)}
            style={{
              padding: '5px 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, whiteSpace: 'nowrap' as const,
              color: insightTab === t.id ? 'var(--text)' : 'var(--text-muted)',
              background: insightTab === t.id ? 'var(--surface)' : 'transparent',
              boxShadow: insightTab === t.id ? 'var(--shadow-sm)' : 'none',
              border: insightTab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            <Icon name={t.icon} size={12} />{t.label}
          </button>
        ))}
      </div>

      {/* 플랫폼 행사 탭 */}
      {insightTab === 'events' && (
        <>
          {events.length === 0 && status === 'ok' && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13, background: 'var(--surface)', borderRadius: 10, border: '1px dashed var(--border)' }}>
              현재 감지된 플랫폼 행사 일정이 없습니다.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map(ev => {
              const conf = CONFIDENCE_STYLE[ev.confidence];
              const isAdded = added.has(ev.id);
              return (
                <div key={ev.id} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{ev.title}</span>
                        <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, fontWeight: 600, background: conf.bg, color: conf.color }}>
                          {conf.label}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)', padding: '1px 6px', background: 'var(--bg-subtle)', borderRadius: 4, border: '1px solid var(--border)' }}>
                          {PLATFORM_LABELS[ev.platform] ?? ev.platform}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 6 }}>
                        {ev.start} ~ {ev.end}
                      </div>
                      <a href={ev.sourceLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11.5, color: 'var(--accent-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Icon name="share" size={11} />
                        {ev.sourceTitle.slice(0, 60)}{ev.sourceTitle.length > 60 ? '…' : ''}
                      </a>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
                        뉴스 발행: {ev.pubDate}
                        {ev.confidence !== 'high' && (
                          <span style={{ marginLeft: 8, color: 'oklch(0.55 0.12 75)' }}>
                            * 날짜가 추정값입니다. 공식 공지를 확인하세요.
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`btn sm ${isAdded ? '' : 'primary'}`}
                      disabled={isAdded}
                      onClick={() => handleAdd(ev)}
                      style={{ flexShrink: 0 }}
                    >
                      {isAdded ? <><Icon name="check" size={12} />추가됨</> : <><Icon name="plus" size={12} />캘린더 추가</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 소비 트렌드 탭 */}
      {insightTab === 'trends' && (
        <>
          {insights.length === 0 && status === 'ok' && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13, background: 'var(--surface)', borderRadius: 10, border: '1px dashed var(--border)' }}>
              수집된 트렌드 기사가 없습니다.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map(ins => {
              const tc = TAG_COLOR[ins.tagColor] ?? TAG_COLOR.blue;
              return (
                <div key={ins.id} style={{ padding: '13px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: tc.bg, color: tc.color }}>
                          {ins.tag}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{ins.pubDate}</span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 5, lineHeight: 1.4 }}>
                        {ins.title}
                      </div>
                      {ins.summary && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>
                          {ins.summary}{ins.summary.length >= 120 ? '…' : ''}
                        </div>
                      )}
                      <a href={ins.sourceLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11.5, color: 'var(--accent-text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Icon name="share" size={11} />기사 원문 보기
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {updatedAt && (
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 12 }}>
          마지막 검색: {new Date(updatedAt).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
type PanelId = 'custom' | 'weather' | 'trends' | 'news';

export default function EventManager() {
  const [panel, setPanel] = useState<PanelId>('custom');

  const panels: { id: PanelId; label: string; icon: string }[] = [
    { id: 'custom', label: '이벤트 직접 등록', icon: 'plus' },
    { id: 'news', label: '뉴스 감지', icon: 'search' },
    { id: 'weather', label: '날씨 자동화', icon: 'cloud' },
    { id: 'trends', label: '트렌드 연동', icon: 'trending' },
  ];

  return (
    <div style={{ padding: '20px 28px 60px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>
          이벤트 관리
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          날씨 API 자동화, 네이버 트렌드 연동, 직접 이벤트 등록을 통해 캘린더를 실시간으로 풍부하게 만드세요.
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--bg-sunken)', borderRadius: 10, border: '1px solid var(--border)', maxWidth: '100%', overflowX: 'auto', marginBottom: 24 }}>
        {panels.map(p => (
          <button
            key={p.id}
            onClick={() => setPanel(p.id)}
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, whiteSpace: 'nowrap' as const,
              color: panel === p.id ? 'var(--text)' : 'var(--text-muted)',
              background: panel === p.id ? 'var(--surface)' : 'transparent',
              boxShadow: panel === p.id ? 'var(--shadow-sm)' : 'none',
              border: panel === p.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            <Icon name={p.icon} size={13} />{p.label}
          </button>
        ))}
      </div>

      {panel === 'custom' && <CustomEventList />}
      {panel === 'news' && <NewsDetectionPanel />}
      {panel === 'weather' && <WeatherPanel />}
      {panel === 'trends' && <TrendPanel />}
    </div>
  );
}
