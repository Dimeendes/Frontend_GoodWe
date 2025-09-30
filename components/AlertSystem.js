"use client";
import { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import styles from './AlertSystem.module.css';

export default function AlertSystem() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [pendingAudio, setPendingAudio] = useState(null);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);
  const [audioPlayedAlerts, setAudioPlayedAlerts] = useState(new Set());
  const { language } = useSettings();

  const translations = {
    pt: {
      title: 'Sistema de Alertas Inteligente',
      loading: 'Carregando alertas...',
      noAlerts: 'Nenhum alerta no momento',
      priority: 'Prioridade',
      recommendation: 'Recomendação',
      action: 'Ação Sugerida',
      playAudio: 'Reproduzir Áudio',
      stopAudio: 'Parar Áudio',
      markAsRead: 'Marcar como Lido',
      critical: 'Crítico',
      warning: 'Aviso',
      info: 'Informação',
      priorityLevels: {
        5: 'Crítico',
        4: 'Alto',
        3: 'Médio',
        2: 'Baixo',
        1: 'Info'
      }
    },
    en: {
      title: 'Intelligent Alert System',
      loading: 'Loading alerts...',
      noAlerts: 'No alerts at the moment',
      priority: 'Priority',
      recommendation: 'Recommendation',
      action: 'Suggested Action',
      playAudio: 'Play Audio',
      stopAudio: 'Stop Audio',
      markAsRead: 'Mark as Read',
      critical: 'Critical',
      warning: 'Warning',
      info: 'Information',
      priorityLevels: {
        5: 'Critical',
        4: 'High',
        3: 'Medium',
        2: 'Low',
        1: 'Info'
      }
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadAlerts();
    
    // Adicionar listener para primeira interação do usuário
    const handleFirstInteraction = () => {
      console.log('👆 Primeira interação do usuário detectada');
      if (pendingAudio) {
        console.log('🎵 Tentando reproduzir áudio pendente após interação');
        setTimeout(() => playAudio(pendingAudio), 500);
      }
      
      // Remover listeners após primeira interação
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Efeito para tocar áudio automaticamente APENAS UMA VEZ quando alertas críticos são carregados
  useEffect(() => {
    if (alerts.length > 0 && !hasPlayedInitialAudio) {
      console.log('🔍 Verificando alertas para reprodução automática inicial:', alerts.length);
      
      // Buscar alerta crítico com maior prioridade
      const criticalAlerts = alerts.filter(alert => alert.priority >= 4);
      console.log('📊 Alertas críticos encontrados:', criticalAlerts.length);
      
      const criticalAlert = criticalAlerts
        .filter(alert => alert.audioUrl || alert.audioData)
        .sort((a, b) => b.priority - a.priority)[0]; // Pegar o de maior prioridade
      
      if (criticalAlert) {
        console.log('🚨 ALERTA CRÍTICO DETECTADO - Reproduzindo áudio automaticamente UMA VEZ');
        console.log('Alerta:', criticalAlert.title);
        console.log('Prioridade:', criticalAlert.priority);
        
        // Marcar que já reproduziu o áudio inicial
        setHasPlayedInitialAudio(true);
        
        // Aguarda um pouco para garantir que a página carregou completamente
        setTimeout(() => {
          console.log('⏰ Iniciando reprodução automática inicial após timeout');
          playAudio(criticalAlert);
        }, 3000);
      } else {
        console.log('⚠️ Nenhum alerta crítico com áudio encontrado');
        setHasPlayedInitialAudio(true); // Marcar como já processado mesmo sem áudio
      }
    }
  }, [alerts, hasPlayedInitialAudio]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alerts');
      const data = await response.json();
      // Garantir que data seja sempre um array
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      setAlerts([]); // Definir como array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (alert, isManualPlay = false) => {
    // Se for reprodução manual, sempre permitir
    // Se for automática, verificar se já foi reproduzido
    if (!isManualPlay && audioPlayedAlerts.has(alert.id)) {
      console.log('🚫 Áudio já foi reproduzido anteriormente, ignorando:', alert.title);
      return;
    }

    if (playingAudio === alert.id) {
      // Parar áudio se já estiver tocando
      console.log('⏹️ Parando áudio do alerta:', alert.title);
      setPlayingAudio(null);
      return;
    }

    const audioSource = alert.audioData || alert.audioUrl;
    if (audioSource) {
      console.log('🔊 Iniciando reprodução de áudio para alerta:', alert.title);
      console.log('📊 Prioridade:', alert.priority);
      console.log('🎵 Fonte do áudio:', audioSource.substring(0, 50) + '...');
      console.log('👆 Reprodução manual:', isManualPlay);
      
      try {
        const audio = new Audio(audioSource);
        
        // Configurar volume e outras propriedades
        audio.volume = 0.8; // Volume moderado
        audio.preload = 'auto';
        
        // Configurar eventos
        audio.onloadstart = () => {
          console.log('📥 Carregando áudio...');
        };
        
        audio.oncanplay = () => {
          console.log('✅ Áudio pronto para reprodução');
        };
        
        audio.onplay = () => {
          console.log('▶️ Áudio iniciado com sucesso');
          setPlayingAudio(alert.id);
          
          // Marcar que este alerta já foi reproduzido
          setAudioPlayedAlerts(prev => new Set([...prev, alert.id]));
        };
        
        audio.play().then(() => {
          console.log('🎵 Reprodução iniciada com sucesso');
          setAutoplayBlocked(false);
          setPendingAudio(null);
        }).catch(error => {
          console.error('❌ Erro ao reproduzir áudio:', error);
          console.error('Detalhes do erro:', error.message);
          
          // Verificar se é erro de autoplay
          if (error.name === 'NotAllowedError' || error.message.includes('autoplay')) {
            console.log('🚫 Autoplay bloqueado pelo navegador');
            setAutoplayBlocked(true);
            setPendingAudio(alert);
          }
          
          setPlayingAudio(null);
        });
        
        audio.onended = () => {
          console.log('🏁 Áudio finalizado');
          setPlayingAudio(null);
        };
        
        audio.onerror = (error) => {
          console.error('❌ Erro no áudio:', error);
          console.error('Tipo de erro:', error.type);
          setPlayingAudio(null);
        };
        
        // Timeout de segurança para evitar áudio travado
        setTimeout(() => {
          if (playingAudio === alert.id) {
            console.log('⏰ Timeout do áudio - finalizando');
            setPlayingAudio(null);
          }
        }, 30000); // 30 segundos de timeout
        
      } catch (error) {
        console.error('❌ Erro ao criar elemento de áudio:', error);
        setPlayingAudio(null);
      }
      
    } else {
      console.log('⚠️ Nenhum áudio disponível para este alerta');
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'markAsRead' })
      });
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 5: return '#dc2626'; // Vermelho - Crítico
      case 4: return '#ea580c'; // Laranja - Alto
      case 3: return '#d97706'; // Amarelo - Médio
      case 2: return '#059669'; // Verde - Baixo
      case 1: return '#2563eb'; // Azul - Info
      default: return '#6b7280'; // Cinza
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3>{t.title}</h3>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  if (!Array.isArray(alerts) || alerts.length === 0) {
    return (
      <div className="card">
        <h3>{t.title}</h3>
        <div className={styles.noAlerts}>
          <span>✅</span>
          <span>{t.noAlerts}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="card">
      <h3>{t.title}</h3>
      
      {/* Aviso de autoplay bloqueado */}
      {autoplayBlocked && pendingAudio && (
        <div style={{ 
          padding: 12, 
          background: '#fbbf24', 
          color: '#92400e', 
          borderRadius: 8, 
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>🔊 Clique para ouvir o alerta de áudio</span>
          <button 
            onClick={() => playAudio(pendingAudio, true)}
            style={{
              padding: '6px 12px',
              background: '#d97706',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            ▶️ Reproduzir Áudio
          </button>
        </div>
      )}
      
      <div className={styles.alertsContainer}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`${styles.alert} ${styles[alert.type]}`}
            style={{ borderLeftColor: getPriorityColor(alert.priority) }}
          >
            <div className={styles.alertHeader}>
              <div className={styles.alertTitle}>
                <span className={styles.typeIcon}>{getTypeIcon(alert.type)}</span>
                <span>{alert.title}</span>
              </div>
              <div className={styles.alertActions}>
                <span
                  className={styles.priority}
                  style={{ backgroundColor: getPriorityColor(alert.priority) }}
                >
                  {t.priorityLevels[alert.priority] || alert.priority}
                </span>
                {(alert.audioUrl || alert.audioData) && (
                  <button
                    className={styles.audioButton}
                    onClick={() => playAudio(alert, true)}
                    title={playingAudio === alert.id ? t.stopAudio : t.playAudio}
                  >
                    {playingAudio === alert.id ? '⏹️' : '🔊'}
                  </button>
                )}
                <button
                  className={styles.closeButton}
                  onClick={() => markAsRead(alert.id)}
                  title={t.markAsRead}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className={styles.alertContent}>
              <p className={styles.message}>{alert.message}</p>
              
              {alert.recommendation && (
                <div className={styles.recommendation}>
                  <strong>{t.recommendation}:</strong>
                  <p>{alert.recommendation}</p>
                </div>
              )}
              
              {alert.action && (
                <div className={styles.action}>
                  <strong>{t.action}:</strong>
                  <span>{alert.action}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
