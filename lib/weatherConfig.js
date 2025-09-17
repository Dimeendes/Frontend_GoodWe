// ========================================
// CONFIGURAÇÃO DE DADOS METEOROLÓGICOS
// ========================================
// Edite este arquivo para testar diferentes cenários meteorológicos

export const WEATHER_SCENARIOS = {
  // Cenário padrão (atual)
  default: {
    name: 'Cenário Padrão',
    description: 'Condições variadas ao longo da semana',
    forecasts: [
      { condition: 'rain-risk', temp: 24, rain: 90, day: 'Hoje' },
      { condition: 'rain-risk', temp: 26, rain: 70, day: 'Amanhã' },
      { condition: 'cloudy', temp: 28, rain: 20, day: 'Depois de amanhã' },
      { condition: 'sunny', temp: 24, rain: 5, day: 'Quarta-feira' },
      { condition: 'rain-risk', temp: 26, rain: 90, day: 'Quinta-feira' }
    ]
  },

  // Cenário de tempestade (alerta crítico)
  storm: {
    name: 'Tempestade',
    description: 'Alto risco de chuva - alertas críticos',
    forecasts: [
      { condition: 'rain-risk', temp: 22, rain: 90, day: 'Hoje' },
      { condition: 'rain-risk', temp: 20, rain: 85, day: 'Amanhã' },
      { condition: 'rain-risk', temp: 23, rain: 70, day: 'Depois de amanhã' },
      { condition: 'cloudy', temp: 25, rain: 30, day: 'Quarta-feira' },
      { condition: 'sunny', temp: 28, rain: 5, day: 'Quinta-feira' }
    ]
  },

  // Cenário ensolarado (sem alertas)
  sunny: {
    name: 'Ensolarado',
    description: 'Dias ensolarados - sem alertas meteorológicos',
    forecasts: [
      { condition: 'sunny', temp: 30, rain: 0, day: 'Hoje' },
      { condition: 'sunny', temp: 32, rain: 0, day: 'Amanhã' },
      { condition: 'sunny', temp: 29, rain: 5, day: 'Depois de amanhã' },
      { condition: 'sunny', temp: 31, rain: 0, day: 'Quarta-feira' },
      { condition: 'sunny', temp: 28, rain: 2, day: 'Quinta-feira' }
    ]
  },

  // Cenário nublado (alertas de aviso)
  cloudy: {
    name: 'Nublado',
    description: 'Céu nublado - alertas de aviso',
    forecasts: [
      { condition: 'cloudy', temp: 25, rain: 15, day: 'Hoje' },
      { condition: 'cloudy', temp: 23, rain: 25, day: 'Amanhã' },
      { condition: 'cloudy', temp: 26, rain: 20, day: 'Depois de amanhã' },
      { condition: 'cloudy', temp: 24, rain: 18, day: 'Quarta-feira' },
      { condition: 'sunny', temp: 27, rain: 5, day: 'Quinta-feira' }
    ]
  },

  // Cenário de chuva moderada
  moderate_rain: {
    name: 'Chuva Moderada',
    description: 'Chuva moderada - alertas de aviso',
    forecasts: [
      { condition: 'rain-risk', temp: 24, rain: 40, day: 'Hoje' },
      { condition: 'rain-risk', temp: 22, rain: 35, day: 'Amanhã' },
      { condition: 'cloudy', temp: 25, rain: 15, day: 'Depois de amanhã' },
      { condition: 'sunny', temp: 28, rain: 5, day: 'Quarta-feira' },
      { condition: 'sunny', temp: 30, rain: 0, day: 'Quinta-feira' }
    ]
  }
};

// Configuração atual (mude aqui para testar)
export const CURRENT_SCENARIO = 'default'; // Mude para: 'storm', 'sunny', 'cloudy', 'moderate_rain'

// Função para gerar dados meteorológicos baseados no cenário atual
export function generateWeatherData() {
  const scenario = WEATHER_SCENARIOS[CURRENT_SCENARIO];
  const base = new Date();
  
  return scenario.forecasts.map((data, i) => {
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
}

// Função para obter informações do cenário atual
export function getCurrentScenarioInfo() {
  return WEATHER_SCENARIOS[CURRENT_SCENARIO];
}
