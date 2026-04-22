import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Search, Eye, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import { awarenessAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'PHISHING', 'PASSWORD_SECURITY', 'DATA_PRIVACY', 'MALWARE', 'GENERAL'];
const BASE_URL = 'http://localhost:8080';

const categoryColor = {
  PHISHING:          { bg: 'rgba(239,68,68,0.1)',   text: '#f87171' },
  PASSWORD_SECURITY: { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24' },
  DATA_PRIVACY:      { bg: 'rgba(139,92,246,0.1)',  text: '#c084fc' },
  MALWARE:           { bg: 'rgba(239,68,68,0.12)',  text: '#fb923c' },
  GENERAL:           { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa' },
};

const AwarenessArticlesPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchArticles = () => {
    setLoading(true);
    awarenessAPI.getArticles()
      .then(res => setArticles(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await awarenessAPI.deleteArticle(id);
      toast.success('Article deleted');
      fetchArticles();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = articles.filter(a =>
    (category === 'All' || a.category === category) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.content || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Awareness Articles</h1>
          <p className="text-sm text-slate-400">Cybersecurity learning resources</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/awareness/admin" style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 0.875rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500,
            background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.25)', textDecoration: 'none',
          }}>
            <Plus size={14} /> Manage Articles
          </Link>
        )}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 360 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4d6080' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,149,255,0.12)', borderRadius: 8, padding: '0.5rem 0.75rem 0.5rem 2rem', color: '#cbd5e1', fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '0.375rem 0.75rem', borderRadius: 8, border: '1px solid', fontSize: '0.75rem',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 200ms',
              background: category === c ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
              borderColor: category === c ? 'rgba(59,130,246,0.4)' : 'rgba(99,149,255,0.1)',
              color: category === c ? '#60a5fa' : '#64748b',
            }}>{c.replace(/_/g, ' ')}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#4d6080', fontSize: '0.875rem' }}>Loading articles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="card col-span-2 text-center py-12">
              <BookOpen size={40} className="mx-auto mb-3" style={{ color: '#2a3a50' }} />
              <p style={{ color: '#4d6080', fontSize: '0.875rem' }}>No articles found.</p>
            </div>
          ) : filtered.map(a => {
            const clr = categoryColor[a.category] || categoryColor.GENERAL;
            return (
              <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
                {/* Cover image or placeholder */}
                {a.imageUrl ? (
                  <div style={{ width: '100%', height: 140, overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={`${BASE_URL}${a.imageUrl}`}
                      alt={a.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; e.target.parentNode.style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 100, background: 'rgba(59,130,246,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Image size={28} style={{ color: 'rgba(99,149,255,0.2)' }} />
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <div className="flex items-start justify-between">
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: clr.bg, color: clr.text, fontWeight: 500 }}>
                      {a.category?.replace(/_/g, ' ') || 'General'}
                    </span>
                    {user?.role === 'ADMIN' && (
                      <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4d6080', padding: 0, lineHeight: 1 }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <h3 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', margin: 0 }}>{a.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{a.content}</p>
                  {a.attachments?.length > 0 && (
                    <p style={{ fontSize: '0.7rem', color: '#a78bfa' }}>{a.attachments.length} attachment(s)</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <p style={{ fontSize: '0.72rem', color: '#4d6080' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</p>
                    <Link to={`/awareness/articles/${a.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                      color: '#60a5fa', textDecoration: 'none', padding: '0.25rem 0.625rem',
                      background: 'rgba(59,130,246,0.08)', borderRadius: 6, border: '1px solid rgba(59,130,246,0.15)',
                    }}>
                      <Eye size={11} /> Read More
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AwarenessArticlesPage;
