import { describe, it, expect } from 'vitest';
import { parseApiHubResponse, tmefToDate, toIso } from '../lib/weather-parser';

const SEOUL = '11B10101';

// 기본 응답 샘플 (기상청 API허브 실제 포맷 기준)
const SAMPLE = `
# REG_ID   TMFC        TMEF        MOD  SKY  PRE  CONF  WF    TEMP
${SEOUL}  2026050600  2026050603  Y    1    0    90    맑음  18.5
${SEOUL}  2026050600  2026050606  Y    1    0    90    맑음  19.0
11B10102  2026050600  2026050603  Y    3    0    80    구름  17.0
`;

describe('parseApiHubResponse', () => {
  it('헤더+데이터 정상 파싱', () => {
    const rows = parseApiHubResponse(SAMPLE);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      regId: SEOUL,
      tmef: '2026050603',
      sky: 1,
      pre: 0,
      temp: 18.5,
      wf: '맑음',
    });
  });

  it('서울(11B10101) 외 지역 필터링', () => {
    const rows = parseApiHubResponse(SAMPLE);
    expect(rows.every(r => r.regId === SEOUL)).toBe(true);
  });

  it('헤더 없을 때 기본 컬럼 순서로 파싱', () => {
    // 기본: REG_ID TMFC TMEF MOD SKY PRE CONF WF TEMP
    const noHeader = `${SEOUL}  2026050600  2026050603  Y    1    0    90    맑음  18.5`;
    const rows = parseApiHubResponse(noHeader);
    expect(rows).toHaveLength(1);
    expect(rows[0].temp).toBe(18.5);
    expect(rows[0].sky).toBe(1);
  });

  it('빈 입력 → 빈 배열', () => {
    expect(parseApiHubResponse('')).toEqual([]);
  });

  it('주석·구분자 줄 건너뜀', () => {
    const input = `
# 주석
==============================
# REG_ID TMFC TMEF MOD SKY PRE CONF WF TEMP
${SEOUL}  2026050600  2026050603  Y  1  0  90  맑음  18.5
`;
    expect(parseApiHubResponse(input)).toHaveLength(1);
  });

  it('컬럼 수 부족한 줄 건너뜀', () => {
    const input = `
# REG_ID TMFC TMEF MOD SKY PRE CONF WF TEMP
${SEOUL}  짧음
${SEOUL}  2026050600  2026050603  Y  1  0  90  맑음  18.5
`;
    expect(parseApiHubResponse(input)).toHaveLength(1);
  });

  it('PRE → PTY 컬럼 별칭 지원', () => {
    const input = `
# REG_ID  TMFC        TMEF        MOD  SKY  PTY  CONF  WF    TEMP
${SEOUL}  2026050600  2026050603  Y    4    1    90    비    16.0
`;
    const rows = parseApiHubResponse(input);
    expect(rows[0].pre).toBe(1);
  });

  it('TEMP → TA 컬럼 별칭 지원', () => {
    const input = `
# REG_ID  TMFC        TMEF        MOD  SKY  PRE  CONF  WF    TA
${SEOUL}  2026050600  2026050603  Y    1    0    90    맑음  22.3
`;
    const rows = parseApiHubResponse(input);
    expect(rows[0].temp).toBe(22.3);
  });

  it('TMEF 없는 행 건너뜀', () => {
    const input = `
# REG_ID  TMFC        TMEF  MOD  SKY
${SEOUL}  2026050600        Y    1
`;
    // TMEF 컬럼이 있어도 값이 비면 추가 안 함
    const rows = parseApiHubResponse(input);
    expect(rows).toHaveLength(0);
  });
});

describe('tmefToDate', () => {
  it('12자리 → 앞 8자리 날짜 추출', () => {
    expect(tmefToDate('202605060300')).toBe('20260506');
  });
  it('10자리도 정상 처리', () => {
    expect(tmefToDate('2026050603')).toBe('20260506');
  });
});

describe('toIso', () => {
  it('YYYYMMDD → YYYY-MM-DD 변환', () => {
    expect(toIso('20260506')).toBe('2026-05-06');
  });
});
