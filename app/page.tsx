'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MarketingCalendar from '@/components/calendar/MarketingCalendar';
import ProductNameOptimizer from '@/components/tabs/ProductNameOptimizer';
import CopyGenerator from '@/components/tabs/CopyGenerator';
import DetailPageDesign from '@/components/tabs/DetailPageDesign';
import EventManager from '@/components/tabs/EventManager';
import SeasonPromos from '@/components/tabs/SeasonPromos';
import Icon from '@/components/Icon';
import type { TabId } from '@/lib/types';

const mobileTabs: { id: TabId; label: string; icon: string; disabled?: boolean }[] = [
  { id: 'calendar', label: '캘린더', icon: 'calendar' },
  { id: 'season-promos', label: '시즌', icon: 'cloud' },
  { id: 'crm-promos', label: 'CRM', icon: 'users' },
  { id: 'product-name', label: '상품명', icon: 'search', disabled: true },
  { id: 'copy', label: '카피', icon: 'pen', disabled: true },
  { id: 'detail-page', label: '상세', icon: 'layout', disabled: true },
];

export default function Home() {
  const [tab, setTab] = useState<TabId>('calendar');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar activeTab={tab} onTabChange={setTab} />
      <div className="main-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {tab === 'calendar' && <MarketingCalendar />}
        {tab === 'season-promos' && <SeasonPromos />}
        {tab === 'crm-promos' && (
          <div style={{ padding: 32, color: 'var(--text-muted)', fontSize: 'var(--fs-base)' }}>
            CRM 기획전 — 준비 중
          </div>
        )}
        {tab === 'product-name' && <ProductNameOptimizer />}
        {tab === 'copy' && <CopyGenerator />}
        {tab === 'detail-page' && <DetailPageDesign />}
      </div>
      {/* 모바일 경쟁사 링크 바 */}
      <div className="mobile-platform-bar">
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
          <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer" title={p.label}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 16, textDecoration: 'none', flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 4, background: p.color, color: '#fff', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{p.short}</span>
            <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500 }}>{p.label}</span>
          </a>
        ))}
      </div>

      <nav className="mobile-nav">
        {mobileTabs.slice(0, 3).map(t => (
          <button
            key={t.id}
            className={`mobile-nav-item${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
        <a href="/brief" className="mobile-nav-item" style={{ textDecoration: 'none' }}>
          <Icon name="trending" size={18} />
          브리핑
        </a>
        {mobileTabs.slice(3).map(t => (
          <button
            key={t.id}
            className="mobile-nav-item"
            style={{ opacity: 0.35, pointerEvents: 'none' }}
            disabled
          >
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
