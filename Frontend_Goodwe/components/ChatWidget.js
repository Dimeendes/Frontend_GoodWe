"use client";
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ChatWidget.module.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages]);

  // Inicializar chat com mensagem de boas-vindas
  useEffect(() => {
    if (open && !initialized) {
      const welcomeMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Olá! 👋 Sou o **Assistente Virtual GoodWe**.

Posso ajudar você com:

- **Instalação** de inversores
- **Configuração** de sistemas solares  
- **Troubleshooting** e resolução de problemas
- **Manutenção** preventiva

*Digite sua pergunta e eu responderei com informações detalhadas!*`
      };
      setMessages([welcomeMessage]);
      setInitialized(true);
    }
  }, [open, initialized]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const payload = {
        message: userMessage,
        ai_provider: 'perplexity',
        context: {}
      };

      // Adicionar conversation_id apenas se existir
      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      console.log('Sending chat payload:', payload);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erro na comunicação com o assistente');
      }

      // Atualizar conversation_id se recebido
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Adicionar resposta do assistente
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Adicionar mensagem de erro
      const errorMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Desculpe, ocorreu um erro: ${error.message}. Verifique se o serviço do assistente está rodando.`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <button aria-label="Abrir chat" className={styles.fab} onClick={() => setOpen(o => !o)}>
        {open ? '×' : '💬'}
      </button>
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>Assistente</div>
          <div ref={scrollRef} className={styles.messages}>
            {messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? styles.user : styles.bot}>
                {m.role === 'user' ? (
                  m.content
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Customizar componentes se necessário
                      code: ({node, inline, className, children, ...props}) => (
                        inline ? 
                        <code className={styles.inlineCode} {...props}>{children}</code> :
                        <pre className={styles.codeBlock}>
                          <code className={className} {...props}>{children}</code>
                        </pre>
                      ),
                      p: ({children}) => <p className={styles.paragraph}>{children}</p>,
                      ul: ({children}) => <ul className={styles.list}>{children}</ul>,
                      ol: ({children}) => <ol className={styles.orderedList}>{children}</ol>,
                      li: ({children}) => <li className={styles.listItem}>{children}</li>,
                      h1: ({children}) => <h1 className={styles.heading1}>{children}</h1>,
                      h2: ({children}) => <h2 className={styles.heading2}>{children}</h2>,
                      h3: ({children}) => <h3 className={styles.heading3}>{children}</h3>,
                      blockquote: ({children}) => <blockquote className={styles.blockquote}>{children}</blockquote>,
                      strong: ({children}) => <strong className={styles.bold}>{children}</strong>,
                      em: ({children}) => <em className={styles.italic}>{children}</em>,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                )}
              </div>
            ))}
            {loading && (
              <div className={styles.bot}>
                <div className={styles.typing}>Assistente está digitando...</div>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} className={styles.inputRow}>
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Digite sua mensagem..." 
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


