"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState('pt');
  const [theme, setTheme] = useState('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Carregar configurações do localStorage ao inicializar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Salvar configurações no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Aplicar tema ao body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const value = {
    language,
    setLanguage,
    theme,
    setTheme,
    isSettingsOpen,
    setIsSettingsOpen
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
