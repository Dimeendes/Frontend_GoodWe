"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import ChatWidget from '../../components/ChatWidget';
import { loadGoodweCsv } from '../../lib/csv';
import { useSettings } from '../../contexts/SettingsContext';
import styles from './styles.module.css';

export default function MedidasPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [peaksMetric, setPeaksMetric] = useState('load');
  const { language } = useSettings();

  const translations = {
    pt: {
      title: 'Medidas',
      loading: 'Carregando...',
      avgPower: 'Média de Potência',
      avgPowerLabel: 'Potência média total',
      avgConsumption: 'Consumo Médio',
      avgConsumptionLabel: 'Consumo médio (Load)',
      avgSolarGeneration: 'Média de Geração Solar',
      avgSolarGenerationLabel: 'Média de geração PV',
      totalSolarGeneration: 'Geração Solar Total',
      totalSolarGenerationLabel: 'Energia total gerada',
      generationStart: 'Início de Geração',
      generationStartLabel: 'Primeira geração do dia',
      generationEnd: 'Fim de Geração',
      generationEndLabel: 'Última geração do dia',
      batteryStatus: 'Estado da Bateria',
      batteryStatusLabel: 'SOC médio',
      peaksByPeriod: 'Picos de gasto por período',
      type: 'Tipo',
      load: 'Load(W)',
      pv: 'PV(W)',
      battery: 'Bateria(W)',
      grid: 'Grid(W)',
      soc: 'SOC(%)',
      morning: 'Picos de gasto manhã (05:00–11:00)',
      afternoon: 'Picos de gasto tarde (12:00–18:00)',
      night: 'Picos de gasto noite (19:00–04:00)',
      highest: 'Maior',
      lowest: 'Menor'
    },
    en: {
      title: 'Measures',
      loading: 'Loading...',
      avgPower: 'Average Power',
      avgPowerLabel: 'Total average power',
      avgConsumption: 'Average Consumption',
      avgConsumptionLabel: 'Average consumption (Load)',
      avgSolarGeneration: 'Average Solar Generation',
      avgSolarGenerationLabel: 'Average PV generation',
      totalSolarGeneration: 'Total Solar Generation',
      totalSolarGenerationLabel: 'Total energy generated',
      generationStart: 'Generation Start',
      generationStartLabel: 'First generation of the day',
      generationEnd: 'Generation End',
      generationEndLabel: 'Last generation of the day',
      batteryStatus: 'Battery Status',
      batteryStatusLabel: 'Average SOC',
      peaksByPeriod: 'Peak consumption by period',
      type: 'Type',
      load: 'Load(W)',
      pv: 'PV(W)',
      battery: 'Battery(W)',
      grid: 'Grid(W)',
      soc: 'SOC(%)',
      morning: 'Morning peaks (05:00–11:00)',
      afternoon: 'Afternoon peaks (12:00–18:00)',
      night: 'Night peaks (19:00–04:00)',
      highest: 'Highest',
      lowest: 'Lowest'
    }
  };

  const t = translations[language];

  useEffect(() => {
    async function load() {
      try {
        const { rows } = await loadGoodweCsv('/data/Plant-Power_20250912195804.csv');
        setData(rows);
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="layout"><Sidebar /><main><div className="topbar"><h2 className="title">SmartWe</h2></div><div className="content">{t.loading}</div></main><ChatWidget /></div>;

  const stats = calculateStats(data);

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <div className="topbar"><h2 className="title">SmartWe</h2></div>
        <div className="content">
          <h1>{t.title}</h1>
          <div className={styles.grid}>
            <div className="card">
              <h3>{t.avgPower}</h3>
              <div className={styles.stat}>
                <span className={styles.value}>{stats.avgPower.toFixed(1)} W</span>
                <span className={styles.label}>{t.avgPowerLabel}</span>
              </div>
            </div>
            
            <div className="card">
              <h3>{t.avgConsumption}</h3>
              <div className={styles.stat}>
                <span className={styles.value}>{stats.avgConsumption.toFixed(1)} W</span>
                <span className={styles.label}>{t.avgConsumptionLabel}</span>
              </div>
            </div>
            
            <div className="card">
              <h3>{t.avgSolarGeneration}</h3>
              <div className={styles.stat}>
                <span className={styles.value}>{stats.avgPV.toFixed(1)} W</span>
                <span className={styles.label}>{t.avgSolarGenerationLabel}</span>
              </div>
            </div>
            
            <div className="card">
              <h3>{t.totalSolarGeneration}</h3>
              <div className={styles.stat}>
                <span className={styles.value}>{stats.totalPV.toFixed(1)} Wh</span>
                <span className={styles.label}>{t.totalSolarGenerationLabel}</span>
              </div>
            </div>
            
            <div className="card">
              <h3>{t.generationStart}</h3>
              <div className={styles.stat}>
                <span className={styles.value}>{stats.generationStart || '—'}</span>
                <span className={styles.label}>{t.generationStartLabel}</span>
              </div>
            </div>
            
            <div className="card">
              <h3>{t.generationEnd}</h3>
              <div className={styles.stat}>
                <span className={styles.value}>{stats.generationEnd || '—'}</span>
                <span className={styles.label}>{t.generationEndLabel}</span>
              </div>
            </div>
            
            <div className="card">
              <h3>{t.batteryStatus}</h3>
              <div className={styles.stat}>
                <span className={styles.value}>{stats.avgSOC.toFixed(1)}%</span>
                <span className={styles.label}>{t.batteryStatusLabel}</span>
              </div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr', marginTop: 24 }}>
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
              <PeaksList rows={data} metric={peaksMetric} language={language} />
            </div>
          </div>
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}

function calculateStats(rows) {
  if (!rows.length) return { avgPower: 0, avgConsumption: 0, avgPV: 0, totalPV: 0, avgSOC: 0, generationStart: null, generationEnd: null };
  
  const loadValues = rows.map(r => Number(r.loadW || 0));
  const pvValues = rows.map(r => Number(r.pvW || 0));
  const socValues = rows.map(r => Number(r.soc || 0));
  
  const avgPower = loadValues.reduce((a, b) => a + b, 0) / loadValues.length;
  const avgConsumption = loadValues.reduce((a, b) => a + b, 0) / loadValues.length;
  const avgPV = pvValues.reduce((a, b) => a + b, 0) / pvValues.length;
  const totalPV = pvValues.reduce((a, b) => a + b, 0) * 0.083; // 5min intervals = 1/12 hour
  const avgSOC = socValues.reduce((a, b) => a + b, 0) / socValues.length;
  
  // Find generation start/end (first and last time PV > 0)
  const generationPoints = rows.filter(r => Number(r.pvW || 0) > 0);
  const generationStart = generationPoints.length ? formatHourMinute(generationPoints[0].time) : null;
  const generationEnd = generationPoints.length ? formatHourMinute(generationPoints[generationPoints.length - 1].time) : null;
  
  return { avgPower, avgConsumption, avgPV, totalPV, avgSOC, generationStart, generationEnd };
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

function extractHour(timeStr) {
  const match = /\s(\d{2}):(\d{2}):\d{2}/.exec(String(timeStr));
  return match ? Number(match[1]) : 0;
}
