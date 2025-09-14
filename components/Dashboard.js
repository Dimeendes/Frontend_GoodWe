"use client";
import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Weather from './Weather';
import LineChart from './LineChart';
import PieChart from './PieChart';
import ChatWidget from './ChatWidget';
import AlertSystem from './AlertSystem';
import { loadGoodweCsv, toLineChartData, toPieChartData } from '../lib/csv';
import { useSettings } from '../contexts/SettingsContext';
import { generateWeatherData, getCurrentScenarioInfo } from '../lib/weatherConfig';
import weatherStyles from './WeatherControlPanel.module.css';

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
  const { language } = useSettings();

  const translations = {
    pt: {
      goodweChart: 'Gráfico da GoodWe',
      load: 'Load(W)',
      pv: 'PV(W)',
      battery: 'Bateria(W)',
      grid: 'Grid(W)',
      soc: 'SOC(%)',
      from: 'De',
      to: 'Até',
      resetZoom: 'Reset Zoom',
      notifications: 'Notificações',
      peaksByPeriod: 'Picos de gasto por período',
      type: 'Tipo',
      mostCommonOutageCauses: 'Causas mais comuns de queda de energia',
      powerOutage: 'Queda de energia',
      morning: 'Picos de gasto manhã (05:00–11:00)',
      afternoon: 'Picos de gasto tarde (12:00–18:00)',
      night: 'Picos de gasto noite (19:00–04:00)',
      highest: 'Maior',
      lowest: 'Menor',
      addReason: 'Adicionar',
      reasonPlaceholder: 'Motivo da queda (ex.: Rede elétrica, Falha no inversor)',
      quantity: 'Qtd',
      delete: 'Excluir',
      weatherControl: 'Controle Meteorológico',
      currentScenario: 'Cenário Atual',
      changeScenario: 'Mudar Cenário',
      scenarioDescription: 'Descrição',
      editConfig: 'Editar Configuração'
    },
    en: {
      goodweChart: 'GoodWe Chart',
      load: 'Load(W)',
      pv: 'PV(W)',
      battery: 'Battery(W)',
      grid: 'Grid(W)',
      soc: 'SOC(%)',
      from: 'From',
      to: 'To',
      resetZoom: 'Reset Zoom',
      notifications: 'Notifications',
      peaksByPeriod: 'Peak consumption by period',
      type: 'Type',
      mostCommonOutageCauses: 'Most common power outage causes',
      powerOutage: 'Power Outage',
      morning: 'Morning peaks (05:00–11:00)',
      afternoon: 'Afternoon peaks (12:00–18:00)',
      night: 'Night peaks (19:00–04:00)',
      highest: 'Highest',
      lowest: 'Lowest',
      addReason: 'Add',
      reasonPlaceholder: 'Outage reason (e.g.: Power grid, Inverter failure)',
      quantity: 'Qty',
      delete: 'Delete'
    }
  };

  const t = translations[language];

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

  // Gerar dados meteorológicos usando a configuração centralizada
  const forecasts = generateWeatherData();
  const scenarioInfo = getCurrentScenarioInfo();

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <div className="topbar"><h2 className="title">SmartWe</h2></div>
        <div className="content">
          <div className="grid" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3>{t.goodweChart}</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <SelectToggle label={t.load} value="load" selected={selected} setSelected={setSelected} color="#d13438" />
                <SelectToggle label={t.pv} value="pv" selected={selected} setSelected={setSelected} color="#ff6b6b" />
                <SelectToggle label={t.battery} value="battery" selected={selected} setSelected={setSelected} color="#ffd166" />
                <SelectToggle label={t.grid} value="grid" selected={selected} setSelected={setSelected} color="#6ee7b7" />
                <SelectToggle label={t.soc} value="soc" selected={selected} setSelected={setSelected} color="#8ab4f8" />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <HourSelect label={t.from} value={hourFrom} onChange={setHourFrom} />
                  <HourSelect label={t.to} value={hourTo} onChange={setHourTo} />
                  <button onClick={() => { setHourFrom(0); setHourTo(23); try { chartRef.current?.resetZoom?.(); } catch {} }} className="card" style={{ padding: '8px 10px' }}>{t.resetZoom}</button>
                </div>
              </div>
              <LineChart chartRef={chartRef} labels={filteredLabels(labels, hourFrom, hourTo).map(formatHourMinute)} datasets={buildDatasets(series, selected, hourFrom, hourTo, t)} />
            </div>
            <div className="card">
              <h3>{t.notifications}</h3>
              <WeatherControlPanel scenarioInfo={scenarioInfo} />
              <Notices forecasts={forecasts} language={language} />
            </div>
          </div>

          <div className="grid" style={{ marginBottom: 24 }}>
            <AlertSystem />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="card">
              <h3>{t.peaksByPeriod}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)' }}>{t.type}:</span>
                <select value={peaksMetric} onChange={e => setPeaksMetric(e.target.value)} style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px' }}>
                  <option value="load">{t.load}</option>
                  <option value="pv">{t.pv}</option>
                  <option value="battery">{t.battery}</option>
                  <option value="grid">{t.grid}</option>
                  <option value="soc">{t.soc}</option>
                </select>
              </div>
              <PeaksList rows={series} metric={peaksMetric} language={language} />
            </div>
            <div className="card">
              <h3>{t.mostCommonOutageCauses}</h3>
              <PieChart labels={outagePie.labels} data={outagePie.data} />
            </div>
            <div className="card">
              <h3>{t.powerOutage}</h3>
              <ReasonsForm onData={setOutagePie} language={language} />
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

function Notices({ forecasts, language }) {
  const [nextEvent, setNextEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  const translations = {
    pt: {
      alerts: 'Avisos',
      rainAlert: 'ALERTA! Hoje há previsão de chuva, possível queda de energia.',
      outageDetected: 'Detectado queda de energia às {time} do dia {date}, adicione o motivo na aba "Queda de energia"',
      noAlerts: 'Nenhum aviso para amanhã.',
      futureEvents: 'Eventos Futuros',
      noEvents: 'Nenhum evento agendado'
    },
    en: {
      alerts: 'Alerts',
      rainAlert: 'ALERT! Today there is rain forecast, possible power outage.',
      outageDetected: 'Power outage detected at {time} on {date}, add the reason in the "Power Outage" tab',
      noAlerts: 'No alerts for tomorrow.',
      futureEvents: 'Future Events',
      noEvents: 'No events scheduled'
    }
  };

  const t = translations[language];

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
    msgs.push({ text: t.rainAlert, urgent: true });
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
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    const hora = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const dia = d.toLocaleDateString(locale);
    msgs.push({ text: t.outageDetected.replace('{time}', hora).replace('{date}', dia), urgent: false });
  }

  if (msgs.length === 0) msgs.push({ text: t.noAlerts, urgent: false });

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>{t.alerts}</h4>
        <ul className="legend" style={{ margin: 0 }}>
          {msgs.map((m, i) => (
            <li key={i} style={{ listStyle: 'none', fontWeight: m.urgent ? 'bold' : 'normal', color: m.urgent ? 'var(--danger)' : 'var(--text)', textTransform: m.urgent ? 'uppercase' : 'none' }}>{m.text}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>{t.futureEvents}</h4>
        {upcomingEvents.length > 0 ? (
          <ul className="legend" style={{ margin: 0 }}>
            {upcomingEvents.map((event, i) => (
              <li key={i} style={{ listStyle: 'none', fontSize: '14px' }}>
                {new Date(event.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')} — {event.text}
              </li>
            ))}
          </ul>
        ) : (
          <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{t.noEvents}</span>
        )}
      </div>
    </div>
  );
}

function ReasonsForm({ onData, language }) {
  const [name, setName] = useState('');
  const [reasons, setReasons] = useState([]);

  const translations = {
    pt: {
      reasonPlaceholder: 'Motivo da queda (ex.: Rede elétrica, Falha no inversor)',
      add: 'Adicionar',
      quantity: 'Qtd',
      delete: 'Excluir'
    },
    en: {
      reasonPlaceholder: 'Outage reason (e.g.: Power grid, Inverter failure)',
      add: 'Add',
      quantity: 'Qty',
      delete: 'Delete',
      weatherControl: 'Weather Control',
      currentScenario: 'Current Scenario',
      changeScenario: 'Change Scenario',
      scenarioDescription: 'Description',
      editConfig: 'Edit Configuration'
    }
  };

  const t = translations[language];

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
        <input value={name} onChange={e => setName(e.target.value)} placeholder={t.reasonPlaceholder} style={{ flex: 1, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }} />
        <button className="card" style={{ padding: '8px 12px' }} type="submit">{t.add}</button>
      </form>
      <div style={{ display: 'grid', gap: 6, maxHeight: 240, overflow: 'auto', paddingRight: 4 }}>
        {reasons.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{r.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--muted)' }}>{t.quantity}: {r.count}</span>
              <button className="card" onClick={() => dec(r.name)} style={{ padding: '4px 10px' }}>-</button>
              <button className="card" onClick={() => inc(r.name)} style={{ padding: '4px 10px' }}>+</button>
              <button className="card" onClick={async () => { await fetch(`/api/outages/reasons/${r.id}`, { method: 'DELETE' }); refresh(); }} style={{ padding: '4px 10px', background: 'var(--danger)', color: '#fff' }}>{t.delete}</button>
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
function buildDatasets(rows, selected, hourFrom, hourTo, t) {
  const colors = {
    load: { border: '#d13438', bg: 'rgba(209,52,56,0.25)', label: t.load },
    pv: { border: '#ff6b6b', bg: 'rgba(255,107,107,0.2)', label: t.pv },
    battery: { border: '#ffd166', bg: 'rgba(255,209,102,0.2)', label: t.battery },
    grid: { border: '#6ee7b7', bg: 'rgba(110,231,183,0.2)', label: t.grid },
    soc: { border: '#8ab4f8', bg: 'rgba(138,180,248,0.2)', label: t.soc }
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

function PeaksList({ rows, metric, language }) {
  const key = metric === 'load' ? 'loadW' : metric === 'pv' ? 'pvW' : metric === 'battery' ? 'batteryW' : metric === 'grid' ? 'gridW' : 'soc';
  const toValue = r => Number(r[key] || 0);
  const unit = metric === 'soc' ? '%' : ' W';
  const fmt = v => `${v}${unit}`;

  const translations = {
    pt: {
      morning: 'Picos de gasto manhã (05:00–11:00)',
      afternoon: 'Picos de gasto tarde (12:00–18:00)',
      night: 'Picos de gasto noite (19:00–04:00)',
      highest: 'Maior',
      lowest: 'Menor'
    },
    en: {
      morning: 'Morning peaks (05:00–11:00)',
      afternoon: 'Afternoon peaks (12:00–18:00)',
      night: 'Night peaks (19:00–04:00)',
      highest: 'Highest',
      lowest: 'Lowest'
    }
  };

  const t = translations[language];

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
        <span>{t.highest}: {info.max ? `${formatHourMinute(info.max.time)} — ${fmt(toValue(info.max))}` : '—'}</span>
        <span>{t.lowest}: {info.min ? `${formatHourMinute(info.min.time)} — ${fmt(toValue(info.min))}` : '—'}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {line(t.morning, m)}
      {line(t.afternoon, a)}
      {line(t.night, n)}
    </div>
  );
}

// Componente para controle de cenários meteorológicos
function WeatherControlPanel({ scenarioInfo }) {
  const [showDetails, setShowDetails] = useState(false);
  const [audioStatus, setAudioStatus] = useState('idle'); // 'idle', 'playing', 'error'
  
  // Verificar se há alertas críticos que podem tocar áudio
  useEffect(() => {
    const checkAudioStatus = () => {
      // Verificar se há áudio sendo reproduzido no sistema
      const audioElements = document.querySelectorAll('audio');
      const isPlaying = Array.from(audioElements).some(audio => !audio.paused);
      
      if (isPlaying) {
        setAudioStatus('playing');
      } else {
        setAudioStatus('idle');
      }
    };
    
    // Verificar a cada 2 segundos
    const interval = setInterval(checkAudioStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ 
      marginBottom: 16, 
      padding: 12, 
      background: 'var(--surface)', 
      borderRadius: 8, 
      border: '1px solid var(--border)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4 style={{ margin: 0, color: 'var(--accent)', fontSize: '14px' }}>
          🌤️ Controle Meteorológico
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {audioStatus === 'playing' && (
            <div className={weatherStyles.audioIndicator}>
              🔊 Tocando
            </div>
          )}
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="card" 
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            {showDetails ? 'Ocultar' : 'Detalhes'}
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <strong style={{ color: 'var(--text)' }}>Cenário Atual:</strong>
        <span style={{ marginLeft: 8, color: 'var(--accent)' }}>{scenarioInfo.name}</span>
      </div>
      
      {showDetails && (
        <div style={{ 
          padding: 8, 
          background: 'var(--background)', 
          borderRadius: 6, 
          fontSize: '12px',
          color: 'var(--muted)',
          marginBottom: 8
        }}>
          <div style={{ marginBottom: 4 }}>
            <strong>Descrição:</strong> {scenarioInfo.description}
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong>Como editar:</strong> Abra o arquivo <code>lib/weatherConfig.js</code>
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong>Mudar cenário:</strong> Altere a variável <code>CURRENT_SCENARIO</code>
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong>Áudio automático:</strong> Alertas críticos (prioridade ≥4) tocam automaticamente
          </div>
          <div style={{ fontSize: '11px', marginTop: 8, padding: 6, background: 'var(--surface)', borderRadius: 4 }}>
            <strong>💡 Dica:</strong> Após editar, recarregue a página para ver as mudanças!
          </div>
        </div>
      )}
      
      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
        📁 Arquivo: <code>lib/weatherConfig.js</code>
      </div>
    </div>
  );
}


