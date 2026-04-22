import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, Scale, ShieldCheck, Plus, TrendingUp, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { incidentAPI } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, colorVar, delay = 0 }) => (
  <div className="stat-card animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <div className={`icon-wrap-${colorVar}`} style={{ width: 36, height: 36 }}>
        <Icon size={16} />
      </div>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.75rem', fontWeight: 700, color: '#e8f0ff', lineHeight: 1 }}>{value}</span>
    </div>
    <p style={{ fontSize: '0.8125rem', color: '#8ba3cc', marginTop: '0.25rem' }}>{label}</p>
  </div>
);

const QuickAction = ({ to, icon: Icon, label, sub, colorVar }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: '0.875rem 1rem',
      borderRadius: 10,
      border: '1px solid rgba(99,149,255,0.08)',
      background: 'rgba(255,255,255,0.02)',
      cursor: 'pointer',
      transition: 'all 200ms',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,149,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,149,255,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(99,149,255,0.08)'; }}
    >
      <div className={`icon-wrap-${colorVar}`} style={{ width: 34, height: 34, flexShrink: 0 }}>
        <Icon size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e8f0ff', margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: '#4d6080', margin: '1px 0 0' }}>{sub}</p>}
      </div>
      <ArrowRight size={14} style={{ color: '#4d6080', flexShrink: 0 }} />
    </div>
  </Link>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    incidentAPI.getMyHistory().then(res => setIncidents(res.data)).catch(() => {});
  }, []);

  const open = incidents.filter(i => i.status === 'OPEN').length;
  const resolved = incidents.filter(i => i.status === 'RESOLVED').length;

  const avatarSrc = user?.profileImageUrl || null;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Profile header */}
      <div className="card animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(135deg, #1e3a5f, #2d1b69)',
          border: '2px solid rgba(99,149,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 700, color: '#e8f0ff',
        }}>
          {avatarSrc
            ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
            : initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{user?.name || 'User'}</h1>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em',
              padding: '0.2rem 0.6rem', borderRadius: 100,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#c4b5fd', textTransform: 'uppercase',
            }}>{user?.role}</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#4d6080', margin: '0.25rem 0 0' }}>{user?.email}</p>
        </div>
        <Link to="/incidents/report" className="btn-primary" style={{ flexShrink: 0 }}>
          <Plus size={14} /> New Report
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem' }} className="stagger">
        <StatCard icon={AlertTriangle} label="Total Reports" value={incidents.length} colorVar="blue" delay={0} />
        <StatCard icon={Clock} label="Open Cases" value={open} colorVar="amber" delay={60} />
        <StatCard icon={CheckCircle2} label="Resolved" value={resolved} colorVar="green" delay={120} />
        <StatCard icon={TrendingUp} label="Articles Read" value="—" colorVar="violet" delay={180} />
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Quick actions */}
        <div className="card animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="section-label">Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            <QuickAction to="/incidents/report" icon={AlertTriangle} label="Report Cyber Incident" sub="Phishing, malware, breach…" colorVar="red" />
            <QuickAction to="/incidents/academic" icon={BookOpen} label="Academic Violation" sub="Plagiarism, cheating…" colorVar="orange" />
            <QuickAction to="/risk/questionnaire" icon={ShieldCheck} label="Risk Assessment" sub="Evaluate your risk level" colorVar="blue" />
            <QuickAction to="/awareness/quiz" icon={Scale} label="Awareness Quiz" sub="Test your knowledge" colorVar="violet" />
          </div>
        </div>

        {/* Recent incidents */}
        <div className="card animate-fade-up" style={{ animationDelay: '260ms' }}>
          <div className="section-label">Recent Incidents</div>
          {incidents.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <AlertTriangle size={28} style={{ color: '#2a3a50' }} />
              <span>No incidents reported yet</span>
            </div>
          ) : (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {incidents.slice(0, 5).map(inc => (
                <Link key={inc.id} to={`/incidents/${inc.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 8,
                    border: '1px solid rgba(99,149,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'all 200ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,149,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,149,255,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(99,149,255,0.08)'; }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#e8f0ff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</p>
                      <p style={{ fontSize: '0.7rem', color: '#4d6080', margin: '2px 0 0', fontFamily: "'DM Mono', monospace" }}>{new Date(inc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge-${inc.status?.toLowerCase()}`} style={{ flexShrink: 0, marginLeft: 8 }}>{inc.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
