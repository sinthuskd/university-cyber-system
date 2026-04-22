import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { riskAPI } from '../../services/api';
import { ShieldCheck, AlertTriangle, XCircle, TrendingUp, Clock, MessageCircle } from 'lucide-react';

const levelConfig = {
  LOW: { color: 'text-green-400', icon: ShieldCheck, label: 'Low Risk', bar: 'bg-green-500' },
  MEDIUM: { color: 'text-yellow-400', icon: AlertTriangle, label: 'Medium Risk', bar: 'bg-yellow-500' },
  HIGH: { color: 'text-red-400', icon: XCircle, label: 'High Risk', bar: 'bg-red-500' },
};

const PersonalSecurityDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riskAPI.getHistory()
      .then(res => setHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = history[0];
  const cfg = latest ? (levelConfig[latest.riskLevel] || levelConfig['MEDIUM']) : null;
  const avgScore = history.length
    ? Math.round(history.reduce((a, r) => a + r.score, 0) / history.length)
    : 0;

  const trend = history.length >= 2
    ? history[0].score - history[1].score
    : null;

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Personal Security Dashboard</h1>
        <p className="text-sm text-slate-400">Your cybersecurity posture at a glance</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className={`text-2xl font-bold ${cfg?.color || 'text-slate-400'}`}>
            {latest ? latest.score + '%' : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Current Risk Score</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-100">{history.length}</p>
          <p className="text-xs text-slate-400 mt-1">Assessments Taken</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-indigo-300">{avgScore > 0 ? avgScore + '%' : 'N/A'}</p>
          <p className="text-xs text-slate-400 mt-1">Average Score</p>
        </div>
        <div className="card text-center">
          {trend !== null ? (
            <>
              <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${trend < 0 ? 'text-green-400' : trend > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                <TrendingUp size={18} />
                {trend > 0 ? '+' : ''}{trend}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {trend < 0 ? 'Improving' : trend > 0 ? 'Worsening' : 'No change'}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-slate-600">—</p>
              <p className="text-xs text-slate-400 mt-1">Trend</p>
            </>
          )}
        </div>
      </div>

      {/* Current risk level */}
      {latest && cfg ? (
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <cfg.icon size={22} className={cfg.color} />
            <div>
              <p className={`font-bold ${cfg.color}`}>Current Status: {cfg.label}</p>
              <p className="text-xs text-slate-400">Last assessed {new Date(latest.completedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
            <div className={`${cfg.bar} h-2 rounded-full`} style={{ width: `${latest.score}%` }} />
          </div>
          {latest.recommendations?.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-1">
              <span className="text-indigo-300 mt-0.5">→</span> {rec}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10">
          <p className="text-slate-400 mb-3">No assessments yet. Start one to see your security status.</p>
          <Link to="/risk/start" className="btn-primary text-sm">Start Assessment</Link>
        </div>
      )}

      {/* Score history */}
      {history.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Clock size={15} className="text-slate-400" /> Recent Assessments
          </h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((r, i) => {
              const c = levelConfig[r.riskLevel] || levelConfig['MEDIUM'];
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-32 flex-shrink-0">
                    {new Date(r.completedAt).toLocaleDateString()}
                  </span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div className={`${c.bar} h-1.5 rounded-full`} style={{ width: `${r.score}%` }} />
                  </div>
                  <span className={`text-xs font-semibold w-12 text-right ${c.color}`}>{r.score}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'New Assessment', path: '/risk/start', style: 'btn-primary' },
          { label: 'View History', path: '/risk/history', style: 'btn-secondary' },
          { label: 'Prevention Tips', path: '/risk/prevention', style: 'btn-secondary' },
          { label: 'AI Chatbot', path: '/risk/chatbot', style: 'btn-secondary' },
        ].map(btn => (
          <Link key={btn.path} to={btn.path} className={`${btn.style} text-sm text-center`}>
            {btn.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PersonalSecurityDashboard;
