// ========================================
// CONFIGURAÇÃO DE VOZES EM PORTUGUÊS
// ========================================
// Configure diferentes vozes e estilos para os alertas de áudio

export const VOICE_PROFILES = {
  // Voz feminina profissional (padrão)
  female_professional: {
    name: 'Voz Feminina Profissional',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - clara e profissional
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.2,
      use_speaker_boost: true
    },
    description: 'Voz feminina clara e profissional, ideal para alertas técnicos'
  },

  // Voz masculina autoritária
  male_authoritative: {
    name: 'Voz Masculina Autoritária',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - voz masculina forte
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.3,
      use_speaker_boost: true
    },
    description: 'Voz masculina forte e autoritária, ideal para alertas críticos'
  },

  // Voz feminina suave
  female_gentle: {
    name: 'Voz Feminina Suave',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - voz suave
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.1,
      use_speaker_boost: true
    },
    description: 'Voz feminina suave e calma, ideal para informações gerais'
  },

  // Voz expressiva para emergências
  emergency_expressive: {
    name: 'Voz de Emergência',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel com configurações mais expressivas
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.6,
      similarity_boost: 0.9,
      style: 0.5,
      use_speaker_boost: true
    },
    description: 'Voz mais expressiva e urgente para alertas críticos'
  }
};

// Configuração atual da voz (mude aqui para testar diferentes vozes)
export const CURRENT_VOICE_PROFILE = 'female_professional'; // Opções: 'female_professional', 'male_authoritative', 'female_gentle', 'emergency_expressive'

// Configurações de processamento de texto para português
export const TEXT_PROCESSING = {
  // Substituições básicas para melhor pronúncia
  replacements: {
    '%': ' por cento',
    '°C': ' graus',
    'SOC': 'bateria',
    'PV': 'solar'
  },

  // Configurações simples
  addPauses: false, // Desabilitado para evitar travamentos
  speechRate: 'normal'
};

// Configurações específicas por tipo de alerta
export const ALERT_VOICE_MAPPING = {
  critical: 'emergency_expressive',    // Alertas críticos usam voz expressiva
  warning: 'female_professional',     // Avisos usam voz profissional
  info: 'female_gentle'              // Informações usam voz suave
};

// Função para obter configuração da voz atual
export function getCurrentVoiceConfig() {
  return VOICE_PROFILES[CURRENT_VOICE_PROFILE];
}

// Função para obter voz baseada no tipo de alerta
export function getVoiceForAlert(alertType) {
  const voiceProfile = ALERT_VOICE_MAPPING[alertType] || CURRENT_VOICE_PROFILE;
  return VOICE_PROFILES[voiceProfile];
}

// Função simplificada para processar texto
export function processTextForPortuguese(text) {
  let processedText = text;

  // Aplicar apenas substituições básicas
  Object.entries(TEXT_PROCESSING.replacements).forEach(([search, replace]) => {
    processedText = processedText.replace(new RegExp(search, 'g'), replace);
  });

  // Limpar espaços extras e quebras de linha
  processedText = processedText.replace(/\s+/g, ' ').trim();

  return processedText;
}

// Função para obter configurações de velocidade
export function getSpeechRateSettings() {
  const rates = {
    slow: { stability: 0.9, similarity_boost: 0.8, style: 0.1 },
    normal: { stability: 0.75, similarity_boost: 0.85, style: 0.2 },
    fast: { stability: 0.6, similarity_boost: 0.9, style: 0.3 }
  };
  
  return rates[TEXT_PROCESSING.speechRate] || rates.normal;
}
