# 🎙️ Guia de Configuração de Voz em Português

## 📁 Arquivo Principal: `lib/voiceConfig.js`

Este arquivo controla **todas as configurações de voz** para os alertas em português brasileiro.

## 🎯 Como Configurar Diferentes Vozes

### 1. **Mudar Perfil de Voz Principal**
No arquivo `lib/voiceConfig.js`, linha 47:
```javascript
export const CURRENT_VOICE_PROFILE = 'female_professional'; // Mude aqui!
```

**Opções disponíveis:**
- `'female_professional'` - Voz feminina clara e profissional (padrão)
- `'male_authoritative'` - Voz masculina forte e autoritária
- `'female_gentle'` - Voz feminina suave e calma
- `'emergency_expressive'` - Voz mais expressiva para emergências

### 2. **Configurar Vozes por Tipo de Alerta**
Linhas 85-89 do `voiceConfig.js`:
```javascript
export const ALERT_VOICE_MAPPING = {
  critical: 'emergency_expressive',    // Alertas críticos
  warning: 'female_professional',     // Avisos
  info: 'female_gentle'              // Informações
};
```

## 🔧 Recursos Avançados Implementados

### ✅ **Processamento de Texto para Português**
- **Substituições automáticas**: °C → "graus Celsius", % → "por cento"
- **Termos técnicos**: SOC → "estado de carga da bateria"
- **Siglas**: PV → "energia fotovoltaica", LED → "L E D"
- **Ênfases**: ALERTA → "ALERTA!", CRÍTICO → "CRÍTICO!"

### ✅ **Configurações de Qualidade**
- **Modelo multilíngue**: `eleven_multilingual_v2`
- **Alta qualidade**: MP3 44.1kHz 128kbps
- **Speaker boost**: Melhora clareza da voz
- **Timeout estendido**: 60 segundos para processamento

### ✅ **Controle de Velocidade**
No `voiceConfig.js`, linha 36:
```javascript
speechRate: 'normal', // 'slow', 'normal', 'fast'
```

### ✅ **Configurações por Tipo de Alerta**
- **Críticos**: Voz expressiva e urgente
- **Avisos**: Voz profissional e clara
- **Informações**: Voz suave e calma

## 🎵 Perfis de Voz Detalhados

### 👩 **Female Professional** (Padrão)
```javascript
voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
stability: 0.75,     // Estabilidade moderada
similarity_boost: 0.85, // Similaridade alta
style: 0.2,          // Pouco expressiva
```

### 👨 **Male Authoritative**
```javascript
voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
stability: 0.8,      // Mais estável
similarity_boost: 0.9,  // Muito similar
style: 0.3,          // Mais expressivo
```

### 👩 **Female Gentle**
```javascript
voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
stability: 0.7,      // Menos estável (mais natural)
similarity_boost: 0.8,  // Similaridade moderada
style: 0.1,          // Muito suave
```

### 🚨 **Emergency Expressive**
```javascript
voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel expressiva
stability: 0.6,      // Menos estável (mais dinâmica)
similarity_boost: 0.9,  // Alta similaridade
style: 0.5,          // Muito expressiva
```

## 🧪 Como Testar Diferentes Configurações

### Teste 1: Voz Masculina Autoritária
```javascript
export const CURRENT_VOICE_PROFILE = 'male_authoritative';
```

### Teste 2: Voz Expressiva para Emergências
```javascript
export const CURRENT_VOICE_PROFILE = 'emergency_expressive';
```

### Teste 3: Velocidade Lenta
```javascript
speechRate: 'slow',
```

### Teste 4: Personalizar Substituições
```javascript
replacements: {
  'SmartWe': 'Smart We Sistema Inteligente',
  'GoodWe': 'Good We Energia Solar',
  // Adicione suas próprias substituições
}
```

## 🔄 Como Aplicar Mudanças

1. **Edite** `lib/voiceConfig.js`
2. **Salve** o arquivo
3. **Recarregue** a página no navegador
4. **Teste** com cenário de chuva para ouvir o áudio

## 📊 Logs de Debug

No console, você verá:
```
Perfil de voz selecionado: Voz Feminina Profissional
Texto processado: Atenção! ALERTA! meteorológico do sistema...
Áudio personalizado gerado com sucesso, tamanho: 445023
```

## 🎯 Dicas de Otimização

- **Para alertas críticos**: Use `emergency_expressive`
- **Para informações técnicas**: Use `male_authoritative`
- **Para avisos gerais**: Use `female_professional`
- **Para notificações suaves**: Use `female_gentle`

Agora você tem **controle total** sobre como os alertas são falados em português! 🇧🇷🎙️
