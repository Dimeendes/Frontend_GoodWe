import Papa from 'papaparse';

/*
  Usage:
  const { headers, rows } = await loadCsv('/data/example.csv');
  headers -> array of strings
  rows -> array of objects keyed by header

  Replace the path above with your CSV file. Keep the same header names
  you will reference in components.
*/

export async function loadCsv(path) {
  const res = await fetch(path, { cache: 'no-store' });
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        resolve({ headers: result.meta.fields || [], rows: result.data });
      },
      error: reject
    });
  });
}

export function toLineChartData(rows, labelField, valueField) {
  const labels = rows.map(r => r[labelField]);
  const data = rows.map(r => Number(r[valueField]));
  return { labels, data };
}

export function toPieChartData(rows, labelField, valueField) {
  const labels = rows.map(r => r[labelField]);
  const data = rows.map(r => Number(r[valueField]));
  return { labels, data };
}

// NEW: Loader tailored for GoodWe CSV (with two preface lines before header)
export async function loadGoodweCsv(path) {
  const res = await fetch(path, { cache: 'no-store' });
  const raw = await res.text();
  // Find the line that starts with Time, which is the real header
  const lines = raw.split(/\r?\n/);
  // Some exports wrap headers in quotes -> Normalize by stripping quotes
  const headerIndex = lines.findIndex(l => l.replace(/"/g, '').trim().startsWith('Time,'));
  if (headerIndex < 0) {
    throw new Error('Cabeçalho "Time,..." não encontrado no CSV. Verifique o arquivo/caminho.');
  }
  const trimmed = lines.slice(headerIndex).join('\n');

  return new Promise((resolve, reject) => {
    Papa.parse(trimmed, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        const rows = (result.data || []).map(r => ({
          time: r['Time'],
          pvW: toNumber(r['PV(W)']),
          soc: toNumber(r['SOC(%)']),
          batteryW: toNumber(r['Battery(W)']),
          gridW: toNumber(r['Grid (W)']),
          loadW: toNumber(r['Load(W)'])
        })).filter(r => r.time);
        resolve({ headers: result.meta.fields || [], rows });
      },
      error: reject
    });
  });
}

function toNumber(x) {
  if (typeof x === 'number') return x;
  if (typeof x === 'string') return Number(String(x).replace(',', '.'));
  return Number(x || 0);
}


