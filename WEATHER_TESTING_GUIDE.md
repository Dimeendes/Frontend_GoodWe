# 🌤️ Guia de Teste de Dados Meteorológicos

## 📁 Arquivo Principal: `lib/weatherConfig.js`

Este é o **único arquivo** que você precisa editar para testar diferentes cenários meteorológicos!

## 🎯 Como Testar Diferentes Cenários

### 1. **Mudar Cenário Atual**
No arquivo `lib/weatherConfig.js`, linha 47:
```javascript
export const CURRENT_SCENARIO = 'default'; // Mude aqui!
```

**Cenários disponíveis:**
- `'default'` - Cenário padrão (condições variadas)
- `'storm'` - Tempestade (alertas críticos)
- `'sunny'` - Ensolarado (sem alertas)
- `'cloudy'` - Nublado (alertas de aviso)
- `'moderate_rain'` - Chuva moderada (alertas de aviso)

### 2. **Criar Novo Cenário**
Adicione um novo cenário no objeto `WEATHER_SCENARIOS`:

```javascript
// Exemplo: Cenário de neve
snow: {
  name: 'Neve',
  description: 'Condições de neve - alertas especiais',
  forecasts: [
    { condition: 'rain-risk', temp: -2, rain: 80, day: 'Hoje' },
    { condition: 'rain-risk', temp: -1, rain: 70, day: 'Amanhã' },
    // ... mais dias
  ]
}
```

### 3. **Editar Dados Específicos**
Para cada dia, você pode editar:
- `condition`: `'sunny'`, `'rain-risk'`, `'cloudy'`
- `temp`: Temperatura em °C
- `rain`: Chance de chuva em % (0-100)
- `day`: Nome do dia (apenas para referência)

## 🔄 Como Aplicar Mudanças

1. **Edite** o arquivo `lib/weatherConfig.js`
2. **Salve** o arquivo
3. **Recarregue** a página no navegador
4. **Verifique** os alertas na seção "Notificações"

## 🎛️ Painel de Controle no Dashboard

No dashboard, você verá um painel "🌤️ Controle Meteorológico" que mostra:
- Cenário atual ativo
- Descrição do cenário
- Instruções de como editar
- Link para o arquivo de configuração

## 📊 Exemplos de Teste

### Teste 1: Alerta Crítico
```javascript
export const CURRENT_SCENARIO = 'storm';
```

### Teste 2: Sem Alertas
```javascript
export const CURRENT_SCENARIO = 'sunny';
```

### Teste 3: Alerta de Aviso
```javascript
export const CURRENT_SCENARIO = 'moderate_rain';
```

## ⚠️ Importante

- **Sempre edite apenas** `lib/weatherConfig.js`
- **Não edite** `components/Dashboard.js` ou `lib/alertSystem.js`
- **Recarregue a página** após cada mudança
- **Os alertas aparecem** na seção "Notificações" do dashboard

## 🎯 Cenários Pré-configurados

| Cenário | Chuva | Temperatura | Alertas |
|---------|-------|-------------|---------|
| `default` | 5-50% | 24-28°C | Variados |
| `storm` | 70-90% | 20-25°C | Críticos |
| `sunny` | 0-5% | 28-32°C | Nenhum |
| `cloudy` | 15-25% | 23-26°C | Aviso |
| `moderate_rain` | 35-40% | 22-28°C | Aviso |

Agora é muito mais fácil testar diferentes condições meteorológicas! 🌧️☀️☁️
