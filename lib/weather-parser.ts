export const SEOUL_REG = '11B10101';

export interface ParsedRow {
  regId: string;
  tmfc: string;
  tmef: string;
  sky: number;
  pre: number;
  temp: number;
  wf: string;
}

export function parseApiHubResponse(text: string): ParsedRow[] {
  const lines = text.split('\n');
  const rows: ParsedRow[] = [];

  let headerCols: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') && /REG_ID|REG/.test(trimmed)) {
      headerCols = trimmed.replace(/^#\s*/, '').split(/\s+/);
      break;
    }
  }

  if (headerCols.length === 0) {
    headerCols = ['REG_ID', 'TMFC', 'TMEF', 'MOD', 'SKY', 'PRE', 'CONF', 'WF', 'TEMP'];
  }

  const idx = (name: string) => {
    const candidates: Record<string, string[]> = {
      REG_ID: ['REG_ID', 'REG'],
      TMFC: ['TMFC'],
      TMEF: ['TMEF'],
      SKY: ['SKY'],
      PRE: ['PRE', 'PTY'],
      TEMP: ['TEMP', 'TA', 'TAV'],
      WF: ['WF'],
    };
    for (const c of candidates[name] ?? [name]) {
      const i = headerCols.findIndex(h => h.toUpperCase() === c.toUpperCase());
      if (i >= 0) return i;
    }
    return -1;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('=')) continue;

    const cols = trimmed.split(/\s+/);
    if (cols.length < 5) continue;

    const regId = idx('REG_ID') >= 0 ? cols[idx('REG_ID')] : cols[0];
    if (regId !== SEOUL_REG && regId !== 'ALL') continue;

    const temp = idx('TEMP') >= 0 ? parseFloat(cols[idx('TEMP')]) : NaN;
    const sky = idx('SKY') >= 0 ? parseInt(cols[idx('SKY')], 10) : 0;
    const pre = idx('PRE') >= 0 ? parseInt(cols[idx('PRE')], 10) : 0;
    const tmfc = idx('TMFC') >= 0 ? cols[idx('TMFC')] : '';
    const tmef = idx('TMEF') >= 0 ? cols[idx('TMEF')] : '';
    const wf = idx('WF') >= 0 ? cols[idx('WF')] : '';

    if (tmef) {
      rows.push({ regId, tmfc, tmef, sky, pre, temp, wf });
    }
  }

  return rows;
}

export function tmefToDate(tmef: string): string {
  return tmef.slice(0, 8);
}

export function toIso(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}
