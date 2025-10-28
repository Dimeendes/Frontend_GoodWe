"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import ChatWidget from '../../components/ChatWidget';
import { useSettings } from '../../contexts/SettingsContext';
import styles from './styles.module.css';

export default function AparelhosPage() {
  const [aparelhos, setAparelhos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedAparelho, setSelectedAparelho] = useState(null);
  const { language } = useSettings();
  

  const translations = {
    pt: {
      title: 'Aparelhos',
      addAppliance: 'Adicionar Aparelho',
      name: 'Nome do Aparelho',
      type: 'Tipo do Aparelho',
      energyConsumption: 'Gasto Energético por Hora (opcional)',
      priority: 'Aparelho Prioritário',
      moreInfo: 'Mais Informações',
      status: 'Status',
      on: 'Ligado',
      off: 'Desligado',
      priorityLevel: 'Nível de Prioridade',
      energyPerHour: 'Consumo por Hora',
      add: 'Adicionar',
      cancel: 'Cancelar',
      close: 'Fechar',
      turnOn: 'Ligar',
      turnOff: 'Desligar',
      applianceTypes: {
        lighting: 'Iluminação',
        heating: 'Aquecimento',
        cooling: 'Refrigeração',
        entertainment: 'Entretenimento',
        kitchen: 'Cozinha',
        laundry: 'Lavanderia',
        other: 'Outro'
      }
    },
    en: {
      title: 'Appliances',
      addAppliance: 'Add Appliance',
      name: 'Appliance Name',
      type: 'Appliance Type',
      energyConsumption: 'Energy Consumption per Hour (optional)',
      priority: 'Priority Appliance',
      moreInfo: 'More Info',
      status: 'Status',
      on: 'On',
      off: 'Off',
      priorityLevel: 'Priority Level',
      energyPerHour: 'Energy per Hour',
      add: 'Add',
      cancel: 'Cancel',
      close: 'Close',
      turnOn: 'Turn On',
      turnOff: 'Turn Off',
      applianceTypes: {
        lighting: 'Lighting',
        heating: 'Heating',
        cooling: 'Cooling',
        entertainment: 'Entertainment',
        kitchen: 'Kitchen',
        laundry: 'Laundry',
        other: 'Other'
      }
    }
  };

  const t = translations[language];

  // Carregar aparelhos salvos da API (similar à agenda)
  useEffect(() => {
    loadAparelhos();
    
    // Atualiza a cada 2 segundos para verificar mudanças no arquivo JSON
    const interval = setInterval(() => {
      loadAparelhos();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);


  const loadAparelhos = async () => {
    try {
      const response = await fetch('/api/aparelhos');
      if (response.ok) {
        const data = await response.json();
        setAparelhos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar aparelhos:', error);
    }
  };

  const handleAddAparelho = async (aparelhoData) => {
    try {
      const response = await fetch('/api/aparelhos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aparelhoData),
      });

      if (response.ok) {
        const newAparelho = await response.json();
        setAparelhos([...aparelhos, newAparelho]);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar aparelho:', error);
    }
  };

  const deleteAparelho = async (id) => {
    try {
      const response = await fetch(`/api/aparelhos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAparelhos(aparelhos.filter(aparelho => aparelho.id !== id));
        setShowInfoModal(false);
        setSelectedAparelho(null);
      }
    } catch (error) {
      console.error('Erro ao excluir aparelho:', error);
    }
  };

  const openInfoModal = (aparelho) => {
    setSelectedAparelho(aparelho);
    setShowInfoModal(true);
  };

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <div className="topbar"><h2 className="title">SmartWe</h2></div>
        <div className="content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1>{t.title}</h1>
            <button 
              onClick={() => setShowModal(true)}
              className="card"
              style={{ 
                padding: '12px 24px', 
                background: 'var(--accent)', 
                color: '#fff', 
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {t.addAppliance}
            </button>
          </div>

          <div className={styles.grid}>
            {aparelhos.map(aparelho => (
              <AparelhoCard
                key={aparelho.id}
                aparelho={aparelho}
                onInfoClick={openInfoModal}
                language={language}
                t={t}
              />
            ))}
          </div>

          {aparelhos.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: 'var(--muted)',
              fontSize: '18px'
            }}>
              {language === 'pt' 
                ? 'Nenhum aparelho adicionado ainda. Clique em "Adicionar Aparelho" para começar.'
                : 'No appliances added yet. Click "Add Appliance" to get started.'
              }
            </div>
          )}
        </div>
      </main>
      <ChatWidget />

      {/* Modal para adicionar aparelho */}
      {showModal && (
        <AddAparelhoModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddAparelho}
          language={language}
          t={t}
        />
      )}

      {/* Modal para informações do aparelho */}
      {showInfoModal && selectedAparelho && (
        <AparelhoInfoModal
          aparelho={selectedAparelho}
          onClose={() => {
            setShowInfoModal(false);
            setSelectedAparelho(null);
          }}
          onDelete={deleteAparelho}
          language={language}
          t={t}
        />
      )}
    </div>
  );
}

// Componente do card de aparelho
function AparelhoCard({ aparelho, onInfoClick, language, t }) {
  const isLampada = aparelho.name.toLowerCase().includes('lâmpada') || aparelho.name.toLowerCase().includes('lampada');
  
  return (
    <div className={styles.aparelhoCard}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div 
            className={styles.statusIndicator}
            style={{ 
              backgroundColor: aparelho.is_on ? '#4CAF50' : '#F44336',
              width: 12,
              height: 12,
              borderRadius: '50%',
              animation: aparelho.is_on ? 'pulse 2s infinite' : 'none'
            }}
          />
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {aparelho.name}
            </h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px' }}>
              {t.applianceTypes[aparelho.type] || aparelho.type}
              {isLampada && (
                <span style={{ 
                  marginLeft: 8, 
                  color: '#2196F3', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  • Controlado por sensor PIR
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ 
            fontSize: '12px', 
            color: aparelho.is_on ? '#4CAF50' : '#F44336',
            fontWeight: 'bold'
          }}>
            {aparelho.is_on ? t.on : t.off}
          </span>
          
          <button
            onClick={() => onInfoClick(aparelho)}
            className="card"
            style={{
              padding: '6px 8px',
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            {t.moreInfo}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para adicionar aparelho
function AddAparelhoModal({ onClose, onAdd, language, t }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'lighting',
    energyConsumption: '',
    priority: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onAdd({
      name: formData.name,
      type: formData.type,
      energyConsumption: formData.energyConsumption ? parseFloat(formData.energyConsumption) : null,
      priority: formData.priority
    });
    
    setFormData({
      name: '',
      type: 'lighting',
      energyConsumption: '',
      priority: 1
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>{t.addAppliance}</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: 'var(--muted)'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>{t.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={language === 'pt' ? 'Ex: Ar Condicionado Sala' : 'Ex: Living Room AC'}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t.type}</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              {Object.entries(t.applianceTypes).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>
              {t.energyConsumption}
              <Link 
                href="/aparelhos/informacoes" 
                target="_blank"
                style={{ 
                  marginLeft: 8, 
                  color: 'var(--accent)', 
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
                title={language === 'pt' ? 'Ver informações energéticas' : 'View energy information'}
              >
                ?
              </Link>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.energyConsumption}
              onChange={(e) => setFormData({...formData, energyConsumption: e.target.value})}
              placeholder={language === 'pt' ? 'Ex: 1500 (Watts)' : 'Ex: 1500 (Watts)'}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t.priority}: {formData.priority}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
              className={styles.slider}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
              <span>{language === 'pt' ? 'Baixa' : 'Low'}</span>
              <span>{language === 'pt' ? 'Alta' : 'High'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="card">
              {t.cancel}
            </button>
            <button type="submit" className="card" style={{ background: 'var(--accent)', color: '#fff' }}>
              {t.add}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para informações do aparelho
function AparelhoInfoModal({ aparelho, onClose, onDelete, language, t }) {
  const isLampada = aparelho.name.toLowerCase().includes('lâmpada') || aparelho.name.toLowerCase().includes('lampada');
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {aparelho.name}
          </h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: 'var(--muted)'
            }}
          >
            ×
          </button>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>{t.type}</label>
            <span>{t.applianceTypes[aparelho.type] || aparelho.type}</span>
          </div>

          <div className={styles.infoItem}>
            <label>{t.status}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div 
                style={{ 
                  backgroundColor: aparelho.is_on ? '#4CAF50' : '#F44336',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  animation: aparelho.is_on ? 'pulse 2s infinite' : 'none'
                }}
              />
              <span>{aparelho.is_on ? t.on : t.off}</span>
            </div>
          </div>


          <div className={styles.infoItem}>
            <label>{t.priorityLevel}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{aparelho.priority}/5</span>
              <div style={{ 
                width: 100, 
                height: 8, 
                background: 'var(--surface)', 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(aparelho.priority / 5) * 100}%`,
                  height: '100%',
                  background: aparelho.priority >= 4 ? '#F44336' : aparelho.priority >= 3 ? '#FF9800' : '#4CAF50',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          <div className={styles.infoItem}>
            <label>{t.energyPerHour}</label>
            <span>
              {aparelho.energy_consumption 
                ? `${aparelho.energy_consumption} W/h` 
                : language === 'pt' ? 'Não especificado' : 'Not specified'
              }
            </span>
          </div>

        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          {!isLampada && (
            <button 
              onClick={() => onDelete(aparelho.id)}
              className="card"
              style={{ background: '#F44336', color: '#fff' }}
            >
              {language === 'pt' ? 'Excluir' : 'Delete'}
            </button>
          )}
          
          <button onClick={onClose} className="card">
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
