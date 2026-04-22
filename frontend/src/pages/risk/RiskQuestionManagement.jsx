import React, { useEffect, useState } from 'react';
import { riskAPI } from '../../services/api';
import { Plus, Pencil, Trash2, Save, X, HelpCircle, Clock, Settings } from 'lucide-react';
import { toast } from 'react-toastify';

const defaultQuestion = { question: '', options: ['', '', '', ''] };

const RiskQuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newQ, setNewQ] = useState({ ...defaultQuestion, options: ['', '', '', ''] });
  const [saving, setSaving] = useState(false);

  // Timer config
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(() => {
    return localStorage.getItem('riskAssessmentTimeLimit') || '';
  });
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  useEffect(() => {
    riskAPI.getQuestions()
      .then(res => setQuestions(res.data))
      .catch(() => toast.error('Failed to load questions'))
      .finally(() => setLoading(false));
  }, []);

  // Helper: persist updated list to backend
  const persistQuestions = async (updatedList) => {
    setSaving(true);
    try {
      await riskAPI.updateQuestions(updatedList);
      setQuestions(updatedList);
      return true;
    } catch {
      toast.error('Failed to save changes to server');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTimer = () => {
    const val = parseInt(timeLimitMinutes, 10);
    if (timeLimitMinutes === '' || timeLimitMinutes === '0') {
      localStorage.removeItem('riskAssessmentTimeLimit');
      toast.success('Timer disabled — no time limit for assessments');
    } else if (isNaN(val) || val < 1 || val > 180) {
      toast.error('Enter a valid time between 1 and 180 minutes');
      return;
    } else {
      localStorage.setItem('riskAssessmentTimeLimit', val.toString());
      toast.success(`Timer set: ${val} minute${val !== 1 ? 's' : ''} per assessment`);
    }
    setShowTimerSettings(false);
  };

  const handleEditSave = async (idx) => {
    if (!editData.question.trim() || editData.options.some(o => !o.trim())) {
      toast.error('Fill in question and all 4 options');
      return;
    }
    const updated = [...questions];
    updated[idx] = editData;
    const ok = await persistQuestions(updated);
    if (ok) {
      setEditingIdx(null);
      toast.success('Question updated');
    }
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('Delete this question?')) return;
    const updated = questions.filter((_, i) => i !== idx);
    const ok = await persistQuestions(updated);
    if (ok) toast.success('Question deleted');
  };

  const handleAddQuestion = async () => {
    if (!newQ.question.trim() || newQ.options.some(o => !o.trim())) {
      toast.error('Fill in question and all 4 options');
      return;
    }
    const updated = [...questions, { ...newQ }];
    const ok = await persistQuestions(updated);
    if (ok) {
      setNewQ({ question: '', options: ['', '', '', ''] });
      setShowAdd(false);
      toast.success('Question added');
    }
  };

  const currentTimer = localStorage.getItem('riskAssessmentTimeLimit');

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Question Management</h1>
          <p className="text-sm text-slate-400">Manage risk assessment questionnaire ({questions.length} questions)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTimerSettings(!showTimerSettings)} className="btn-secondary flex items-center gap-2 text-sm">
            <Clock size={14} />
            {currentTimer ? `Timer: ${currentTimer}m` : 'Set Timer'}
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Add Question
          </button>
        </div>
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-900/20 border border-cyan-900/40 rounded-lg px-3 py-2">
          <div className="animate-spin w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full" />
          Saving changes to server...
        </div>
      )}

      {/* Timer Settings Panel */}
      {showTimerSettings && (
        <div className="card border border-cyan-900/50" style={{ background: 'rgba(8,145,178,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(8,145,178,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={15} style={{ color: '#22d3ee' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Assessment Timer Settings</h3>
              <p className="text-xs text-slate-500">Set how many minutes students have to complete the assessment</p>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Time Limit (minutes) — leave empty to disable timer</label>
              <input
                type="number"
                min="1"
                max="180"
                value={timeLimitMinutes}
                onChange={e => setTimeLimitMinutes(e.target.value)}
                placeholder="e.g. 15"
                className="form-input w-full"
              />
            </div>
            <button onClick={handleSaveTimer} className="btn-primary flex items-center gap-2 text-sm">
              <Save size={13} /> Save Timer
            </button>
            <button onClick={() => setShowTimerSettings(false)} className="btn-secondary text-sm flex items-center gap-2">
              <X size={13} /> Cancel
            </button>
          </div>
          {currentTimer && (
            <p className="text-xs mt-2" style={{ color: '#22d3ee' }}>
              ✓ Active: Students have <strong>{currentTimer} minutes</strong> to complete each assessment.
            </p>
          )}
          {!currentTimer && (
            <p className="text-xs mt-2 text-slate-500">Currently no time limit — students can take as long as needed.</p>
          )}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="card border border-indigo-900/50">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">New Question</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Question Text</label>
              <input type="text" value={newQ.question}
                onChange={e => setNewQ({ ...newQ, question: e.target.value })}
                className="form-input w-full" placeholder="Enter question..." />
            </div>
            {newQ.options.map((opt, i) => (
              <div key={i}>
                <label className="text-xs text-slate-400 mb-1 block">
                  Option {i + 1} {i === 0 ? '(safest)' : i === 3 ? '(riskiest)' : ''}
                </label>
                <input type="text" value={opt}
                  onChange={e => {
                    const opts = [...newQ.options];
                    opts[i] = e.target.value;
                    setNewQ({ ...newQ, options: opts });
                  }}
                  className="form-input w-full" placeholder={`Option ${i + 1}...`} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={handleAddQuestion} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                <Save size={13} /> {saving ? 'Saving...' : 'Save Question'}
              </button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm flex items-center gap-2">
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question list */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={idx} className="card">
            {editingIdx === idx ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Question</label>
                  <input type="text" value={editData.question}
                    onChange={e => setEditData({ ...editData, question: e.target.value })}
                    className="form-input w-full" />
                </div>
                {editData.options.map((opt, i) => (
                  <div key={i}>
                    <label className="text-xs text-slate-400 mb-1 block">Option {i + 1}</label>
                    <input type="text" value={opt}
                      onChange={e => {
                        const opts = [...editData.options];
                        opts[i] = e.target.value;
                        setEditData({ ...editData, options: opts });
                      }}
                      className="form-input w-full" />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={() => handleEditSave(idx)} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                    <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingIdx(null)} className="btn-secondary text-sm flex items-center gap-2">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HelpCircle size={14} className="text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-100 mb-2">Q{idx + 1}. {q.question}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {q.options.map((opt, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded ${i === 0 ? 'bg-green-900/30 text-green-400' : i === 3 ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                            {i === 0 ? '✓ ' : i === 3 ? '✗ ' : ''}{opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditingIdx(idx); setEditData({ ...q, options: [...q.options] }); }}
                      className="p-1.5 text-slate-500 hover:text-indigo-300 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(idx)} disabled={saving} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskQuestionManagement;
