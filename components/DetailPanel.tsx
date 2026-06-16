'use client';

import React, { useState } from 'react';
import Icon from './Icon';
import { PlatformInsights } from './calendar/CalendarParts';
import { CATEGORIES, PLATFORMS, catColor, typeLabel, typeChip, fmtDateFull, daysUntil, isActive, getPlatformInsight } from '@/lib/data';
import { useEventTrend } from '@/hooks/useEventTrend';
import { useCustomEvents } from '@/hooks/useCustomEvents';
import { exportDetailToExcel } from '@/lib/exportExcel';
import type { MarketingEvent } from '@/lib/types';

const urgencyStyle = (u: string) => ({
  high: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  mid: { background: 'var(--warning-bg)', color: 'oklch(0.48 0.15 75)' },
  low: { background: 'var(--bg-subtle)', color: 'var(--text-muted)' },
}[u] ?? {});

const urgencyLabel = (u: string) => ({ high: '긴급', mid: '중요', low: '여유' }[u] ?? u);

const GIFT_MAP: Record<string, { name: string; reason: string }> = {
  b_diaper:   { name: '기저귀 파우치 (방수 소형)', reason: '기저귀 교체 시 휴대 필수' },
  b_wipe:     { name: '휴대용 물티슈 케이스', reason: '물티슈 보관 편의' },
  b_toy:      { name: '스티커북 / 색연필 세트', reason: '완구 구매 어린이 추가 선물' },
  b_fashion:  { name: '유아 양말 세트 (3켤레)', reason: '의류 구매 시 세트 완성' },
  b_formula:  { name: '젖병 세정 솔 세트', reason: '분유 수유 필수 소모품' },
  b_bedding:  { name: '미니 베개 / 경추 쿠션', reason: '침구 구매 시 기능 보완' },
  b_safety:   { name: '모서리 보호대 세트 (8p)', reason: '안전용품 보완 구성' },
  b_carry:    { name: '멀티 파우치 (방수)', reason: '외출용품 정리 보완' },
  b_stroller: { name: '유모차 음료 홀더', reason: '유모차 편의 액세서리' },
  b_carseat:  { name: '차량용 선쉐이드 (2p)', reason: '카시트 탑승 자외선 차단' },
  b_bath:     { name: '아기 목욕 타월 / 욕조 온도계', reason: '목욕 세트 완성' },
  b_hygiene:  { name: '휴대용 손세정 파우치', reason: '위생용품 외출 대응' },
  b_furniture:{ name: '조립 방지 패드 세트', reason: '가구 바닥 보호 보완' },
  b_feed:     { name: '수유 패드 소형 팩', reason: '수유 시 필수 소모품' },
  b_wean:     { name: '실리콘 빕 (턱받이)', reason: '이유식기 세트 완성' },
  b_suppl:    { name: '영양제 휴대 케이스', reason: '복약 편의성 향상' },
  l_body:     { name: '핸드크림 샘플 세트', reason: '바디케어 브랜드 체험' },
  l_hair:     { name: '헤어밴드 / 미니 트리트먼트', reason: '헤어케어 보완 구성' },
  l_oral:     { name: '치실 / 가글 샘플', reason: '구강케어 루틴 완성' },
  l_tissue:   { name: '미니 물티슈 세트 (10매×3)', reason: '화장지 보완 휴대용' },
  l_sanitary: { name: '위생 파우치 (소형)', reason: '위생용품 휴대 편의' },
  l_laundry:  { name: '세탁 망 세트 (소/중)', reason: '세탁 세트 완성' },
  l_clean:    { name: '수세미 / 고무장갑 세트', reason: '청소 세트 보완' },
  l_air:      { name: '미니 탈취제 (2p)', reason: '공기케어 보완 소모품' },
  l_health:   { name: '약통 케이스 / 파우치', reason: '건강용품 휴대 보완' },
  l_bath:     { name: '논슬립 욕실 스티커 세트', reason: '욕실 안전 보완' },
  l_storage:  { name: '라벨 스티커 세트', reason: '수납 정리 완성' },
  l_electric: { name: '멀티탭 안전 커버 세트', reason: '전기용품 안전 보완' },
};

const COMMON_MD_CHECKLIST = [
  { d: -21, task: '전환율·매출 목표 KPI 설정 (이벤트 기간 목표 매출 확정)' },
  { d: -14, task: '상세페이지·대표 썸네일 시즌 버전 업데이트' },
  { d: -7,  task: '경쟁사 주요 상품 가격·기획전 현황 모니터링' },
  { d: -7,  task: '리뷰 수·평점 사전 점검 (목표 미달 시 체험단 즉시 투입)' },
  { d: -3,  task: '플랫폼별 가격 통일성 체크 (맘큐·쿠팡·네이버 격차 확인)' },
  { d: 0,   task: '광고 ROAS 기준치 설정 및 일일 예산 최종 확정' },
  { d: 3,   task: '품절 임박 상품 → 대체 상품 전환 또는 사전예약 오픈' },
  { d: 7,   task: '부정 리뷰·Q&A 실시간 모니터링 및 대응' },
  { d: 14,  task: '행사 성과 분석 (전환율·ROAS·신규/재구매 비율 리포트)' },
];

const MOMQ_CROSSELL = [
  { name: '하기스 기저귀 (맞춤 사이즈)', reason: '맘큐 핵심 품목 — 이벤트 동반 구매 1위', urgency: 'high' as const, category: 'b_diaper' },
  { name: '하기스 물티슈 대용량 묶음', reason: '기저귀 동반 구매 최상위 조합, 반복 구매', urgency: 'high' as const, category: 'b_wipe' },
  { name: '분유·어린이 영양식 (월령별)', reason: '정기 보충 구매, 재구매 락인 핵심 품목', urgency: 'mid' as const, category: 'b_formula' },
];

function fmtGiftPrice(priceRange?: { min: number; max: number }) {
  if (!priceRange) return '단가의 10% 수준';
  const lo = Math.round(priceRange.min * 0.1 / 500) * 500;
  const hi = Math.round(priceRange.max * 0.1 / 500) * 500;
  return `₩${lo.toLocaleString()}~₩${hi.toLocaleString()}`;
}

interface DetailPanelProps {
  event: MarketingEvent;
  onClose: () => void;
  initialTab?: 'plan' | 'products' | 'gift' | 'insights';
  onOpenPromoPlan?: (e: MarketingEvent) => void;
}

export default function DetailPanel({ event, onClose, initialTab = 'plan', onOpenPromoPlan }: DetailPanelProps) {
  const [tab, setTab] = useState<'plan' | 'products' | 'gift' | 'insights'>(initialTab);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [commonChecked, setCommonChecked] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>(
    Object.fromEntries(event.checklist.map((c, i) => [i, c.done]))
  );

  const { add: addCustomEvent } = useCustomEvents();

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleExcelExport = () => {
    exportDetailToExcel(event, checked, commonChecked);
  };

  const handleShare = () => {
    const dateStr = event.start === event.end ? event.start : `${event.start} ~ ${event.end}`;
    const text = `📅 ${event.title}\n${dateStr}\n\n${event.summary}`;
    navigator.clipboard.writeText(text).then(() => showFeedback('클립보드에 복사됨 ✓'));
  };

  const handleDuplicate = () => {
    addCustomEvent({ ...event, id: `custom-dup-${event.id}-${Date.now()}`, source: 'custom' });
    showFeedback('이벤트 관리 탭에 복제됨 ✓');
  };

  const toggle = (i: number) => setChecked(p => ({ ...p, [i]: !p[i] }));
  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = event.checklist.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const trendData = useEventTrend(event.categories, event.start);
  const dU = daysUntil(event.start);
  const active = isActive(event);

  const subtabs = [
    { id: 'plan' as const, label: '액션 플랜', icon: 'target' },
    { id: 'products' as const, label: `추천 품목 (${event.products.length})`, icon: 'package' },
    { id: 'gift' as const, label: '사은품 추천', icon: 'crown' },
    { id: 'insights' as const, label: '실무 인사이트', icon: 'lightbulb' },
  ];

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.35)', zIndex: 110, animation: 'fadeIn 180ms var(--easing)' }}
        onClick={onClose}
      />
      <div className="detail-panel" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 540, maxWidth: '100vw',
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)', zIndex: 111,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'slideIn 220ms var(--easing)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: catColor(event.type) }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span className={`chip ${typeChip(event.type)}`}>{typeLabel(event.type)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                {fmtDateFull(event.start)}
                {event.end !== event.start && ` – ${fmtDateFull(event.end)}`}
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text)', marginBottom: 4 }}>
              {event.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{event.summary}</div>
          </div>
          <button className="btn ghost icon sm" onClick={onClose}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Sub tabs */}
        <div className="detail-panel-tabs" style={{ display: 'flex', padding: '0 20px', borderBottom: '1px solid var(--border)', gap: 2, alignItems: 'center' }}>
          {subtabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 10px', fontSize: 13, fontWeight: 500,
                color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 4,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <Icon name={t.icon} size={12} />{t.label}
            </button>
          ))}
          {onOpenPromoPlan && (
            <>
              <div style={{ width: 8, flexShrink: 0 }} />
              <button
                onClick={() => onOpenPromoPlan(event)}
                style={{
                  padding: '6px 10px', fontSize: 12, fontWeight: 600, marginBottom: -1,
                  display: 'flex', alignItems: 'center', gap: 4, borderRadius: 6,
                  background: 'linear-gradient(135deg, var(--accent) 0%, oklch(0.55 0.25 280) 100%)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                <Icon name="sparkles" size={11} />AI 기획서
              </button>
            </>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {tab === 'plan' && (
            <>
              {/* 맘큐 대응 전략 — platform 이벤트에서만 표시 */}
              {event.type === 'platform' && (() => {
                const momqInsight = getPlatformInsight(event, 'momq');
                if (!momqInsight) return null;
                return (
                  <div style={{ marginBottom: 22, padding: '14px 16px', borderRadius: 10, background: 'oklch(0.97 0.028 20)', border: '1.5px solid oklch(0.88 0.06 20)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'oklch(0.68 0.15 20)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="sparkles" size={11} />맘큐 대응 전략
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: momqInsight.action ? 10 : 0 }}>{momqInsight.tip}</div>
                    {momqInsight.action && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'oklch(0.68 0.15 20)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="arrowRight" size={10} stroke={2.5} />{momqInsight.action}
                        </span>
                        {momqInsight.metric && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>· {momqInsight.metric}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Metrics */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                  <Icon name="trendUp" size={11} />기회 지표
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: '기회점수', value: `${event.trendScore}`, sub: '/100', ref: '0~100점', color: 'var(--accent-text)' },
                    {
                      label: '검색량 변화',
                      value: trendData?.change ?? event.search,
                      sub: '',
                      ref: trendData ? trendData.basis : '추정치',
                      color: 'var(--success)',
                    },
                    { label: '예상 GMV 변화', value: event.gmv, sub: '', ref: '추정치', color: 'var(--success)' },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: m.color, fontVariantNumeric: 'tabular-nums', marginTop: 3 }}>
                        {m.value}
                        {m.sub && <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 400 }}>{m.sub}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>{m.ref}</div>
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
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
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
                            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: 'var(--danger)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                              지금 해야 함
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 공통 MD 체크리스트 */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="flag" size={11} />공통 MD 체크리스트
                  </div>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: 'var(--text-subtle)', background: 'var(--bg-sunken)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>Amazon MD 표준</span>
                </div>
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 8, padding: '12px 12px 4px 36px', border: '1px solid var(--border)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 21, top: 12, bottom: 12, width: 2, background: 'var(--border)' }} />
                  {COMMON_MD_CHECKLIST.map((item, i) => {
                    const isDone = commonChecked[i] ?? false;
                    const isActiveItem = !isDone && item.d <= 0 && item.d >= -3;
                    return (
                      <div key={i} style={{ position: 'relative', paddingBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div
                          style={{
                            position: 'absolute', left: -23, top: 3,
                            width: 20, height: 20, borderRadius: '50%',
                            background: isDone ? 'var(--success)' : isActiveItem ? 'var(--accent)' : 'var(--surface)',
                            border: `2px solid ${isDone ? 'var(--success)' : isActiveItem ? 'var(--accent)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, cursor: 'pointer', color: isDone || isActiveItem ? '#fff' : undefined,
                          }}
                          onClick={() => setCommonChecked(p => ({ ...p, [i]: !p[i] }))}
                        >
                          {isDone && <Icon name="check" size={10} stroke={3} />}
                          {isActiveItem && !isDone && <Icon name="alert" size={10} stroke={2.5} />}
                        </div>
                        <div style={{ minWidth: 48, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', paddingTop: 2 }}>
                          {item.d === 0 ? 'D-DAY' : item.d > 0 ? `D+${item.d}` : `D${item.d}`}
                        </div>
                        <div style={{ flex: 1, fontSize: 12, paddingTop: 1, lineHeight: 1.5, color: isDone ? 'var(--text-subtle)' : 'var(--text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {item.task}
                          {isActiveItem && !isDone && (
                            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: 'var(--danger)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>지금 해야 함</span>
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
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)', marginRight: 4 }}>플랫폼:</span>
                  {event.platforms.length > 0 ? event.platforms.map(p => (
                    <span key={p} className="chip">{PLATFORMS[p] || p}</span>
                  )) : <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>해당 없음</span>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)', marginRight: 4 }}>카테고리:</span>
                  {event.categories.length > 0 ? event.categories.map(c => {
                    const cat = CATEGORIES.find(x => x.id === c);
                    return <span key={c} className="chip">{cat?.label || c}</span>;
                  }) : <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>전체</span>}
                </div>
              </div>
            </>
          )}

          {tab === 'products' && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
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
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
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
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)' }}>
                  이 이벤트는 품목별 제안보다는 브랜드 이미지 차원에서 접근하는 것을 추천합니다.
                </div>
              )}

              {/* 맘큐 핵심 상시 크로스셀 */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                  <Icon name="refresh" size={11} />맘큐 핵심 상시 크로스셀
                  <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontWeight: 400, marginLeft: 4 }}>— 모든 이벤트 필수 동반 기획</span>
                </div>
                {MOMQ_CROSSELL.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)', marginBottom: 6,
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="refresh" size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', ...urgencyStyle(p.urgency) }}>{urgencyLabel(p.urgency)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'gift' && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                추천 품목 단가의 <strong style={{ color: 'var(--accent-text)' }}>10%</strong> 수준 사은품 제안입니다. 구매 전환율 향상과 객단가 방어에 활용하세요.
              </div>
              {event.products.filter(p => GIFT_MAP[p.category]).map((p, i) => {
                const gift = GIFT_MAP[p.category];
                return (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 2 }}>본 제품</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                        {p.priceRange && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                            ₩{p.priceRange.min.toLocaleString()}~₩{p.priceRange.max.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 2 }}>사은품 단가 기준</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-text)', fontVariantNumeric: 'tabular-nums' }}>
                          {fmtGiftPrice(p.priceRange)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
                      <Icon name="crown" size={12} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-text)' }}>{gift.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{gift.reason}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {event.products.filter(p => !GIFT_MAP[p.category]).length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 8 }}>
                  * 사은품 매핑이 없는 품목 {event.products.filter(p => !GIFT_MAP[p.category]).length}개는 제외됨
                </div>
              )}
            </div>
          )}

          {tab === 'insights' && (
            <div style={{ marginBottom: 22 }}>
              <div style={{
                padding: 14, borderRadius: 10, marginBottom: 16,
                background: 'linear-gradient(135deg, oklch(0.97 0.03 75) 0%, var(--surface) 100%)',
                border: '1px solid var(--cat-season-border)',
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--cat-season)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  실무 인사이트
                </div>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {event.pro}
                </div>
              </div>
              {event.platforms.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                    <Icon name="share" size={11} />플랫폼별 인사이트
                  </div>
                  <PlatformInsights event={event} compact />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-subtle)' }}>
          <button className="btn sm ghost" onClick={handleShare}>
            <Icon name="copy" size={12} />복사
          </button>
          <button className="btn sm" onClick={handleDuplicate}>
            <Icon name="plus" size={12} />이벤트에 추가
          </button>
          <button className="btn sm" onClick={handleExcelExport}>
            <Icon name="download" size={12} />엑셀 내보내기
          </button>
          {feedback && (
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>{feedback}</span>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn primary sm" onClick={handleDuplicate}>
            <Icon name="plus" size={12} />내 계획에 추가
          </button>
        </div>
      </div>
    </>
  );
}
