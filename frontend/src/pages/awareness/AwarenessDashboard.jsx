// Awareness Dashboard - Main hub for cybersecurity awareness content and training

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, HelpCircle, TrendingUp, Video, GraduationCap, Award, BarChart2, Shield, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const cards = [
  {
    icon: BookOpen, label: 'Articles', color: 'blue',
    desc: 'Read curated cybersecurity articles and guides',
    to: '/awareness/articles', btn: 'Browse Articles',
  },
  {
    icon: Video, label: 'Video Resources', color: 'purple',
    desc: 'Watch training videos on cybersecurity topics',
    to: '/awareness/videos', btn: 'Watch Videos',
  },
  {
    icon: GraduationCap, label: 'Academic Integrity', color: 'amber',
    desc: 'University policies on honesty and exam conduct',
    to: '/awareness/integrity', btn: 'View Guidelines',
  },
  {
    icon: HelpCircle, label: 'Quizzes', color: 'green',
    desc: 'Test your cybersecurity knowledge with quizzes',
    to: '/awareness/quiz', btn: 'Take Quiz',
  },
  {
    icon: BarChart2, label: 'Quiz Results', color: 'cyan',
    desc: 'View your past quiz scores and performance',
    to: '/awareness/quiz/results', btn: 'View Results',
  },
  {
    icon: Award, label: 'Training', color: 'pink',
    desc: 'Complete structured awareness training modules',
    to: '/awareness/training', btn: 'Start Training',
  },
  {
    icon: ClipboardCheck, label: 'Awareness Assessment', color: 'emerald',
    desc: 'Take the timed cyber awareness assessment to evaluate your knowledge',
    to: '/awareness/assessment', btn: 'Take Assessment',
    highlight: true,
  },
];

const colorMap = {
  blue:    { bg: 'rgba(59,130,246,0.12)',   icon: '#60a5fa' },
  purple:  { bg: 'rgba(139,92,246,0.12)',   icon: '#c084fc' },
  amber:   { bg: 'rgba(245,158,11,0.12)',   icon: '#fbbf24' },
  green:   { bg: 'rgba(74,222,128,0.12)',   icon: '#4ade80' },
  cyan:    { bg: 'rgba(34,211,238,0.12)',   icon: '#22d3ee' },
  pink:    { bg: 'rgba(244,114,182,0.12)',  icon: '#f472b6' },
  emerald: { bg: 'rgba(16,185,129,0.12)',   icon: '#34d399' },
};

const AwarenessDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Cyber Awareness</h1>
          <p className="text-sm text-slate-400 mt-1">Learn about cybersecurity and academic integrity</p>
        </div>
        {user?.role === 'ADMIN' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/awareness/admin/assessments" style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500,
              background: 'rgba(16,185,129,0.12)', color: '#34d399',
              border: '1px solid rgba(16,185,129,0.25)', textDecoration: 'none',
            }}>
              <ClipboardCheck size={13} /> Manage Assessments
            </Link>
            <Link to="/awareness/admin" style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500,
              background: 'rgba(139,92,246,0.12)', color: '#c084fc',
              border: '1px solid rgba(139,92,246,0.25)', textDecoration: 'none',
            }}>
              <Shield size={13} /> Manage Content
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {cards.map(card => {
          const c = colorMap[card.color];
          const Icon = card.icon;
          return (
            <div key={card.label} className="card" style={{
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
              border: card.highlight ? `1px solid ${c.icon}30` : undefined,
              position: 'relative', overflow: 'hidden',
            }}>
              {card.highlight && (
                <div style={{ position: 'absolute', top: 8, right: 8, background: c.bg, color: c.icon, fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 8, border: `1px solid ${c.icon}40` }}>
                  TIMED
                </div>
              )}
              <div style={{ width: 42, height: 42, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} style={{ color: c.icon }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{card.label}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{card.desc}</p>
              </div>
              <Link to={card.to} style={{
                display: 'block', textAlign: 'center', padding: '0.5rem', borderRadius: 8,
                fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none',
                background: c.bg, color: c.icon, border: `1px solid ${c.bg}`,
                transition: 'opacity 200ms',
              }}>{card.btn}</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AwarenessDashboard;
