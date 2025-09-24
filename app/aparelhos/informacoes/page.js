"use client";
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';
import ChatWidget from '../../../components/ChatWidget';
import { useSettings } from '../../../contexts/SettingsContext';
import styles from './styles.module.css';

export default function InformacoesPage() {
  const { language } = useSettings();

  const translations = {
    pt: {
      title: 'Informações Energéticas',
      subtitle: 'Consumo típico de aparelhos domésticos',
      backToAppliances: '← Voltar aos Aparelhos',
      category: 'Categoria',
      appliance: 'Aparelho',
      consumption: 'Consumo (kWh/mês)',
      recommendedPriority: 'Prioridade Recomendada',
      priority: 'Prioridade',
      categories: {
        lighting: 'Iluminação',
        heating: 'Aquecimento',
        cooling: 'Refrigeração',
        entertainment: 'Entretenimento',
        kitchen: 'Cozinha',
        laundry: 'Lavanderia',
        other: 'Outro'
      },
      appliances: {
        lighting: [
          { name: 'Lâmpada LED 7W', consumption: '5-8', priority: 2 },
          { name: 'Lâmpada LED 12W', consumption: '8-12', priority: 2 },
          { name: 'Lâmpada LED 18W', consumption: '12-18', priority: 2 },
          { name: 'Lâmpada Fluorescente 20W', consumption: '15-25', priority: 2 },
          { name: 'Abajur LED', consumption: '3-6', priority: 2 }
        ],
        heating: [
          { name: 'Aquecedor Elétrico 1000W', consumption: '300-500', priority: 4 },
          { name: 'Aquecedor Elétrico 2000W', consumption: '600-1000', priority: 5 },
          { name: 'Chuveiro Elétrico 3500W', consumption: '150-300', priority: 5 },
          { name: 'Chuveiro Elétrico 5500W', consumption: '250-450', priority: 5 },
          { name: 'Torneira Elétrica', consumption: '100-200', priority: 4 }
        ],
        cooling: [
          { name: 'Ar Condicionado 9000 BTU', consumption: '200-400', priority: 4 },
          { name: 'Ar Condicionado 12000 BTU', consumption: '300-600', priority: 5 },
          { name: 'Ar Condicionado 18000 BTU', consumption: '500-900', priority: 5 },
          { name: 'Ventilador de Teto', consumption: '15-30', priority: 2 },
          { name: 'Ventilador Portátil', consumption: '5-15', priority: 1 }
        ],
        entertainment: [
          { name: 'TV LED 32"', consumption: '30-60', priority: 3 },
          { name: 'TV LED 43"', consumption: '50-100', priority: 3 },
          { name: 'TV LED 55"', consumption: '80-150', priority: 3 },
          { name: 'Gaming Console', consumption: '40-80', priority: 3 },
          { name: 'Soundbar', consumption: '10-25', priority: 2 },
          { name: 'Home Theater', consumption: '60-120', priority: 3 }
        ],
        kitchen: [
          { name: 'Geladeira 1 Porta', consumption: '25-50', priority: 5 },
          { name: 'Geladeira 2 Portas', consumption: '40-70', priority: 5 },
          { name: 'Freezer Vertical', consumption: '60-100', priority: 5 },
          { name: 'Microondas', consumption: '15-30', priority: 3 },
          { name: 'Forno Elétrico', consumption: '40-80', priority: 4 },
          { name: 'Cooktop Elétrico', consumption: '50-100', priority: 4 },
          { name: 'Liquidificador', consumption: '5-10', priority: 2 },
          { name: 'Cafeteira Elétrica', consumption: '10-20', priority: 2 },
          { name: 'Lava-louças', consumption: '30-60', priority: 4 }
        ],
        laundry: [
          { name: 'Máquina de Lavar 8kg', consumption: '40-80', priority: 4 },
          { name: 'Máquina de Lavar 10kg', consumption: '50-100', priority: 4 },
          { name: 'Secadora Elétrica', consumption: '100-200', priority: 4 },
          { name: 'Ferro de Passar', consumption: '20-40', priority: 3 }
        ],
        other: [
          { name: 'Computador Desktop', consumption: '60-120', priority: 3 },
          { name: 'Notebook', consumption: '15-30', priority: 2 },
          { name: 'Modem/Router', consumption: '5-15', priority: 1 },
          { name: 'Aspirador de Pó', consumption: '10-25', priority: 2 },
          { name: 'Aspirador Robô', consumption: '5-15', priority: 2 },
          { name: 'Bomba de Piscina', consumption: '80-150', priority: 4 }
        ]
      },
      priorityLevels: {
        1: 'Baixa',
        2: 'Baixa-Média',
        3: 'Média',
        4: 'Alta',
        5: 'Crítica'
      },
      notes: {
        title: 'Notas Importantes',
        note1: 'Os valores de consumo são estimativas baseadas no uso médio brasileiro.',
        note2: 'A prioridade indica a importância do aparelho para o funcionamento da residência.',
        note3: 'Aparelhos com prioridade 5 são essenciais e devem ser mantidos ligados.',
        note4: 'Considere o horário de pico energético ao programar o uso dos aparelhos.'
      }
    },
    en: {
      title: 'Energy Information',
      subtitle: 'Typical consumption of household appliances',
      backToAppliances: '← Back to Appliances',
      category: 'Category',
      appliance: 'Appliance',
      consumption: 'Consumption (kWh/month)',
      recommendedPriority: 'Recommended Priority',
      priority: 'Priority',
      categories: {
        lighting: 'Lighting',
        heating: 'Heating',
        cooling: 'Cooling',
        entertainment: 'Entertainment',
        kitchen: 'Kitchen',
        laundry: 'Laundry',
        other: 'Other'
      },
      appliances: {
        lighting: [
          { name: 'LED Bulb 7W', consumption: '5-8', priority: 2 },
          { name: 'LED Bulb 12W', consumption: '8-12', priority: 2 },
          { name: 'LED Bulb 18W', consumption: '12-18', priority: 2 },
          { name: 'Fluorescent Bulb 20W', consumption: '15-25', priority: 2 },
          { name: 'LED Table Lamp', consumption: '3-6', priority: 2 }
        ],
        heating: [
          { name: 'Electric Heater 1000W', consumption: '300-500', priority: 4 },
          { name: 'Electric Heater 2000W', consumption: '600-1000', priority: 5 },
          { name: 'Electric Shower 3500W', consumption: '150-300', priority: 5 },
          { name: 'Electric Shower 5500W', consumption: '250-450', priority: 5 },
          { name: 'Electric Faucet', consumption: '100-200', priority: 4 }
        ],
        cooling: [
          { name: 'Air Conditioner 9000 BTU', consumption: '200-400', priority: 4 },
          { name: 'Air Conditioner 12000 BTU', consumption: '300-600', priority: 5 },
          { name: 'Air Conditioner 18000 BTU', consumption: '500-900', priority: 5 },
          { name: 'Ceiling Fan', consumption: '15-30', priority: 2 },
          { name: 'Portable Fan', consumption: '5-15', priority: 1 }
        ],
        entertainment: [
          { name: 'LED TV 32"', consumption: '30-60', priority: 3 },
          { name: 'LED TV 43"', consumption: '50-100', priority: 3 },
          { name: 'LED TV 55"', consumption: '80-150', priority: 3 },
          { name: 'Gaming Console', consumption: '40-80', priority: 3 },
          { name: 'Soundbar', consumption: '10-25', priority: 2 },
          { name: 'Home Theater', consumption: '60-120', priority: 3 }
        ],
        kitchen: [
          { name: 'Refrigerator 1 Door', consumption: '25-50', priority: 5 },
          { name: 'Refrigerator 2 Door', consumption: '40-70', priority: 5 },
          { name: 'Vertical Freezer', consumption: '60-100', priority: 5 },
          { name: 'Microwave', consumption: '15-30', priority: 3 },
          { name: 'Electric Oven', consumption: '40-80', priority: 4 },
          { name: 'Electric Cooktop', consumption: '50-100', priority: 4 },
          { name: 'Blender', consumption: '5-10', priority: 2 },
          { name: 'Electric Coffee Maker', consumption: '10-20', priority: 2 },
          { name: 'Dishwasher', consumption: '30-60', priority: 4 }
        ],
        laundry: [
          { name: 'Washing Machine 8kg', consumption: '40-80', priority: 4 },
          { name: 'Washing Machine 10kg', consumption: '50-100', priority: 4 },
          { name: 'Electric Dryer', consumption: '100-200', priority: 4 },
          { name: 'Iron', consumption: '20-40', priority: 3 }
        ],
        other: [
          { name: 'Desktop Computer', consumption: '60-120', priority: 3 },
          { name: 'Laptop', consumption: '15-30', priority: 2 },
          { name: 'Modem/Router', consumption: '5-15', priority: 1 },
          { name: 'Vacuum Cleaner', consumption: '10-25', priority: 2 },
          { name: 'Robot Vacuum', consumption: '5-15', priority: 2 },
          { name: 'Pool Pump', consumption: '80-150', priority: 4 }
        ]
      },
      priorityLevels: {
        1: 'Low',
        2: 'Low-Medium',
        3: 'Medium',
        4: 'High',
        5: 'Critical'
      },
      notes: {
        title: 'Important Notes',
        note1: 'Consumption values are estimates based on average Brazilian usage.',
        note2: 'Priority indicates the importance of the appliance for home operation.',
        note3: 'Priority 5 appliances are essential and should be kept on.',
        note4: 'Consider peak energy hours when scheduling appliance use.'
      }
    }
  };

  const t = translations[language];

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <div className="topbar"><h2 className="title">SmartWe</h2></div>
        <div className="content">
          <div style={{ marginBottom: 24 }}>
            <Link href="/aparelhos" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              color: 'var(--accent)', 
              textDecoration: 'none',
              marginBottom: 16,
              fontSize: '14px'
            }}>
              {t.backToAppliances}
            </Link>
            <h1>{t.title}</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 32 }}>{t.subtitle}</p>
          </div>

          <div className={styles.categoriesGrid}>
            {Object.entries(t.appliances).map(([categoryKey, appliances]) => (
              <div key={categoryKey} className={styles.categoryCard}>
                <h3 className={styles.categoryTitle}>
                  {t.categories[categoryKey]}
                </h3>
                <div className={styles.appliancesList}>
                  {appliances.map((appliance, index) => (
                    <div key={index} className={styles.applianceItem}>
                      <div className={styles.applianceInfo}>
                        <span className={styles.applianceName}>{appliance.name}</span>
                        <span className={styles.consumption}>
                          {appliance.consumption} kWh/mês
                        </span>
                      </div>
                      <div className={styles.priorityInfo}>
                        <span className={styles.priorityLabel}>{t.priority}:</span>
                        <span 
                          className={styles.priorityValue}
                          style={{ 
                            color: appliance.priority >= 4 ? '#F44336' : 
                                   appliance.priority >= 3 ? '#FF9800' : '#4CAF50'
                          }}
                        >
                          {appliance.priority} - {t.priorityLevels[appliance.priority]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.notesSection}>
            <h3>{t.notes.title}</h3>
            <ul className={styles.notesList}>
              <li>{t.notes.note1}</li>
              <li>{t.notes.note2}</li>
              <li>{t.notes.note3}</li>
              <li>{t.notes.note4}</li>
            </ul>
          </div>
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}

