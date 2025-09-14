# 🚨 Sistema de Alertas Inteligente - SmartWe

## Visão Geral

O Sistema de Alertas Inteligente é uma funcionalidade avançada que monitora automaticamente os dados de energia solar e gera alertas personalizados com recomendações baseadas em padrões semanais. O sistema utiliza inteligência artificial para análise de dados e geração de voz através da API do ElevenLabs.

## ✨ Funcionalidades Principais

### 🔍 Análise Inteligente
- **Análise de Padrões Semanais**: Agrupa dados por dia da semana para identificar padrões de consumo
- **Detecção de Anomalias**: Identifica automaticamente comportamentos anômalos no sistema
- **Previsão de Problemas**: Antecipa possíveis falhas baseadas em tendências históricas

### 🎯 Tipos de Alertas

#### 1. Alertas de Consumo
- **Alto Consumo**: Detecta quando o consumo médio excede 2000W
- **Horários de Pico**: Identifica períodos de maior consumo para otimização
- **Recomendações**: Sugere ações específicas para reduzir o consumo

#### 2. Alertas Solares
- **Baixa Geração**: Alerta quando a geração solar está abaixo do esperado
- **Eficiência dos Painéis**: Monitora a eficiência e sugere manutenção
- **Sombreamento**: Detecta possíveis obstáculos bloqueando a luz solar

#### 3. Alertas de Bateria
- **SOC Baixo**: Alerta crítico quando a bateria está com pouca energia (< 20%)
- **Ciclos Excessivos**: Monitora o número de ciclos de carga/descarga
- **Vida Útil**: Sugere otimizações para prolongar a vida da bateria

#### 4. Alertas Meteorológicos
- **Previsão de Chuva**: Alerta sobre condições climáticas que podem afetar a geração
- **Tempestades e Ventos Fortes**: Detecta condições que podem causar quedas de energia
- **Granizo**: Alerta crítico sobre risco de danos aos painéis solares
- **Temperatura Extrema**: Monitora impacto da temperatura na eficiência dos painéis
- **Neblina/Névoa**: Alerta sobre redução na geração solar matinal
- **Impacto na Geração**: Calcula o impacto esperado na produção de energia
- **Risco de Queda**: Analisa combinação de fatores meteorológicos e estado da bateria
- **Condições Ideais**: Identifica momentos ótimos para maximizar o uso de energia solar

### 🔊 Sistema de Voz (ElevenLabs)
- **Síntese de Voz**: Converte alertas em áudio usando IA avançada
- **Alertas Críticos**: Reproduz automaticamente alertas de alta prioridade
- **Personalização**: Voz natural e clara para melhor compreensão

### 📊 Sistema de Prioridades
- **Crítico (5)**: Ação imediata necessária (ex: SOC baixo)
- **Alto (4)**: Atenção urgente (ex: baixa geração solar)
- **Médio (3)**: Monitoramento ativo (ex: alto consumo)
- **Baixo (2)**: Informativo (ex: horários de pico)
- **Info (1)**: Informações gerais

## 🛠️ Arquitetura Técnica

### Estrutura de Arquivos
```
lib/
├── alertSystem.js          # Lógica principal do sistema de alertas
app/api/
├── alerts/
│   └── route.js           # API endpoints para alertas
components/
├── AlertSystem.js         # Componente React para exibição
├── AlertSystem.module.css # Estilos do componente
app/alertas/
├── page.js               # Página dedicada aos alertas
└── styles.module.css     # Estilos da página
```

### Fluxo de Dados
1. **Coleta**: Sistema carrega dados do CSV GoodWe
2. **Análise**: `analyzeWeeklyData()` processa os dados semanais
3. **Geração**: Cria alertas baseados em padrões identificados
4. **Voz**: Gera áudio para alertas críticos via ElevenLabs
5. **Exibição**: Interface React exibe alertas com recomendações

## 🚀 Como Usar

### Acesso ao Sistema
1. Navegue para a página **Alertas** no menu lateral
2. O sistema carrega automaticamente os alertas baseados nos dados atuais
3. Use o botão **Atualizar Alertas** para recarregar

### Interação com Alertas
- **🔊 Reproduzir Áudio**: Clique no botão de áudio para ouvir o alerta
- **✕ Marcar como Lido**: Remove o alerta da lista
- **📊 Visualizar Detalhes**: Cada alerta mostra mensagem, recomendação e ação

### Configurações
- **Idioma**: Suporte completo para Português e Inglês
- **Prioridades**: Sistema automático baseado na criticidade
- **Atualização**: Refresh automático a cada carregamento da página

## 🔧 Configuração da API ElevenLabs

### Chave API
```javascript
const ELEVENLABS_API_KEY = '0a0f6171a5eed7a1ee22f9fd0a13a24f4e5bc718e2b2b261b52d3d3a79e73d1a';
```

### Configurações de Voz
- **Modelo**: eleven_monolingual_v1
- **Estabilidade**: 0.5 (equilibrio entre consistência e variação)
- **Similaridade**: 0.5 (fidelidade à voz original)

## 📈 Métricas e Estatísticas

O sistema rastreia:
- **Total de Alertas**: Número total de alertas gerados
- **Alertas Críticos**: Quantidade de alertas de alta prioridade
- **Alertas Resolvidos**: Alertas marcados como lidos
- **Tempo de Resposta**: Tempo médio para ação nos alertas

## 🔮 Funcionalidades Futuras

### Melhorias Planejadas
- **Machine Learning**: Algoritmos mais avançados para detecção de padrões
- **Notificações Push**: Alertas em tempo real via notificações do navegador
- **Histórico**: Armazenamento de alertas históricos no banco de dados
- **Personalização**: Configurações personalizáveis por usuário
- **Integração IoT**: Conexão direta com sensores de energia

### Alertas Avançados
- **Previsão de Falhas**: IA preditiva para antecipar problemas
- **Otimização Automática**: Sugestões automáticas de configurações
- **Relatórios**: Geração de relatórios detalhados de performance

## 🛡️ Segurança e Privacidade

- **Dados Locais**: Todos os dados são processados localmente
- **API Segura**: Chave ElevenLabs protegida no servidor
- **Sem Armazenamento**: Alertas não são persistidos permanentemente
- **Anonimização**: Dados pessoais não são coletados

## 📞 Suporte

Para dúvidas ou problemas com o sistema de alertas:
1. Verifique se a API do ElevenLabs está funcionando
2. Confirme se os dados do CSV estão sendo carregados corretamente
3. Verifique o console do navegador para erros
4. Reinicie o servidor de desenvolvimento se necessário

---

**Desenvolvido para o SmartWe - Sistema de Monitoramento de Energia Solar** ⚡
