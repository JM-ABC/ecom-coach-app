'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProductCandidate } from '@/lib/types';

const STORAGE_KEY = 'momq-candidate-cart';

function load(): ProductCandidate[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function save(items: ProductCandidate[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

export function useCandidateCart() {
  const [items, setItems] = useState<ProductCandidate[]>([]);
  useEffect(() => { setItems(load()); }, []);

  const add = useCallback((c: ProductCandidate) => {
    setItems(prev => {
      if (prev.some(p => p.id === c.id || p.name === c.name)) return prev;
      const next = [...prev, c]; save(next); return next;
    });
  }, []);
  const remove = useCallback((id: string) => {
    setItems(prev => { const next = prev.filter(p => p.id !== id); save(next); return next; });
  }, []);
  const clear = useCallback(() => { save([]); setItems([]); }, []);
  const has = useCallback((id: string) => items.some(p => p.id === id), [items]);

  return { items, add, remove, clear, has };
}
