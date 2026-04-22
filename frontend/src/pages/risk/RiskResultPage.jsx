// Risk Result Page - Displays final risk score and personalized security recommendations

import React, { useEffect, useState } from 'react';
import { riskAPI } from '../../services/api';
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

const levelConfig = {
  LOW: { color: 'text-green-400', bg: 'bg-slate-800', icon: ShieldCheck, label: 'Low Risk', bar: 'bg-green-500' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-slate-800', icon: AlertTriangle, label: 'Medium Risk', bar: 'bg-yellow-500' },
  HIGH: { color: 'text-red-400', bg: 'bg-slate-800', icon: XCircle, label: 'High Risk', bar: 'bg-red-500' },
};

const RiskResultPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riskAPI.getHistory()
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Risk Assessment Results</h1>
        <p className="text-sm text-slate-400">Your previous assessment history</p>
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          No assessments completed yet. <a href="/risk/questionnaire" className="text-indigo-300">Take one now!</a>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((r, i) => {
            const cfg = levelConfig[r.riskLevel] || levelConfig['MEDIUM'];
            const Icon = cfg.icon;
            return (
              <div key={i} className="card">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                    <Icon size={22} className={cfg.color} />
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-xs text-slate-400">{new Date(r.completedAt).toLocaleString()}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-slate-100">{r.score}%</p>
                    <p className="text-xs text-slate-400">Risk Score</p>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                  <div className={`${cfg.bar} h-2 rounded-full`} style={{ width: `${r.score}%` }}></div>
                </div>
                {r.recommendations?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {r.recommendations.map((rec, j) => (
                        <li key={j} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-indigo-300 mt-0.5">•</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiskResultPage;
