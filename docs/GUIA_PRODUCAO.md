# 🎥 GUIA DE PRODUÇÃO - VÍDEO PITCH SMARTWE

## 🛠️ **PREPARAÇÃO TÉCNICA**

### **Setup do Sistema**
```bash
# 1. Garantir que o sistema está rodando
npm run dev

# 2. Verificar se todas as APIs estão funcionando
# - Chat API (localhost:8000)
# - Alertas funcionando
# - Dados CSV carregados
```

### **Checklist Pré-Gravação**
- [ ] **Sistema SmartWe funcionando** (localhost:3000)
- [ ] **Dados carregados** - CSV Plant-Power_20250912195804.csv
- [ ] **Chat respondendo** - testar algumas perguntas
- [ ] **Alertas gerados** - verificar se aparecem
- [ ] **Áudio dos alertas** - testar ElevenLabs
- [ ] **Clima funcionando** - widget meteorológico
- [ ] **Gráficos animados** - charts responsivos

---

## 📱 **SEQUÊNCIA DE TELAS PARA GRAVAÇÃO**

### **1. Tela de Abertura (0:00-0:15)**
- **URL:** `http://localhost:3000/`
- **Foco:** Dashboard principal com gráficos
- **Ação:** Zoom suave no título "SmartWe"

### **2. Demonstração Problema (0:15-0:45)**
- **Preparar:** Screenshots de sistemas tradicionais
- **Visual:** Gráficos estáticos vs dinâmicos
- **Efeito:** Transição rápida entre imagens

### **3. Dashboard Principal (0:45-1:30)**
- **URL:** `http://localhost:3000/`
- **Mostrar:**
  - Gráficos em tempo real
  - Sidebar com navegação
  - Sistema de alertas no dashboard
  - Chat widget no canto inferior

### **4. Página de Alertas (1:30-2:00)**
- **URL:** `http://localhost:3000/alertas`
- **Demonstrar:**
  - Lista de alertas com prioridades
  - Botão de áudio funcionando
  - Diferentes tipos de alerta
  - Marcar como lido

### **5. Chat em Ação (2:00-2:15)**
- **Localização:** Widget no canto da tela
- **Perguntas preparadas:**
  - "Como otimizar meu consumo de energia?"
  - "Qual a eficiência dos meus painéis?"
  - "Preciso fazer manutenção?"

### **6. Análise de Dados (2:15-2:30)**
- **URL:** `http://localhost:3000/medidas`
- **Mostrar:** Gráficos detalhados e análises

### **7. Fechamento (2:45-3:00)**
- **Retornar:** Dashboard principal
- **Foco:** Logo SmartWe e sistema completo

---

## 🎬 **DICAS DE APRESENTAÇÃO**

### **Tom de Voz**
- **Início:** Entusiasmado e confiante
- **Meio:** Técnico mas acessível  
- **Final:** Inspirador e memorável

### **Ritmo da Narração**
- **150-160 palavras por minuto** (ritmo ideal para 3 min)
- **Pausas estratégicas** após pontos importantes
- **Enfatizar** palavras-chave com tom ligeiramente mais alto

### **Linguagem Corporal (se aparecer)**
- Gestos moderados e profissionais
- Postura confiante
- Olhar direto para câmera

---

## 📊 **DADOS E ESTATÍSTICAS PARA MENCIONAR**

### **Tecnologias Implementadas**
- ✅ **Frontend:** Next.js + React 18
- ✅ **Gráficos:** Chart.js com animações
- ✅ **IA:** Análise preditiva + ElevenLabs
- ✅ **Backend:** APIs REST + SQLite
- ✅ **Integrações:** GoodWe + Meteorologia

### **Funcionalidades Quantificadas**
- 🔢 **5 tipos** de alertas inteligentes
- 🔢 **4 categorias** de análise (consumo, solar, bateria, clima)
- 🔢 **2 idiomas** suportados (PT/EN)
- 🔢 **Tempo real** - atualizações automáticas

---

## 🎯 **SCRIPTS DE DEMONSTRAÇÃO**

### **Chat - Perguntas Preparadas**
```
Usuário: "Como posso otimizar meu consumo?"
Resposta esperada: Recomendações sobre horários de pico

Usuário: "Meus painéis estão eficientes?"
Resposta esperada: Análise da geração solar

Usuário: "Preciso fazer manutenção?"
Resposta esperada: Sugestões baseadas nos dados
```

### **Alertas - Cenários para Mostrar**
- ⚠️ **Crítico:** SOC da bateria baixo
- 🔶 **Alto:** Baixa geração solar
- 🔵 **Médio:** Alto consumo detectado
- 📢 **Com áudio:** Qualquer alerta para demonstrar voz

---

## 🔧 **TROUBLESHOOTING RÁPIDO**

### **Se o chat não responder:**
```bash
# Verificar se API Python está rodando
curl http://localhost:8000/health
```

### **Se alertas não aparecerem:**
- Recarregar página `/alertas`
- Verificar console do navegador
- Testar botão "Atualizar Alertas"

### **Se gráficos não carregarem:**
- Verificar se CSV está em `/public/data/`
- Recarregar página principal
- Verificar console para erros

### **Se áudio não funcionar:**
- Verificar chave ElevenLabs
- Testar com alerta crítico primeiro
- Verificar permissões de áudio do navegador

---

## 📷 **CONFIGURAÇÕES DE GRAVAÇÃO**

### **Resolução e Qualidade**
- **Resolução:** 1920x1080 (Full HD)
- **FPS:** 30 fps mínimo
- **Bitrate:** Alto para qualidade
- **Formato:** MP4 (compatibilidade)

### **Áudio**
- **Microfone:** Testado e configurado
- **Ambiente:** Silencioso
- **Níveis:** Verificar antes de gravar
- **Backup:** Gravar áudio separado se possível

### **Enquadramento**
- **Tela:** Capture completa da janela do navegador
- **Cursor:** Visível mas não distrativo
- **Zoom:** 100% do navegador
- **Abas:** Apenas SmartWe aberto

---

## ⚡ **ÚLTIMAS VERIFICAÇÕES**

### **5 Minutos Antes de Gravar**
1. ✅ Cronômetro preparado e visível
2. ✅ Roteiro na mesa para consulta
3. ✅ Sistema funcionando perfeitamente
4. ✅ Todas as telas testadas
5. ✅ Áudio e vídeo configurados
6. ✅ Ambiente silencioso
7. ✅ Celular no silencioso

### **Plano B - Se Algo Der Errado**
- **Chat offline:** Focar nos alertas e gráficos
- **Alertas com problema:** Destacar dashboard e análises  
- **Internet instável:** Usar screenshots preparadas
- **Áudio com falha:** Mencionar funcionalidade sem demonstrar

---

## 🎭 **STORYTELLING EFETIVO**

### **Estrutura Narrativa**
1. **Hook** - Problema urgente que todos reconhecem
2. **Agitação** - Consequências de não resolver
3. **Solução** - SmartWe como resposta perfeita
4. **Prova** - Demonstração técnica funcionando
5. **Visão** - Futuro com energia inteligente

### **Conectores de Transição**
- "Mas imagine se..." (0:15)
- "É aí que entra..." (0:45)
- "Vejam na prática..." (1:30)
- "Nosso diferencial..." (2:15)
- "Por isso, o SmartWe..." (2:45)

---

*Lembre-se: Confiança é tudo. Você conhece seu projeto melhor que ninguém!* 🚀
