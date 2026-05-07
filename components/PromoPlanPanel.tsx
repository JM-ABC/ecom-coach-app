'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Icon from './Icon';
import type { MarketingEvent } from '@/lib/types';

interface PromoPlanPanelProps {
  event: MarketingEvent;
  onClose: () => void;
  weatherHint?: string;
}

type PlanState = 'idle' | 'loading' | 'done' | 'error';

export default function PromoPlanPanel({ event, onClose, weatherHint }: PromoPlanPanelProps) {
  const [state, setState] = useState<PlanState>('idle');
  const [planText, setPlanText] = useState('');
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    setState('loading');
    setPlanText('');
    setError('');

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      // 1. 네이버 트렌드 데이터 가져오기
      let naverTrends: { category: string; latestRatio: number; changeVsPrevWeek: number; keywords: string[] }[] = [];
      try {
        const trendsRes = await fetch('/api/trends', { signal: ctrl.signal });
        if (trendsRes.ok) {
          const { trends } = await trendsRes.json();
          naverTrends = (trends ?? [])
            .filter((t: { ourKey: string }) => event.categories.includes(t.ourKey))
            .map((t: { title: string; latestRatio: number; changeVsPrevWeek: number; keywords: string[] }) => ({
              category: t.title,
              latestRatio: t.latestRatio,
              changeVsPrevWeek: t.changeVsPrevWeek,
              keywords: t.keywords,
            }));
        }
      } catch {
        // 트렌드 없이도 기획서 생성 가능
      }

      // 2. Gemini 기획서 생성 요청
      const res = await fetch('/api/promo-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          title: event.title,
          date: `${event.start} ~ ${event.end}`,
          products: event.products,
          trendScore: event.trendScore,
          summary: event.summary,
          naverTrends,
          weatherHint,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      // 3. 스트리밍 읽기
      const reader = res.body?.getReader();
      if (!reader) throw new Error('스트리밍 응답을 받을 수 없습니다.');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setPlanText(accumulated);
      }

      setState('done');
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setError(String(err));
      setState('error');
    }
  }, [event, weatherHint]);

  // 자동 스크롤
  useEffect(() => {
    if (state === 'loading' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [planText, state]);

  // 언마운트 시 abort
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(planText);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = planText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([planText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}-promo-plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(17, 24, 39, 0.35)',
          zIndex: 60,
          animation: 'fadeIn 180ms var(--easing)',
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 620,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 61,
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 220ms var(--easing)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent) 0%, oklch(0.55 0.25 280) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
          }}>
            <Icon name="sparkles" size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              AI 프로모션 기획서
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {event.title} · Gemini Flash
            </div>
          </div>
          <button className="btn ghost icon sm" onClick={onClose}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {state === 'idle' && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 16, textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-subtle)',
              }}>
                <Icon name="sparkles" size={28} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  맘큐 자사몰 기획서 생성
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 340 }}>
                  네이버 검색 트렌드 + 이벤트 데이터를 기반으로<br />
                  맘큐 자사몰 전용 프로모션 기획서를 자동 생성합니다.
                </div>
              </div>
              <button
                className="btn primary"
                style={{ marginTop: 8, padding: '10px 28px', fontSize: 13.5 }}
                onClick={generate}
              >
                <Icon name="sparkles" size={14} />기획서 생성하기
              </button>
            </div>
          )}

          {state === 'loading' && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                marginBottom: 16, fontSize: 12.5, color: 'var(--accent-text)',
              }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid var(--accent)',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 800ms linear infinite',
                }} />
                기획서를 생성하고 있습니다...
              </div>
              <div
                className="promo-plan-content"
                style={{
                  fontSize: 13.5, lineHeight: 1.75,
                  color: 'var(--text)', whiteSpace: 'pre-wrap',
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(planText) }}
              />
            </div>
          )}

          {state === 'done' && (
            <div
              className="promo-plan-content"
              style={{
                fontSize: 13.5, lineHeight: 1.75,
                color: 'var(--text)', whiteSpace: 'pre-wrap',
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(planText) }}
            />
          )}

          {state === 'error' && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 12, textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--danger-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--danger)',
              }}>
                <Icon name="alert" size={22} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
                기획서 생성에 실패했습니다
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300 }}>
                {error}
              </div>
              <button className="btn primary sm" onClick={generate} style={{ marginTop: 4 }}>
                다시 시도
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {(state === 'done' || (state === 'loading' && planText.length > 0)) && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8,
            background: 'var(--bg-subtle)',
          }}>
            {state === 'done' && (
              <button className="btn sm ghost" onClick={generate}>
                <Icon name="refresh" size={12} />재생성
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button className="btn sm" onClick={handleCopy} disabled={state === 'loading'}>
              <Icon name="copy" size={12} />복사
            </button>
            <button className="btn primary sm" onClick={handleDownload} disabled={state === 'loading'}>
              <Icon name="download" size={12} />다운로드
            </button>
          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .promo-plan-content h2 { font-size: 16px; font-weight: 700; margin: 20px 0 8px; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 6px; }
        .promo-plan-content h3 { font-size: 14px; font-weight: 600; margin: 16px 0 6px; color: var(--text); }
        .promo-plan-content ul, .promo-plan-content ol { padding-left: 20px; margin: 6px 0; }
        .promo-plan-content li { margin-bottom: 4px; }
        .promo-plan-content table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12.5px; }
        .promo-plan-content th, .promo-plan-content td { padding: 6px 10px; border: 1px solid var(--border); text-align: left; }
        .promo-plan-content th { background: var(--bg-subtle); font-weight: 600; }
      `}</style>
    </>
  );
}

/** 간단한 마크다운 → HTML 변환 (의존성 없이) */
function renderMarkdown(md: string): string {
  if (!md) return '';
  return md
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // unordered list
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // ordered list
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // table rows (basic)
    .replace(/\|---.*\|/g, '')
    .replace(/^\|(.+)\|$/gm, (_, row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean);
      return '<tr>' + cells.map((c: string) => `<td>${c}</td>`).join('') + '</tr>';
    })
    // line breaks
    .replace(/\n/g, '<br/>');
}
