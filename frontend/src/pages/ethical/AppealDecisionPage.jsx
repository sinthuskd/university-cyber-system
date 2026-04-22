import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Scale, ArrowLeft, CheckCircle, XCircle, Clock, User, Calendar, FileText } from 'lucide-react';
import { ethicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AppealDecisionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/ethical');
      return;
    }
    ethicalAPI.getCaseById(id)
      .then(res => {
        setAppeal(res.data);
        if (res.data.decision) setDecision(res.data.decision);
        if (res.data.reason) setReason(res.data.reason);
      })
      .catch(() => toast.error('Failed to load appeal'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleDecision = async () => {
    if (!decision || !reason.trim()) {
      toast.error('Please select a decision and provide rationale');
      return;
    }
    setSubmitting(true);
    try {
      await ethicalAPI.updateDecision(id, { decision, reason });
      await ethicalAPI.updateAppealStatus(id, decision);
      toast.success('Appeal decision recorded successfully');
      navigate('/ethical/appeal-review');
    } catch {
      toast.error('Failed to record decision');
    } finally {
      setSubmitting(false);
    }
  };

  const decisionOptions = [
    {
      value: 'APPROVED',
      label: 'Uphold Appeal',
      sublabel: 'The appeal is valid and accepted',
      icon: CheckCircle,
      color: 'var(--green)',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.25)',
    },
    {
      value: 'REJECTED',
      label: 'Dismiss Appeal',
      sublabel: 'The appeal lacks merit and is rejected',
      icon: XCircle,
      color: 'var(--red)',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
    },
    {
      value: 'UNDER_REVIEW',
      label: 'Defer for More Review',
      sublabel: 'Requires additional investigation',
      icon: Clock,
      color: 'var(--blue)',
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.25)',
    },
  ];

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!appeal) return (
    <div className="card text-center py-12">
      <p style={{ color: 'var(--text-muted)' }}>Appeal not found.</p>
    </div>
  );

  const statusColor = (s) => {
    const m = { PENDING: 'var(--amber)', UNDER_REVIEW: 'var(--blue)', APPROVED: 'var(--green)', REJECTED: 'var(--red)' };
    return m[s] || 'var(--text-muted)';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/ethical/appeal-review')} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Appeal Decision</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Issue final decision on this appeal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Appeal Details */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{appeal.title}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${statusColor(appeal.status)}18`, color: statusColor(appeal.status) }}>
                {appeal.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {[
                { icon: User, label: 'Submitted By', value: appeal.submittedByName },
                { icon: Calendar, label: 'Submitted On', value: new Date(appeal.createdAt).toLocaleDateString() },
                { icon: Scale, label: 'Appeal Type', value: appeal.type?.replace(/_/g, ' ') },
                ...(appeal.relatedCaseId ? [{ icon: FileText, label: 'Related Case', value: appeal.relatedCaseId }] : []),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <item.icon size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>DESCRIPTION</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{appeal.description}</p>
            </div>

            {appeal.evidence && (
              <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--blue)' }}>EVIDENCE</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{appeal.evidence}</p>
              </div>
            )}
          </div>

          {/* Previous Decision */}
          {appeal.decision && (
            <div className="card" style={{ borderLeft: '3px solid var(--amber)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--amber)' }}>PREVIOUS DECISION</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{appeal.decision}</p>
              {appeal.reason && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{appeal.reason}</p>}
            </div>
          )}
        </div>

        {/* Right: Decision Form */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Issue Decision *</h3>
            <div className="space-y-2">
              {decisionOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDecision(opt.value)}
                  className="w-full text-left rounded-xl p-3 transition-all"
                  style={{
                    background: decision === opt.value ? opt.bg : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${decision === opt.value ? opt.border : 'var(--border-subtle)'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <opt.icon size={18} style={{ color: opt.color }} />
                    <div>
                      <p className="font-bold text-sm" style={{ color: decision === opt.value ? opt.color : 'var(--text-primary)' }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.sublabel}</p>
                    </div>
                    {decision === opt.value && (
                      <div className="ml-auto w-4 h-4 rounded-full" style={{ background: opt.color }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Decision Rationale *</h3>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={6}
              placeholder="Provide detailed reasoning for this decision. This will be communicated to the appellant..."
              className="form-input resize-none w-full"
            />
            <p className="text-xs mt-1" style={{ color: reason.length >= 30 ? 'var(--green)' : 'var(--text-muted)' }}>
              {reason.length} characters {reason.length < 30 ? `(min 30 required)` : '✓'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDecision}
              disabled={submitting || !decision || reason.length < 30}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Scale size={14} /> {submitting ? 'Issuing Decision...' : 'Issue Final Decision'}
            </button>
          </div>
          <button onClick={() => navigate('/ethical/appeal-review')} className="btn-secondary w-full">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AppealDecisionPage;
