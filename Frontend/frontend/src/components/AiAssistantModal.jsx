import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { Sparkles, Send, X, Bot, User, Trash2 } from 'lucide-react';

const AiAssistantModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '👋 Hi there! I am your Gemini AI Task Assistant. Ask me anything about prioritizing your work, estimating deadlines, or breaking down projects into actionable steps!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (messageToSend) => {
    const text = messageToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.chat(text.trim());
      setMessages((prev) => [...prev, { role: 'assistant', text: response.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '⚠️ Sorry, I could not process that request right now. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        text: '👋 Chat cleared. How can I help you organize your tasks today?'
      }
    ]);
  };

  const suggestions = [
    'What should I prioritize today?',
    'Give me a 5-step checklist for releasing a feature',
    'How do I avoid procrastination on hard tasks?'
  ];

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <div className="ai-icon-bubble">
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <h3>Gemini Task Assistant</h3>
              <span className="ai-model-tag">gemini-3.8-flash</span>
            </div>
          </div>
          <div className="ai-modal-header-actions">
            <button onClick={handleClear} className="btn-ai-icon" title="Clear chat">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="btn-ai-icon" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="ai-chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`ai-message-row ${msg.role}`}>
              <div className="ai-message-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="ai-message-bubble">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-message-row assistant">
              <div className="ai-message-avatar">
                <Bot size={16} />
              </div>
              <div className="ai-message-bubble ai-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 2 && (
          <div className="ai-suggestions">
            {suggestions.map((sug, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(sug)} 
                className="ai-suggestion-chip"
                disabled={loading}
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          className="ai-chat-input-bar"
        >
          <input
            type="text"
            placeholder="Ask Gemini about your tasks..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={!input.trim() || loading} className="btn-ai-send">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantModal;
