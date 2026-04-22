import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Search, Filter, Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { ethicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AppealReviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/ethical');
      return;
    }
    loadAppeals();
  }, [user, navigate]);

  const loadAppeals = () => {
    setLoading(true);
    ethicalAPI.getAppeals()
      .then(res => setAppeals(res.data))
      .catch(() => toast.error('Failed to load appeals'))
      .finally(() => setLoading(false));
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await ethicalAPI.updateAppealStatus(id, status);
      toast.success(`Appeal status updated to ${status}`);
      loadAppeals();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = (s) => {
    const map = { PENDING: '#f59e0b', UNDER_REVIEW: '#3b82f6', APPROVED: '#10b981', REJECTED: '#ef4444' };
    return map[s] || '#8ba3cc';
  };

  const filtered = appeals.filter(a => {
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.submittedByName?.toLowerCase().includes(search.toLowerCase()) ||
      a.type?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    ALL: appeals.length,
    PENDING: appeals.filter(a => a.status === 'PENDING').length,
    UNDER_REVIEW: appeals.filter(a => a.status === 'UNDER_REVIEW').length,
    APPROVED: appeals.filter(a => a.status === 'APPROVED').length,
    REJECTED: appeals.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Appeal Review</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Review and manage submitted appeals</p>
        </div>
        <button onClick={loadAppeals} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: filter === status ? 'var(--blue)' : 'rgba(255,255,255,0.04)',
              color: filter === status ? 'white' : 'var(--text-muted)',
              border: `1px solid ${filter === status ? 'var(--blue)' : 'var(--border-subtle)'}`,
            }}
          >
            {status.replace(/_/g, ' ')} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search appeals by title, submitter, or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input pl-9 w-full"
        />
      </div>

      {/* Appeals Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Scale size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No appeals found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(appeal => (
            <div key={appeal.id} className="card hover:border-blue-500/20 transition-all" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{appeal.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{
                      background: `${statusColor(appeal.status)}18`,
                      color: statusColor(appeal.status),
                      border: `1px solid ${statusColor(appeal.status)}33`
                    }}>
                      {appeal.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>👤 {appeal.submittedByName}</span>
                    <span>🏷️ {appeal.type?.replace(/_/g, ' ')}</span>
                    <span>📅 {new Date(appeal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/ethical/appeal-decision/${appeal.id}`}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--blue)' }}
                    title="View & Decide"
                  >
                    <Eye size={14} />
                  </Link>
                </div>
              </div>

              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{appeal.description}</p>

              {/* Quick Actions */}
              {appeal.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(appeal.id, 'UNDER_REVIEW')}
                    disabled={updatingId === appeal.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.2)' }}
                  >
                    <Clock size={10} /> Start Review
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(appeal.id, 'APPROVED')}
                    disabled={updatingId === appeal.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <CheckCircle size={10} /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(appeal.id, 'REJECTED')}
                    disabled={updatingId === appeal.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <XCircle size={10} /> Reject
                  </button>
                  <Link to={`/ethical/appeal-decision/${appeal.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto transition-all"
                    style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--indigo)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    Full Review →
                  </Link>
                </div>
              )}

              {appeal.status === 'UNDER_REVIEW' && (
                <div className="flex gap-2">
                  <button onClick={() => handleStatusUpdate(appeal.id, 'APPROVED')} disabled={updatingId === appeal.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                    style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={10} /> Approve
                  </button>
                  <button onClick={() => handleStatusUpdate(appeal.id, 'REJECTED')} disabled={updatingId === appeal.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                    style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <XCircle size={10} /> Reject
                  </button>
                  <Link to={`/ethical/appeal-decision/${appeal.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                    style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--indigo)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    Full Review →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppealReviewPage;
