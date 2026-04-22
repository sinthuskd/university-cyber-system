import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riskAPI } from '../../services/api';
import { MessageCircle, Trash2, Clock, RefreshCw, Bot } from 'lucide-react';
import { toast } from 'react-toastify';

const ChatHistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  const fetchLogs = () => {
    setLoading(true);
    riskAPI.getChatHistory()
      .then(res => setLogs(res.data))
      .catch(() => toast.error('Failed to load chat history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this chat log?')) return;
    try {
      await riskAPI.deleteChatLog(id);
      setLogs(prev => prev.filter(l => l.id !== id));
      toast.success('Chat log deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL chat history? This cannot be undone.')) return;
    try {
      await riskAPI.deleteAllChatLogs();
      setLogs([]);
      toast.success('All chat logs deleted');
    } catch {
      toast.error('Failed to delete all logs');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Chat History</h1>
          <p className="text-sm text-slate-400">Your previous AI chatbot conversations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          {logs.length > 0 && (
            <button onClick={handleDeleteAll} className="btn-secondary text-red-400 border-red-900 text-sm">
              Clear All
            </button>
          )}
          <button onClick={() => navigate('/risk/chatbot')} className="btn-primary text-sm">
            New Chat
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="card text-center py-16">
          <MessageCircle size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No chat history yet.</p>
          <button onClick={() => navigate('/risk/chatbot')} className="btn-primary text-sm">
            Start a Chat
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={log.id || i} className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-indigo-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {log.messages?.[1]?.content || log.firstMessage || 'Chat session'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-slate-500" />
                    <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{log.messages?.length || 0} messages</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 border border-slate-700 rounded"
                  >
                    {expanded === i ? 'Hide' : 'View'}
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {expanded === i && log.messages && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 max-h-64 overflow-y-auto">
                  {log.messages.map((msg, j) => (
                    <div key={j} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                        msg.role === 'assistant' ? 'bg-slate-700 text-indigo-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {msg.role === 'assistant' ? 'AI' : 'U'}
                      </div>
                      <div className={`text-xs px-3 py-2 rounded-xl max-w-xs lg:max-w-sm leading-relaxed ${
                        msg.role === 'assistant' ? 'bg-slate-800 text-slate-300 rounded-tl-sm' : 'bg-blue-900/50 text-slate-200 rounded-tr-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistoryPage;
