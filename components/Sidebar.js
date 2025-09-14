"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '../contexts/SettingsContext';
import styles from './Sidebar.module.css';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  const { language, setIsSettingsOpen } = useSettings();

  const translations = {
    pt: {
      home: 'Home',
      agenda: 'Agenda',
      measures: 'Medidas',
      alerts: 'Alertas',
      settings: 'Configurações'
    },
    en: {
      home: 'Home',
      agenda: 'Schedule',
      measures: 'Measures',
      alerts: 'Alerts',
      settings: 'Settings'
    }
  };

  const t = translations[language];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>SmartWe</div>
      <nav className={styles.nav}>
        <Link className={clsx(styles.link, pathname === '/' && styles.active)} href="/">
          {t.home}
        </Link>
        <Link className={clsx(styles.link, pathname.startsWith('/agenda') && styles.active)} href="/agenda">
          {t.agenda}
        </Link>
        <Link className={clsx(styles.link, pathname.startsWith('/medidas') && styles.active)} href="/medidas">
          {t.measures}
        </Link>
        <Link className={clsx(styles.link, pathname.startsWith('/alertas') && styles.active)} href="/alertas">
          🚨 {t.alerts}
        </Link>
        <button 
          className={styles.settingsButton}
          onClick={() => setIsSettingsOpen(true)}
        >
          ⚙️ {t.settings}
        </button>
      </nav>
    </aside>
  );
}


