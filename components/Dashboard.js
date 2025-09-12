"use client";
import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Weather from './Weather';
import LineChart from './LineChart';
import PieChart from './PieChart';
import ChatWidget from './ChatWidget';
import { loadGoodweCsv, toLineChartData, toPieChartData } from '../lib/csv';

export default function Dashboard() {
  const [labels, setLabels] = useState([]);
  const [series, setSeries] = useState([]);
  const [pie1, setPie1] = useState({ labels: [], data: [] });
  const [outagePie, setOutagePie] = useState({ labels: [], data: [] });
  const [selected, setSelected] = useState(['load']);
  const [hourFrom, setHourFrom] = useState(0);
  const [hourTo, setHourTo] = useState(23);
  const chartRef = useRef(null);
  const [peaksMetric, setPeaksMetric] = useState('load');

  useEffect(() => {
    async function run() {
      // Lê o novo CSV GoodWe e mapeia para os gráficos
      const { rows } = await loadGoodweCsv('/data/Plant-Power_20250912195804.csv');

      setLabels(rows.map(r => r.time));
      setSeries(rows);

      // Pizzas: distribuição de consumo por período do dia (manhã vs tarde/noite)
      const morning = rows.filter(r => isMorning(r.time));
      setPie1(toPieChartData(aggregateByHour(morning, 'loadW'), 'label', 'value'));

      // Load initial outage reasons to build second pie
      try {
        const reasons = await fetch('/api/outages/reasons').then(r => r.json());
        setOutagePie({ labels: reasons.map(r => r.name), data: reasons.map(r => r.count) });
      } catch {}

      // Detect outage: gridW near zero and loadW drops significantly compared to previous
      for (let i = 1; i < rows.length; i++) {
        const prev = rows[i - 1];
        const cur = rows[i];
        const drop = Number(prev.loadW) - Number(cur.loadW);
        if (Number(cur.gridW) === 0 && drop > 300) {
          try {
            await fetch('/api/outages/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ at: new Date(cur.time.replace(/(\d{2}).(\d{2}).(\d{4})/, '$3-$2-$1')).toISOString() }) });
          } catch {}
          break;
        }
      }
    }
    run();
  }, []);

  const base = new Date();
  const forecasts = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const conditions = ['sunny', 'rain-risk', 'cloudy'];
    let condition = conditions[i % conditions.length];
    if (d.getDate() === 13) condition = 'sunny';
    return {
      dateISO: d.toISOString(),
      condition,
      temperatureC: 24 + (i % 3) * 2,
      precipitationChance: condition === 'rain-risk' ? 0.5 : condition === 'cloudy' ? 0.2 : 0.05
    };
  });

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <div className="topbar"><h2 className="title">SmartWe</h2></div>
        <div className="content">
          <div className="grid" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3>Gráfico da GoodWe</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <SelectToggle label="Load(W)" value="load" selected={selected} setSelected={setSelected} color="#d13438" />
                <SelectToggle label="PV(W)" value="pv" selected={selected} setSelected={setSelected} color="#ff6b6b" />
                <SelectToggle label="Bateria(W)" value="battery" selected={selected} setSelected={setSelected} color="#ffd166" />
                <SelectToggle label="Grid(W)" value="grid" selected={selected} setSelected={setSelected} color="#6ee7b7" />
                <SelectToggle label="SOC(%)" value="soc" selected={selected} setSelected={setSelected} color="#8ab4f8" />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <HourSelect label="De" value={hourFrom} onChange={setHourFrom} />
                  <HourSelect label="Até" value={hourTo} onChange={setHourTo} />
                  <button onClick={() => { setHourFrom(0); setHourTo(23); try { chartRef.current?.resetZoom?.(); } catch {} }} className="card" style={{ padding: '8px 10px' }}>Reset Zoom</button>
                </div>
              </div>
              <LineChart chartRef={chartRef} labels={filteredLabels(labels, hourFrom, hourTo).map(formatHourMinute)} datasets={buildDatasets(series, selected, hourFrom, hourTo)} />
            </div>
            <div className="card">
              <h3>Notificações</h3>
              <Notices forecasts={forecasts} />
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="card">
              <h3>Picos de gasto por período</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>Tipo:</span>
                <select value={peaksMetric} onChange={e => setPeaksMetric(e.target.value)} style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px' }}>
                  <option value="load">Load(W)</option>
                  <option value="pv">PV(W)</option>
                  <option value="battery">Bateria(W)</option>
                  <option value="grid">Grid(W)</option>
                  <option value="soc">SOC(%)</option>
                </select>
              </div>
              <PeaksList rows={series} metric={peaksMetric} />
            </div>
            <div className="card">
              <h3>Causas mais comuns de queda de energia</h3>
              <PieChart labels={outagePie.labels} data={outagePie.data} />
            </div>
            <div className="card">
              <h3>Queda de energia</h3>
              <ReasonsForm onData={setOutagePie} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Weather forecasts={forecasts} />
          </div>
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}

function LegendDot({ text, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, background: color, borderRadius: 999 }} />
      <span>{text}</span>
    </div>
  );
}

function Notices({ forecasts }) {
  const [nextEvent, setNextEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  useEffect(() => {
    async function load() {
      try {
        const items = await fetch('/api/agenda').then(r => r.json());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyyMmDd = tomorrow.toISOString().slice(0, 10);
        const match = items.find(i => i.date && i.date.startsWith(yyyyMmDd));
        if (match) setNextEvent(match);
        
        // Get 3 most recent upcoming events
        const today = new Date();
        const upcoming = items
          .filter(i => i.date && new Date(i.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        setUpcomingEvents(upcoming);
      } catch {}
    }
    load();
  }, []);

  const msgs = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tISO = tomorrow.toISOString().slice(0, 10);
  const fTomorrow = forecasts.find(f => (f.dateISO || '').startsWith(tISO));
  if (fTomorrow?.condition === 'rain-risk') {
    msgs.push({ text: 'ALERTA! Amanhã há previsão de chuva, possível queda de energia.', urgent: true });
  }

  // Fetch most recent outage event to ask for reason
  const [lastOutage, setLastOutage] = useState(null);
  useEffect(() => {
    fetch('/api/outages/events').then(r => r.json()).then(list => {
      if (list && list.length) setLastOutage(list[0]);
    }).catch(() => {});
  }, []);
  if (lastOutage) {
    const d = new Date(lastOutage.at);
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dia = d.toLocaleDateString('pt-BR');
    msgs.push({ text: `Detectado queda de energia às ${hora} do dia ${dia}, adicione o motivo na aba "Queda de energia"`, urgent: false });
  }

  if (msgs.length === 0) msgs.push({ text: 'Nenhum aviso para amanhã.', urgent: false });

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>Avisos</h4>
        <ul className="legend" style={{ margin: 0 }}>
          {msgs.map((m, i) => (
            <li key={i} style={{ listStyle: 'none', fontWeight: m.urgent ? 'bold' : 'normal', color: m.urgent ? 'var(--danger)' : 'var(--text)', textTransform: m.urgent ? 'uppercase' : 'none' }}>{m.text}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>Eventos Futuros</h4>
        {upcomingEvents.length > 0 ? (
          <ul className="legend" style={{ margin: 0 }}>
            {upcomingEvents.map((event, i) => (
              <li key={i} style={{ listStyle: 'none', fontSize: '14px' }}>
                {new Date(event.date).toLocaleDateString('pt-BR')} — {event.text}
              </li>
            ))}
          </ul>
        ) : (
          <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Nenhum evento agendado</span>
        )}
      </div>
    </div>
  );
}

function ReasonsForm({ onData }) {
  const [name, setName] = useState('');
  const [reasons, setReasons] = useState([]);

  async function refresh() {
    const list = await fetch('/api/outages/reasons').then(r => r.json());
    setReasons(list);
    onData && onData({ labels: list.map(r => r.name), data: list.map(r => r.count) });
  }

  useEffect(() => { refresh(); }, []);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch('/api/outages/reasons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setName('');
    refresh();
  }

  async function inc(nm) {
    await fetch('/api/outages/reasons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm, delta: 1 }) });
    refresh();
  }

  async function dec(nm) {
    await fetch('/api/outages/reasons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm, delta: -1 }) });
    refresh();
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <form onSubmit={add} style={{ display: 'flex', gap: 6 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Motivo da queda (ex.: Rede elétrica, Falha no inversor)" style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }} />
        <button className="card" style={{ padding: '8px 12px' }} type="submit">Adicionar</button>
      </form>
      <div style={{ display: 'grid', gap: 6, maxHeight: 240, overflow: 'auto', paddingRight: 4 }}>
        {reasons.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{r.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Qtd: {r.count}</span>
              <button className="card" onClick={() => dec(r.name)} style={{ padding: '4px 10px' }}>-</button>
              <button className="card" onClick={() => inc(r.name)} style={{ padding: '4px 10px' }}>+</button>
              <button className="card" onClick={async () => { await fetch(`/api/outages/reasons/${r.id}`, { method: 'DELETE' }); refresh(); }} style={{ padding: '4px 10px', background: 'var(--danger)', color: '#fff' }}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helpers for aggregations/periods
function isMorning(timeStr) {
  // timeStr format: dd.mm.yyyy HH:MM:SS
  const match = /\s(\d{2}):(\d{2}):\d{2}/.exec(String(timeStr));
  if (!match) return false;
  const hour = Number(match[1]);
  return hour >= 5 && hour < 12;
}

function aggregateByHour(rows, valueField) {
  const byHour = new Map();
  for (const r of rows) {
    const hour = extractHour(r.time);
    const prev = byHour.get(hour) || 0;
    byHour.set(hour, prev + Number(r[valueField] || 0));
  }
  return Array.from(byHour.entries()).map(([h, sum]) => ({ label: `${String(h).padStart(2,'0')}:00`, value: sum }));
}

function extractHour(timeStr) {
  const match = /\s(\d{2}):(\d{2}):\d{2}/.exec(String(timeStr));
  return match ? Number(match[1]) : 0;
}

// Build datasets for multi-series line chart
function buildDatasets(rows, selected, hourFrom, hourTo) {
  const colors = {
    load: { border: '#d13438', bg: 'rgba(209,52,56,0.25)', label: 'Load(W)' },
    pv: { border: '#ff6b6b', bg: 'rgba(255,107,107,0.2)', label: 'PV(W)' },
    battery: { border: '#ffd166', bg: 'rgba(255,209,102,0.2)', label: 'Bateria(W)' },
    grid: { border: '#6ee7b7', bg: 'rgba(110,231,183,0.2)', label: 'Grid(W)' },
    soc: { border: '#8ab4f8', bg: 'rgba(138,180,248,0.2)', label: 'SOC(%)' }
  };

  const rangeFiltered = rows.filter(r => {
    const h = extractHour(r.time);
    return h >= hourFrom && h <= hourTo;
  });

  const build = (key, valueSelector) => ({
    label: colors[key].label,
    data: rangeFiltered.map(valueSelector),
    borderColor: colors[key].border,
    backgroundColor: colors[key].bg,
    pointBackgroundColor: colors[key].border,
    tension: 0.25,
    fill: false
  });

  const ds = [];
  if (selected.includes('load')) ds.push(build('load', r => Number(r.loadW)));
  if (selected.includes('pv')) ds.push(build('pv', r => Number(r.pvW)));
  if (selected.includes('battery')) ds.push(build('battery', r => Number(r.batteryW)));
  if (selected.includes('grid')) ds.push(build('grid', r => Number(r.gridW)));
  if (selected.includes('soc')) ds.push(build('soc', r => Number(r.soc)));
  return ds;
}

function filteredLabels(labels, hourFrom, hourTo) {
  return labels.filter(t => {
    const h = extractHour(t);
    return h >= hourFrom && h <= hourTo;
  });
}

function SelectToggle({ label, value, selected, setSelected, color }) {
  const isOn = selected.includes(value);
  return (
    <button onClick={() => setSelected(s => isOn ? s.filter(v => v !== value) : [...s, value])}
      className="card" style={{ padding: '6px 10px', borderColor: isOn ? color : 'var(--border)', color: isOn ? '#fff' : 'var(--text)', background: isOn ? color : 'var(--surface)' }}>
      {label}
    </button>
  );
}

function HourSelect({ label, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <select value={value} onChange={e => onChange(Number(e.target.value))} style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px' }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>
        ))}
      </select>
    </label>
  );
}

function formatHourMinute(timeStr) {
  const m = /\s(\d{2}):(\d{2}):\d{2}/.exec(String(timeStr));
  if (!m) return timeStr;
  return `${m[1]}:${m[2]}`;
}

function PeaksList({ rows, metric }) {
  const key = metric === 'load' ? 'loadW' : metric === 'pv' ? 'pvW' : metric === 'battery' ? 'batteryW' : metric === 'grid' ? 'gridW' : 'soc';
  const toValue = r => Number(r[key] || 0);
  const unit = metric === 'soc' ? '%' : ' W';
  const fmt = v => `${v}${unit}`;

  const morning = rows.filter(r => { const h = extractHour(r.time); return h >= 5 && h <= 11; });
  const afternoon = rows.filter(r => { const h = extractHour(r.time); return h >= 12 && h <= 18; });
  const night = rows.filter(r => { const h = extractHour(r.time); return h >= 19 || h <= 4; });

  function peakInfo(list) {
    if (!list.length) return { max: null, min: null };
    let max = list[0], min = list[0];
    for (const r of list) {
      if (toValue(r) > toValue(max)) max = r;
      if (toValue(r) < toValue(min)) min = r;
    }
    return { max, min };
  }

  const m = peakInfo(morning);
  const a = peakInfo(afternoon);
  const n = peakInfo(night);

  function line(title, info) {
    return (
      <div className="card" style={{ padding: 12, display: 'grid', gap: 6 }}>
        <strong>{title}</strong>
        <span>Maior: {info.max ? `${formatHourMinute(info.max.time)} — ${fmt(toValue(info.max))}` : '—'}</span>
        <span>Menor: {info.min ? `${formatHourMinute(info.min.time)} — ${fmt(toValue(info.min))}` : '—'}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {line('Picos de gasto manhã (05:00–11:00)', m)}
      {line('Picos de gasto tarde (12:00–18:00)', a)}
      {line('Picos de gasto noite (19:00–04:00)', n)}
    </div>
  );
}


