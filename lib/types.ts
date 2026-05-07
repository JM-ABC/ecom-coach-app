export type EventType = 'holiday' | 'season' | 'platform' | 'promo' | 'trend' | 'weather';
export type UrgencyLevel = 'high' | 'mid' | 'low';
export type TabId = 'calendar' | 'product-name' | 'copy' | 'detail-page' | 'event-manager';
export type EventSource = 'static' | 'weather-api' | 'naver-trend' | 'custom';
export type ViewMode = 'focus' | 'grid' | 'timeline';

export interface Product {
  name: string;
  reason: string;
  urgency: UrgencyLevel;
  category: string;
  priceRange?: { min: number; max: number };
  prepDays?: number;
  momqTip?: string;
}

export interface ChecklistItem {
  d: number;
  task: string;
  done: boolean;
}

export interface MarketingEvent {
  id: string;
  title: string;
  type: EventType;
  start: string;
  end: string;
  categories: string[];
  platforms: string[];
  summary: string;
  trendScore: number;
  search: string;
  gmv: string;
  products: Product[];
  checklist: ChecklistItem[];
  pro: string;
  source?: EventSource;
}

export interface Category {
  id: string;
  label: string;
  parent?: string;
}

export interface CategoryGroup {
  id: string;
  label: string;
  items: Category[];
}

export interface PlatformMeta {
  label: string;
  color: string;
  bg: string;
  note?: string;
}

export interface PlatformInsight {
  tip: string;
  action: string;
  metric: string;
}
