import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Upload, Trash2, Scale, CheckCircle, Clock } from 'lucide-react';
import { ethicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const EvidenceReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ethicalCase, setEthicalCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newEvidence, setNewEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ethicalAPI.getCaseById(id)
      .then(res => setEthicalCase(res.data))
      .catch(() => toast.error('Failed to load case'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddEvidence = async () => {
    if (!newEvidence.trim()) return;
    setSubmitting(true);
    try {
      const combined = ethicalCase.evidence
        ? `${ethicalCase.evidence}\n\n[Added ${new Date().toLocaleDateString()}]: ${newEvidence}`
        : newEvidence;
      await ethicalAPI.updateDecision(id, {
        decision: ethicalCase.decision,
        reason: ethicalCase.reason,
        evidence: combined
      });
      toast.success('Evidence added successfully');
      const res = await ethicalAPI.getCaseById(id);
      setEthicalCase(res.data);
      setNewEvidence('');
    } catch {
      toast.error('Failed to add evidence');
    } finally {
      setSubmitting(false);
    }
  };

  const mockEvidenceList = ethicalCase?.evidence
    ? ethicalCase.evidence.split('\n\n').filter(Boolean).map((text, i) => ({
        id: i,
        text,
        date: new Date().toLocaleDateString(),
        verified: i === 0
      }))
    : [];

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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/ethical/case/${id}`)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Evidence Review</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Case: {ethicalCase.title}</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Evidence Items', value: mockEvidenceList.length, icon: FileText, color: 'var(--blue)' },
          { label: 'Verified Items', value: mockEvidenceList.filter(e => e.verified).length, icon: CheckCircle, color: 'var(--green)' },
          { label: 'Case Status', value: ethicalCase.status, icon: Clock, color: 'var(--amber)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '1rem' }}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} style={{ color: s.color }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Evidence List */}
      <div className="card">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <FileText size={16} style={{ color: 'var(--blue)' }} /> Submitted Evidence
        </h3>

        {mockEvidenceList.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No evidence submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockEvidenceList.map((ev, i) => (
              <div key={i} className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--indigo)' }}>
                      #{i + 1}
                    </span>
                    {ev.verified && (
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--green)' }}>
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ev.date}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ev.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Evidence */}
      {user?.role === 'ADMIN' && ethicalCase.status !== 'APPROVED' && ethicalCase.status !== 'REJECTED' && (
        <div className="card">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Upload size={16} style={{ color: 'var(--cyan)' }} /> Add Evidence
          </h3>
          <textarea
            value={newEvidence}
            onChange={e => setNewEvidence(e.target.value)}
            rows={4}
            placeholder="Enter additional evidence details..."
            className="form-input resize-none w-full mb-3"
          />
          <div className="flex gap-3">
            <button onClick={handleAddEvidence} disabled={submitting || !newEvidence.trim()} className="btn-primary flex items-center gap-2">
              <Upload size={14} /> {submitting ? 'Adding...' : 'Add Evidence'}
            </button>
            <Link to={`/ethical/decision/${id}`} className="btn-secondary">Make Decision</Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Link to={`/ethical/case/${id}`} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Case
        </Link>
        <Link to="/ethical/history" className="btn-secondary">Case History</Link>
      </div>
    </div>
  );
};

export default EvidenceReviewPage;
