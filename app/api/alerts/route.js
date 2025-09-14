import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync, readFileSync as readFile } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import Papa from 'papaparse';
import axios from 'axios';
import { analyzeWeeklyData } from '../../../lib/alertSystem';
import config from '../../../config';
import { getVoiceForAlert, processTextForPortuguese, getSpeechRateSettings } from '../../../lib/voiceConfig';

// Função para gerar hash único do alerta
function generateAlertHash(alert) {
  const content = `${alert.id}-${alert.type}-${alert.audioText || ''}-${alert.priority}`;
  return createHash('md5').update(content).digest('hex');
}

// Função para obter caminho do arquivo de cache
function getAudioCachePath(hash) {
  const cacheDir = join(process.cwd(), 'public', 'audio-cache');
  return join(cacheDir, `${hash}.mp3`);
}

// Função para verificar se áudio existe no cache
function getCachedAudio(hash) {
  const filePath = getAudioCachePath(hash);
  if (existsSync(filePath)) {
    try {
      const audioData = readFile(filePath);
      const base64Audio = audioData.toString('base64');
      return `data:audio/mpeg;base64,${base64Audio}`;
    } catch (error) {
      console.error('Erro ao ler áudio do cache:', error);
      return null;
    }
  }
  return null;
}

// Função para salvar áudio no cache
function saveAudioToCache(hash, audioBuffer) {
  try {
    const cacheDir = join(process.cwd(), 'public', 'audio-cache');
    const filePath = getAudioCachePath(hash);
    
    // Criar diretório se não existir
    if (!existsSync(cacheDir)) {
      require('fs').mkdirSync(cacheDir, { recursive: true });
    }
    
    writeFileSync(filePath, audioBuffer);
    console.log('Áudio salvo no cache:', filePath);
    return true;
  } catch (error) {
    console.error('Erro ao salvar áudio no cache:', error);
    return false;
  }
}

// Função para carregar CSV no servidor
function loadCsvFromFile(path) {
  try {
    const filePath = join(process.cwd(), 'public', path);
    const fileContent = readFileSync(filePath, 'utf8');
    
    // Encontrar o cabeçalho real
    const lines = fileContent.split(/\r?\n/);
    const headerIndex = lines.findIndex(l => l.replace(/"/g, '').trim().startsWith('Time,'));
    
    if (headerIndex < 0) {
      throw new Error('Cabeçalho "Time,..." não encontrado no CSV');
    }
    
    const trimmed = lines.slice(headerIndex).join('\n');
    
    return new Promise((resolve, reject) => {
      Papa.parse(trimmed, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result) => {
          const rows = (result.data || []).map(r => ({
            time: r['Time'],
            pvW: toNumber(r['PV(W)']),
            soc: toNumber(r['SOC(%)']),
            batteryW: toNumber(r['Battery(W)']),
            gridW: toNumber(r['Grid (W)']),
            loadW: toNumber(r['Load(W)'])
          })).filter(r => r.time);
          resolve({ headers: result.meta.fields || [], rows });
        },
        error: reject
      });
    });
  } catch (error) {
    console.error('Erro ao carregar CSV:', error);
    return { headers: [], rows: [] };
  }
}

function toNumber(x) {
  if (typeof x === 'number') return x;
  if (typeof x === 'string') return Number(String(x).replace(',', '.'));
  return Number(x || 0);
}

// Áudio padrão pré-gerado para economizar créditos da API
let DEFAULT_ALERT_AUDIO = null;

// Função para gerar áudio padrão genérico (executa apenas uma vez)
// Função para gerar áudio personalizado baseado no alerta
async function generatePersonalizedAlertAudio(alert) {
  try {
    // Gerar hash único para este alerta
    const alertHash = generateAlertHash(alert);
    console.log('Hash do alerta:', alertHash);
    
    // Verificar se áudio já existe no cache
    const cachedAudio = getCachedAudio(alertHash);
    if (cachedAudio) {
      console.log('✅ Áudio encontrado no cache, reutilizando:', alertHash);
      return cachedAudio;
    }
    
    console.log('🔄 Áudio não encontrado no cache, gerando novo...');
    
    const ELEVENLABS_API_KEY = config.ELEVENLABS_API_KEY;
    
    // Verificar se a chave da API está configurada
    if (!ELEVENLABS_API_KEY) {
      console.warn('Chave da API ElevenLabs não configurada, pulando geração de áudio');
      return null;
    }
    
    const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
    
    // Usar texto personalizado do alerta ou texto padrão
    const audioText = alert.audioText || 
      "Atenção! Alerta meteorológico do sistema de energia solar. Verifique o painel de controle para mais informações.";
    
    console.log('Gerando áudio personalizado:', audioText);
    
    // Obter configuração de voz baseada no tipo de alerta
    const voiceProfile = getVoiceForAlert(alert.type);
    const speechRateSettings = getSpeechRateSettings();
    
    // Processar texto para melhor pronúncia em português
    const processedText = processTextForPortuguese(audioText);
    
    console.log('Perfil de voz selecionado:', voiceProfile.name);
    console.log('Texto processado:', processedText.substring(0, 100) + '...');
    
    // Configuração avançada para voz em português brasileiro
    const voiceConfig = {
      voiceId: voiceProfile.voiceId,
      text: processedText,
      model_id: voiceProfile.model_id,
      
      // Combinar configurações do perfil com ajustes de velocidade
      voice_settings: {
        ...voiceProfile.voice_settings,
        ...speechRateSettings,
        use_speaker_boost: true
      },
      
      // Configurações adicionais para português
      language_code: "pt",
      
      // Configurações de qualidade de áudio
      output_format: "mp3_44100_128", // Alta qualidade
      optimize_streaming_latency: 0,   // Máxima qualidade
      
      // Configurações experimentais para melhor português
      pronunciation_dictionary_locators: [],
      seed: null, // Para consistência na geração
      previous_text: null,
      next_text: null,
      previous_request_ids: [],
      next_request_ids: []
    };

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceConfig.voiceId}`,
      {
        text: voiceConfig.text,
        model_id: voiceConfig.model_id,
        voice_settings: voiceConfig.voice_settings,
        language_code: voiceConfig.language_code,
        output_format: voiceConfig.output_format,
        optimize_streaming_latency: voiceConfig.optimize_streaming_latency,
        pronunciation_dictionary_locators: voiceConfig.pronunciation_dictionary_locators,
        seed: voiceConfig.seed,
        previous_text: voiceConfig.previous_text,
        next_text: voiceConfig.next_text,
        previous_request_ids: voiceConfig.previous_request_ids,
        next_request_ids: voiceConfig.next_request_ids
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
          'User-Agent': 'GoodWe-Dashboard/1.0 (Portuguese-BR)',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br'
        },
        responseType: 'arraybuffer',
        timeout: 60000, // Aumentado para 60 segundos para alta qualidade
        maxContentLength: 100 * 1024 * 1024, // 100MB max para alta qualidade
        maxBodyLength: 100 * 1024 * 1024,
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Aceitar apenas códigos de sucesso
        }
      }
    );
    
    console.log('Áudio personalizado gerado com sucesso, tamanho:', response.data.length);
    
    // Salvar áudio no cache
    const audioBuffer = Buffer.from(response.data);
    saveAudioToCache(alertHash, audioBuffer);
    
    // Converter para base64
    const base64Audio = audioBuffer.toString('base64');
    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Erro de autenticação na API ElevenLabs - verifique a chave da API');
    } else if (error.response?.status === 429) {
      console.error('Limite de requisições excedido na API ElevenLabs');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição para API ElevenLabs');
    } else {
      console.error('Erro ao gerar áudio personalizado:', error.message);
    }
    return null;
  }
}

export async function GET() {
  try {
    console.log('Iniciando geração de alertas...');
    
    // Dados de exemplo para teste (simulando dados do CSV com variações meteorológicas)
    const currentHour = new Date().getHours();
    const weatherCondition = getSimulatedWeatherCondition();
    
    const mockData = [
      { 
        time: '12.09.2025 06:00:00', 
        loadW: 2500, 
        pvW: weatherCondition.morning.pvW, 
        soc: 85, 
        batteryW: -100, 
        gridW: 100 
      },
      { 
        time: '12.09.2025 12:00:00', 
        loadW: 1800, 
        pvW: weatherCondition.noon.pvW, 
        soc: 95, 
        batteryW: 200, 
        gridW: -200 
      },
      { 
        time: '12.09.2025 18:00:00', 
        loadW: 2200, 
        pvW: weatherCondition.afternoon.pvW, 
        soc: weatherCondition.socImpact, 
        batteryW: -300, 
        gridW: 300 
      },
      { 
        time: '12.09.2025 22:00:00', 
        loadW: 1500, 
        pvW: 0, 
        soc: Math.max(15, weatherCondition.socImpact - 20), 
        batteryW: -400, 
        gridW: 400 
      }
    ];
    
    console.log('Usando dados de exemplo:', mockData.length, 'registros');
    
    // Analisar dados e gerar alertas
    const alerts = await analyzeWeeklyData(mockData);
    console.log('Alertas gerados:', alerts);
    
    // Garantir que alerts seja sempre um array
    const alertsArray = Array.isArray(alerts) ? alerts : [];
    console.log('Alertas como array:', alertsArray.length, 'itens');
    
    // Gerar áudio personalizado para alertas críticos
    const alertsWithAudio = [];
    
    for (const alert of alertsArray) {
      if (alert.priority >= 4) {
        console.log('Gerando áudio personalizado para alerta:', alert.title);
        const personalizedAudio = await generatePersonalizedAlertAudio(alert);
        alertsWithAudio.push({ ...alert, audioData: personalizedAudio });
      } else {
        alertsWithAudio.push(alert);
      }
    }
    
    console.log('Alertas finais:', alertsWithAudio.length, 'itens');
    return NextResponse.json(alertsWithAudio);
  } catch (error) {
    console.error('Erro ao gerar alertas:', error);
    return NextResponse.json([]); // Retorna array vazio em caso de erro
  }
}

// Função para simular condições meteorológicas variadas
function getSimulatedWeatherCondition() {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const hour = now.getHours();
  
  // Simular diferentes cenários meteorológicos baseados no dia do mês
  const scenarios = [
    // Dia ensolarado
    {
      name: 'sunny',
      morning: { pvW: 800 },
      noon: { pvW: 4500 },
      afternoon: { pvW: 2200 },
      socImpact: 85
    },
    // Dia nublado
    {
      name: 'cloudy',
      morning: { pvW: 200 },
      noon: { pvW: 1800 },
      afternoon: { pvW: 800 },
      socImpact: 60
    },
    // Dia chuvoso
    {
      name: 'rainy',
      morning: { pvW: 50 },
      noon: { pvW: 600 },
      afternoon: { pvW: 200 },
      socImpact: 40
    },
    // Tempestade
    {
      name: 'storm',
      morning: { pvW: 0 },
      noon: { pvW: 300 },
      afternoon: { pvW: 100 },
      socImpact: 25
    },
    // Neblina matinal
    {
      name: 'foggy',
      morning: { pvW: 100 },
      noon: { pvW: 3200 },
      afternoon: { pvW: 1800 },
      socImpact: 70
    }
  ];
  
  // Selecionar cenário baseado no dia (ciclo de 5 dias)
  const scenarioIndex = dayOfMonth % scenarios.length;
  const baseScenario = scenarios[scenarioIndex];
  
  // Adicionar variação baseada na hora atual para simular mudanças ao longo do dia
  const hourVariation = Math.sin((hour / 24) * Math.PI * 2) * 0.2; // -0.2 a 0.2
  
  return {
    name: baseScenario.name,
    morning: {
      pvW: Math.max(0, baseScenario.morning.pvW * (1 + hourVariation))
    },
    noon: {
      pvW: Math.max(0, baseScenario.noon.pvW * (1 + hourVariation))
    },
    afternoon: {
      pvW: Math.max(0, baseScenario.afternoon.pvW * (1 + hourVariation))
    },
    socImpact: Math.max(15, Math.min(95, baseScenario.socImpact + (hourVariation * 10)))
  };
}

export async function POST(request) {
  try {
    const { alertId, action } = await request.json();
    
    // Aqui você pode implementar lógica para marcar alertas como resolvidos
    // ou executar ações específicas baseadas no alertId e action
    
    return NextResponse.json({ success: true, message: 'Ação executada com sucesso' });
  } catch (error) {
    console.error('Erro ao processar ação do alerta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
