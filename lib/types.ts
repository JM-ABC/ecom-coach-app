export type EventType = 'holiday' | 'season' | 'platform' | 'promo' | 'trend' | 'weather';
export type UrgencyLevel = 'high' | 'mid' | 'low';
export type TabId =
  | 'calendar'
  | 'season-promos'
  | 'crm-promos'
  | 'product-name'
  | 'copy'
  | 'detail-page';
export type EventSource = 'static' | 'weather-api' | 'naver-trend' | 'custom' | 'news';
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
  counterStrategy?: string;
  sourceLink?: string;
  mdBrief?: { items: string; concept: string; insight: string };
  platformTips?: Record<string, PlatformInsight>;
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

export type LifecycleTrigger =
  | 'pre-birth'   // 출산 준비 (임신 후기)
  | 'newborn'     // 신생아 0-3개월
  | 'infant'      // 영아 3-12개월
  | 'toddler'     // 유아 1-3세
  | 'preschool'   // 미취학 3-7세
  | 'always-on';  // 상시

export interface LifecycleReco {
  id: string;
  title: string;
  concept: string;
  trigger: LifecycleTrigger;
  categories: string[];
  platforms: string[];
  products: Product[];
  checklist: ChecklistItem[];
  pro: string;
  platformTips?: Record<string, PlatformInsight>;
}
