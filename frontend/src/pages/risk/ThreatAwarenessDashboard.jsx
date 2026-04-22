import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Shield, BookOpen, Lightbulb, TrendingUp, Eye } from 'lucide-react';

const threats = [
  {
    type: 'Phishing',
    level: 'High',
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    bar: 'bg-red-500',
    percent: 78,
    desc: 'Deceptive emails/sites to steal credentials',
    icon: Eye,
  },
  {
    type: 'Ransomware',
    level: 'High',
    color: 'text-orange-400',
    bg: 'bg-orange-900/30',
    bar: 'bg-orange-500',
    percent: 72,
    desc: 'Malware that encrypts files for ransom',
    icon: AlertOctagon,
  },
  {
    type: 'Weak Passwords',
    level: 'Medium',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30',
    bar: 'bg-yellow-500',
    percent: 55,
    desc: 'Easily guessable or reused credentials',
    icon: Shield,
  },
  {
    type: 'Unpatched Software',
    level: 'Medium',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30',
    bar: 'bg-yellow-500',
    percent: 50,
    desc: 'Outdated software with known vulnerabilities',
    icon: TrendingUp,
  },
  {
    type: 'Insider Threats',
    level: 'Medium',
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    bar: 'bg-purple-500',
    percent: 42,
    desc: 'Malicious or negligent internal users',
    icon: BookOpen,
  },
  {
    type: 'Public Wi-Fi Risks',
    level: 'Low',
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    bar: 'bg-blue-500',
    percent: 30,
    desc: 'Unsecured networks exposing sensitive data',
    icon: Lightbulb,
  },
];

const ThreatAwarenessDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-bold text-slate-100">Threat Awareness Dashboard</h1>
      <p className="text-sm text-slate-400">Current cybersecurity threat landscape for university environments</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Active Threats', value: '6', color: 'text-red-400' },
        { label: 'Avg Risk Score', value: '55%', color: 'text-yellow-400' },
        { label: 'High Risk', value: '2', color: 'text-orange-400' },
        { label: 'Low Risk', value: '1', color: 'text-green-400' },
      ].map(stat => (
        <div key={stat.label} className="card text-center">
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {threats.map((threat, i) => {
        const Icon = threat.icon;
        return (
          <div key={i} className="card">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${threat.bg}`}>
                <Icon size={18} className={threat.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-100">{threat.type}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${threat.bg} ${threat.color}`}>
                    {threat.level}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{threat.desc}</p>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className={`${threat.bar} h-1.5 rounded-full`} style={{ width: `${threat.percent}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1 text-right">{threat.percent}% threat prevalence</p>
          </div>
        );
      })}
    </div>

    <div className="card">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Link to="/risk/prevention" className="btn-primary text-sm">View Prevention Tips</Link>
        <Link to="/risk/questionnaire" className="btn-secondary text-sm">Take Risk Assessment</Link>
        <Link to="/risk/chatbot" className="btn-secondary text-sm">Ask AI Chatbot</Link>
        <Link to="/risk/recommendations" className="btn-secondary text-sm">Get Recommendations</Link>
      </div>
    </div>
  </div>
);

export default ThreatAwarenessDashboard;
