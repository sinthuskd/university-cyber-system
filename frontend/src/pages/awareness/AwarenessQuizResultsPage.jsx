import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, BarChart2, Clock, Trophy, RefreshCw, Loader } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { awarenessAPI } from '../../services/api';

const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171';
  const bg    = score >= 80 ? 'rgba(74,222,128,0.1)' : score >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';
  return (
    <span style={{ background: bg, color, fontWeight: 700, fontSize: '0.8125rem', padding: '0.25rem 0.625rem', borderRadius: 99 }}>
      {score}%
    </span>
  );
};

const formatDuration = (secs) => {
  if (!secs) return '-';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const AwarenessQuizResultsPage = () => {
  const location = useLocation();
  const freshResult = location.state?.result;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    awarenessAPI.getMyQuizResults()
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avg = history.length
    ? Math.round(history.reduce((s, r) => s + r.score, 0) / history.length)
    : 0;
  const passed = history.filter(r => r.passed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Quiz Results</h1>
        <p className="text-sm text-slate-400 mt-1">Your quiz history and performance overview</p>
      </div>

      {/* Fresh result banner */}
      {freshResult && (
        <div className="card" style={{
          border: freshResult.score >= 70 ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(248,113,113,0.3)',
          background: freshResult.score >= 70 ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: freshResult.score >= 70 ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {freshResult.score >= 70
                ? <Trophy size={24} style={{ color: '#4ade80' }} />
                : <XCircle size={24} style={{ color: '#f87171' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1.25rem' }}>{freshResult.score}%</h2>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                {freshResult.correct} / {freshResult.total} correct &bull;{' '}
                {freshResult.score >= 70 ? '🎉 You passed!' : 'Keep practicing!'}
              </p>
            </div>
            <Link to="/awareness/quiz" style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.8125rem',
              background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
              textDecoration: 'none', border: '1px solid rgba(59,130,246,0.2)',
            }}>
              <RefreshCw size={13} /> Retake
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Avg Score', value: `${avg}%`, icon: BarChart2, color: '#60a5fa' },
          { label: 'Quizzes Passed', value: `${passed}/${history.length}`, icon: CheckCircle, color: '#4ade80' },
          { label: 'Total Taken', value: history.length, icon: Clock, color: '#c084fc' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <s.icon size={20} style={{ color: s.color, margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 700, fontSize: '1.25rem', color: '#e2e8f0' }}>{s.value}</p>
            <p style={{ fontSize: '0.75rem', color: '#4d6080' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* History table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(99,149,255,0.08)' }}>
          <h2 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9375rem' }}>Quiz History</h2>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#4d6080', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#4d6080', fontSize: '0.875rem' }}>
            No quiz results yet. <Link to="/awareness/quiz" style={{ color: '#60a5fa' }}>Take a quiz!</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(99,149,255,0.04)' }}>
                  {['Quiz', 'Score', 'Correct', 'Duration', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontSize: '0.7rem', color: '#4d6080', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid rgba(99,149,255,0.08)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < history.length - 1 ? '1px solid rgba(99,149,255,0.05)' : 'none' }}>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 500 }}>{r.quizTitle}</td>
                    <td style={{ padding: '0.875rem 1rem' }}><ScoreBadge score={r.score} /></td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>{r.correct}/{r.total}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>{formatDuration(r.durationSeconds)}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {r.passed
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4ade80', fontSize: '0.75rem' }}><CheckCircle size={12} /> Passed</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f87171', fontSize: '0.75rem' }}><XCircle size={12} /> Failed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AwarenessQuizResultsPage;
