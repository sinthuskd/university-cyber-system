import React, { useEffect, useState, useRef } from 'react';
import {
  Plus, Trash2, Edit2, Search, BookOpen, HelpCircle, Save, X, Eye,
  Upload, Image, Download, FileText, Video, ExternalLink, Users,
  Clock, CheckCircle, XCircle, BarChart2, TrendingUp, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { awarenessAPI, trainingVideoAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const TABS = ['Articles', 'Quizzes', 'Videos', 'Quiz Results', 'Reach Analytics'];
const BASE_URL = 'http://localhost:8080';

const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171';
  const bg    = score >= 80 ? 'rgba(74,222,128,0.1)' : score >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';
  return <span style={{ background: bg, color, fontWeight: 700, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 99 }}>{score}%</span>;
};

const formatDuration = (secs) => {
  if (!secs) return '-';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const AdminAwarenessPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Articles');
  const [articles, setArticles] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Article form
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({ title: '', content: '', category: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const imageInputRef = useRef();
  const attachmentInputRef = useRef();

  // Quiz form
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', timeLimitMinutes: '', questions: [] });

  // Video
  const [videos, setVideos] = useState([]);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({ title: '', youtubeUrl: '', category: 'GENERAL', duration: '', description: '' });
  const [savingVideo, setSavingVideo] = useState(false);

  // Quiz results (all users)
  const [quizResults, setQuizResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultFilter, setResultFilter] = useState('');

  // Reach analytics
  const [reachSummary, setReachSummary] = useState(null);
  const [loadingReach, setLoadingReach] = useState(false);
  const [reachModal, setReachModal] = useState(null); // { type, id, title }
  const [reachDetail, setReachDetail] = useState(null);

  // Report
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      awarenessAPI.getArticles().then(r => setArticles(r.data)).catch(() => {}),
      awarenessAPI.getQuizzes().then(r => setQuizzes(r.data)).catch(() => {}),
      trainingVideoAPI.getAll().then(r => setVideos(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  const fetchQuizResults = () => {
    setLoadingResults(true);
    awarenessAPI.getAllQuizResults()
      .then(r => setQuizResults(r.data))
      .catch(() => {})
      .finally(() => setLoadingResults(false));
  };

  const fetchReachSummary = () => {
    setLoadingReach(true);
    awarenessAPI.getReachSummary()
      .then(r => setReachSummary(r.data))
      .catch(() => {})
      .finally(() => setLoadingReach(false));
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (tab === 'Quiz Results') fetchQuizResults();
    if (tab === 'Reach Analytics') fetchReachSummary();
  }, [tab]);

  // ── Image handling ──
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); if (imageInputRef.current) imageInputRef.current.value = ''; };
  const handleAttachmentSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { toast.error('Max 5 attachments'); return; }
    setAttachmentFiles(files);
  };

  // ── Articles ──
  const openNewArticle = () => {
    setEditingArticle(null);
    setArticleForm({ title: '', content: '', category: '' });
    setImageFile(null); setImagePreview(null); setAttachmentFiles([]);
    setShowArticleForm(true);
  };
  const openEditArticle = (a) => {
    setEditingArticle(a);
    setArticleForm({ title: a.title, content: a.content, category: a.category || '' });
    setImageFile(null); setImagePreview(a.imageUrl ? `${BASE_URL}${a.imageUrl}` : null); setAttachmentFiles([]);
    setShowArticleForm(true);
  };
  const handleSaveArticle = async () => {
    if (!articleForm.title || !articleForm.content) { toast.error('Title and content are required'); return; }
    try {
      let saved;
      if (editingArticle) {
        const res = await awarenessAPI.updateArticle(editingArticle.id, articleForm);
        saved = res.data; toast.success('Article updated!');
      } else {
        const res = await awarenessAPI.createArticle(articleForm);
        saved = res.data; toast.success('Article created!');
      }
      if (imageFile && saved?.id) {
        setUploadingImage(true);
        try { const fd = new FormData(); fd.append('image', imageFile); await awarenessAPI.uploadArticleImage(saved.id, fd); toast.success('Image uploaded!'); }
        catch { toast.error('Article saved, but image upload failed'); }
        finally { setUploadingImage(false); }
      }
      if (attachmentFiles.length > 0 && saved?.id) {
        setUploadingAttachments(true);
        try { const fd = new FormData(); attachmentFiles.forEach(f => fd.append('files', f)); await awarenessAPI.uploadArticleAttachments(saved.id, fd); toast.success(`${attachmentFiles.length} attachment(s) uploaded!`); }
        catch { toast.error('Article saved, but attachment upload failed'); }
        finally { setUploadingAttachments(false); }
      }
      setShowArticleForm(false); fetchAll();
    } catch { toast.error('Failed to save article'); }
  };
  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try { await awarenessAPI.deleteArticle(id); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  // ── Quizzes ──
  const openNewQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({ title: '', description: '', timeLimitMinutes: '', questions: [] });
    setShowQuizForm(true);
  };
  const openEditQuiz = (q) => {
    setEditingQuiz(q);
    setQuizForm({
      title: q.title || '',
      description: q.description || '',
      timeLimitMinutes: q.timeLimitMinutes != null ? String(q.timeLimitMinutes) : '',
      questions: q.questions ? q.questions.map(qn => ({ ...qn, options: [...qn.options] })) : [],
    });
    setShowQuizForm(true);
  };
  const addQuestion = () => setQuizForm(f => ({ ...f, questions: [...f.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }] }));
  const updateQuestion = (i, field, val) => setQuizForm(f => { const qs = [...f.questions]; qs[i] = { ...qs[i], [field]: val }; return { ...f, questions: qs }; });
  const updateOption = (qi, oi, val) => setQuizForm(f => { const qs = [...f.questions]; qs[qi].options[oi] = val; return { ...f, questions: qs }; });
  const removeQuestion = (i) => setQuizForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));

  const handleSaveQuiz = async () => {
    if (!quizForm.title || quizForm.questions.length === 0) { toast.error('Quiz title and at least 1 question are required'); return; }
    const payload = {
      ...quizForm,
      timeLimitMinutes: quizForm.timeLimitMinutes ? parseInt(quizForm.timeLimitMinutes) : null,
    };
    try {
      if (editingQuiz) {
        await awarenessAPI.updateQuiz(editingQuiz.id, payload);
        toast.success('Quiz updated!');
      } else {
        await awarenessAPI.createQuiz(payload);
        toast.success('Quiz created!');
      }
      setShowQuizForm(false); setEditingQuiz(null);
      setQuizForm({ title: '', description: '', timeLimitMinutes: '', questions: [] });
      fetchAll();
    } catch { toast.error('Failed to save quiz'); }
  };
  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try { await awarenessAPI.deleteQuiz(id); toast.success('Quiz deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  // ── Videos ──
  const openNewVideo = () => { setEditingVideo(null); setVideoForm({ title: '', youtubeUrl: '', category: 'GENERAL', duration: '', description: '' }); setShowVideoForm(true); };
  const openEditVideo = (v) => { setEditingVideo(v); setVideoForm({ title: v.title || '', youtubeUrl: v.youtubeUrl || '', category: v.category || 'GENERAL', duration: v.duration || '', description: v.description || '' }); setShowVideoForm(true); };
  const handleSaveVideo = async () => {
    if (!videoForm.title || !videoForm.youtubeUrl) { toast.error('Title and YouTube URL are required'); return; }
    setSavingVideo(true);
    try {
      if (editingVideo) { await trainingVideoAPI.update(editingVideo.id, videoForm); toast.success('Video updated!'); }
      else { await trainingVideoAPI.create(videoForm); toast.success('Video added!'); }
      setShowVideoForm(false); fetchAll();
    } catch { toast.error('Failed to save video'); }
    finally { setSavingVideo(false); }
  };
  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try { await trainingVideoAPI.delete(id); toast.success('Video deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  // ── Reach detail modal ──
  const openReachDetail = async (type, id, title) => {
    setReachModal({ type, id, title });
    setReachDetail(null);
    try {
      const res = type === 'ARTICLE'
        ? await awarenessAPI.getArticleReach(id)
        : await awarenessAPI.getVideoReach(id);
      setReachDetail(res.data);
    } catch { toast.error('Failed to load reach data'); }
  };

  // ── Report ──
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await awarenessAPI.generateReport();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/html' }));
      const a = document.createElement('a'); a.href = url;
      const cd = res.headers['content-disposition'] || '';
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match ? match[1] : 'awareness-report.html';
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch { toast.error('Failed to generate report'); }
    finally { setGeneratingReport(false); }
  };

  const valueToLabel = (val) => ({ PHISHING: 'Phishing', PASSWORD_SECURITY: 'Password Security', DATA_PRIVACY: 'Data Privacy', MALWARE: 'Malware', GENERAL: 'General' }[val] || val || 'General');
  const filteredArticles = articles.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()));
  const filteredQuizzes  = quizzes.filter(q => !search || q.title.toLowerCase().includes(search.toLowerCase()));
  const filteredVideos   = videos.filter(v => !search || v.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredResults  = quizResults.filter(r =>
    !resultFilter ||
    r.userName?.toLowerCase().includes(resultFilter.toLowerCase()) ||
    r.userEmail?.toLowerCase().includes(resultFilter.toLowerCase()) ||
    r.quizTitle?.toLowerCase().includes(resultFilter.toLowerCase())
  );

  const resultStats = {
    total: quizResults.length,
    passed: quizResults.filter(r => r.passed).length,
    avg: quizResults.length ? Math.round(quizResults.reduce((s, r) => s + r.score, 0) / quizResults.length) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Awareness Content Management</h1>
          <p className="text-sm text-slate-400 mt-1">Create, manage and monitor all awareness materials</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleGenerateReport} disabled={generatingReport} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 0.875rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(74,222,128,0.25)',
            background: 'rgba(74,222,128,0.08)', color: '#4ade80',
            cursor: generatingReport ? 'not-allowed' : 'pointer', opacity: generatingReport ? 0.6 : 1,
          }}>
            <Download size={14} /> {generatingReport ? 'Generating...' : 'Report'}
          </button>
          {(tab === 'Articles' || tab === 'Videos' || tab === 'Quizzes') && (
            <button
              onClick={() => tab === 'Articles' ? openNewArticle() : tab === 'Videos' ? openNewVideo() : openNewQuiz()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={15} /> New {tab === 'Articles' ? 'Article' : tab === 'Videos' ? 'Video' : 'Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', background: 'rgba(99,149,255,0.05)', padding: '0.25rem', borderRadius: 10, width: 'fit-content', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setSearch(''); }}
            style={{
              padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", border: 'none', cursor: 'pointer', transition: 'all 200ms',
              background: tab === t ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: tab === t ? '#60a5fa' : '#4d6080',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}
          >
            {t === 'Quiz Results' && <BarChart2 size={12} />}
            {t === 'Reach Analytics' && <TrendingUp size={12} />}
            {t}
          </button>
        ))}
      </div>

      {/* Search (for content tabs) */}
      {['Articles', 'Quizzes', 'Videos'].includes(tab) && (
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4d6080' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab.toLowerCase()}...`}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,149,255,0.12)', borderRadius: 8, padding: '0.5rem 0.75rem 0.5rem 2rem', color: '#cbd5e1', fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
        </div>
      )}

      {/* ── ARTICLE FORM ── */}
      {tab === 'Articles' && showArticleForm && (
        <div className="card" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
          <h2 style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem', fontSize: '0.9375rem' }}>{editingArticle ? 'Edit Article' : 'New Article'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} placeholder="Article title *" className="form-input" />
            <select value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })} className="form-input">
              <option value="">Select category</option>
              <option value="PHISHING">Phishing</option>
              <option value="PASSWORD_SECURITY">Password Security</option>
              <option value="DATA_PRIVACY">Data Privacy</option>
              <option value="MALWARE">Malware</option>
              <option value="GENERAL">General</option>
            </select>
            <textarea value={articleForm.content} onChange={e => setArticleForm({ ...articleForm, content: e.target.value })} placeholder="Article content *" rows={6} className="form-input resize-none" />
            {/* Image */}
            <div style={{ border: '1px solid rgba(99,149,255,0.15)', borderRadius: 10, padding: '0.875rem', background: 'rgba(99,149,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <Image size={14} style={{ color: '#60a5fa' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Cover Image</span>
                <span style={{ fontSize: '0.7rem', color: '#4d6080' }}>(Optional · max 5MB)</span>
              </div>
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(99,149,255,0.2)' }} />
                  <button onClick={handleRemoveImage} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={11} /></button>
                </div>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1.5px dashed rgba(99,149,255,0.2)', cursor: 'pointer', color: '#4d6080', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', width: 'fit-content' }}>
                  <Upload size={13} /> Click to upload cover image
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            {/* Attachments */}
            <div style={{ border: '1px solid rgba(99,149,255,0.15)', borderRadius: 10, padding: '0.875rem', background: 'rgba(99,149,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <FileText size={14} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Attachments</span>
                <span style={{ fontSize: '0.7rem', color: '#4d6080' }}>(Optional · up to 5 files)</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1.5px dashed rgba(139,92,246,0.2)', cursor: 'pointer', color: '#4d6080', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', width: 'fit-content' }}>
                <Upload size={13} /> {attachmentFiles.length > 0 ? `${attachmentFiles.length} file(s) selected` : 'Click to attach files'}
                <input ref={attachmentInputRef} type="file" multiple onChange={handleAttachmentSelect} style={{ display: 'none' }} />
              </label>
            </div>
            {(uploadingImage || uploadingAttachments) && (
              <div style={{ fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 14, height: 14, border: '2px solid rgba(251,191,36,0.3)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {uploadingImage ? 'Uploading image...' : 'Uploading attachments...'}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSaveArticle} disabled={uploadingImage || uploadingAttachments} className="btn-primary flex items-center gap-2"><Save size={14} /> {editingArticle ? 'Update' : 'Publish'}</button>
              <button onClick={() => setShowArticleForm(false)} className="btn-secondary flex items-center gap-2"><X size={14} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUIZ FORM ── */}
      {tab === 'Quizzes' && showQuizForm && (
        <div className="card" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
          <h2 style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem', fontSize: '0.9375rem' }}>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="Quiz title *" className="form-input" />
            <input value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })} placeholder="Short description (optional)" className="form-input" />

            {/* Time limit */}
            <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 10, padding: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <Clock size={14} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Time Limit</span>
                <span style={{ fontSize: '0.7rem', color: '#4d6080' }}>(optional — leave blank for no limit)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number" min="1" max="120"
                  value={quizForm.timeLimitMinutes}
                  onChange={e => setQuizForm({ ...quizForm, timeLimitMinutes: e.target.value })}
                  placeholder="e.g. 10"
                  className="form-input"
                  style={{ width: 100, marginBottom: 0 }}
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>minutes</span>
                {quizForm.timeLimitMinutes && (
                  <span style={{ fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    ⏱ {quizForm.timeLimitMinutes} min time limit will be shown to users
                  </span>
                )}
              </div>
            </div>

            {quizForm.questions.map((q, qi) => (
              <div key={qi} style={{ background: 'rgba(99,149,255,0.04)', border: '1px solid rgba(99,149,255,0.08)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#4d6080', fontWeight: 600 }}>Question {qi + 1}</span>
                  <button onClick={() => removeQuestion(qi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4d6080' }}><X size={13} /></button>
                </div>
                <input value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} placeholder="Question text *" className="form-input" style={{ marginBottom: '0.5rem' }} />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQuestion(qi, 'correctAnswer', oi)} style={{ accentColor: '#3b82f6' }} />
                    <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="form-input" style={{ flex: 1, marginBottom: 0 }} />
                  </div>
                ))}
                <p style={{ fontSize: '0.7rem', color: '#4d6080', marginTop: '0.375rem' }}>● Select the correct answer above</p>
              </div>
            ))}
            <button onClick={addQuestion} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', borderRadius: 8, fontSize: '0.8rem', background: 'rgba(99,149,255,0.06)', color: '#4d6080', border: '1px dashed rgba(99,149,255,0.15)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              <Plus size={13} /> Add Question
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSaveQuiz} className="btn-primary flex items-center gap-2"><Save size={14} /> {editingQuiz ? 'Update Quiz' : 'Create Quiz'}</button>
              <button onClick={() => { setShowQuizForm(false); setEditingQuiz(null); }} className="btn-secondary flex items-center gap-2"><X size={14} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ARTICLES LIST ── */}
      {tab === 'Articles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {loading ? <div style={{ textAlign: 'center', color: '#4d6080', padding: '2rem', fontSize: '0.875rem' }}>Loading...</div>
            : filteredArticles.length === 0 ? (
              <div className="card text-center py-10">
                <BookOpen size={32} style={{ margin: '0 auto 0.75rem', color: '#2a3a50' }} />
                <p style={{ color: '#4d6080', fontSize: '0.875rem' }}>No articles yet. Create one above.</p>
              </div>
            ) : filteredArticles.map(a => (
              <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {a.imageUrl ? (
                  <img src={`${BASE_URL}${a.imageUrl}`} alt={a.title} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid rgba(99,149,255,0.15)' }} />
                ) : (
                  <div style={{ width: 56, height: 40, borderRadius: 6, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={16} style={{ color: '#60a5fa' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {a.category && <span style={{ fontSize: '0.7rem', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '0 0.375rem', borderRadius: 4 }}>{a.category.replace(/_/g, ' ')}</span>}
                    <span style={{ fontSize: '0.7rem', color: '#4d6080' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <button onClick={() => openReachDetail('ARTICLE', a.id, a.title)} title="Reach" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', color: '#4ade80', cursor: 'pointer' }}><TrendingUp size={13} /></button>
                  <button onClick={() => navigate(`/awareness/articles/${a.id}`)} title="View" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(99,149,255,0.06)', border: '1px solid rgba(99,149,255,0.1)', color: '#4d6080', cursor: 'pointer' }}><Eye size={13} /></button>
                  <button onClick={() => openEditArticle(a)} title="Edit" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer' }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDeleteArticle(a.id)} title="Delete" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── QUIZZES LIST ── */}
      {tab === 'Quizzes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {loading ? <div style={{ textAlign: 'center', color: '#4d6080', padding: '2rem', fontSize: '0.875rem' }}>Loading...</div>
            : filteredQuizzes.length === 0 ? (
              <div className="card text-center py-10">
                <HelpCircle size={32} style={{ margin: '0 auto 0.75rem', color: '#2a3a50' }} />
                <p style={{ color: '#4d6080', fontSize: '0.875rem' }}>No quizzes yet. Create one above.</p>
              </div>
            ) : filteredQuizzes.map(q => (
              <div key={q.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HelpCircle size={16} style={{ color: '#c084fc' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.125rem' }}>{q.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#4d6080' }}>{q.questions?.length || 0} questions</span>
                    {q.timeLimitMinutes && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '1px 6px', borderRadius: 4 }}>
                        <Clock size={9} /> {q.timeLimitMinutes} min
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <button onClick={() => openEditQuiz(q)} title="Edit" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer' }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDeleteQuiz(q.id)} title="Delete" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── VIDEO FORM + LIST ── */}
      {tab === 'Videos' && showVideoForm && (
        <div className="card" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
          <h2 style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem', fontSize: '0.9375rem' }}>{editingVideo ? 'Edit Video' : 'Add YouTube Video'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="Video title *" className="form-input" />
            <input value={videoForm.youtubeUrl} onChange={e => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })} placeholder="YouTube URL *" className="form-input" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select value={videoForm.category} onChange={e => setVideoForm({ ...videoForm, category: e.target.value })} className="form-input">
                <option value="GENERAL">General</option>
                <option value="PHISHING">Phishing</option>
                <option value="PASSWORD_SECURITY">Password Security</option>
                <option value="DATA_PRIVACY">Data Privacy</option>
                <option value="MALWARE">Malware</option>
              </select>
              <input value={videoForm.duration} onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })} placeholder="Duration (e.g. 8 min)" className="form-input" />
            </div>
            <textarea value={videoForm.description} onChange={e => setVideoForm({ ...videoForm, description: e.target.value })} placeholder="Short description..." rows={2} className="form-input resize-none" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSaveVideo} disabled={savingVideo} className="btn-primary flex items-center gap-2">
                <Save size={14} /> {savingVideo ? 'Saving...' : editingVideo ? 'Update' : 'Add Video'}
              </button>
              <button onClick={() => setShowVideoForm(false)} className="btn-secondary flex items-center gap-2"><X size={14} /> Cancel</button>
            </div>
          </div>
        </div>
      )}
      {tab === 'Videos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {loading ? <div style={{ textAlign: 'center', color: '#4d6080', padding: '2rem', fontSize: '0.875rem' }}>Loading...</div>
            : filteredVideos.length === 0 ? (
              <div className="card text-center py-10">
                <Video size={32} style={{ margin: '0 auto 0.75rem', color: '#2a3a50' }} />
                <p style={{ color: '#4d6080', fontSize: '0.875rem' }}>No videos yet. Add a YouTube video above.</p>
              </div>
            ) : filteredVideos.map(v => {
              const thumb = v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/mqdefault.jpg` : null;
              return (
                <div key={v.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {thumb ? (
                    <img src={thumb} alt={v.title} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid rgba(99,149,255,0.15)' }} />
                  ) : (
                    <div style={{ width: 80, height: 50, borderRadius: 6, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Video size={18} style={{ color: '#c084fc' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#c084fc', background: 'rgba(139,92,246,0.1)', padding: '0 0.375rem', borderRadius: 4 }}>{valueToLabel(v.category)}</span>
                      {v.duration && <span style={{ fontSize: '0.7rem', color: '#4d6080' }}>{v.duration}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                    <button onClick={() => openReachDetail('VIDEO', v.id, v.title)} title="Reach" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', color: '#4ade80', cursor: 'pointer' }}><TrendingUp size={13} /></button>
                    <a href={v.youtubeUrl} target="_blank" rel="noreferrer" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(99,149,255,0.06)', border: '1px solid rgba(99,149,255,0.1)', color: '#4d6080', cursor: 'pointer', display: 'flex' }}><ExternalLink size={13} /></a>
                    <button onClick={() => openEditVideo(v)} title="Edit" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer' }}><Edit2 size={13} /></button>
                    <button onClick={() => handleDeleteVideo(v.id)} title="Delete" style={{ padding: '0.375rem', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ── QUIZ RESULTS (all users) ── */}
      {tab === 'Quiz Results' && (
        <div className="space-y-4">
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Total Attempts', value: resultStats.total, color: '#60a5fa' },
              { label: 'Passed', value: resultStats.passed, color: '#4ade80' },
              { label: 'Avg Score', value: `${resultStats.avg}%`, color: '#c084fc' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: '1.5rem', color: s.color }}>{s.value}</p>
                <p style={{ fontSize: '0.75rem', color: '#4d6080' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4d6080' }} />
            <input value={resultFilter} onChange={e => setResultFilter(e.target.value)} placeholder="Search by user or quiz..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,149,255,0.12)', borderRadius: 8, padding: '0.5rem 0.75rem 0.5rem 2rem', color: '#cbd5e1', fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingResults ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#4d6080' }}>Loading results...</div>
            ) : filteredResults.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#4d6080', fontSize: '0.875rem' }}>
                {quizResults.length === 0 ? 'No quiz results yet.' : 'No results match your search.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(99,149,255,0.04)' }}>
                      {['User', 'Email', 'Quiz', 'Score', 'Correct', 'Duration', 'Date', 'Status'].map(h => (
                        <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: '#4d6080', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid rgba(99,149,255,0.08)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < filteredResults.length - 1 ? '1px solid rgba(99,149,255,0.05)' : 'none' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#e2e8f0', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.userName || '-'}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#64748b' }}>{r.userEmail || '-'}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#cbd5e1', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.quizTitle}</td>
                        <td style={{ padding: '0.75rem 1rem' }}><ScoreBadge score={r.score} /></td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>{r.correct}/{r.total}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>{formatDuration(r.durationSeconds)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {r.passed
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4ade80', fontSize: '0.75rem' }}><CheckCircle size={11} /> Passed</span>
                            : <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f87171', fontSize: '0.75rem' }}><XCircle size={11} /> Failed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={fetchQuizResults} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 7, fontSize: '0.78rem', background: 'rgba(99,149,255,0.08)', color: '#60a5fa', border: '1px solid rgba(99,149,255,0.15)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>
      )}

      {/* ── REACH ANALYTICS ── */}
      {tab === 'Reach Analytics' && (
        <div className="space-y-4">
          {loadingReach ? (
            <div style={{ textAlign: 'center', color: '#4d6080', padding: '3rem' }}>Loading analytics...</div>
          ) : reachSummary ? (
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <BookOpen size={24} style={{ color: '#60a5fa', margin: '0 auto 0.5rem' }} />
                  <p style={{ fontWeight: 700, fontSize: '1.75rem', color: '#60a5fa' }}>{reachSummary.totalArticleViews}</p>
                  <p style={{ fontSize: '0.8rem', color: '#4d6080' }}>Total Article Views</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <Video size={24} style={{ color: '#c084fc', margin: '0 auto 0.5rem' }} />
                  <p style={{ fontWeight: 700, fontSize: '1.75rem', color: '#c084fc' }}>{reachSummary.totalVideoViews}</p>
                  <p style={{ fontSize: '0.8rem', color: '#4d6080' }}>Total Video Views</p>
                </div>
              </div>

              {/* Top articles by views */}
              {Object.keys(reachSummary.articleViewCounts).length > 0 && (
                <div className="card">
                  <h3 style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '0.875rem', fontSize: '0.9rem' }}>📄 Article Views Breakdown</h3>
                  {Object.entries(reachSummary.articleViewCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([title, count]) => {
                      const max = Math.max(...Object.values(reachSummary.articleViewCounts));
                      return (
                        <div key={title} style={{ marginBottom: '0.625rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{title}</span>
                            <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 600 }}>{count}</span>
                          </div>
                          <div style={{ background: 'rgba(99,149,255,0.08)', borderRadius: 4, height: 6 }}>
                            <div style={{ height: 6, borderRadius: 4, background: '#3b82f6', width: `${(count / max) * 100}%`, transition: 'width 500ms' }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Top videos */}
              {Object.keys(reachSummary.videoViewCounts).length > 0 && (
                <div className="card">
                  <h3 style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '0.875rem', fontSize: '0.9rem' }}>🎬 Video Views Breakdown</h3>
                  {Object.entries(reachSummary.videoViewCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([title, count]) => {
                      const max = Math.max(...Object.values(reachSummary.videoViewCounts));
                      return (
                        <div key={title} style={{ marginBottom: '0.625rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{title}</span>
                            <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>{count}</span>
                          </div>
                          <div style={{ background: 'rgba(139,92,246,0.08)', borderRadius: 4, height: 6 }}>
                            <div style={{ height: 6, borderRadius: 4, background: '#a855f7', width: `${(count / max) * 100}%`, transition: 'width 500ms' }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Recent activity */}
              {reachSummary.recentViews?.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(99,149,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>Recent View Activity</h3>
                    <button onClick={fetchReachSummary} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.625rem', borderRadius: 6, fontSize: '0.72rem', background: 'rgba(99,149,255,0.08)', color: '#60a5fa', border: '1px solid rgba(99,149,255,0.15)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      <RefreshCw size={11} /> Refresh
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(99,149,255,0.04)' }}>
                          {['User', 'Email', 'Content', 'Type', 'Viewed At'].map(h => (
                            <th key={h} style={{ padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: '#4d6080', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid rgba(99,149,255,0.08)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reachSummary.recentViews.slice(0, 30).map((v, i) => (
                          <tr key={v.id || i} style={{ borderBottom: '1px solid rgba(99,149,255,0.05)' }}>
                            <td style={{ padding: '0.625rem 1rem', fontSize: '0.8rem', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{v.userName}</td>
                            <td style={{ padding: '0.625rem 1rem', fontSize: '0.75rem', color: '#64748b' }}>{v.userEmail}</td>
                            <td style={{ padding: '0.625rem 1rem', fontSize: '0.8rem', color: '#cbd5e1', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.contentTitle}</td>
                            <td style={{ padding: '0.625rem 1rem' }}>
                              <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 4, background: v.contentType === 'ARTICLE' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)', color: v.contentType === 'ARTICLE' ? '#60a5fa' : '#c084fc' }}>
                                {v.contentType}
                              </span>
                            </td>
                            <td style={{ padding: '0.625rem 1rem', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {v.viewedAt ? new Date(v.viewedAt).toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reachSummary.totalArticleViews === 0 && reachSummary.totalVideoViews === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <TrendingUp size={32} style={{ margin: '0 auto 0.75rem', color: '#2a3a50' }} />
                  <p style={{ color: '#4d6080', fontSize: '0.875rem' }}>No view data yet. Views are tracked as users read articles and watch videos.</p>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#4d6080' }}>Failed to load analytics.</p>
            </div>
          )}
        </div>
      )}

      {/* ── REACH DETAIL MODAL ── */}
      {reachModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0f1a2e', border: '1px solid rgba(99,149,255,0.15)', borderRadius: 14, padding: '1.5rem', width: '100%', maxWidth: 560, maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.25rem' }}>Reach Details</h2>
                <p style={{ fontSize: '0.8rem', color: '#4d6080' }}>{reachModal.title}</p>
              </div>
              <button onClick={() => { setReachModal(null); setReachDetail(null); }} style={{ background: 'none', border: 'none', color: '#4d6080', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {!reachDetail ? (
              <div style={{ textAlign: 'center', color: '#4d6080', padding: '2rem' }}>Loading...</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ flex: 1, background: 'rgba(59,130,246,0.08)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#60a5fa' }}>{reachDetail.viewCount}</p>
                    <p style={{ fontSize: '0.75rem', color: '#4d6080' }}>Unique Views</p>
                  </div>
                </div>
                {reachDetail.viewers?.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['User', 'Email', 'Viewed At'].map(h => (
                          <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.7rem', color: '#4d6080', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid rgba(99,149,255,0.08)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reachDetail.viewers.map((v, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(99,149,255,0.05)' }}>
                          <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8rem', color: '#e2e8f0' }}>{v.userName}</td>
                          <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: '#64748b' }}>{v.userEmail}</td>
                          <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: '#64748b' }}>{v.viewedAt ? new Date(v.viewedAt).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: '#4d6080', fontSize: '0.875rem', padding: '1.5rem' }}>No views tracked yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAwarenessPage;
