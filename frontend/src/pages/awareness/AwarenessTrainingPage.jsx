import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Award, ChevronRight, Download, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MODULES = [
  {
    id: 1, title: 'Phishing Awareness', duration: '15 min', category: 'Cyber Threats',
    description: 'Learn to identify and avoid phishing attacks in emails, messages, and websites.',
    steps: ['Introduction to Phishing', 'Identifying Phishing Emails', 'Reporting Phishing Attempts', 'Quiz'],
    completed: true, score: 90,
  },
  {
    id: 2, title: 'Password Security', duration: '10 min', category: 'Account Security',
    description: 'Create strong passwords and manage them securely using best practices.',
    steps: ['Why Passwords Matter', 'Strong Password Rules', 'Password Managers', 'Quiz'],
    completed: true, score: 80,
  },
  {
    id: 3, title: 'Academic Integrity', duration: '20 min', category: 'Policy',
    description: 'Understand university policies on academic honesty, plagiarism, and exam conduct.',
    steps: ['What is Academic Integrity?', 'Plagiarism Explained', 'Exam Conduct Rules', 'Quiz'],
    completed: false, score: null, locked: false,
  },
  {
    id: 4, title: 'Data Privacy & GDPR', duration: '12 min', category: 'Data Protection',
    description: 'Understand how personal data is protected and your responsibilities.',
    steps: ['GDPR Basics', 'Data Handling Practices', 'Incident Reporting', 'Quiz'],
    completed: false, score: null, locked: true,
  },
  {
    id: 5, title: 'Malware & Social Engineering', duration: '18 min', category: 'Cyber Threats',
    description: 'Recognise malware types and social engineering tactics used by attackers.',
    steps: ['Types of Malware', 'Social Engineering Tactics', 'Prevention Tips', 'Quiz'],
    completed: false, score: null, locked: true,
  },
];

const ModuleCard = ({ mod, onStart }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card" style={{
      border: mod.completed ? '1px solid rgba(74,222,128,0.2)' : mod.locked ? '1px solid rgba(99,149,255,0.04)' : '1px solid rgba(99,149,255,0.08)',
      opacity: mod.locked ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: mod.completed ? 'rgba(74,222,128,0.1)' : mod.locked ? 'rgba(99,149,255,0.05)' : 'rgba(59,130,246,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {mod.completed
            ? <CheckCircle size={18} style={{ color: '#4ade80' }} />
            : mod.locked
              ? <Lock size={16} style={{ color: '#2a3a50' }} />
              : <Circle size={18} style={{ color: '#60a5fa' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h3 style={{ fontWeight: 600, color: mod.locked ? '#2a3a50' : '#e2e8f0', fontSize: '0.9rem' }}>{mod.title}</h3>
            {mod.completed && mod.score && (
              <span style={{ fontSize: '0.75rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '0.125rem 0.5rem', borderRadius: 99 }}>
                {mod.score}%
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#4d6080', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={10} /> {mod.duration}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#4d6080', background: 'rgba(99,149,255,0.07)', padding: '0 0.375rem', borderRadius: 4 }}>
              {mod.category}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{mod.description}</p>
        </div>
      </div>

      <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {!mod.locked && (
          <>
            <button
              onClick={() => setExpanded(v => !v)}
              style={{ fontSize: '0.75rem', color: '#4d6080', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
            >
              {expanded ? 'Hide' : 'Show'} steps <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : '', transition: '200ms' }} />
            </button>
            <div style={{ flex: 1 }} />
            {mod.completed
              ? <span style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={12} /> Completed</span>
              : <button onClick={() => onStart(mod)} style={{
                  padding: '0.375rem 0.875rem', borderRadius: 7, fontSize: '0.8rem', fontWeight: 500,
                  background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)',
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}>Start Module</button>
            }
          </>
        )}
        {mod.locked && (
          <span style={{ fontSize: '0.75rem', color: '#2a3a50' }}>Complete previous modules to unlock</span>
        )}
      </div>

      {expanded && !mod.locked && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(99,149,255,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {mod.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: mod.completed ? '#4d6080' : i === 0 ? '#93c5fd' : '#2a3a50' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: mod.completed ? 'rgba(74,222,128,0.1)' : i === 0 ? 'rgba(59,130,246,0.1)' : 'rgba(99,149,255,0.04)',
                  fontSize: '0.65rem', fontWeight: 700, color: mod.completed ? '#4ade80' : i === 0 ? '#60a5fa' : '#2a3a50',
                }}>
                  {mod.completed ? '✓' : i + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AwarenessTrainingPage = () => {
  const [modules, setModules] = useState(MODULES);
  const completed = modules.filter(m => m.completed).length;
  const total = modules.length;
  const pct = Math.round((completed / total) * 100);
  const allDone = completed === total;

  const handleStart = (mod) => {
    alert(`Starting: ${mod.title} — connect this to your training backend!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Training Completion</h1>
          <p className="text-sm text-slate-400 mt-1">Track and complete your awareness training modules</p>
        </div>
        {allDone && (
          <button className="btn-primary flex items-center gap-2">
            <Download size={15} /> Download Certificate
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} style={{ color: pct === 100 ? '#fbbf24' : '#60a5fa' }} />
            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9375rem' }}>Overall Progress</span>
          </div>
          <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(99,149,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: 99, transition: 'width 600ms ease',
            background: pct === 100 ? 'linear-gradient(90deg, #4ade80, #22d3ee)' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: '#4d6080', marginTop: '0.5rem' }}>{completed} of {total} modules completed</p>
        {allDone && (
          <div style={{ marginTop: '0.75rem', padding: '0.625rem 1rem', borderRadius: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={14} /> Congratulations! You have completed all training modules.
          </div>
        )}
      </div>

      {/* Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {modules.map(mod => <ModuleCard key={mod.id} mod={mod} onStart={handleStart} />)}
      </div>
    </div>
  );
};

export default AwarenessTrainingPage;
