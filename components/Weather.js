"use client";
import styles from './Weather.module.css';

/*
  Edit the forecast in the props you pass from the page using this shape:
  {
    dateISO: '2025-09-12',
    condition: 'sunny' | 'rain-risk' | 'cloudy',
    temperatureC: 28,
    precipitationChance: 0.2
  }
*/

export default function Weather({ forecast, forecasts }) {
  const list = Array.isArray(forecasts) && forecasts.length
    ? forecasts
    : forecast
      ? [forecast]
      : [];
  return (
    <section id="weather" className={styles.wrapper}>
      <div>
        <div className={styles.title}>Previsão do Tempo</div>
        <div className={styles.days}>
          {list.map((f, i) => (
            <div key={f.dateISO || i} className={styles.dayCard}>
              <div className={styles.dayTop}>
                <span className={styles.icon}>{getIcon(f.condition)}</span>
                <span className={styles.badge}>{label(f.condition)}</span>
              </div>
              <div className={styles.dayDate}>{formatDate(f.dateISO)}</div>
              <div className={styles.meta}>
                <span>{f.temperatureC}°C</span>
                <span>Chuva: {Math.round((f.precipitationChance || 0) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function label(cond) {
  if (cond === 'sunny') return 'Ensolarado';
  if (cond === 'rain-risk') return 'Risco de chuva';
  return 'Nublado';
}

function getIcon(cond) {
  if (cond === 'sunny') return '☀️';
  if (cond === 'rain-risk') return '🌦️';
  return '☁️';
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  } catch {
    return iso;
  }
}


