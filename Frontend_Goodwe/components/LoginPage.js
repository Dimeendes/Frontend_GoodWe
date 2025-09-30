'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { language, setLanguage } = useSettings();

  const translations = {
    pt: {
      login: 'Login',
      password: 'Senha',
      enter: 'Entrar',
      entering: 'Entrando...',
      emailPlaceholder: 'Digite seu email',
      passwordPlaceholder: 'Digite sua senha',
      errorMessage: 'Email ou senha incorretos',
      language: 'Idioma'
    },
    en: {
      login: 'Login',
      password: 'Password',
      enter: 'Enter',
      entering: 'Entering...',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      errorMessage: 'Incorrect email or password',
      language: 'Language'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simular um pequeno delay para melhor UX
    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setError(t.errorMessage);
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span className={styles.logoText}>SmartWe</span>
            <span className={styles.logoSubtext}>Smart Energy Solutions</span>
          </div>
        </div>

        {/* Seletor de Idioma */}
        <div className={styles.languageSelector}>
          <label htmlFor="language" className={styles.languageLabel}>
            {t.language}:
          </label>
          <select 
            id="language"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className={styles.languageSelect}
          >
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              {t.login}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder={t.emailPlaceholder}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              {t.password}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder={t.passwordPlaceholder}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? t.entering : t.enter}
          </button>
        </form>
      </div>
    </div>
  );
}
