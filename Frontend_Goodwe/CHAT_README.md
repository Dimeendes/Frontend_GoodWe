# Chat com Assistente Virtual GoodWe

## Visão Geral

O sistema de chat integra o frontend Next.js com a API Python do Assistente Virtual GoodWe, permitindo que usuários façam perguntas sobre produtos e serviços GoodWe diretamente na interface.

## Arquitetura

```
Frontend (Next.js) → API Route (/api/chat) → Python API (localhost:8000)
```

## Componentes Implementados

### 1. ChatWidget (`components/ChatWidget.js`)
- Interface de chat flutuante
- Gerenciamento de estado das mensagens
- Indicador de carregamento
- Tratamento de erros

### 2. API Route (`app/api/chat/route.js`)
- **POST /api/chat**: Envia mensagens para o assistente
- **GET /api/chat**: Verifica status da API do assistente

### 3. Utilitários (`lib/assistantApi.js`)
- Funções para comunicação com a API Python
- Configurações de contexto para diferentes tipos de usuário
- Tratamento de erros de conexão

### 4. Status Monitor (`components/AssistantStatus.js`)
- Monitora conexão com a API do assistente
- Atualização automática do status

## Como Usar

### 1. Iniciar a API Python
Certifique-se de que a API Python está rodando em `http://localhost:8000`:

```bash
# No diretório da API Python
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Verificar Status
Acesse `http://localhost:3000/api/chat` para verificar se a conexão está funcionando.

### 3. Usar o Chat
- Clique no ícone de chat (💬) no canto inferior esquerdo
- Digite sua pergunta sobre produtos GoodWe
- Aguarde a resposta do assistente

## Configurações

### Contextos de Usuário
```javascript
// Em lib/assistantApi.js
export const USER_CONTEXTS = {
  installer: { user_type: 'installer', product: 'inverter' },
  technician: { user_type: 'technician', product: 'inverter' },
  customer: { user_type: 'customer', product: 'inverter' }
};
```

### Provedores de IA
```javascript
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  PERPLEXITY: 'perplexity'
};
```

## API Endpoints

### POST /api/chat
Envia mensagem para o assistente.

**Request:**
```json
{
  "message": "Como instalar um inversor GoodWe?",
  "conversation_id": "uuid-opcional",
  "ai_provider": "perplexity",
  "context": {}
}
```

**Response:**
```json
{
  "message": "Para instalar um inversor GoodWe...",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "ai_provider": "openai",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "tokens_used": 150,
  "response_time": 2.5
}
```

### GET /api/chat
Verifica status da API do assistente.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "2.0.0",
  "ai_providers": {
    "openai": true,
    "anthropic": false
  }
}
```

## Tratamento de Erros

### Erros Comuns

1. **Assistente Offline (503)**
   - Mensagem: "Assistente offline"
   - Solução: Verificar se a API Python está rodando

2. **Erro de Conexão**
   - Mensagem: "Cannot connect to assistant service"
   - Solução: Verificar URL da API e conectividade

3. **Mensagem Vazia (400)**
   - Mensagem: "message is required"
   - Solução: Enviar mensagem não vazia

## Personalização

### Modificar Aparência
Edite `components/ChatWidget.module.css` para personalizar:
- Cores do chat
- Posição do botão flutuante
- Tamanho do painel
- Animações

### Adicionar Funcionalidades
- Histórico de conversas
- Anexos de arquivos
- Comandos especiais
- Integração com outros sistemas

## Monitoramento

O componente `AssistantStatus` pode ser adicionado ao dashboard para monitorar a conexão:

```jsx
import AssistantStatus from '../components/AssistantStatus';

// No seu componente
<AssistantStatus />
```

## Troubleshooting

### Chat não responde
1. Verificar se a API Python está rodando
2. Verificar logs do console do navegador
3. Testar endpoint `/api/chat` diretamente

### Mensagens não aparecem
1. Verificar estado do React no DevTools
2. Verificar se há erros de JavaScript
3. Limpar cache do navegador

### Erro de CORS
Se houver problemas de CORS, configurar headers na API Python:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```
