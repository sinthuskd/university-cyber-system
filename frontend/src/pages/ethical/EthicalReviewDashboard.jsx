import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Plus, Search, Eye, Trash2, Download, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ethicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const EthicalReviewDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const loadCases = () => {
    setLoading(true);
    ethicalAPI.getCases()
      .then(res => setCases(res.data))
      .catch(() => toast.error('Failed to load cases'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCases(); }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await ethicalAPI.deleteCase(id);
      toast.success('Case deleted successfully');
      setCases(prev => prev.filter(c => c.id !== id));
    } catch {
      toast.error('Failed to delete case');
    } finally {
      setDeleting(null);
      setShowDeleteModal(null);
    }
  };

  const handleQuickDecision = async (id, decision, reason) => {
    try {
      await ethicalAPI.updateDecision(id, { decision, reason });
      toast.success(`Decision set to ${decision}`);
      loadCases();
    } catch {
      toast.error('Failed to update decision');
    }
  };

  const statusColor = (s) => {
    const m = { PENDING: 'var(--amber)', UNDER_REVIEW: 'var(--blue)', APPROVED: 'var(--green)', REJECTED: 'var(--red)' };
    return m[s] || 'var(--text-muted)';
  };

  const filtered = cases.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.submittedByName?.toLowerCase().includes(search.toLowerCase()) ||
      c.type?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: cases.length,
    PENDING: cases.filter(c => c.status === 'PENDING').length,
    UNDER_REVIEW: cases.filter(c => c.status === 'UNDER_REVIEW').length,
    APPROVED: cases.filter(c => c.status === 'APPROVED').length,
    REJECTED: cases.filter(c => c.status === 'REJECTED').length,
  };

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Type', 'Status', 'Submitted By', 'Decision', 'Created At'];
    const rows = filtered.map(c => [c.id, `"${c.title}"`, c.type, c.status, c.submittedByName, c.decision || '', new Date(c.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `ethical-cases-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Cases exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Ethical Review Cases</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Academic integrity and ethical review board</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadCases} className="btn-secondary flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
          {user?.role === 'ADMIN' && (
            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2"><Download size={14} /> Export</button>
          )}
          <Link to="/ethical/create" className="btn-primary flex items-center gap-2"><Plus size={14} /> New Case</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.ALL, icon: Scale, color: 'var(--indigo)' },
          { label: 'Pending', value: counts.PENDING, icon: Clock, color: 'var(--amber)' },
          { label: 'Approved', value: counts.APPROVED, icon: CheckCircle, color: 'var(--green)' },
          { label: 'Rejected', value: counts.REJECTED, icon: XCircle, color: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '1rem' }}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={13} style={{ color: s.color }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..." className="form-input pl-9 w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(counts).map(([status, count]) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
              style={{
                background: statusFilter === status ? 'var(--blue)' : 'rgba(255,255,255,0.04)',
                color: statusFilter === status ? 'white' : 'var(--text-muted)',
                border: `1px solid ${statusFilter === status ? 'var(--blue)' : 'var(--border-subtle)'}`,
              }}>
              {status.replace(/_/g, ' ')} ({count})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Scale size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>{search || statusFilter !== 'ALL' ? 'No cases match your filters.' : 'No ethical review cases yet.'}</p>
          <Link to="/ethical/create" className="btn-primary mt-4 inline-flex items-center gap-2"><Plus size={14} /> Create First Case</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="card hover:border-blue-500/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${statusColor(c.status)}18`, color: statusColor(c.status), border: `1px solid ${statusColor(c.status)}33` }}>{c.status}</span>
                    {c.type && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo)' }}>{c.type.replace(/_/g, ' ')}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>👤 {c.submittedByName}</span>
                    <span>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <Link to={`/ethical/case/${c.id}`} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--blue)' }}><Eye size={14} /></Link>
                  {user?.role === 'ADMIN' && (
                    <button onClick={() => setShowDeleteModal(c.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>
              {c.decision && (
                <div className="rounded-lg px-3 py-2 text-xs flex items-center gap-2 mb-3" style={{ background: c.decision === 'APPROVED' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${c.decision === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  {c.decision === 'APPROVED' ? <CheckCircle size={12} style={{ color: 'var(--green)' }} /> : <XCircle size={12} style={{ color: 'var(--red)' }} />}
                  <span className="font-bold" style={{ color: c.decision === 'APPROVED' ? 'var(--green)' : 'var(--red)' }}>Decision: {c.decision}</span>
                  {c.reason && <span style={{ color: 'var(--text-secondary)' }}>— {c.reason}</span>}
                </div>
              )}
              {user?.role === 'ADMIN' && !c.decision && c.status === 'PENDING' && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleQuickDecision(c.id, 'UNDER_REVIEW', 'Case is now under committee review')} className="px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.2)' }}><Clock size={10} /> Start Review</button>
                  <button onClick={() => handleQuickDecision(c.id, 'APPROVED', 'Case approved after committee review')} className="px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }}><CheckCircle size={10} /> Approve</button>
                  <button onClick={() => handleQuickDecision(c.id, 'REJECTED', 'Case rejected after committee review')} className="px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}><XCircle size={10} /> Reject</button>
                  <Link to={`/ethical/decision/${c.id}`} className="px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1 ml-auto" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo)', border: '1px solid rgba(99,102,241,0.2)' }}>Full Decision →</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card max-w-sm w-full mx-4">
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Case?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>This action cannot be undone. All case data will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(showDeleteModal)} disabled={deleting === showDeleteModal} className="btn-primary flex-1" style={{ background: 'var(--red)', borderColor: 'var(--red)' }}>
                {deleting === showDeleteModal ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setShowDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EthicalReviewDashboard;
