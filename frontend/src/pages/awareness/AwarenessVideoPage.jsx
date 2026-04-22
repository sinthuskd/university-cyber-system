import React, { useState, useEffect } from 'react';
import { Video, Play, Plus, Trash2, Search, ExternalLink, X, Save, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { trainingVideoAPI } from '../../services/api';

const CATEGORIES = ['All', 'Phishing', 'Password Security', 'Data Privacy', 'Malware', 'General'];

const valueToLabel = (val) => {
  const map = { PHISHING: 'Phishing', PASSWORD_SECURITY: 'Password Security', DATA_PRIVACY: 'Data Privacy', MALWARE: 'Malware', GENERAL: 'General' };
  return map[val] || val || 'General';
};

const VideoCard = ({ video, isAdmin, onDelete, onEdit }) => {
  const thumbUrl = video.youtubeVideoId
    ? `https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`
    : null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{
        width: '100%', height: 130, borderRadius: 8, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(99,149,255,0.1)',
      }}>
        {thumbUrl
          ? <img src={thumbUrl} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={20} style={{ color: '#60a5fa', marginLeft: 2 }} />
            </div>
        }
        {thumbUrl && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={18} style={{ color: '#fff', marginLeft: 2 }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '0.125rem 0.5rem', borderRadius: 99 }}>
              {valueToLabel(video.category)}
            </span>
            {video.duration && <span style={{ fontSize: '0.7rem', color: '#4d6080' }}>{video.duration}</span>}
          </div>
          <h3 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{video.title}</h3>
          {video.description && <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>{video.description}</p>}
          {video.addedBy && <p style={{ fontSize: '0.7rem', color: '#4d6080', marginTop: '0.25rem' }}>Added by {video.addedBy}</p>}
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            <button onClick={() => onEdit(video)} title="Edit" style={{ padding: 5, borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer' }}>
              <Edit2 size={12} />
            </button>
            <button onClick={() => onDelete(video.id)} title="Delete" style={{ padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      <a
        href={video.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          // Track view on click
          import('../../services/api').then(({ awarenessAPI }) => {
            awarenessAPI.trackVideoView(video.id).catch(() => {});
          });
        }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          padding: '0.5rem', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500,
          background: 'rgba(59,130,246,0.12)', color: '#60a5fa', textDecoration: 'none',
          border: '1px solid rgba(59,130,246,0.2)', transition: 'all 200ms',
        }}
      >
        <ExternalLink size={13} /> Watch on YouTube
      </a>
    </div>
  );
};

const EMPTY_FORM = { title: '', youtubeUrl: '', category: 'GENERAL', duration: '', description: '' };

const AwarenessVideoPage = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchVideos = () => {
    setLoading(true);
    trainingVideoAPI.getAll()
      .then(r => setVideos(r.data))
      .catch(() => toast.error('Failed to load videos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVideos(); }, []);

  const filtered = videos.filter(v => {
    const catMatch = category === 'All' || valueToLabel(v.category) === category;
    const searchMatch = !search || v.title?.toLowerCase().includes(search.toLowerCase()) || v.description?.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const openNew = () => { setEditingVideo(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (v) => {
    setEditingVideo(v);
    setForm({ title: v.title || '', youtubeUrl: v.youtubeUrl || '', category: v.category || 'GENERAL', duration: v.duration || '', description: v.description || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.youtubeUrl) { toast.error('Title and YouTube URL are required'); return; }
    setSaving(true);
    try {
      if (editingVideo) {
        await trainingVideoAPI.update(editingVideo.id, form);
        toast.success('Video updated!');
      } else {
        await trainingVideoAPI.create(form);
        toast.success('Video added!');
      }
      setShowForm(false);
      fetchVideos();
    } catch { toast.error('Failed to save video'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try { await trainingVideoAPI.delete(id); toast.success('Video removed'); setVideos(prev => prev.filter(v => v.id !== id)); }
    catch { toast.error('Failed to delete video'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Video Resources</h1>
          <p className="text-sm text-slate-400 mt-1">Cybersecurity awareness training videos</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> Add Video
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
          <h2 style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem', fontSize: '0.9375rem' }}>
            {editingVideo ? 'Edit Video' : 'Add Video Resource'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Video title *" className="form-input" />
            <input value={form.youtubeUrl} onChange={e => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="YouTube URL * (e.g. https://www.youtube.com/watch?v=xxx)" className="form-input" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-input">
                <option value="GENERAL">General</option>
                <option value="PHISHING">Phishing</option>
                <option value="PASSWORD_SECURITY">Password Security</option>
                <option value="DATA_PRIVACY">Data Privacy</option>
                <option value="MALWARE">Malware</option>
              </select>
              <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="Duration (e.g. 8 min)" className="form-input" />
            </div>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description..." rows={2} className="form-input resize-none" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : editingVideo ? 'Update' : 'Add Video'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex items-center gap-2">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 360 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4d6080' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..."
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
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#4d6080', padding: '3rem', fontSize: '0.875rem' }}>Loading videos...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Video size={36} style={{ margin: '0 auto 0.75rem', color: '#2a3a50' }} />
          <p style={{ color: '#4d6080', fontSize: '0.875rem' }}>
            {videos.length === 0 ? 'No videos yet. Admin can add videos.' : 'No videos match your search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map(v => <VideoCard key={v.id} video={v} isAdmin={user?.role === 'ADMIN'} onDelete={handleDelete} onEdit={openEdit} />)}
        </div>
      )}
    </div>
  );
};

export default AwarenessVideoPage;
