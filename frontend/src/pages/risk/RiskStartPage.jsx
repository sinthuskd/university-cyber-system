import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, HelpCircle, AlertCircle } from 'lucide-react';
import { riskAPI } from '../../services/api';
import { toast } from 'react-toastify';

const RiskStartPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await riskAPI.startAssessment();
      navigate('/risk/questionnaire', { state: { sessionId: res.data.sessionId } });
    } catch {
      toast.error('Failed to start assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Risk Assessment</h1>
        <p className="text-sm text-slate-400">Understand your cybersecurity risk level</p>
      </div>

      <div className="card text-center py-10 space-y-4">
        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck size={36} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Cybersecurity Risk Assessment</h2>
        <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
          This assessment evaluates your current cybersecurity habits and practices.
          Answer honestly — the results are for your benefit only.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-start gap-3">
          <Clock size={18} className="text-indigo-300 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-100">~5 Minutes</p>
            <p className="text-xs text-slate-400">Quick to complete</p>
          </div>
        </div>
        <div className="card flex items-start gap-3">
          <HelpCircle size={18} className="text-purple-300 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-100">8 Questions</p>
            <p className="text-xs text-slate-400">Multiple choice format</p>
          </div>
        </div>
        <div className="card flex items-start gap-3">
          <AlertCircle size={18} className="text-yellow-300 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-100">Instant Results</p>
            <p className="text-xs text-slate-400">With recommendations</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">What will be assessed?</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          {[
            'Password strength and management practices',
            'Two-factor authentication usage',
            'Email and phishing awareness',
            'Software update habits',
            'Public Wi-Fi and network security',
            'Sensitive data storage practices',
            'Antivirus and security software usage',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Starting...' : 'Start Assessment Now'}
        </button>
        <button
          onClick={() => navigate('/risk')}
          className="btn-secondary px-6"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RiskStartPage;
