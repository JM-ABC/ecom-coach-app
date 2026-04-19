// ============================================
// Other tabs — Product Name / Copy / Detail Page
// (simplified but polished redesigns)
// ============================================

const { useState: useStateT } = React;

const tabStyles = {
  root: { padding: '20px 28px 60px', maxWidth: 1200 },
  pageHead: { marginBottom: 18 },
  pageTitle: {
    fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
    color: 'var(--text)', marginBottom: 4,
  },
  pageSubtitle: { fontSize: 13, color: 'var(--text-muted)' },
  panel: {
    background: 'var(--surface)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    borderRadius: 10, padding: 18, marginBottom: 14,
  },
  label: {
    fontSize: 12, fontWeight: 500, color: 'var(--text)',
    marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5,
  },
  labelSub: { fontSize: 11, color: 'var(--text-subtle)', marginLeft: 6 },
  textarea: {
    width: '100%', minHeight: 80, padding: '10px 12px',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: 8,
    background: 'var(--surface)', fontSize: 13,
    fontFamily: 'inherit', color: 'var(--text)',
    resize: 'vertical', lineHeight: 1.5,
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  selectChip: {
    padding: '5px 11px', borderRadius: 999,
    fontSize: 12.5, fontWeight: 500,
    color: 'var(--text-muted)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    background: 'var(--bg-subtle)', cursor: 'pointer',
    transition: 'all 120ms',
  },
  selectChipActive: {
    color: 'var(--accent-text)',
    background: 'var(--accent-bg)',
    borderColor: 'var(--accent-border)',
  },
  resultCard: {
    padding: 12, borderRadius: 8,
    background: 'var(--bg-subtle)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
    marginBottom: 8,
  },
  resultTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 },
  resultMeta: { display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-subtle)', marginTop: 6 },
  scoreBar: {
    height: 4, borderRadius: 2, background: 'var(--bg-sunken)',
    width: 60, overflow: 'hidden',
  },
};

// ============ Product Name Optimizer ============
const ProductNameOptimizer = () => {
  const [input, setInput] = useStateT('대용량 물티슈 100매');
  const [category, setCategory] = useStateT('baby');
  const [platform, setPlatform] = useStateT('coupang');
  const [generated, setGenerated] = useStateT(true);

  const results = [
    { name: '프리미엄 아기물티슈 100매 대용량 순면 무향 휴대용', score: 94, length: 26, keywords: 7, platform: 'coupang' },
    { name: '유아 물티슈 대용량 100매 순한 민감피부용 엠보싱 캡형', score: 91, length: 25, keywords: 8, platform: 'coupang' },
    { name: '아기 물티슈 100매입 저자극 천연펄프 정품 로켓배송', score: 88, length: 23, keywords: 6, platform: 'coupang' },
    { name: '[1+1] 물티슈 100매 대용량 아기 순한 엠보싱 무향 리필', score: 86, length: 25, keywords: 7, platform: 'coupang' },
  ];

  return (
    <div style={tabStyles.root}>
      <div style={tabStyles.pageHead}>
        <div style={tabStyles.pageTitle}>상품명 최적화</div>
        <div style={tabStyles.pageSubtitle}>검색 노출에 최적화된 상품명을 AI가 4가지 스타일로 제안합니다.</div>
      </div>

      <div style={tabStyles.panel}>
        <div style={tabStyles.label}>원본 상품명 또는 핵심 키워드</div>
        <textarea
          style={tabStyles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 대용량 물티슈 100매"
        />

        <div style={{ ...tabStyles.twoCol, marginTop: 14 }}>
          <div>
            <div style={tabStyles.label}>카테고리</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['baby', 'living', 'food', 'beauty'].map(c => {
                const cat = window.CATEGORIES.find(x => x.id === c);
                return (
                  <button key={c} onClick={() => setCategory(c)}
                          style={{ ...tabStyles.selectChip, ...(category === c ? tabStyles.selectChipActive : {}) }}>
                    {cat?.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={tabStyles.label}>타깃 플랫폼</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['coupang', 'naver', '11st'].map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                        style={{ ...tabStyles.selectChip, ...(platform === p ? tabStyles.selectChipActive : {}) }}>
                  {window.PLATFORMS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn primary" onClick={() => setGenerated(true)}>
            <Icon name="sparkles" size={13} />
            상품명 생성
          </button>
          <button className="btn"><Icon name="refresh" size={13} />다시 생성</button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', alignSelf: 'center' }}>
            쿠팡 권장 글자수: 20~40자
          </span>
        </div>
      </div>

      {generated && (
        <div style={tabStyles.panel}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>생성 결과 (4건)</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>점수순 정렬</div>
          </div>

          {results.map((r, i) => (
            <div key={i} style={tabStyles.resultCard}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: r.score >= 90 ? 'var(--accent-bg)' : 'var(--surface)',
                  border: '1px solid ' + (r.score >= 90 ? 'var(--accent-border)' : 'var(--border)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: r.score >= 90 ? 'var(--accent-text)' : 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {r.score}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={tabStyles.resultTitle}>{r.name}</div>
                  <div style={tabStyles.resultMeta}>
                    <span><Icon name="tag" size={10} /> 키워드 {r.keywords}개</span>
                    <span>·</span>
                    <span>{r.length}자</span>
                    <span>·</span>
                    <span>{window.PLATFORMS[r.platform]} 최적화</span>
                  </div>
                </div>
                <button className="btn sm"><Icon name="copy" size={11} />복사</button>
                <button className="btn sm primary">
                  <Icon name="arrowRight" size={11} />카피로
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ Copy Generator ============
const CopyGenerator = () => {
  const [tone, setTone] = useStateT('emotional');
  const [generated, setGenerated] = useStateT(true);

  const copies = {
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

  const activeCopies = copies[tone];

  return (
    <div style={tabStyles.root}>
      <div style={tabStyles.pageHead}>
        <div style={tabStyles.pageTitle}>카피 생성</div>
        <div style={tabStyles.pageSubtitle}>상품의 핵심 가치를 3가지 톤앤매너로 표현해드립니다.</div>
      </div>

      <div style={tabStyles.panel}>
        <div style={tabStyles.label}>상품명 <span style={tabStyles.labelSub}>상품명 최적화에서 불러오기</span></div>
        <input className="input" defaultValue="프리미엄 아기물티슈 100매 대용량 순면 무향 휴대용" style={{ height: 38 }} />

        <div style={{ ...tabStyles.twoCol, marginTop: 14 }}>
          <div>
            <div style={tabStyles.label}>핵심 셀링포인트</div>
            <textarea style={{ ...tabStyles.textarea, minHeight: 60 }} defaultValue="천연펄프 99.9%, 민감피부 임상완료, 대용량 100매" />
          </div>
          <div>
            <div style={tabStyles.label}>타깃 고객</div>
            <textarea style={{ ...tabStyles.textarea, minHeight: 60 }} defaultValue="0-3세 자녀를 둔 30대 육아맘, 민감피부 아기" />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={tabStyles.label}>톤앤매너</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {[
              { id: 'emotional', label: '감성적' },
              { id: 'functional', label: '기능 강조' },
              { id: 'urgent', label: '긴박감' },
            ].map(t => (
              <button key={t.id} onClick={() => setTone(t.id)}
                      style={{ ...tabStyles.selectChip, ...(tone === t.id ? tabStyles.selectChipActive : {}) }}>
                {t.label}
              </button>
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
        <div style={tabStyles.panel}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>생성 결과 · {tone === 'emotional' ? '감성적' : tone === 'functional' ? '기능 강조' : '긴박감'}</div>
          <div style={tabStyles.twoCol}>
            {activeCopies.map((c, i) => (
              <div key={i} style={tabStyles.resultCard}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{c.body}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button className="btn sm"><Icon name="copy" size={11} />복사</button>
                  <button className="btn sm primary">
                    <Icon name="arrowRight" size={11} />상세페이지로
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ Detail Page Design ============
const DetailPageDesign = () => {
  const [layout, setLayout] = useStateT('storytelling');
  return (
    <div style={tabStyles.root}>
      <div style={tabStyles.pageHead}>
        <div style={tabStyles.pageTitle}>상세페이지 디자인</div>
        <div style={tabStyles.pageSubtitle}>카피를 바탕으로 상세페이지 구성을 자동으로 설계합니다.</div>
      </div>

      <div style={tabStyles.panel}>
        <div style={tabStyles.label}>레이아웃 스타일</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { id: 'storytelling', label: '스토리텔링형', desc: '문제 → 공감 → 솔루션 순서' },
            { id: 'feature', label: '기능 나열형', desc: '스펙과 기능을 강조' },
            { id: 'comparison', label: '비교 강조형', desc: '경쟁사 대비 우위 강조' },
          ].map(l => (
            <div
              key={l.id}
              onClick={() => setLayout(l.id)}
              style={{
                padding: 12, borderRadius: 8,
                border: '1px solid ' + (layout === l.id ? 'var(--accent)' : 'var(--border)'),
                background: layout === l.id ? 'var(--accent-bg)' : 'var(--surface)',
                cursor: 'pointer',
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

      <div style={tabStyles.panel}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>페이지 구성 (6 섹션)</div>
          <div style={{ flex: 1 }} />
          <button className="btn sm"><Icon name="refresh" size={11} />재구성</button>
          <button className="btn sm primary"><Icon name="download" size={11} />PSD 내보내기</button>
        </div>
        {[
          { n: '01', title: '히어로 섹션', desc: '후킹 문구 + 대표 이미지 + CTA', h: 320 },
          { n: '02', title: '문제 제기', desc: '고객 공감 포인트 (감성적 톤)', h: 240 },
          { n: '03', title: '솔루션 제시', desc: '제품의 핵심 가치 3가지', h: 280 },
          { n: '04', title: '상세 기능', desc: '엠보싱·천연펄프·대용량 스펙', h: 360 },
          { n: '05', title: '실사용 리뷰', desc: '포토리뷰 + 평점 하이라이트', h: 240 },
          { n: '06', title: '구매 유도', desc: 'FAQ + 쿠폰 + 구매 버튼', h: 200 },
        ].map(s => (
          <div key={s.n} style={{
            display: 'flex', alignItems: 'stretch', gap: 12,
            padding: 10, borderRadius: 8, marginBottom: 6,
            background: 'var(--bg-subtle)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)',
          }}>
            <div style={{
              fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
              color: 'var(--text-subtle)', padding: '4px 0', minWidth: 24,
            }}>
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
};

window.ProductNameOptimizer = ProductNameOptimizer;
window.CopyGenerator = CopyGenerator;
window.DetailPageDesign = DetailPageDesign;
