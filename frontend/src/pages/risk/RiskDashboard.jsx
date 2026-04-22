import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ClipboardList, MessageCircle, History,
  AlertOctagon, Lightbulb, UserCheck, TrendingUp, Play
} from 'lucide-react';
import { riskAPI } from '../../services/api';

const RiskDashboard = () => {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    riskAPI.getHistory()
      .then(res => setLatest(res.data?.[0] || null))
      .catch(() => {});
  }, []);

  const levelColor = {
    LOW: 'text-green-400', MEDIUM: 'text-yellow-400', HIGH: 'text-red-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Risk Assessment & Prevention</h1>
          <p className="text-sm text-slate-400">Evaluate cybersecurity risks and get AI-powered recommendations</p>
        </div>
        {latest && (
          <div className="card text-right py-2 px-4">
            <p className="text-xs text-slate-400">Last Assessment</p>
            <p className={`text-lg font-bold ${levelColor[latest.riskLevel] || 'text-slate-100'}`}>
              {latest.score}% — {latest.riskLevel}
            </p>
          </div>
        )}
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Play size={22} className="text-green-400" />
          </div>
          <h3 className="font-semibold text-slate-100">Start Assessment</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">Answer 8 questions to evaluate your risk level</p>
          <Link to="/risk/start" className="btn-primary text-sm">Begin Now</Link>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={22} className="text-indigo-300" />
          </div>
          <h3 className="font-semibold text-slate-100">My Results</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">View latest assessment results and scores</p>
          <Link to="/risk/result" className="btn-secondary text-sm">View Results</Link>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={22} className="text-purple-300" />
          </div>
          <h3 className="font-semibold text-slate-100">AI Chatbot</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">Get instant cybersecurity advice via Google Gemini AI</p>
          <Link to="/risk/chatbot" className="btn-primary text-sm">Chat Now</Link>
        </div>
      </div>

      {/* Secondary pages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: History,      label: 'Assessment History',    path: '/risk/history',         color: 'text-blue-400' },
          { icon: UserCheck,    label: 'Personal Security',     path: '/risk/personal',        color: 'text-teal-400' },
          { icon: AlertOctagon, label: 'Threat Awareness',      path: '/risk/threats',         color: 'text-orange-400' },
          { icon: Lightbulb,    label: 'Prevention Tips',       path: '/risk/prevention',      color: 'text-yellow-400' },
          { icon: ShieldCheck,  label: 'Recommendations',       path: '/risk/recommendations', color: 'text-green-400' },
          { icon: MessageCircle,label: 'Chat History',          path: '/risk/chat-history',    color: 'text-purple-400' },
          { icon: ClipboardList,label: 'Questionnaire',         path: '/risk/questionnaire',   color: 'text-indigo-400' },
          { icon: TrendingUp,   label: 'Risk Results',          path: '/risk/result',          color: 'text-pink-400' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}
              className="card flex items-center gap-3 hover:border-slate-600 transition-colors group">
              <Icon size={16} className={`${item.color} flex-shrink-0`} />
              <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RiskDashboard;
