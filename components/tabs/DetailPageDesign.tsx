'use client';

import React, { useState } from 'react';
import Icon from '@/components/Icon';

const layouts = [
  { id: 'storytelling', label: '스토리텔링형', desc: '문제 → 공감 → 솔루션 순서' },
  { id: 'feature', label: '기능 나열형', desc: '스펙과 기능을 강조' },
  { id: 'comparison', label: '비교 강조형', desc: '경쟁사 대비 우위 강조' },
];

const sections = [
  { n: '01', title: '히어로 섹션', desc: '후킹 문구 + 대표 이미지 + CTA', h: 320 },
  { n: '02', title: '문제 제기', desc: '고객 공감 포인트 (감성적 톤)', h: 240 },
  { n: '03', title: '솔루션 제시', desc: '제품의 핵심 가치 3가지', h: 280 },
  { n: '04', title: '상세 기능', desc: '엠보싱·천연펄프·대용량 스펙', h: 360 },
  { n: '05', title: '실사용 리뷰', desc: '포토리뷰 + 평점 하이라이트', h: 240 },
  { n: '06', title: '구매 유도', desc: 'FAQ + 쿠폰 + 구매 버튼', h: 200 },
];

export default function DetailPageDesign() {
  const [layout, setLayout] = useState('storytelling');
  const panel: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, marginBottom: 14 };

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>상세페이지 디자인</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>카피를 바탕으로 상세페이지 구성을 자동으로 설계합니다.</div>
      </div>

      <div style={panel}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 10 }}>레이아웃 스타일</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {layouts.map(l => (
            <div
              key={l.id}
              onClick={() => setLayout(l.id)}
              style={{
                padding: 12, borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${layout === l.id ? 'var(--accent)' : 'var(--border)'}`,
                background: layout === l.id ? 'var(--accent-bg)' : 'var(--surface)',
              }}
            >
              <div style={{ height: 80, background: 'var(--bg-sunken)', borderRadius: 6, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4, padding: 8 }}>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 2 }} />
                <div style={{ height: 18, background: 'var(--border-strong)', borderRadius: 2 }} />
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 2, width: '70%' }} />
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 2, width: '60%' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{l.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{l.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={panel}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>페이지 구성 (6 섹션)</div>
          <div style={{ flex: 1 }} />
          <button className="btn sm" style={{ marginRight: 6 }}><Icon name="refresh" size={11} />재구성</button>
          <button className="btn sm primary"><Icon name="download" size={11} />PSD 내보내기</button>
        </div>
        {sections.map(s => (
          <div key={s.n} style={{
            display: 'flex', alignItems: 'stretch', gap: 12,
            padding: 10, borderRadius: 8, marginBottom: 6,
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-subtle)', padding: '4px 0', minWidth: 24 }}>
              {s.n}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>{s.desc}</div>
              <div style={{
                height: Math.min(60, s.h / 5),
                background: 'repeating-linear-gradient(135deg, var(--surface), var(--surface) 8px, var(--bg-sunken) 8px, var(--bg-sunken) 9px)',
                border: '1px dashed var(--border-strong)', borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)',
              }}>
                {s.h}px · 이미지/카피 플레이스홀더
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button className="btn sm ghost icon"><Icon name="pen" size={11} /></button>
              <button className="btn sm ghost icon"><Icon name="chevUp" size={11} /></button>
              <button className="btn sm ghost icon"><Icon name="chevDown" size={11} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
