// Utilitário para interagir com a API do Assistente Virtual GoodWe

const ASSISTANT_API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Verifica se a API do assistente está disponível
 * @returns {Promise<Object>} Status da API
 */
export async function checkAssistantHealth() {
  try {
    const response = await fetch(`${ASSISTANT_API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Assistant API unavailable: ${error.message}`);
  }
}

/**
 * Envia mensagem para o assistente
 * @param {string} message - Mensagem do usuário
 * @param {string} conversationId - ID da conversa (opcional)
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} Resposta do assistente
 */
export async function sendMessageToAssistant(message, conversationId = null, options = {}) {
  // Garantir que message é uma string
  const messageStr = String(message || '').trim();
  if (!messageStr) {
    throw new Error('Message cannot be empty');
  }

  // Construir payload com validação
  const payload = {
    message: messageStr,
    ai_provider: options.aiProvider || 'perplexity',
    context: options.context || {}
  };

  // Adicionar conversation_id apenas se fornecido
  if (conversationId && typeof conversationId === 'string') {
    payload.conversation_id = conversationId;
  }

  console.log('Sending payload to assistant:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${ASSISTANT_API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('Assistant API response status:', response.status);
    console.log('Assistant API response body:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { detail: responseText || 'Unknown error' };
      }
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Assistant API error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to assistant service. Make sure it\'s running on http://localhost:8000');
    }
    throw error;
  }
}

/**
 * Configurações padrão para diferentes tipos de usuário
 */
export const USER_CONTEXTS = {
  installer: {
    user_type: 'installer',
    product: 'inverter'
  },
  technician: {
    user_type: 'technician', 
    product: 'inverter'
  },
  customer: {
    user_type: 'customer',
    product: 'inverter'
  }
};

/**
 * Provedores de IA disponíveis
 */
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  PERPLEXITY: 'perplexity'
};
