'use client';

import React, { useState } from 'react';
import Icon from '@/components/Icon';

const copies: Record<string, { title: string; body: string }[]> = {
  emotional: [
    { title: '주인공', body: '밤새 뒤척이던 아기도, 엄마도 이제 편안해지는 밤.\n피부가 예민한 우리 아기를 위한 순면 100% 물티슈.' },
    { title: '공감형', body: '육아맘의 마음을 아는 물티슈.\n한 통에 100매, 잠깐의 여유를 더해드립니다.' },
  ],
  functional: [
    { title: '스펙 강조', body: '엠보싱 2배 두께 · 천연펄프 99.9% · 대용량 100매\n민감피부 임상테스트 완료' },
    { title: '비교형', body: '일반 물티슈 대비 2.3배 두꺼운 원단\n10회 사용해도 찢어지지 않는 내구성' },
  ],
  urgent: [
    { title: '한정 특가', body: '오늘만 1+1 · 쿠팡 로켓배송\n재고 소진 시 자동 종료됩니다.' },
    { title: 'FOMO', body: '이번 주 벌써 3,472명이 구매했어요.\n이 가격에 다시 만나기 어렵습니다.' },
  ],
};

const tones = [
  { id: 'emotional', label: '감성적' },
  { id: 'functional', label: '기능 강조' },
  { id: 'urgent', label: '긴박감' },
];

export default function CopyGenerator() {
  const [tone, setTone] = useState('emotional');
  const [generated, setGenerated] = useState(true);
  const activeCopies = copies[tone];

  const panel: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, marginBottom: 14 };
  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 11px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
    color: active ? 'var(--accent-text)' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
    background: active ? 'var(--accent-bg)' : 'var(--bg-subtle)',
    cursor: 'pointer', transition: 'all 120ms',
  });

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4 }}>카피 생성</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>상품의 핵심 가치를 3가지 톤앤매너로 표현해드립니다.</div>
      </div>

      <div style={panel}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
          상품명
          <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 6 }}>상품명 최적화에서 불러오기</span>
        </div>
        <input className="input" defaultValue="프리미엄 아기물티슈 100매 대용량 순면 무향 휴대용" style={{ height: 38 }} readOnly />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>핵심 셀링포인트</div>
            <textarea style={{ width: '100%', minHeight: 60, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', fontSize: 13, fontFamily: 'inherit', color: 'var(--text)', resize: 'vertical', lineHeight: 1.5 }} defaultValue="천연펄프 99.9%, 민감피부 임상완료, 대용량 100매" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>타깃 고객</div>
            <textarea style={{ width: '100%', minHeight: 60, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', fontSize: 13, fontFamily: 'inherit', color: 'var(--text)', resize: 'vertical', lineHeight: 1.5 }} defaultValue="0-3세 자녀를 둔 30대 육아맘, 민감피부 아기" />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>톤앤매너</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {tones.map(t => (
              <button key={t.id} onClick={() => setTone(t.id)} style={chipStyle(tone === t.id)}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn primary" onClick={() => setGenerated(true)}>
            <Icon name="sparkles" size={13} />카피 생성
          </button>
          <button className="btn"><Icon name="refresh" size={13} />다시 생성</button>
        </div>
      </div>

      {generated && (
        <div style={panel}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            생성 결과 · {tone === 'emotional' ? '감성적' : tone === 'functional' ? '기능 강조' : '긴박감'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {activeCopies.map((c, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{c.body}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button className="btn sm"><Icon name="copy" size={11} />복사</button>
                  <button className="btn sm primary"><Icon name="arrowRight" size={11} />상세페이지로</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
