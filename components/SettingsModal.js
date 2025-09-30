"use client";
import { useSettings } from '../contexts/SettingsContext';
import styles from './SettingsModal.module.css';

export default function SettingsModal() {
  const { 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    isSettingsOpen, 
    setIsSettingsOpen 
  } = useSettings();

  if (!isSettingsOpen) return null;

  const translations = {
    pt: {
      title: 'Configurações',
      language: 'Idioma',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Escuro',
      close: 'Fechar'
    },
    en: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      close: 'Close'
    }
  };

  const t = translations[language];

  return (
    <div className={styles.overlay} onClick={() => setIsSettingsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.title}</h2>
          <button 
            className={styles.closeButton}
            onClick={() => setIsSettingsOpen(false)}
          >
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.setting}>
            <label className={styles.label}>{t.language}</label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className={styles.select}
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className={styles.setting}>
            <label className={styles.label}>{t.theme}</label>
            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeButton} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => setTheme('light')}
              >
                ☀️ {t.light}
              </button>
              <button
                className={`${styles.themeButton} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => setTheme('dark')}
              >
                🌙 {t.dark}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
