'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MarketingCalendar from '@/components/calendar/MarketingCalendar';
import ProductNameOptimizer from '@/components/tabs/ProductNameOptimizer';
import CopyGenerator from '@/components/tabs/CopyGenerator';
import DetailPageDesign from '@/components/tabs/DetailPageDesign';
import type { TabId } from '@/lib/types';

export default function Home() {
  const [tab, setTab] = useState<TabId>('calendar');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar activeTab={tab} onTabChange={setTab} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {tab === 'calendar' && <MarketingCalendar />}
        {tab === 'product-name' && <ProductNameOptimizer />}
        {tab === 'copy' && <CopyGenerator />}
        {tab === 'detail-page' && <DetailPageDesign />}
      </div>
    </div>
  );
}
