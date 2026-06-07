'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MarketingCalendar from '@/components/calendar/MarketingCalendar';
import ProductNameOptimizer from '@/components/tabs/ProductNameOptimizer';
import CopyGenerator from '@/components/tabs/CopyGenerator';
import DetailPageDesign from '@/components/tabs/DetailPageDesign';
import SeasonPromos from '@/components/tabs/SeasonPromos';
import CRMPromos from '@/components/tabs/CRMPromos';
import InsightsPanel from '@/components/tabs/InsightsPanel';
import TrendReportPanel from '@/components/tabs/TrendReportPanel';
import Icon from '@/components/Icon';
import type { TabId } from '@/lib/types';

const mobileTabs: { id: TabId; label: string; icon: string; disabled?: boolean }[] = [
  { id: 'calendar',     label: '캘린더',  icon: 'calendar' },
  { id: 'season-promos',label: '시즌',    icon: 'cloud' },
  { id: 'crm-promos',   label: 'CRM',    icon: 'users' },
  { id: 'insights',     label: '인사이트', icon: 'trending' },
  { id: 'trend-report', label: '리포트',  icon: 'layout' },
];

export default function Home() {
  const [tab, setTab] = useState<TabId>('calendar');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar activeTab={tab} onTabChange={setTab} />
      <div className="main-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {tab === 'calendar' && <MarketingCalendar />}
        {tab === 'season-promos' && <SeasonPromos />}
        {tab === 'crm-promos' && <CRMPromos />}
        {tab === 'insights' && <InsightsPanel />}
        {tab === 'trend-report' && <TrendReportPanel />}
        {tab === 'product-name' && <ProductNameOptimizer />}
        {tab === 'copy' && <CopyGenerator />}
        {tab === 'detail-page' && <DetailPageDesign />}
      </div>
      <nav className="mobile-nav">
        {mobileTabs.map(t => (
          <button
            key={t.id}
            className={`mobile-nav-item${tab === t.id ? ' active' : ''}`}
            onClick={() => !t.disabled && setTab(t.id)}
            style={t.disabled ? { opacity: 0.35, pointerEvents: 'none' } : undefined}
            disabled={t.disabled}
          >
            <Icon name={t.icon} size={20} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
