import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Scale, ArrowLeft, FileText, User, Calendar, Tag, Search } from 'lucide-react';
import { ethicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CaseReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ethicalCase, setEthicalCase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      ethicalAPI.getCaseById(id)
        .then(res => setEthicalCase(res.data))
        .catch(() => toast.error('Failed to load case'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const statusColor = (s) => {
    const map = { PENDING: '#f59e0b', UNDER_REVIEW: '#3b82f6', APPROVED: '#10b981', REJECTED: '#ef4444', CLOSED: '#6366f1' };
    return map[s] || '#8ba3cc';
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!ethicalCase) return (
    <div className="card text-center py-12">
      <Scale size={40} className="mx-auto text-gray-400 mb-3" />
      <p className="text-gray-400">Case not found.</p>
      <Link to="/ethical" className="btn-primary mt-4 inline-block">Back to Cases</Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/ethical')} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Case Review</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Review case details and evidence</p>
        </div>
      </div>

      {/* Case Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Scale size={20} style={{ color: 'var(--indigo)' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{ethicalCase.title}</h2>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Case ID: {ethicalCase.id}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${statusColor(ethicalCase.status)}22`, color: statusColor(ethicalCase.status), border: `1px solid ${statusColor(ethicalCase.status)}44` }}>
            {ethicalCase.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <User size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{ethicalCase.submittedByName || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{ethicalCase.type?.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{new Date(ethicalCase.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Case Description</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ethicalCase.description}</p>
        </div>

        {ethicalCase.relatedCaseId && (
          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <FileText size={12} />
            <span>Related Case: {ethicalCase.relatedCaseId}</span>
          </div>
        )}
      </div>

      {/* Evidence */}
      {ethicalCase.evidence && (
        <div className="card">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileText size={16} style={{ color: 'var(--blue)' }} /> Supporting Evidence
          </h3>
          <div className="rounded-lg p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ethicalCase.evidence}</p>
          </div>
        </div>
      )}

      {/* Decision Panel */}
      {ethicalCase.decision && (
        <div className="card">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Committee Decision</h3>
          <div className="rounded-lg p-4" style={{ background: ethicalCase.decision === 'APPROVED' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${ethicalCase.decision === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold" style={{ color: ethicalCase.decision === 'APPROVED' ? 'var(--green)' : 'var(--red)' }}>{ethicalCase.decision}</span>
            </div>
            {ethicalCase.reason && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ethicalCase.reason}</p>}
            {ethicalCase.decidedBy && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Decided by: {ethicalCase.decidedBy}</p>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={`/ethical/evidence/${ethicalCase.id}`} className="btn-primary flex items-center gap-2">
          <Search size={14} /> View Evidence
        </Link>
        {user?.role === 'ADMIN' && (
          <Link to={`/ethical/decision/${ethicalCase.id}`} className="btn-secondary flex items-center gap-2">
            <Scale size={14} /> Make Decision
          </Link>
        )}
        <Link to="/ethical/appeal" className="btn-secondary">Submit Appeal</Link>
      </div>
    </div>
  );
};

export default CaseReviewPage;
