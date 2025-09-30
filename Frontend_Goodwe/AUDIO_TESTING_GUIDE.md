# 🔊 Guia de Teste de Áudio Automático

## 🎯 Como Funciona

O sistema agora reproduz **automaticamente** áudio quando você entra no site, mas apenas para alertas **críticos** (prioridade ≥4).

## 🚀 Teste Rápido

### 1. **Configurar Cenário com Alerta Crítico**
No arquivo `lib/weatherConfig.js`, linha 47:
```javascript
export const CURRENT_SCENARIO = 'storm'; // ← Mude para 'storm'
```

### 2. **Recarregar a Página**
- Salve o arquivo
- Recarregue a página no navegador
- **Aguarde 2 segundos** após o carregamento

### 3. **Verificar o Áudio**
- O áudio deve tocar automaticamente
- Você verá um indicador "🔊 Tocando" no painel meteorológico
- No console do navegador, verá logs detalhados

## 🎛️ Cenários de Teste

### **Cenário 1: Alerta Crítico (Áudio Automático)**
```javascript
export const CURRENT_SCENARIO = 'storm';
```
- **Resultado**: Áudio toca automaticamente
- **Prioridade**: 5 (Crítico)
- **Chuva**: 90% hoje

### **Cenário 2: Alerta de Aviso (Sem Áudio Automático)**
```javascript
export const CURRENT_SCENARIO = 'moderate_rain';
```
- **Resultado**: Sem áudio automático
- **Prioridade**: 4 (Aviso)
- **Chuva**: 40% hoje

### **Cenário 3: Sem Alertas (Sem Áudio)**
```javascript
export const CURRENT_SCENARIO = 'sunny';
```
- **Resultado**: Sem áudio
- **Prioridade**: N/A
- **Chuva**: 0% hoje

## 🔍 Verificação no Console

Abra o console do navegador (F12) para ver os logs:

### **Logs de Sucesso:**
```
🚨 ALERTA CRÍTICO DETECTADO - Reproduzindo áudio automaticamente
Alerta: 🌧️ ALERTA DE QUEDA DE ENERGIA
Prioridade: 5
🔊 Iniciando reprodução de áudio para alerta: 🌧️ ALERTA DE QUEDA DE ENERGIA
📊 Prioridade: 5
🎵 Fonte do áudio: data:audio/mpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
📥 Carregando áudio...
✅ Áudio pronto para reprodução
▶️ Áudio iniciado com sucesso
🎵 Reprodução iniciada
```

### **Logs de Erro:**
```
❌ Erro ao reproduzir áudio: NotAllowedError
Detalhes do erro: The play() request was interrupted
```

## 🎵 Controles de Áudio

### **Reprodução Automática:**
- ✅ **Ativa** para alertas críticos (prioridade ≥4)
- ⏱️ **Delay**: 2 segundos após carregamento da página
- 🔊 **Volume**: 80% (moderado)

### **Controles Manuais:**
- **Botão 🔊**: Reproduzir/parar áudio manualmente
- **Indicador Visual**: "🔊 Tocando" quando ativo
- **Timeout**: 30 segundos máximo por reprodução

## ⚠️ Solução de Problemas

### **Áudio Não Toca:**
1. **Verifique o console** para erros
2. **Confirme o cenário** está configurado corretamente
3. **Aguarde 2 segundos** após carregar a página
4. **Verifique se há alertas críticos** (prioridade ≥4)

### **Erro "NotAllowedError":**
- **Causa**: Navegador bloqueou reprodução automática
- **Solução**: Clique em qualquer lugar da página primeiro
- **Prevenção**: Alguns navegadores exigem interação do usuário

### **Áudio Travado:**
- **Timeout**: 30 segundos máximo
- **Reset**: Recarregue a página
- **Logs**: Verifique console para detalhes

## 🎯 Teste Completo

1. **Configure** `CURRENT_SCENARIO = 'storm'`
2. **Recarregue** a página
3. **Aguarde** 2 segundos
4. **Verifique** se o áudio toca
5. **Observe** o indicador "🔊 Tocando"
6. **Confirme** nos logs do console

## 📱 Compatibilidade

- ✅ **Chrome**: Funciona perfeitamente
- ✅ **Firefox**: Funciona perfeitamente
- ✅ **Safari**: Pode exigir interação do usuário
- ✅ **Edge**: Funciona perfeitamente

Agora o áudio toca automaticamente quando há alertas críticos! 🎵🚨
