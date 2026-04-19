import { useState, useCallback } from "react";

const DAILY_LIMIT = 3;

type UsageType = "product_name" | "copy" | "design";

interface DailyUsage {
  date: string;
  product_name: number;
  copy: number;
  design: number;
}

const getStorageKey = () => "seller_toolkit_daily_usage";

const getTodayStr = () => new Date().toISOString().slice(0, 10);

const getUsage = (): DailyUsage => {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw) as DailyUsage;
      if (parsed.date === getTodayStr()) return parsed;
    }
  } catch {}
  return { date: getTodayStr(), product_name: 0, copy: 0, design: 0 };
};

const saveUsage = (usage: DailyUsage) => {
  localStorage.setItem(getStorageKey(), JSON.stringify(usage));
};

export function useDailyUsage(type: UsageType) {
  const [usage, setUsage] = useState<DailyUsage>(getUsage);

  const count = usage[type];
  const remaining = Math.max(0, DAILY_LIMIT - count);
  const isLimitReached = remaining <= 0;

  const increment = useCallback(() => {
    const current = getUsage();
    const updated = { ...current, [type]: current[type] + 1 };
    saveUsage(updated);
    setUsage(updated);
  }, [type]);

  return { count, remaining, isLimitReached, increment, limit: DAILY_LIMIT };
}
