"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import ChatWidget from '../../components/ChatWidget';
import AlertSystem from '../../components/AlertSystem';
import { useSettings } from '../../contexts/SettingsContext';
import styles from './styles.module.css';

export default function AlertasPage() {
  const { language } = useSettings();
  const [refreshKey, setRefreshKey] = useState(0);

  const translations = {
    pt: {
      title: 'Sistema de Alertas Inteligente',
      subtitle: 'Monitoramento em tempo real e recomendações automáticas',
      refresh: 'Atualizar Alertas',
      lastUpdate: 'Última atualização',
      features: {
        title: 'Recursos do Sistema',
        realTime: 'Análise em tempo real dos dados de energia',
        recommendations: 'Recomendações personalizadas baseadas em padrões',
        voiceAlerts: 'Alertas com voz usando IA avançada',
        priority: 'Sistema de prioridades inteligente',
        automation: 'Automação completa do monitoramento'
      },
      stats: {
        title: 'Estatísticas dos Alertas',
        totalAlerts: 'Total de Alertas',
        criticalAlerts: 'Alertas Críticos',
        resolvedAlerts: 'Alertas Resolvidos',
        avgResponseTime: 'Tempo Médio de Resposta'
      }
    },
    en: {
      title: 'Intelligent Alert System',
      subtitle: 'Real-time monitoring and automatic recommendations',
      refresh: 'Refresh Alerts',
      lastUpdate: 'Last update',
      features: {
        title: 'System Features',
        realTime: 'Real-time analysis of energy data',
        recommendations: 'Personalized recommendations based on patterns',
        voiceAlerts: 'Voice alerts using advanced AI',
        priority: 'Intelligent priority system',
        automation: 'Complete monitoring automation'
      },
      stats: {
        title: 'Alert Statistics',
        totalAlerts: 'Total Alerts',
        criticalAlerts: 'Critical Alerts',
        resolvedAlerts: 'Resolved Alerts',
        avgResponseTime: 'Average Response Time'
      }
    }
  };

  const t = translations[language];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <div className="topbar">
          <h2 className="title">SmartWe</h2>
        </div>
        <div className="content">
          <div className={styles.header}>
            <div>
              <h1>{t.title}</h1>
              <p className={styles.subtitle}>{t.subtitle}</p>
            </div>
            <button 
              onClick={handleRefresh}
              className={styles.refreshButton}
            >
              🔄 {t.refresh}
            </button>
          </div>

          <div className={styles.statsGrid}>
            <div className="card">
              <h3>{t.stats.title}</h3>
              <div className={styles.statsContent}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>12</span>
                  <span className={styles.statLabel}>{t.stats.totalAlerts}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>3</span>
                  <span className={styles.statLabel}>{t.stats.criticalAlerts}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>8</span>
                  <span className={styles.statLabel}>{t.stats.resolvedAlerts}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>2.3m</span>
                  <span className={styles.statLabel}>{t.stats.avgResponseTime}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>{t.features.title}</h3>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>⚡</span>
                  <span>{t.features.realTime}</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>💡</span>
                  <span>{t.features.recommendations}</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>🔊</span>
                  <span>{t.features.voiceAlerts}</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>🎯</span>
                  <span>{t.features.priority}</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>🤖</span>
                  <span>{t.features.automation}</span>
                </div>
              </div>
            </div>
          </div>

          <div key={refreshKey}>
            <AlertSystem />
          </div>
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}
