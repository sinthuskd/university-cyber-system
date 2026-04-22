import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, History, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { riskAPI } from '../../services/api';
import { toast } from 'react-toastify';

// ─── Google Gemini AI Integration ────────────────────────────────────────────
const GEMINI_API_KEY = 'YOUR_GOOGLE_GEMINI_API_KEY'; // Replace with your actual API key
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a Cybersecurity AI Assistant for a university cybersecurity management system.
You help students, staff, and faculty with:
- Cybersecurity threats: phishing, malware, ransomware, social engineering
- Best practices: passwords, 2FA, software updates, safe browsing
- Academic integrity and digital ethics
- Incident reporting guidance
- University-specific security policies

Always give concise, practical, student-friendly advice. Use simple language.
Format responses clearly. If asked about something unrelated to cybersecurity or academia, 
politely redirect to your area of expertise.`;

async function askGemini(userMessage, chatHistory) {
  const contents = chatHistory
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    })
  });

  if (!res.ok) throw new Error('Gemini API error');
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}
// ─────────────────────────────────────────────────────────────────────────────

const suggestedQuestions = [
  'What is phishing and how do I avoid it?',
  'How do I create a strong password?',
  'What should I do if my account is hacked?',
  'How to detect malware on my computer?',
  'What are academic integrity rules?',
  'How do I enable two-factor authentication?',
];

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your Cybersecurity AI Assistant powered by Google Gemini. I can help you with:\n• Phishing & email scams\n• Password security\n• Malware & ransomware\n• Network & Wi-Fi safety\n• Two-factor authentication\n• Academic integrity\n• How to report incidents\n\nWhat would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useGemini, setUseGemini] = useState(true);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMsg = { role: 'user', content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      let reply;
      if (useGemini && GEMINI_API_KEY !== 'YOUR_GOOGLE_GEMINI_API_KEY') {
        reply = await askGemini(messageText, messages);
      } else {
        // Fallback to backend rule-based chatbot
        const res = await riskAPI.chat(messageText, messages);
        reply = res.data.reply;
      }
      const assistantMsg = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMsg]);

      // Save chat log
      try {
        await riskAPI.saveChatLog({
          messages: [...updatedMessages, assistantMsg],
          firstMessage: messageText,
        });
      } catch { /* non-critical */ }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ I encountered an error. Please check your connection and try again. If the issue persists, the AI service may be temporarily unavailable.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared. How can I help you with cybersecurity today?"
    }]);
  };

  return (
    <div className="max-w-2xl flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">AI Cybersecurity Chatbot</h1>
          <p className="text-sm text-slate-400">
            Powered by Google Gemini •{' '}
            <span className={useGemini && GEMINI_API_KEY !== 'YOUR_GOOGLE_GEMINI_API_KEY' ? 'text-green-400' : 'text-yellow-400'}>
              {useGemini && GEMINI_API_KEY !== 'YOUR_GOOGLE_GEMINI_API_KEY' ? 'AI Mode' : 'Basic Mode'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearChat} className="btn-secondary flex items-center gap-1.5 text-sm px-3">
            <Trash2 size={13} /> Clear
          </button>
          <button onClick={() => navigate('/risk/chat-history')} className="btn-secondary flex items-center gap-1.5 text-sm px-3">
            <History size={13} /> History
          </button>
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-slate-700' : 'bg-slate-800'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot size={16} className="text-indigo-300" />
                  : <User size={16} className="text-slate-300" />}
              </div>
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                  : 'bg-blue-600 text-white rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Bot size={16} className="text-indigo-300" />
              </div>
              <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested questions (only when no user messages yet) */}
          {messages.length === 1 && !loading && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full hover:bg-slate-700 hover:text-slate-100 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about cybersecurity..."
              rows={1}
              className="form-input flex-1 resize-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
