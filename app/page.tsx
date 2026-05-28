'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MarketingCalendar from '@/components/calendar/MarketingCalendar';
import ProductNameOptimizer from '@/components/tabs/ProductNameOptimizer';
import CopyGenerator from '@/components/tabs/CopyGenerator';
import DetailPageDesign from '@/components/tabs/DetailPageDesign';
import EventManager from '@/components/tabs/EventManager';
import Icon from '@/components/Icon';
import type { TabId } from '@/lib/types';

const mobileTabs: { id: TabId; label: string; icon: string; disabled?: boolean }[] = [
  { id: 'calendar', label: '캘린더', icon: 'calendar' },
  { id: 'event-manager', label: '이벤트', icon: 'cloud' },
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
        {tab === 'product-name' && <ProductNameOptimizer />}
        {tab === 'copy' && <CopyGenerator />}
        {tab === 'detail-page' && <DetailPageDesign />}
        {tab === 'event-manager' && <EventManager />}
      </div>
      <nav className="mobile-nav">
        {mobileTabs.slice(0, 2).map(t => (
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
        {mobileTabs.slice(2).map(t => (
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
