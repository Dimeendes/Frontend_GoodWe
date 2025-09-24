"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import styles from './Sidebar.module.css';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  const { language, setIsSettingsOpen } = useSettings();
  const { logout } = useAuth();

  const translations = {
    pt: {
      home: 'Dashboard',
      agenda: 'Agenda',
      measures: 'Medidas',
      appliances: 'Aparelhos',
      alerts: 'Alertas',
      settings: 'Configurações',
      logout: 'Sair'
    },
    en: {
      home: 'Dashboard',
      agenda: 'Schedule',
      measures: 'Measures',
      appliances: 'Appliances',
      alerts: 'Alerts',
      settings: 'Settings',
      logout: 'Logout'
    }
  };

  const t = translations[language];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>SmartWe</div>
      <nav className={styles.nav}>
        <Link className={clsx(styles.link, pathname === '/' && styles.active)} href="/">
          📈 {t.home}
        </Link>
        <Link className={clsx(styles.link, pathname.startsWith('/agenda') && styles.active)} href="/agenda">
          📅 {t.agenda}
        </Link>
        <Link className={clsx(styles.link, pathname.startsWith('/medidas') && styles.active)} href="/medidas">
          📊 {t.measures}
        </Link>
        <Link className={clsx(styles.link, pathname.startsWith('/aparelhos') && styles.active)} href="/aparelhos">
          🔌 {t.appliances}
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
        <button 
          className={styles.logoutButton}
          onClick={logout}
        >
          🚪 {t.logout}
        </button>
      </nav>
    </aside>
  );
}


