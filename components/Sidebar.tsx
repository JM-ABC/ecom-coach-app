'use client';

import React, { CSSProperties, useState, useEffect } from 'react';
import Icon from './Icon';
import type { TabId } from '@/lib/types';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) { setTheme(saved); document.documentElement.setAttribute('data-theme', saved); }
  }, []);
  const toggle = (t: 'light' | 'dark') => {
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };
  return { theme, toggle };
}

const s: Record<string, CSSProperties> = {
  sidebar: {
    width: 236, flexShrink: 0,
    background: 'var(--bg-subtle)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    height: '100vh', position: 'sticky', top: 0,
    padding: '12px 10px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px 12px' },
  brandMark: {
    width: 24, height: 24, borderRadius: 7,
    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(17,24,39,0.08)',
  },
  brandName: { fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' },
  groupLabel: {
    padding: '8px 8px 6px', fontSize: 11, fontWeight: 500,
    color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
    borderRadius: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)',
    cursor: 'pointer', marginBottom: 1, letterSpacing: '-0.005em',
    transition: 'background 120ms, color 120ms',
  },
  navItemActive: {
    background: 'var(--surface)', color: 'var(--text)',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
  },
  avatar: {
    width: 24, height: 24, borderRadius: 6,
    background: 'oklch(0.90 0.02 258)', color: 'var(--accent-text)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 600,
  },
};


interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'calendar' as TabId, label: '마케팅 캘린더', icon: 'calendar' },
  { id: 'event-manager' as TabId, label: '이벤트 관리', icon: 'cloud' },
  { id: 'product-name' as TabId, label: '상품명 최적화', icon: 'search', disabled: true },
  { id: 'copy' as TabId, label: '카피 생성', icon: 'pen', disabled: true },
  { id: 'detail-page' as TabId, label: '상세페이지', icon: 'layout', disabled: true },
];

const tools = [
  { id: 'trends', label: '트렌드 리포트', icon: 'trending' },
  { id: 'competitor', label: '경쟁사 모니터링', icon: 'eye' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <>
      {showSettings && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)', zIndex: 120, animation: 'fadeIn 180ms var(--easing)' }}
            onClick={() => setShowSettings(false)}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 340, background: 'var(--surface)', borderRadius: 14,
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
            zIndex: 121, padding: 24, animation: 'fadeIn 180ms var(--easing)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>설정</div>
              <div style={{ flex: 1 }} />
              <button className="btn icon sm ghost" onClick={() => setShowSettings(false)}>
                <Icon name="x" size={14} />
              </button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>테마</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['light', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => toggle(t)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                    background: theme === t ? 'var(--accent-bg)' : 'var(--bg-subtle)',
                    color: theme === t ? 'var(--accent-text)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 150ms',
                  }}
                >
                  {t === 'light' ? '☀️ 라이트' : '🌙 다크'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <aside style={s.sidebar} className="sidebar-desktop">
        <div style={s.brand}>
          <div style={s.brandMark}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7l8-4 8 4v10l-8 4-8-4V7z" />
              <path d="M4 7l8 4 8-4" />
              <path d="M12 11v10" />
            </svg>
          </div>
          <div style={s.brandName}>
            <span style={{ color: 'var(--accent)' }}>맘큐</span> MD 플래너
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={s.groupLabel as CSSProperties}>도구</div>
          {tabs.map(t => (
            <div
              key={t.id}
              onClick={t.disabled ? undefined : () => onTabChange(t.id)}
              style={{
                ...s.navItem,
                ...(activeTab === t.id ? s.navItemActive : {}),
                ...(t.disabled ? { opacity: 0.45, cursor: 'default', pointerEvents: 'none' } : {}),
              }}
            >
              <Icon name={t.icon} size={15} />
              <span>{t.label}</span>
              {t.disabled && <span style={{ flex: 1 }} />}
              {t.disabled && (
                <span className="chip" style={{ fontSize: 10, padding: '0 5px', height: 16 }}>Soon</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={s.groupLabel as CSSProperties}>인사이트</div>
          <a
            href="/brief"
            style={{ ...s.navItem, textDecoration: 'none', display: 'flex' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ''; (e.currentTarget as HTMLAnchorElement).style.color = ''; }}
          >
            <Icon name="trending" size={15} />
            <span>주간 수요 브리핑</span>
            <span style={{ flex: 1 }} />
            <span className="chip" style={{ fontSize: 10, padding: '0 5px', height: 16, color: 'var(--success)', background: 'var(--success-bg)', borderColor: 'transparent' }}>New</span>
          </a>
          {tools.map(t => (
            <div
              key={t.id}
              style={{ ...s.navItem, opacity: 0.45, cursor: 'default', pointerEvents: 'none' }}
            >
              <Icon name={t.icon} size={15} />
              <span>{t.label}</span>
              <span style={{ flex: 1 }} />
              <span className="chip" style={{ fontSize: 10, padding: '0 5px', height: 16 }}>Soon</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* 경쟁사 모니터링 */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 8, marginBottom: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, padding: '0 4px' }}>
            경쟁사 모니터링
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '0 2px' }}>
            {[
              { label: '쿠팡', short: '쿠', url: 'https://www.coupang.com', color: 'oklch(0.62 0.18 25)' },
              { label: '네이버', short: 'N', url: 'https://shopping.naver.com', color: 'oklch(0.55 0.15 150)' },
              { label: '11번가', short: '11', url: 'https://www.11st.co.kr', color: 'oklch(0.62 0.18 15)' },
              { label: 'G마켓', short: 'G', url: 'https://www.gmarket.co.kr', color: 'oklch(0.55 0.14 155)' },
              { label: '카카오', short: 'K', url: 'https://store.kakao.com', color: 'oklch(0.62 0.13 90)' },
              { label: '컬리', short: '컬', url: 'https://www.kurly.com', color: 'oklch(0.44 0.22 310)' },
              { label: '알리', short: 'A', url: 'https://ko.aliexpress.com', color: 'oklch(0.65 0.18 50)' },
              { label: '무신사', short: '무', url: 'https://www.musinsa.com', color: 'oklch(0.22 0 0)' },
              { label: 'GS샵', short: 'GS', url: 'https://www.gsshop.com', color: 'oklch(0.50 0.18 250)' },
            ].map(p => (
              <a
                key={p.label}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                title={p.label}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: 6,
                  background: p.color, color: '#fff',
                  fontSize: 10, fontWeight: 700, textDecoration: 'none',
                  letterSpacing: '-0.02em', flexShrink: 0,
                  opacity: 0.88,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.88')}
              >
                {p.short}
              </a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
            <div style={s.avatar}>맘</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>맘큐 MD 담당자</div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>맘큐 플랫폼</div>
            </div>
            <button className="btn icon sm ghost" onClick={() => setShowSettings(true)}><Icon name="settings" size={13} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
