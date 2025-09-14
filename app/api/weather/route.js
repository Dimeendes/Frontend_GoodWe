import { NextResponse } from 'next/server';

// ========================================
// DADOS METEOROLÓGICOS BASEADOS NO FRONTEND
// ========================================
// Para modificar e testar diferentes cenários, edite o array abaixo:
const weatherData = [
  { condition: 'rain-risk', temp: 24, rain: 60, day: 'sáb., 13/09' }, // Forçar chuva hoje para teste
  { condition: 'rain-risk', temp: 26, rain: 50, day: 'dom., 14/09' },
  { condition: 'cloudy', temp: 28, rain: 20, day: 'seg., 15/09' },
  { condition: 'sunny', temp: 24, rain: 5, day: 'ter., 16/09' },
  { condition: 'rain-risk', temp: 26, rain: 50, day: 'qua., 17/09' }
];

// ========================================
// INSTRUÇÕES PARA TESTES:
// ========================================
// Para gerar mais alertas de chuva, modifique:
// - Aumente 'rain' para valores > 30 (ex: rain: 80)
// - Mude 'condition' para 'rain-risk' 
// - Para tempestade: rain: 95, condition: 'rain-risk'
// - Para dia ensolarado: rain: 5, condition: 'sunny'

function generateWeatherForecasts() {
  const base = new Date();
  
  const forecasts = weatherData.map((data, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    
    return {
      dateISO: d.toISOString(),
      condition: data.condition,
      temperatureC: data.temp,
      precipitationChance: data.rain / 100, // Converter % para decimal
      // Dados adicionais baseados na condição
      windSpeed: data.condition === 'rain-risk' ? 45 : data.condition === 'cloudy' ? 25 : 15,
      cloudCover: data.condition === 'rain-risk' ? 0.9 : data.condition === 'cloudy' ? 0.7 : 0.1,
      hailRisk: data.condition === 'rain-risk' && data.rain > 40 ? 0.3 : 0,
      visibility: data.condition === 'rain-risk' ? 2000 : data.condition === 'cloudy' ? 5000 : 10000,
      humidity: data.condition === 'rain-risk' ? 85 : data.condition === 'cloudy' ? 65 : 50
    };
  });
  
  return forecasts;
}

export async function GET() {
  const forecasts = generateWeatherForecasts();
  const current = forecasts[0]; // Primeiro dia = hoje

  return NextResponse.json({
    current,
    forecasts,
    timestamp: new Date().toISOString()
  });
}