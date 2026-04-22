import React, { useEffect, useState } from 'react';
import { riskAPI } from '../../services/api';
import { ShieldCheck, AlertTriangle, XCircle, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const levelConfig = {
  LOW: { color: 'text-green-400', bg: 'bg-green-900/30', icon: ShieldCheck, label: 'Low Risk' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: AlertTriangle, label: 'Medium Risk' },
  HIGH: { color: 'text-red-400', bg: 'bg-red-900/30', icon: XCircle, label: 'High Risk' },
};

const SecurityRecommendationsPage = () => {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    riskAPI.getHistory()
      .then(res => setLatest(res.data?.[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const generalRecs = [
    { title: 'Enable Multi-Factor Authentication', priority: 'Critical', desc: 'Add 2FA to all university and personal accounts immediately.' },
    { title: 'Use a Password Manager', priority: 'High', desc: 'Bitwarden or 1Password helps you generate and store strong unique passwords.' },
    { title: 'Enable Automatic Updates', priority: 'High', desc: 'OS and software patches fix critical vulnerabilities that attackers exploit.' },
    { title: 'Install Endpoint Protection', priority: 'Medium', desc: 'Keep antivirus updated and run regular scans on all devices.' },
    { title: 'Back Up Your Data', priority: 'Medium', desc: 'Follow the 3-2-1 rule: 3 copies, 2 media types, 1 offsite backup.' },
    { title: 'Review Privacy Settings', priority: 'Low', desc: 'Audit social media and app permissions regularly.' },
  ];

  const priorityStyle = {
    Critical: 'text-red-400 bg-red-900/30',
    High: 'text-orange-400 bg-orange-900/30',
    Medium: 'text-yellow-400 bg-yellow-900/30',
    Low: 'text-green-400 bg-green-900/30',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Security Recommendations</h1>
        <p className="text-sm text-slate-400">Personalised and general security action items</p>
      </div>

      {/* Latest assessment result */}
      {latest ? (
        (() => {
          const cfg = levelConfig[latest.riskLevel] || levelConfig['MEDIUM'];
          const Icon = cfg.icon;
          return (
            <div className={`card ${cfg.bg} border border-slate-700`}>
              <div className="flex items-center gap-3 mb-3">
                <Icon size={22} className={cfg.color} />
                <div>
                  <p className={`font-bold ${cfg.color}`}>Your Latest Risk Level: {cfg.label} ({latest.score}%)</p>
                  <p className="text-xs text-slate-400">From {new Date(latest.completedAt).toLocaleDateString()}</p>
                </div>
              </div>
              {latest.recommendations?.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Personalised Recommendations</p>
                  <ul className="space-y-2">
                    {latest.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                        <span className={`${cfg.color} mt-0.5 flex-shrink-0`}>→</span> {rec}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          );
        })()
      ) : (
        <div className="card text-center py-8">
          <p className="text-slate-400 text-sm mb-3">No assessment completed yet. Take one to get personalised recommendations.</p>
          <button onClick={() => navigate('/risk/start')} className="btn-primary text-sm">Take Assessment</button>
        </div>
      )}

      {/* General recommendations */}
      <div>
        <h2 className="text-base font-semibold text-slate-200 mb-3">General Security Actions</h2>
        <div className="space-y-3">
          {generalRecs.map((rec, i) => (
            <div key={i} className="card flex items-start gap-4">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 mt-0.5 ${priorityStyle[rec.priority]}`}>
                {rec.priority}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-100">{rec.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">Need personalised advice?</p>
          <p className="text-xs text-slate-400">Ask our AI Chatbot for specific guidance on any security topic.</p>
        </div>
        <button onClick={() => navigate('/risk/chatbot')} className="btn-primary flex items-center gap-2 text-sm">
          <MessageCircle size={15} /> Chat with AI
        </button>
      </div>
    </div>
  );
};

export default SecurityRecommendationsPage;
