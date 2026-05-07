'use client';

import React, { CSSProperties } from 'react';
import Icon from './Icon';
import type { TabId } from '@/lib/types';

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
  usageBar: {
    padding: 8, borderRadius: 8, background: 'var(--surface)',
    border: '1px solid var(--border)', marginBottom: 8,
  },
  usageTrack: { height: 4, borderRadius: 2, background: 'var(--bg-sunken)', overflow: 'hidden' },
  usageFill: { height: '100%', background: 'var(--accent)', borderRadius: 2 },
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
  { id: 'product-name' as TabId, label: '상품명 최적화', icon: 'search', disabled: true },
  { id: 'copy' as TabId, label: '카피 생성', icon: 'pen', disabled: true },
  { id: 'detail-page' as TabId, label: '상세페이지', icon: 'layout', disabled: true },
  { id: 'event-manager' as TabId, label: '이벤트 관리', icon: 'cloud' },
];

const tools = [
  { id: 'trends', label: '트렌드 리포트', icon: 'trending' },
  { id: 'competitor', label: '경쟁사 모니터링', icon: 'eye' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
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
          Seller<span style={{ color: 'var(--accent)' }}>kit</span>
        </div>
        <div style={{ flex: 1 }} />
        <button style={{ ...s.navItem, padding: 4, marginBottom: 0, color: 'var(--text-subtle)' }}>
          <Icon name="chevDown" size={14} />
        </button>
      </div>

      <div style={{ padding: '0 8px', marginBottom: 6 }}>
        <button className="btn sm" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-subtle)', gap: 6 }}>
          <Icon name="search" size={13} />
          <span>검색</span>
          <span style={{ flex: 1 }} />
          <span className="kbd">⌘K</span>
        </button>
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
            {t.disabled && (
              <span style={{ flex: 1 }} />
            )}
            {t.disabled && (
              <span className="chip" style={{ fontSize: 9.5, padding: '0 5px', height: 16 }}>Soon</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={s.groupLabel as CSSProperties}>인사이트</div>
        {tools.map(t => (
          <div key={t.id} style={s.navItem}>
            <Icon name={t.icon} size={15} />
            <span>{t.label}</span>
            <span style={{ flex: 1 }} />
            <span className="chip" style={{ fontSize: 9.5, padding: '0 5px', height: 16 }}>Soon</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
          <div style={s.avatar}>브</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)' }}>브랜드 담당자</div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>쿠팡 · 네이버 · 맘큐</div>
          </div>
          <button className="btn icon sm ghost"><Icon name="settings" size={13} /></button>
        </div>
      </div>
    </aside>
  );
}
