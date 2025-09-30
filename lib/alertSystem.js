import axios from 'axios';
import config from '../config';
import { generateWeatherData } from './weatherConfig';

// Configuração da API do ElevenLabs
const ELEVENLABS_API_KEY = config.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Função para analisar dados semanais e gerar alertas
export async function analyzeWeeklyData(data) {
  const alerts = [];
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return alerts;
  }

  // Agrupar dados por dia da semana
  const weeklyData = groupDataByDayOfWeek(data);
  
  // Analisar padrões de consumo
  const consumptionPatterns = analyzeConsumptionPatterns(weeklyData);
  
  // Analisar padrões de geração solar
  const solarPatterns = analyzeSolarPatterns(weeklyData);
  
  // Analisar estado da bateria
  const batteryPatterns = analyzeBatteryPatterns(weeklyData);
  
  // Gerar apenas alertas meteorológicos
  alerts.push(...await generateWeatherAlerts());
  alerts.push(...await generateWeatherImpactAlerts(solarPatterns, batteryPatterns));
  
  return alerts.sort((a, b) => b.priority - a.priority);
}

// Agrupar dados por dia da semana
function groupDataByDayOfWeek(data) {
  const weeklyData = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };
  
  data.forEach(row => {
    const date = new Date(row.time.replace(/(\d{2}).(\d{2}).(\d{4})/, '$3-$2-$1'));
    const dayOfWeek = date.getDay();
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    if (weeklyData[dayName]) {
      weeklyData[dayName].push(row);
    }
  });
  
  return weeklyData;
}

// Analisar padrões de consumo
function analyzeConsumptionPatterns(weeklyData) {
  const patterns = {
    peakHours: [],
    lowHours: [],
    averageConsumption: 0,
    peakConsumption: 0,
    consumptionTrend: 'stable'
  };
  
  const allData = Object.values(weeklyData).flat();
  const consumptionValues = allData.map(r => Number(r.loadW || 0));
  
  patterns.averageConsumption = consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length;
  patterns.peakConsumption = Math.max(...consumptionValues);
  
  // Identificar horários de pico (consumo > 80% do pico)
  const peakThreshold = patterns.peakConsumption * 0.8;
  const hourlyConsumption = {};
  
  allData.forEach(row => {
    const hour = extractHour(row.time);
    if (!hourlyConsumption[hour]) {
      hourlyConsumption[hour] = [];
    }
    hourlyConsumption[hour].push(Number(row.loadW || 0));
  });
  
  Object.entries(hourlyConsumption).forEach(([hour, values]) => {
    const avgConsumption = values.reduce((a, b) => a + b, 0) / values.length;
    if (avgConsumption > peakThreshold) {
      patterns.peakHours.push(parseInt(hour));
    } else if (avgConsumption < patterns.averageConsumption * 0.5) {
      patterns.lowHours.push(parseInt(hour));
    }
  });
  
  return patterns;
}

// Analisar padrões de geração solar
function analyzeSolarPatterns(weeklyData) {
  const patterns = {
    averageGeneration: 0,
    peakGeneration: 0,
    generationStart: null,
    generationEnd: null,
    generationEfficiency: 0
  };
  
  const allData = Object.values(weeklyData).flat();
  const solarValues = allData.map(r => Number(r.pvW || 0));
  
  patterns.averageGeneration = solarValues.reduce((a, b) => a + b, 0) / solarValues.length;
  patterns.peakGeneration = Math.max(...solarValues);
  
  // Encontrar início e fim da geração
  const generationPoints = allData.filter(r => Number(r.pvW || 0) > 0);
  if (generationPoints.length > 0) {
    patterns.generationStart = extractHour(generationPoints[0].time);
    patterns.generationEnd = extractHour(generationPoints[generationPoints.length - 1].time);
  }
  
  // Calcular eficiência (comparar com potencial teórico)
  const theoreticalMax = 5000; // Assumindo 5kW de painéis
  patterns.generationEfficiency = (patterns.peakGeneration / theoreticalMax) * 100;
  
  return patterns;
}

// Analisar padrões da bateria
function analyzeBatteryPatterns(weeklyData) {
  const patterns = {
    averageSOC: 0,
    minSOC: 100,
    maxSOC: 0,
    batteryCycles: 0,
    chargingEfficiency: 0
  };
  
  const allData = Object.values(weeklyData).flat();
  const socValues = allData.map(r => Number(r.soc || 0));
  
  patterns.averageSOC = socValues.reduce((a, b) => a + b, 0) / socValues.length;
  patterns.minSOC = Math.min(...socValues);
  patterns.maxSOC = Math.max(...socValues);
  
  // Contar ciclos de bateria (cargas completas)
  let cycles = 0;
  let lastSOC = socValues[0];
  let charging = false;
  
  for (let i = 1; i < socValues.length; i++) {
    const currentSOC = socValues[i];
    if (currentSOC > lastSOC && !charging) {
      charging = true;
    } else if (currentSOC < lastSOC && charging) {
      cycles++;
      charging = false;
    }
    lastSOC = currentSOC;
  }
  
  patterns.batteryCycles = cycles;
  
  return patterns;
}

// Gerar alertas de consumo
function generateConsumptionAlerts(patterns) {
  const alerts = [];
  
  // Alerta de alto consumo
  if (patterns.averageConsumption > 2000) {
    alerts.push({
      id: 'high_consumption',
      type: 'warning',
      priority: 3,
      title: 'Alto Consumo de Energia',
      message: `Consumo médio de ${patterns.averageConsumption.toFixed(0)}W detectado. Considere otimizar o uso de energia.`,
      recommendation: 'Desligue equipamentos desnecessários e use lâmpadas LED para reduzir o consumo.',
      action: 'Otimizar consumo de energia'
    });
  }
  
  // Alerta de horários de pico
  if (patterns.peakHours.length > 0) {
    const peakHoursStr = patterns.peakHours.map(h => `${h}:00`).join(', ');
    alerts.push({
      id: 'peak_hours',
      type: 'info',
      priority: 2,
      title: 'Horários de Pico Identificados',
      message: `Maior consumo detectado nos horários: ${peakHoursStr}`,
      recommendation: 'Evite usar equipamentos de alto consumo nestes horários para economizar energia.',
      action: 'Ajustar horários de uso'
    });
  }
  
  return alerts;
}

// Gerar alertas solares
function generateSolarAlerts(patterns) {
  const alerts = [];
  
  // Alerta de baixa geração solar
  if (patterns.averageGeneration < 1000) {
    alerts.push({
      id: 'low_solar_generation',
      type: 'warning',
      priority: 4,
      title: 'Baixa Geração Solar',
      message: `Geração solar média de apenas ${patterns.averageGeneration.toFixed(0)}W. Verifique se há sombreamento ou problemas nos painéis.`,
      recommendation: 'Limpe os painéis solares e verifique se não há obstáculos bloqueando a luz solar.',
      action: 'Verificar painéis solares'
    });
  }
  
  // Alerta de eficiência baixa
  if (patterns.generationEfficiency < 60) {
    alerts.push({
      id: 'low_efficiency',
      type: 'warning',
      priority: 3,
      title: 'Baixa Eficiência dos Painéis',
      message: `Eficiência de apenas ${patterns.generationEfficiency.toFixed(1)}%. Os painéis podem precisar de manutenção.`,
      recommendation: 'Limpe os painéis solares e verifique as conexões elétricas.',
      action: 'Manutenção dos painéis'
    });
  }
  
  return alerts;
}

// Gerar alertas da bateria
function generateBatteryAlerts(patterns) {
  const alerts = [];
  
  // Alerta de SOC baixo
  if (patterns.minSOC < 20) {
    alerts.push({
      id: 'low_battery',
      type: 'critical',
      priority: 5,
      title: 'Bateria com Pouca Energia',
      message: `SOC mínimo de ${patterns.minSOC.toFixed(1)}% detectado. Risco de queda de energia.`,
      recommendation: 'Reduza o consumo imediatamente e considere usar energia da rede para carregar a bateria.',
      action: 'Economizar energia urgentemente'
    });
  }
  
  // Alerta de muitos ciclos
  if (patterns.batteryCycles > 10) {
    alerts.push({
      id: 'high_battery_cycles',
      type: 'info',
      priority: 2,
      title: 'Muitos Ciclos da Bateria',
      message: `${patterns.batteryCycles} ciclos de carga detectados esta semana.`,
      recommendation: 'Considere otimizar o uso da bateria para prolongar sua vida útil.',
      action: 'Otimizar uso da bateria'
    });
  }
  
  return alerts;
}

// Gerar alertas meteorológicos baseados nos dados do frontend
async function generateWeatherAlerts() {
  const alerts = [];
  
  try {
    // Buscar dados meteorológicos do endpoint
    const weatherData = await fetchWeatherData();
    
    // Usar dados específicos do dia atual
    const dayName = weatherData.dayName;
    const dateFormatted = weatherData.dateFormatted;
    const condition = weatherData.condition;
    
    // Alerta de Chuva - baseado nos dados específicos do frontend
    if (weatherData.rainProbability > 0.3) { // > 30% de chance de chuva
      const rainPercent = (weatherData.rainProbability * 100).toFixed(0);
      const severity = weatherData.rainProbability > 0.7 ? 'ALTO' : 'MODERADO';
      const priority = weatherData.rainProbability > 0.7 ? 5 : 4;
      
      // Determinar o tipo de condição para mensagem mais específica
      let conditionText = '';
      if (condition === 'rain-risk') {
        conditionText = 'Risco de chuva';
      } else if (condition === 'cloudy') {
        conditionText = 'Céu nublado';
      } else {
        conditionText = 'Condições adversas';
      }
      
      // Criar mensagens mais naturais e simples
      const isHighRisk = weatherData.rainProbability > 0.7;
      const riskLevel = isHighRisk ? 'alto' : 'moderado';
      
      // Título mais claro
      const alertTitle = isHighRisk ? 
        '🚨 ALERTA CRÍTICO - Risco de Falta de Energia' : 
        '⚠️ AVISO - Possível Redução de Energia';
      
      // Mensagem principal mais direta
      const mainMessage = `Previsão de chuva para ${dayName} com ${rainPercent}% de chance. Isso pode reduzir a energia solar e afetar o fornecimento elétrico da sua casa.`;
      
      // Recomendação específica para equipamentos GoodWe
      const practicalAdvice = isHighRisk ?
        'Ative o modo de carregamento da bateria GoodWe agora. Evite usar equipamentos de alto consumo (chuveiro elétrico, ar-condicionado). Configure o sistema para priorizar o carregamento da bateria.' :
        'Configure o inversor GoodWe para carregar a bateria durante o dia. Evite usar muitos equipamentos simultaneamente para preservar a energia solar.';
      
      // Texto de áudio simples e direto
      const naturalAudioText = isHighRisk ? 
        `Alerta crítico! Chuva prevista para ${dayName} com ${rainPercent} por cento de chance. Queda de energia eminente, priorize o carregamento da bateria IMEDIATAMENTE.` :
        `Aviso: Chuva prevista para ${dayName} com ${rainPercent} por cento de chance. prepare-se para eventuais quedas de energia e priorize o carregamento da bateria.`;

      alerts.push({
        id: 'rain_alert',
        type: isHighRisk ? 'critical' : 'warning',
        priority: priority,
        title: alertTitle,
        message: mainMessage,
        recommendation: practicalAdvice,
        action: isHighRisk ? 'Preparar para falta de energia' : 'Economizar energia',
        audioText: naturalAudioText
      });
    }
    
    // Alerta de condições nubladas (menor prioridade)
    else if (condition === 'cloudy' && weatherData.rainProbability > 0.1) {
      const rainPercent = (weatherData.rainProbability * 100).toFixed(0);
      
      alerts.push({
        id: 'cloudy_alert',
        type: 'info',
        priority: 2,
        title: '☁️ INFORMAÇÃO - Dia Nublado',
        message: `O dia ${dayName} será nublado com ${rainPercent}% de chance de chuva. A energia solar será menor que o normal.`,
        recommendation: 'Configure o inversor GoodWe para otimizar o carregamento da bateria. Use equipamentos durante as horas de maior irradiação solar. Priorize o carregamento da bateria.',
        action: 'Usar energia com moderação',
        audioText: `Dia nublado ${dayName} com ${rainPercent} por cento de chuva. Configure o inversor GoodWe.`
      });
    }
    
  } catch (error) {
    console.error('Erro ao gerar alertas meteorológicos:', error);
  }
  
  return alerts;
}

// Função para buscar dados meteorológicos usando a configuração centralizada
async function fetchWeatherData() {
  try {
    // Usar a configuração centralizada do weatherConfig.js
    const forecasts = generateWeatherData();
    
    // Pegar dados do dia atual (primeiro item do array)
    const current = forecasts[0];
    
    // Converter dados do formato do Weather para o formato esperado pelos alertas
    return {
      temperature: current.temperatureC,
      rainProbability: current.precipitationChance,
      windSpeed: current.windSpeed,
      cloudCover: current.cloudCover,
      hailRisk: current.hailRisk,
      visibility: current.visibility,
      humidity: current.humidity,
      // Adicionar informações do dia para referência
      dayName: new Date(current.dateISO).toLocaleDateString('pt-BR', { weekday: 'long' }),
      dateFormatted: new Date(current.dateISO).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      condition: current.condition
    };
  } catch (error) {
    console.error('Erro ao buscar dados meteorológicos:', error);
    
    // Fallback para dados padrão em caso de erro
    return {
      temperature: 25,
      rainProbability: 0.1,
      windSpeed: 20,
      cloudCover: 0.3,
      hailRisk: 0,
      visibility: 5000,
      humidity: 60,
      dayName: 'hoje',
      dateFormatted: new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      condition: 'sunny'
    };
  }
}


// Gerar alertas de impacto meteorológico
async function generateWeatherImpactAlerts(solarPatterns, batteryPatterns) {
  const alerts = [];
  
  // Por enquanto, não geramos alertas de impacto
  // Focamos apenas em alertas de chuva diretos
  return alerts;
}


// Calcular impacto das condições meteorológicas na geração solar
function calculateWeatherImpact(weatherData) {
  let impactFactor = 1.0;
  
  // Impacto da chuva
  if (weatherData.rainProbability > 0.3) {
    impactFactor *= (1 - weatherData.rainProbability * 0.6);
  }
  
  // Impacto da cobertura de nuvens
  impactFactor *= (1 - weatherData.cloudCover * 0.5);
  
  // Impacto da visibilidade (neblina/névoa)
  if (weatherData.visibility < 2000) {
    impactFactor *= (weatherData.visibility / 2000);
  }
  
  return Math.max(0.1, impactFactor); // Mínimo 10% da geração normal
}

// Obter motivo do impacto meteorológico
function getWeatherImpactReason(weatherData) {
  const reasons = [];
  
  if (weatherData.rainProbability > 0.3) {
    reasons.push(`Chuva (${(weatherData.rainProbability * 100).toFixed(0)}% de chance)`);
  }
  
  if (weatherData.cloudCover > 0.7) {
    reasons.push(`Céu nublado (${(weatherData.cloudCover * 100).toFixed(0)}% de cobertura)`);
  }
  
  if (weatherData.visibility < 2000) {
    reasons.push(`Baixa visibilidade (${weatherData.visibility}m)`);
  }
  
  if (weatherData.windSpeed > 50) {
    reasons.push(`Vento forte (${weatherData.windSpeed}km/h)`);
  }
  
  return reasons.length > 0 ? reasons.join(' + ') : 'Condições meteorológicas adversas';
}


// Função para extrair hora do timestamp
function extractHour(timeStr) {
  const match = /\s(\d{2}):(\d{2}):\d{2}/.exec(String(timeStr));
  return match ? Number(match[1]) : 0;
}

// Função para gerar áudio usando ElevenLabs
export async function generateVoiceAlert(alert) {
  try {
    // Verificar se a chave da API está configurada
    if (!ELEVENLABS_API_KEY) {
      console.warn('Chave da API ElevenLabs não configurada, pulando geração de áudio');
      return null;
    }

    // Verificar se o alerta tem as propriedades necessárias
    if (!alert || !alert.title || !alert.message) {
      console.warn('Alerta inválido para geração de áudio:', alert);
      return null;
    }

    // Limitar o texto para evitar problemas com a API
    const text = `${alert.title}. ${alert.message}. ${alert.recommendation || ''}`.substring(0, 500);
    console.log('Texto para síntese de voz:', text);
    
    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/7u8qsX4HQsSHJ0f8xsQZ`,
      {
        text: text,
        model_id: "eleven_monolingual_v2",
        voice_settings: {
          stability: 1,
          similarity_boost: 1,
          language_code: "pt-BR"
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 segundos de timeout
      }
    );
    
    console.log('Resposta da API ElevenLabs recebida, tamanho:', response.data.length);
    
    // Converter para blob e criar URL
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('URL de áudio gerada:', audioUrl);
    return audioUrl;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Erro de autenticação na API ElevenLabs - verifique a chave da API');
    } else if (error.response?.status === 429) {
      console.error('Limite de requisições excedido na API ElevenLabs');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição para API ElevenLabs');
    } else if (error.response?.data) {
      const errorData = Buffer.isBuffer(error.response.data) 
        ? JSON.parse(error.response.data.toString())
        : error.response.data;
      
      if (errorData.detail?.status === 'quota_exceeded') {
        console.error('Cota da API ElevenLabs excedida:', errorData.detail.message);
      } else {
        console.error('Erro da API ElevenLabs:', errorData);
      }
    } else {
      console.error('Erro ao gerar áudio:', error.message);
    }
    return null;
  }
}

// Função para reproduzir alerta com voz
export function playVoiceAlert(audioUrl) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Erro ao reproduzir áudio:', error);
    });
  }
}
