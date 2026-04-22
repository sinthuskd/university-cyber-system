import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riskAPI } from '../../services/api';
import { ShieldCheck, AlertTriangle, XCircle, Trash2, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const levelConfig = {
  LOW: { color: 'text-green-400', bg: 'bg-green-900/30', icon: ShieldCheck, label: 'Low Risk', bar: 'bg-green-500' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: AlertTriangle, label: 'Medium Risk', bar: 'bg-yellow-500' },
  HIGH: { color: 'text-red-400', bg: 'bg-red-900/30', icon: XCircle, label: 'High Risk', bar: 'bg-red-500' },
};

const RiskHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = () => {
    setLoading(true);
    riskAPI.getHistory()
      .then(res => setHistory(res.data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment record?')) return;
    try {
      await riskAPI.deleteAssessment(id);
      setHistory(prev => prev.filter(r => r.id !== id));
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete record');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Assessment History</h1>
          <p className="text-sm text-slate-400">All your past risk assessments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchHistory} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => navigate('/risk/questionnaire')} className="btn-primary text-sm">
            New Assessment
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {['LOW', 'MEDIUM', 'HIGH'].map(level => {
            const cfg = levelConfig[level];
            const count = history.filter(r => r.riskLevel === level).length;
            return (
              <div key={level} className={`card text-center ${cfg.bg}`}>
                <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
                <p className="text-xs text-slate-400 mt-1">{cfg.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {history.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No assessments completed yet.</p>
          <button onClick={() => navigate('/risk/start')} className="btn-primary text-sm">
            Take Your First Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((r, i) => {
            const cfg = levelConfig[r.riskLevel] || levelConfig['MEDIUM'];
            const Icon = cfg.icon;
            return (
              <div key={r.id || i} className="card">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                    <Icon size={22} className={cfg.color} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-xs text-slate-400">{new Date(r.completedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-2xl font-bold text-slate-100">{r.score}%</p>
                    <p className="text-xs text-slate-400">Risk Score</p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
                  <div className={`${cfg.bar} h-1.5 rounded-full transition-all`} style={{ width: `${r.score}%` }} />
                </div>
                {r.recommendations?.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-200 transition-colors">
                      {r.recommendations.length} Recommendation{r.recommendations.length > 1 ? 's' : ''}
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {r.recommendations.map((rec, j) => (
                        <li key={j} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-indigo-300 mt-0.5">•</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiskHistoryPage;
