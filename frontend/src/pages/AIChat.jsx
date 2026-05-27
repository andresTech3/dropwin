import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, User, Trash2, 
  RefreshCw, MessageCircle, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiApi } from '../services/api';
import toast from 'react-hot-toast';
import './AIChat.css';

const SUGGESTED_PROMPTS = [
  "¿Qué gadgets están trending en TikTok ahora mismo?",
  "¿Cómo calculo el precio ideal para maximizar ventas?",
  "Dame estrategias para vender en Mercado Libre",
  "¿Cuáles son los mejores proveedores en AliExpress?",
  "¿Cómo puedo reducir el tiempo de envío al mínimo?",
  "Dame 5 nichos con poca competencia y alta demanda",
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      className={`message-wrapper ${isUser ? 'message-user' : 'message-ai'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`message-avatar ${isUser ? 'avatar-user' : 'avatar-ai'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-ai'}`}>
        <p className="message-text">{message.content}</p>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: '¡Hola! Soy DropWin AI 🤖, tu asistente experto en dropshipping. Puedo ayudarte a encontrar productos rentables, optimizar precios, crear estrategias de venta, y mucho más. ¿Por dónde empezamos?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(1).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiApi.chat(history, trimmed);
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Error al conectar con IA');
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: '¡Chat reiniciado! ¿En qué te puedo ayudar con tu negocio de dropshipping?',
      timestamp: new Date().toISOString(),
    }]);
  };

  return (
    <div className="page-content animate-in">
      {/* Header */}
      <div className="chat-page-header mb-6">
        <div className="flex items-center gap-3">
          <div className="chat-header-icon">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-title">DropWin AI Asistente</h1>
            <p className="text-subtle text-sm">Powered by Google Gemini • Especialista en dropshipping</p>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearChat}>
          <Trash2 size={14} /> Limpiar chat
        </button>
      </div>

      <div className="chat-layout">
        {/* Chat area */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {loading && (
              <motion.div
                className="message-wrapper message-ai"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="message-avatar avatar-ai">
                  <Bot size={14} />
                </div>
                <div className="message-bubble bubble-ai">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Pregunta sobre productos, estrategias, precios..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              id="chat-input"
            />
            <button
              className={`btn btn-primary chat-send-btn`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              id="send-message"
            >
              {loading ? <div className="spinner" style={{width:14,height:14}} /> : <Send size={14} />}
            </button>
          </div>
        </div>

        {/* Sidebar suggestions */}
        <div className="chat-sidebar">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-sm font-bold">Preguntas sugeridas</h3>
            </div>
            <div className="suggestions-list">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  <MessageCircle size={12} />
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="card mt-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
              <h3 className="text-sm font-bold">Capacidades</h3>
            </div>
            <div className="capabilities-list">
              {[
                '🔍 Búsqueda de nichos',
                '💰 Análisis de márgenes',
                '📱 Estrategias TikTok',
                '🛍️ Optimización Shopify',
                '📦 Selección de proveedores',
                '✍️ Copywriting de productos',
              ].map((cap, i) => (
                <div key={i} className="capability-item">{cap}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
