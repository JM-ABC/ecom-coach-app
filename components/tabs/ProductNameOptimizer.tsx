'use client';

import React, { useState } from 'react';
import Icon from '@/components/Icon';
import { PLATFORMS } from '@/lib/data';

const results = [
  { name: '프리미엄 아기물티슈 100매 대용량 순면 무향 휴대용', score: 94, length: 26, keywords: 7, platform: 'coupang' },
  { name: '유아 물티슈 대용량 100매 순한 민감피부용 엠보싱 캡형', score: 91, length: 25, keywords: 8, platform: 'coupang' },
  { name: '아기 물티슈 100매입 저자극 천연펄프 정품 로켓배송', score: 88, length: 23, keywords: 6, platform: 'coupang' },
  { name: '[1+1] 물티슈 100매 대용량 아기 순한 엠보싱 무향 리필', score: 86, length: 25, keywords: 7, platform: 'coupang' },
];

const categories = [
  { id: 'baby', label: '출산/유아동' },
  { id: 'living', label: '생활용품' },
  { id: 'food', label: '식품' },
  { id: 'beauty', label: '뷰티' },
];

export default function ProductNameOptimizer() {
  const [input, setInput] = useState('대용량 물티슈 100매');
  const [category, setCategory] = useState('baby');
  const [platform, setPlatform] = useState('coupang');
  const [generated, setGenerated] = useState(true);

  const panel: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, marginBottom: 14 };
  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 11px', borderRadius: 999, fontSize: 13, fontWeight: 500,
    color: active ? 'var(--accent-text)' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
    background: active ? 'var(--accent-bg)' : 'var(--bg-subtle)',
    cursor: 'pointer', transition: 'all 120ms',
  });

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>상품명 최적화</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>검색 노출에 최적화된 상품명을 AI가 4가지 스타일로 제안합니다.</div>
      </div>

      <div style={panel}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>원본 상품명 또는 핵심 키워드</div>
        <textarea
          style={{ width: '100%', minHeight: 80, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', fontSize: 13, fontFamily: 'inherit', color: 'var(--text)', resize: 'vertical', lineHeight: 1.5 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="예: 대용량 물티슈 100매"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>카테고리</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {categories.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={chipStyle(category === c.id)}>{c.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>타깃 플랫폼</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['coupang', 'naver', '11st'].map(p => (
                <button key={p} onClick={() => setPlatform(p)} style={chipStyle(platform === p)}>{PLATFORMS[p]}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
          <button className="btn primary" onClick={() => setGenerated(true)}>
            <Icon name="sparkles" size={13} />상품명 생성
          </button>
          <button className="btn"><Icon name="refresh" size={13} />다시 생성</button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>쿠팡 권장 글자수: 20~40자</span>
        </div>
      </div>

      {generated && (
        <div style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>생성 결과 (4건)</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>점수순 정렬</div>
          </div>
          {results.map((r, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                  background: r.score >= 90 ? 'var(--accent-bg)' : 'var(--surface)',
                  border: `1px solid ${r.score >= 90 ? 'var(--accent-border)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: r.score >= 90 ? 'var(--accent-text)' : 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                }}>{r.score}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{r.name}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-subtle)', marginTop: 6, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="tag" size={10} /> 키워드 {r.keywords}개</span>
                    <span>·</span><span>{r.length}자</span>
                    <span>·</span><span>{PLATFORMS[r.platform]} 최적화</span>
                  </div>
                </div>
                <button className="btn sm"><Icon name="copy" size={11} />복사</button>
                <button className="btn sm primary"><Icon name="arrowRight" size={11} />카피로</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
