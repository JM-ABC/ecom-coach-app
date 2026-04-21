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

const mobileTabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'calendar', label: '캘린더', icon: 'calendar' },
  { id: 'product-name', label: '상품명', icon: 'search' },
  { id: 'copy', label: '카피', icon: 'pen' },
  { id: 'detail-page', label: '상세', icon: 'layout' },
  { id: 'event-manager', label: '이벤트', icon: 'cloud' },
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
        {mobileTabs.map(t => (
          <button
            key={t.id}
            className={`mobile-nav-item${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
