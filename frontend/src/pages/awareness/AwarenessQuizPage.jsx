import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { awarenessAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AwarenessQuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);   // seconds remaining
  const [startTime, setStartTime] = useState(null); // Date.now() when quiz started
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    awarenessAPI.getQuizzes().then(res => setQuizzes(res.data)).catch(() => {});
  }, []);

  // Cleanup timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  const startQuiz = (quiz) => {
    setSelected(quiz);
    setAnswers({});
    setStartTime(Date.now());
    if (quiz.timeLimitMinutes) {
      const secs = quiz.timeLimitMinutes * 60;
      setTimeLeft(secs);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(quiz, {}, true); // auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(null);
    }
  };

  const handleSubmit = async (quizOverride, answersOverride, autoSubmit = false) => {
    clearInterval(timerRef.current);
    const q = quizOverride || selected;
    const a = answersOverride !== undefined ? answersOverride : answers;
    const durationSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    if (autoSubmit) toast.warning('⏰ Time is up! Auto-submitting...');
    try {
      const res = await awarenessAPI.submitQuiz(q.id, a, durationSeconds);
      navigate('/awareness/quiz/results', { state: { result: res.data } });
    } catch {
      toast.error('Failed to submit quiz');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerColor = timeLeft !== null
    ? timeLeft <= 60 ? '#f87171' : timeLeft <= 180 ? '#fbbf24' : '#4ade80'
    : '#60a5fa';

  if (selected) return (
    <div style={{ maxWidth: 700, margin: '0 auto' }} className="space-y-6">
      {/* Header with timer */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 className="text-xl font-bold text-slate-100">{selected.title}</h1>
          <p className="text-sm text-slate-400">{selected.questions?.length} questions</p>
        </div>
        {timeLeft !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1rem', borderRadius: 10,
            background: timeLeft <= 60 ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.08)',
            border: `1px solid ${timerColor}40`, flexShrink: 0,
          }}>
            <Clock size={16} style={{ color: timerColor }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: '1.1rem', color: timerColor }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {timeLeft !== null && timeLeft <= 60 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 1rem', borderRadius: 8,
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          color: '#f87171', fontSize: '0.8rem',
        }}>
          <AlertTriangle size={14} /> Less than 1 minute remaining!
        </div>
      )}

      <div className="space-y-4">
        {selected.questions?.map((q, i) => (
          <div key={i} className="card">
            <p style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              {i + 1}. {q.question}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options?.map((opt, j) => (
                <label key={j} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.875rem', borderRadius: 8, cursor: 'pointer',
                  border: answers[i] === j ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(99,149,255,0.1)',
                  background: answers[i] === j ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 150ms',
                }}>
                  <input type="radio" name={`q-${i}`} value={j} checked={answers[i] === j}
                    onChange={() => setAnswers({ ...answers, [i]: j })}
                    style={{ accentColor: '#3b82f6', width: 14, height: 14 }} />
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => handleSubmit()} className="btn-primary">Submit Quiz</button>
        <button onClick={() => { clearInterval(timerRef.current); setSelected(null); setTimeLeft(null); }} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Awareness Quizzes</h1>
        <p className="text-sm text-slate-400">Test your cybersecurity knowledge</p>
      </div>
      {quizzes.length === 0 ? (
        <div className="card text-center py-12">
          <p style={{ color: '#4d6080', fontSize: '0.875rem' }}>No quizzes available yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {quizzes.map(q => (
            <div key={q.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{q.title}</h3>
                {q.description && <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{q.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                  {q.questions?.length || 0} questions
                </span>
                {q.timeLimitMinutes && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                    <Clock size={10} /> {q.timeLimitMinutes} min limit
                  </span>
                )}
              </div>
              <button onClick={() => startQuiz(q)} className="btn-primary" style={{ fontSize: '0.8125rem', marginTop: 'auto' }}>
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AwarenessQuizPage;
