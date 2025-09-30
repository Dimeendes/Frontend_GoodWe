import { NextResponse } from 'next/server';
import { sendMessageToAssistant, checkAssistantHealth } from '../../../lib/assistantApi';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received chat request:', body);
    
    if (!body || !body.message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Validar e sanitizar dados
    const messageStr = String(body.message).trim();
    if (!messageStr) {
      return NextResponse.json({ error: 'message cannot be empty' }, { status: 400 });
    }

    // Usar a função utilitária para enviar mensagem
    const assistantResponse = await sendMessageToAssistant(
      messageStr,
      body.conversation_id || null,
      {
        aiProvider: body.ai_provider || 'perplexity',
        context: body.context || {}
      }
    );
    
    return NextResponse.json({
      message: assistantResponse.message,
      conversation_id: assistantResponse.conversation_id,
      ai_provider: assistantResponse.ai_provider,
      timestamp: assistantResponse.timestamp,
      tokens_used: assistantResponse.tokens_used,
      response_time: assistantResponse.response_time
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Verificar se é erro de conexão
    if (error.message.includes('Cannot connect to assistant service')) {
      return NextResponse.json(
        { 
          error: 'Assistant service unavailable',
          details: error.message
        }, 
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from assistant',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Endpoint para verificar status da API do assistente
export async function GET() {
  try {
    const healthData = await checkAssistantHealth();
    return NextResponse.json(healthData);
    
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Assistant service unavailable',
        details: error.message
      }, 
      { status: 503 }
    );
  }
}
