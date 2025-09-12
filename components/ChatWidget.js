"use client";
import { useEffect, useRef, useState } from 'react';
import styles from './ChatWidget.module.css';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // INSERT YOUR ASSISTANT API CALL HERE
    // Example placeholder:
    // yourAssistantSend(input).then(reply => setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }]))
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
              <div key={m.id} className={m.role === 'user' ? styles.user : styles.bot}>{m.content}</div>
            ))}
          </div>
          <form onSubmit={sendMessage} className={styles.inputRow}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Digite sua mensagem..." />
            <button type="submit">Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}


