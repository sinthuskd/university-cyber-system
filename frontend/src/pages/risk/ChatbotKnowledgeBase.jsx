import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, BookOpen, Search } from 'lucide-react';
import { toast } from 'react-toastify';

const initialKnowledge = [
  {
    id: '1', keyword: 'phishing',
    response: '🎣 Phishing is a cyber attack where attackers trick you into revealing sensitive info via fake emails or websites. Tips: Check sender email carefully, don\'t click suspicious links, verify with the sender through a separate channel, and report suspicious emails to your IT department.',
    category: 'Threats'
  },
  {
    id: '2', keyword: 'password',
    response: '🔐 Strong password tips: Use at least 12 characters, mix uppercase/lowercase/numbers/symbols, never reuse passwords, use a password manager like Bitwarden or LastPass, and enable 2FA wherever possible.',
    category: 'Best Practices'
  },
  {
    id: '3', keyword: 'malware',
    response: '🦠 Malware protection tips: Keep antivirus updated, avoid downloading from unknown sources, don\'t open unexpected email attachments, keep your OS patched, and back up your data regularly.',
    category: 'Threats'
  },
  {
    id: '4', keyword: '2fa',
    response: '🔒 Two-Factor Authentication (2FA) adds an extra security layer beyond your password. Enable it on email, banking, and social accounts. Use authenticator apps like Google Authenticator rather than SMS for stronger security.',
    category: 'Best Practices'
  },
  {
    id: '5', keyword: 'ransomware',
    response: '💀 Ransomware encrypts your files and demands payment. Prevention: Keep regular backups offline, don\'t open suspicious attachments, keep software updated, and use endpoint protection. If infected, do NOT pay the ransom — report to authorities.',
    category: 'Threats'
  },
  {
    id: '6', keyword: 'vpn',
    response: '🛡️ A VPN (Virtual Private Network) encrypts your internet traffic and hides your IP address. It\'s especially useful on public Wi-Fi. Recommended for university use when accessing internal resources remotely.',
    category: 'Tools'
  },
];

const categories = ['All', 'Threats', 'Best Practices', 'Tools', 'Reporting', 'General'];

const ChatbotKnowledgeBase = () => {
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ keyword: '', response: '', category: 'General' });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const filtered = knowledge.filter(k =>
    (filterCat === 'All' || k.category === filterCat) &&
    (k.keyword.toLowerCase().includes(search.toLowerCase()) ||
     k.response.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    if (!newEntry.keyword.trim() || !newEntry.response.trim()) {
      toast.error('Fill in keyword and response');
      return;
    }
    setKnowledge(prev => [...prev, { ...newEntry, id: Date.now().toString() }]);
    setNewEntry({ keyword: '', response: '', category: 'General' });
    setShowAdd(false);
    toast.success('Knowledge entry added');
  };

  const handleSave = (id) => {
    setKnowledge(prev => prev.map(k => k.id === id ? editData : k));
    setEditId(null);
    toast.success('Entry updated');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this knowledge entry?')) return;
    setKnowledge(prev => prev.filter(k => k.id !== id));
    toast.success('Entry deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Chatbot Knowledge Base</h1>
          <p className="text-sm text-slate-400">Manage AI chatbot keyword responses ({knowledge.length} entries)</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Entry
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card border border-indigo-900/50">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">New Knowledge Entry</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Trigger Keyword</label>
                <input type="text" value={newEntry.keyword} onChange={e => setNewEntry({ ...newEntry, keyword: e.target.value })} className="form-input w-full" placeholder="e.g. phishing" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Category</label>
                <select value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })} className="form-input w-full">
                  {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Response</label>
              <textarea rows={3} value={newEntry.response} onChange={e => setNewEntry({ ...newEntry, response: e.target.value })} className="form-input w-full resize-none" placeholder="Response text..." />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary text-sm flex items-center gap-2"><Save size={13} /> Save</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm flex items-center gap-2"><X size={13} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8" />
        </div>
        <div className="flex gap-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCat === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge list */}
      <div className="space-y-3">
        {filtered.map(k => (
          <div key={k.id} className="card">
            {editId === k.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Keyword</label>
                    <input type="text" value={editData.keyword} onChange={e => setEditData({ ...editData, keyword: e.target.value })} className="form-input w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Category</label>
                    <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} className="form-input w-full">
                      {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Response</label>
                  <textarea rows={3} value={editData.response} onChange={e => setEditData({ ...editData, response: e.target.value })} className="form-input w-full resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSave(k.id)} className="btn-primary text-sm flex items-center gap-2"><Save size={13} /> Save</button>
                  <button onClick={() => setEditId(null)} className="btn-secondary text-sm flex items-center gap-2"><X size={13} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen size={15} className="text-indigo-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs bg-slate-800 text-indigo-300 px-2 py-0.5 rounded">{k.keyword}</code>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{k.category}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{k.response}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditId(k.id); setEditData({ ...k }); }} className="p-1.5 text-slate-500 hover:text-indigo-300 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(k.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-8 text-slate-500">No entries found.</div>
        )}
      </div>
    </div>
  );
};

export default ChatbotKnowledgeBase;
