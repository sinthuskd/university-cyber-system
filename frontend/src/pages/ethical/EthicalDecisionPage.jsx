import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Scale, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ethicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const EthicalDecisionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ethicalCase, setEthicalCase] = useState(null);
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
        setEthicalCase(res.data);
        setDecision(res.data.decision || '');
        setReason(res.data.reason || '');
      })
      .catch(() => toast.error('Failed to load case'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleSubmit = async () => {
    if (!decision || !reason.trim()) {
      toast.error('Please select a decision and provide a reason');
      return;
    }
    setSubmitting(true);
    try {
      await ethicalAPI.updateDecision(id, { decision, reason });
      toast.success('Decision recorded successfully');
      navigate(`/ethical/case/${id}`);
    } catch {
      toast.error('Failed to record decision');
    } finally {
      setSubmitting(false);
    }
  };

  const decisions = [
    { value: 'APPROVED', label: 'Approved', icon: CheckCircle, desc: 'The case/appeal is approved and accepted', color: 'var(--green)', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    { value: 'REJECTED', label: 'Rejected', icon: XCircle, desc: 'The case/appeal is rejected after review', color: 'var(--red)', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    { value: 'UNDER_REVIEW', label: 'Under Review', icon: Clock, desc: 'Additional review is required', color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
  ];

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!ethicalCase) return (
    <div className="card text-center py-12">
      <p style={{ color: 'var(--text-muted)' }}>Case not found.</p>
      <Link to="/ethical" className="btn-primary mt-4 inline-block">Back to Cases</Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/ethical/case/${id}`)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Record Decision</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Case: {ethicalCase.title}</p>
        </div>
      </div>

      {/* Case Summary */}
      <div className="card" style={{ borderLeft: '3px solid var(--indigo)' }}>
        <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>CASE UNDER REVIEW</p>
        <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{ethicalCase.title}</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ethicalCase.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Submitted by: {ethicalCase.submittedByName}</span>
          <span>Type: {ethicalCase.type?.replace(/_/g, ' ')}</span>
          <span>Date: {new Date(ethicalCase.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Decision Selection */}
      <div className="card">
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Select Decision *</h3>
        <div className="grid grid-cols-1 gap-3">
          {decisions.map((d) => (
            <button
              key={d.value}
              onClick={() => setDecision(d.value)}
              className="w-full text-left rounded-xl p-4 transition-all"
              style={{
                background: decision === d.value ? d.bg : 'rgba(255,255,255,0.02)',
                border: `2px solid ${decision === d.value ? d.border : 'var(--border-subtle)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <d.icon size={20} style={{ color: d.color }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: decision === d.value ? d.color : 'var(--text-primary)' }}>{d.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.desc}</p>
                </div>
                {decision === d.value && (
                  <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center" style={{ background: d.color }}>
                    <CheckCircle size={10} color="white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reason */}
      <div className="card">
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Decision Rationale *</h3>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={5}
          placeholder="Provide a detailed explanation for this decision. This will be visible to the case submitter..."
          className="form-input resize-none w-full"
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Minimum 20 characters required. {reason.length}/20</p>
      </div>

      {/* Warning if already decided */}
      {ethicalCase.decision && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--amber)' }}>⚠️ This case already has a decision: {ethicalCase.decision}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Submitting a new decision will override the previous one.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={submitting || !decision || reason.length < 20} className="btn-primary flex items-center gap-2">
          <Scale size={14} /> {submitting ? 'Recording...' : 'Record Decision'}
        </button>
        <button onClick={() => navigate(`/ethical/case/${id}`)} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
};

export default EthicalDecisionPage;
