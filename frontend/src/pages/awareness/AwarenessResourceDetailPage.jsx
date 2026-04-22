import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Tag, Edit2, Trash2, Save, X, Upload, Image, Paperclip } from 'lucide-react';
import { toast } from 'react-toastify';
import { awarenessAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'http://localhost:8080';

const AwarenessResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: '' });

  // Image upload in detail view
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadArticle = () => {
    setLoading(true);
    awarenessAPI.getArticleById(id)
      .then(res => {
        setArticle(res.data);
        setForm({ title: res.data.title, content: res.data.content, category: res.data.category || '' });
        setLoading(false);
        // Track view
        awarenessAPI.trackArticleView(id).catch(() => {});
      })
      .catch(() => {
        toast.error('Article not found');
        navigate('/awareness/articles');
      });
  };

  useEffect(() => { loadArticle(); }, [id]);

  const handleUpdate = async () => {
    try {
      const res = await awarenessAPI.updateArticle(id, form);
      let updated = res.data;

      if (imageFile) {
        setUploadingImage(true);
        try {
          const fd = new FormData();
          fd.append('image', imageFile);
          await awarenessAPI.uploadArticleImage(id, fd);
          toast.success('Image uploaded!');
        } catch { toast.error('Text saved, but image upload failed'); }
        finally { setUploadingImage(false); }
        // Reload to get updated imageUrl
        loadArticle();
      } else {
        setArticle(updated);
      }
      setEditing(false);
      setImageFile(null);
      setImagePreview(null);
      toast.success('Article updated!');
    } catch { toast.error('Failed to update article'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    try {
      await awarenessAPI.deleteArticle(id);
      toast.success('Article deleted');
      navigate('/awareness/articles');
    } catch { toast.error('Failed to delete article'); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const categoryColor = {
    PHISHING:          'rgba(239,68,68,0.1)',
    PASSWORD_SECURITY: 'rgba(245,158,11,0.1)',
    DATA_PRIVACY:      'rgba(139,92,246,0.1)',
    MALWARE:           'rgba(239,68,68,0.12)',
    GENERAL:           'rgba(59,130,246,0.1)',
  };
  const categoryText = {
    PHISHING:          '#f87171',
    PASSWORD_SECURITY: '#fbbf24',
    DATA_PRIVACY:      '#c084fc',
    MALWARE:           '#fb923c',
    GENERAL:           '#60a5fa',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(99,149,255,0.15)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!article) return null;

  const cat = article.category || 'GENERAL';
  const catBg = categoryColor[cat] || categoryColor.GENERAL;
  const catText = categoryText[cat] || categoryText.GENERAL;

  return (
    <div className="space-y-6" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: '#4d6080', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
        <ArrowLeft size={14} /> Back
      </button>

      {/* Cover Image */}
      {article.imageUrl && !editing && (
        <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(99,149,255,0.12)', maxHeight: 320 }}>
          <img src={`${BASE_URL}${article.imageUrl}`} alt={article.title} style={{ width: '100%', height: 280, objectFit: 'cover' }} />
        </div>
      )}

      {/* Article card */}
      <div className="card">
        {!editing ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 12, background: catBg, color: catText, fontWeight: 500 }}>
                    <Tag size={10} style={{ display: 'inline', marginRight: 4 }} />{cat.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#4d6080', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} /> {article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                  {article.authorName && (
                    <span style={{ fontSize: '0.72rem', color: '#4d6080' }}>by {article.authorName}</span>
                  )}
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.35, marginBottom: '1rem' }}>{article.title}</h1>
              </div>
              {user?.role === 'ADMIN' && (
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, marginLeft: '1rem' }}>
                  <button onClick={() => setEditing(true)} style={{ padding: '0.375rem 0.75rem', borderRadius: 7, fontSize: '0.78rem', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={handleDelete} style={{ padding: '0.375rem 0.75rem', borderRadius: 7, fontSize: '0.78rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>

            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {article.content}
            </div>

            {/* Attachments */}
            {article.attachments?.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(99,149,255,0.08)', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Paperclip size={13} /> Attachments
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {article.attachments.map((url, i) => (
                    <a key={i} href={`${BASE_URL}${url}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: '0.8rem', color: '#a78bfa', background: 'rgba(139,92,246,0.08)', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Paperclip size={11} /> Attachment {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Edit mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Edit Article</h2>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Article title *" className="form-input" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-input">
              <option value="">Select category</option>
              <option value="PHISHING">Phishing</option>
              <option value="PASSWORD_SECURITY">Password Security</option>
              <option value="DATA_PRIVACY">Data Privacy</option>
              <option value="MALWARE">Malware</option>
              <option value="GENERAL">General</option>
            </select>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Article content *" rows={8} className="form-input resize-none" />

            {/* Image upload in edit mode */}
            <div style={{ border: '1px solid rgba(99,149,255,0.15)', borderRadius: 10, padding: '0.875rem', background: 'rgba(99,149,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <Image size={14} style={{ color: '#60a5fa' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>
                  {article.imageUrl ? 'Replace Cover Image' : 'Add Cover Image'}
                </span>
              </div>
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="New" style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(99,149,255,0.2)' }} />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1.5px dashed rgba(99,149,255,0.2)', cursor: 'pointer', color: '#4d6080', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', width: 'fit-content' }}>
                  <Upload size={13} />
                  {article.imageUrl ? 'Upload new image to replace' : 'Upload cover image'}
                  <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {uploadingImage && (
              <div style={{ fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 14, height: 14, border: '2px solid rgba(251,191,36,0.3)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Uploading image...
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button onClick={handleUpdate} disabled={uploadingImage} className="btn-primary flex items-center gap-2"><Save size={14} /> Save Changes</button>
              <button onClick={() => { setEditing(false); setImageFile(null); setImagePreview(null); }} className="btn-secondary flex items-center gap-2"><X size={14} /> Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AwarenessResourceDetailPage;
