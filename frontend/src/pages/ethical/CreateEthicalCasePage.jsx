import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, ArrowLeft, Plus } from 'lucide-react';
import { ethicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CreateEthicalCasePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    type: '',
    description: '',
    relatedCaseId: '',
    evidence: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.type) e.type = 'Type is required';
    if (!form.description.trim() || form.description.length < 30) e.description = 'Description must be at least 30 characters';
    return e;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setSubmitting(true);
    try {
      const res = await ethicalAPI.createCase(form);
      toast.success('Ethical review case created successfully');
      navigate(`/ethical/case/${res.data.id}`);
    } catch {
      toast.error('Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  const caseTypes = [
    { value: 'GRADE_APPEAL', label: 'Grade Appeal' },
    { value: 'DISCIPLINARY_APPEAL', label: 'Disciplinary Appeal' },
    { value: 'ETHICAL_CONCERN', label: 'Ethical Concern' },
    { value: 'ACADEMIC_MISCONDUCT', label: 'Academic Misconduct' },
    { value: 'HARASSMENT', label: 'Harassment / Misconduct' },
    { value: 'DATA_BREACH', label: 'Data Breach Ethics' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/ethical')} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Ethical Review Case</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Submit a new case to the Ethics Committee</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Case Title */}
          <div>
            <label className="form-label">Case Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Provide a clear and concise case title..."
              className="form-input w-full"
            />
            {errors.title && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.title}</p>}
          </div>

          {/* Case Type */}
          <div>
            <label className="form-label">Case Type *</label>
            <select value={form.type} onChange={e => handleChange('type', e.target.value)} className="form-input w-full">
              <option value="">Select case type...</option>
              {caseTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.type && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.type}</p>}
          </div>

          {/* Related Case */}
          <div>
            <label className="form-label">Related Incident / Case ID <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <input
              type="text"
              value={form.relatedCaseId}
              onChange={e => handleChange('relatedCaseId', e.target.value)}
              placeholder="Leave blank if not applicable"
              className="form-input w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Case Description *</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={6}
              placeholder="Provide a thorough description of the ethical concern, incident, or situation that requires committee review..."
              className="form-input w-full resize-none"
            />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-xs" style={{ color: 'var(--red)' }}>{errors.description}</p>}
              <p className="text-xs ml-auto" style={{ color: form.description.length >= 30 ? 'var(--green)' : 'var(--text-muted)' }}>
                {form.description.length}/30 min
              </p>
            </div>
          </div>

          {/* Evidence */}
          <div>
            <label className="form-label">Supporting Evidence <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea
              value={form.evidence}
              onChange={e => handleChange('evidence', e.target.value)}
              rows={4}
              placeholder="Include any supporting documents, references, or evidence..."
              className="form-input w-full resize-none"
            />
          </div>

          {/* Info Banner */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--indigo)' }}>ℹ️ Submission Notice</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              This case will be reviewed by the Ethics Committee. Cases are processed within 5–10 working days.
              All submissions are confidential. You will be notified of any decisions or updates.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Plus size={14} /> {submitting ? 'Creating Case...' : 'Create Case'}
            </button>
            <Link to="/ethical" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEthicalCasePage;
