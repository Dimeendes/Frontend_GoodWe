"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>SmartWe</div>
      <nav className={styles.nav}>
        <Link className={clsx(styles.link, pathname === '/' && styles.active)} href="/">Home</Link>
        <Link className={clsx(styles.link, pathname.startsWith('/agenda') && styles.active)} href="/agenda">Agenda</Link>
        <Link className={clsx(styles.link, pathname.startsWith('/medidas') && styles.active)} href="/medidas">Medidas</Link>
      </nav>
    </aside>
  );
}


