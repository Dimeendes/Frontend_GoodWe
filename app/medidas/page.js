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
      batteryStatusLabel: 'SOC médio'
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
      batteryStatusLabel: 'Average SOC'
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
