"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import ChatWidget from '../../components/ChatWidget';
import { useSettings } from '../../contexts/SettingsContext';
import styles from './styles.module.css';

export default function AgendaPage() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const { language } = useSettings();

  const translations = {
    pt: {
      title: 'Agenda',
      description: 'Descrição',
      add: 'Adicionar',
      delete: 'Excluir'
    },
    en: {
      title: 'Schedule',
      description: 'Description',
      add: 'Add',
      delete: 'Delete'
    }
  };

  const t = translations[language];

  useEffect(() => {
    fetch('/api/agenda').then(r => r.json()).then(setItems).catch(() => {});
  }, []);

  function addItem(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const payload = { id: crypto.randomUUID(), text, date };
    setItems(prev => [...prev, payload]);
    fetch('/api/agenda', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
    setText("");
    setDate("");
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    fetch(`/api/agenda/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <div className="topbar"><h2 className="title">SmartWe</h2></div>
        <div className="content">
          <div className={styles.container}>
            <h1>{t.title}</h1>
            <form onSubmit={addItem} className={styles.form}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder={t.description} />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              <button type="submit">{t.add}</button>
            </form>
            <ul className={styles.list}>
              {items.map(item => (
                <li key={item.id}>
                  <span>{item.text}</span>
                  {item.date && <em> {new Date(item.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}</em>}
                  <button onClick={() => removeItem(item.id)}>{t.delete}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}


