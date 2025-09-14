# 🔊 Teste do Áudio Automático - Guia Rápido

## 🎯 Como Testar Agora:

### 1. **Abrir o Site**
- Acesse: **http://localhost:3001**
- Aguarde a página carregar completamente

### 2. **Verificar Console (F12)**
Você deve ver logs como:
```
🔍 Verificando alertas para reprodução automática: 1
📊 Alertas críticos encontrados: 1
- Alerta: 🌧️ ALERTA DE QUEDA DE ENERGIA, Prioridade: 4, Tem áudio: true
🎵 AudioData presente, tamanho: 344025
🚨 ALERTA CRÍTICO DETECTADO - Reproduzindo áudio automaticamente
⏰ Iniciando reprodução automática após timeout
🔊 Iniciando reprodução de áudio para alerta: 🌧️ ALERTA DE QUEDA DE ENERGIA
```

### 3. **Se o Áudio Não Tocar Automaticamente**

**Opção A:** Aparecerá um botão amarelo:
```
🔊 Clique para ouvir o alerta de áudio [▶️ Reproduzir Áudio]
```

**Opção B:** Clique em qualquer lugar da página e o áudio deve tocar

**Opção C:** Clique no botão 🔊 no próprio alerta

### 4. **Testar Diferentes Cenários**

No arquivo `lib/weatherConfig.js`, mude:

**Para alerta crítico (90% chuva):**
```javascript
export const CURRENT_SCENARIO = 'storm';
```

**Para sem alertas:**
```javascript
export const CURRENT_SCENARIO = 'sunny';
```

### 5. **Troubleshooting**

Se não funcionar:
1. **Recarregue a página** (Ctrl+F5)
2. **Verifique o console** para erros
3. **Teste em navegador diferente** (Chrome funciona melhor)
4. **Clique em qualquer lugar** da página primeiro

## ✅ Funcionalidades Implementadas:

- ✅ **Reprodução automática** após 3 segundos
- ✅ **Detecção de autoplay bloqueado**
- ✅ **Botão de fallback** se autoplay falhar
- ✅ **Reprodução após primeira interação**
- ✅ **Logs detalhados** para debug
- ✅ **Indicador visual** no painel de controle

## 🎵 Status Esperado:

Com o cenário atual (70% chuva), você deve ouvir:
> "Atenção! Alerta meteorológico do sistema de energia solar. sábado, sáb., 13/09, tem previsão de risco de chuva com 70% de chance de precipitação..."

O áudio tem aproximadamente **30 segundos** de duração.
