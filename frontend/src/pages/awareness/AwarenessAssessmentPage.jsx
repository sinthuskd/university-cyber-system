import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AWARENESS_QUESTIONS = [
  {
    id: 1,
    category: 'Phishing',
    question: 'You receive an email claiming to be from your university IT department asking you to verify your account by clicking a link. What should you do?',
    options: [
      'Click the link and enter your credentials immediately',
      'Forward the email to colleagues to check if they got it too',
      'Verify the sender\'s email domain and contact IT directly through official channels',
      'Reply to the email asking if it is legitimate',
    ],
    correct: 2,
    explanation: 'Always verify suspicious emails through official channels. Never click links in unsolicited emails asking for credentials.',
  },
  {
    id: 2,
    category: 'Password Security',
    question: 'Which of the following is the most secure password practice?',
    options: [
      'Using the same strong password for all university accounts',
      'Using a unique 12+ character passphrase for each account with a password manager',
      'Writing down all passwords in a notebook kept at your desk',
      'Using your student ID and birth year as your password',
    ],
    correct: 1,
    explanation: 'Unique passwords for each account with a password manager is the gold standard. Reusing passwords means one breach compromises all accounts.',
  },
  {
    id: 3,
    category: 'Data Privacy',
    question: 'A colleague asks you to share student grade data via a personal Gmail account for "convenience." What should you do?',
    options: [
      'Share it since they are a trusted colleague',
      'Share only partial data to reduce risk',
      'Refuse and explain that student data must only be shared through official secure university systems',
      'Forward to your own Gmail first then share',
    ],
    correct: 2,
    explanation: 'Student data is protected by privacy laws. It must only be transmitted through officially approved, encrypted university systems.',
  },
  {
    id: 4,
    category: 'Social Engineering',
    question: 'Someone calls claiming to be from the helpdesk and asks for your university account password to "fix an urgent issue." What do you do?',
    options: [
      'Provide the password since they called you first',
      'Give them a temporary password you will change later',
      'Hang up and call the official IT helpdesk number to verify',
      'Ask them security questions before providing access',
    ],
    correct: 2,
    explanation: 'Legitimate IT staff never ask for passwords. Always call back using the official number found on the university website.',
  },
  {
    id: 5,
    category: 'Device Security',
    question: 'You leave your workstation for a 10-minute coffee break. What is the correct action?',
    options: [
      'Leave it open since you will be back quickly',
      'Lock your screen (Win+L / Cmd+Ctrl+Q) before leaving',
      'Log out completely each time',
      'Turn off the monitor',
    ],
    correct: 1,
    explanation: 'Always lock your screen when leaving your workstation, even briefly. Physical access to an unlocked computer is a major security risk.',
  },
  {
    id: 6,
    category: 'Malware',
    question: 'You find a USB drive in the university parking lot. What should you do?',
    options: [
      'Plug it in to find the owner',
      'Plug it in on a personal device to be safe',
      'Hand it to university security or IT without plugging it in',
      'Take it home and check it there',
    ],
    correct: 2,
    explanation: 'Found USB drives could contain malware designed to auto-execute. Never plug in unknown storage devices. Hand them to security.',
  },
  {
    id: 7,
    category: 'Academic Integrity',
    question: 'A student offers to pay you to access the university exam system on their behalf. This is:',
    options: [
      'Acceptable if the amount is significant',
      'A serious breach of academic integrity and potentially a criminal offense',
      'Fine if the student is struggling academically',
      'Acceptable if they are a close friend',
    ],
    correct: 1,
    explanation: 'Unauthorized access to university systems is a criminal offense under computer crime laws and a severe academic integrity violation.',
  },
  {
    id: 8,
    category: 'Network Security',
    question: 'When accessing sensitive university data from home, you should:',
    options: [
      'Use any available WiFi network for convenience',
      'Only use public library computers for security',
      'Connect through the university VPN on a secured personal network',
      'Use mobile data but disable VPN to save battery',
    ],
    correct: 2,
    explanation: 'Always use the university VPN when accessing sensitive systems remotely. This encrypts your connection and protects data in transit.',
  },
];

const TIME_LIMIT_SECONDS = 10 * 60; // 10 minutes

const AwarenessAssessmentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const timerRef = useRef(null);

  const handleSubmit = useCallback((auto = false) => {
    clearInterval(timerRef.current);
    setSubmitted(true);
    if (auto) toast.warning('⏰ Time is up! Assessment submitted.');

    // Save result to localStorage for admin to view
    const score = Object.entries(answers).filter(([qi, ans]) =>
      AWARENESS_QUESTIONS[parseInt(qi)].correct === ans
    ).length;

    const result = {
      id: Date.now(),
      userId: user?.id || 'guest',
      userName: user?.name || user?.username || 'Student',
      userEmail: user?.email || '',
      score,
      total: AWARENESS_QUESTIONS.length,
      percentage: Math.round((score / AWARENESS_QUESTIONS.length) * 100),
      answers,
      submittedAt: new Date().toISOString(),
      timeTaken: TIME_LIMIT_SECONDS - timeLeft,
    };

    const existing = JSON.parse(localStorage.getItem('awarenessAssessmentResults') || '[]');
    existing.unshift(result);
    localStorage.setItem('awarenessAssessmentResults', JSON.stringify(existing.slice(0, 200)));
  }, [answers, user, timeLeft]);

  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, submitted, handleSubmit]);

  useEffect(() => {
    if (timeLeft === 60 && started && !submitted) toast.warning('⚠️ 1 minute remaining!');
  }, [timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const timerColor = timeLeft <= 60 ? '#ef4444' : timeLeft <= 180 ? '#f59e0b' : '#22d3ee';

  const score = submitted ? Object.entries(answers).filter(([qi, ans]) =>
    AWARENESS_QUESTIONS[parseInt(qi)].correct === ans).length : 0;
  const pct = submitted ? Math.round((score / AWARENESS_QUESTIONS.length) * 100) : 0;

  if (!started) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card text-center py-8 space-y-4">
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <Shield size={26} style={{ color: '#60a5fa' }} />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Cyber Awareness Assessment</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Test your knowledge on cybersecurity, data privacy, and academic integrity. You have <strong className="text-cyan-400">10 minutes</strong> to complete {AWARENESS_QUESTIONS.length} questions.
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto text-center">
          {[['📝', AWARENESS_QUESTIONS.length + ' Qs'], ['⏱️', '10 min'], ['✅', 'Instant result']].map(([icon, label]) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 8px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setStarted(true)} className="btn-primary" style={{ minWidth: 180 }}>Start Assessment</button>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card text-center py-8 space-y-4">
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: pct >= 70 ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          {pct >= 70 ? <CheckCircle size={30} style={{ color: '#4ade80' }} /> : <XCircle size={30} style={{ color: '#ef4444' }} />}
        </div>
        <h2 className="text-xl font-bold text-slate-100">Assessment Complete</h2>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: pct >= 70 ? '#4ade80' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>{pct}%</div>
        <p className="text-slate-400 text-sm">{score} / {AWARENESS_QUESTIONS.length} correct</p>
        <p className="text-sm" style={{ color: pct >= 70 ? '#4ade80' : '#f59e0b' }}>
          {pct >= 70 ? '🎉 Well done! You demonstrate strong cybersecurity awareness.' : pct >= 50 ? '📚 Keep learning — review the topics you missed.' : '⚠️ Please complete the awareness training modules to strengthen your knowledge.'}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Review Your Answers</h3>
        {AWARENESS_QUESTIONS.map((q, i) => {
          const userAns = answers[i];
          const correct = q.correct;
          const isRight = userAns === correct;
          return (
            <div key={i} className="card space-y-3">
              <div className="flex items-start gap-2">
                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: isRight ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  {isRight ? <CheckCircle size={11} style={{ color: '#4ade80' }} /> : <XCircle size={11} style={{ color: '#ef4444' }} />}
                </span>
                <div>
                  <span className="text-xs font-medium" style={{ color: '#64748b' }}>{q.category}</span>
                  <p className="text-sm font-medium text-slate-100">{q.question}</p>
                </div>
              </div>
              <div className="space-y-1 ml-7">
                {q.options.map((opt, j) => (
                  <div key={j} style={{
                    fontSize: '0.8rem', padding: '6px 10px', borderRadius: 6,
                    background: j === correct ? 'rgba(74,222,128,0.1)' : j === userAns && !isRight ? 'rgba(239,68,68,0.1)' : 'transparent',
                    color: j === correct ? '#4ade80' : j === userAns && !isRight ? '#ef4444' : '#64748b',
                    border: j === correct ? '1px solid rgba(74,222,128,0.2)' : j === userAns && !isRight ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
                  }}>
                    {j === correct ? '✓ ' : j === userAns && !isRight ? '✗ ' : '  '}{opt}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 ml-7 italic">{q.explanation}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/awareness')} className="btn-secondary flex-1">Back to Awareness</button>
        <button onClick={() => { setStarted(false); setSubmitted(false); setAnswers({}); setCurrentQ(0); setTimeLeft(TIME_LIMIT_SECONDS); }} className="btn-primary flex-1">Retake Assessment</button>
      </div>
    </div>
  );

  const q = AWARENESS_QUESTIONS[currentQ];
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Cyber Awareness Assessment</h1>
          <p className="text-xs text-slate-500">{q.category} — Question {currentQ + 1} of {AWARENESS_QUESTIONS.length}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(15,23,42,0.8)', border: `2px solid ${timerColor}`, borderRadius: 12, padding: '8px 14px', minWidth: 110 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <Clock size={13} style={{ color: timerColor }} />
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>TIME LEFT</span>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: timerColor, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
            {formatTime(timeLeft)}
          </span>
          <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4 }}>
            <div style={{ width: `${(timeLeft / TIME_LIMIT_SECONDS) * 100}%`, height: '100%', borderRadius: 2, background: timerColor, transition: 'width 1s linear' }} />
          </div>
          {timeLeft <= 60 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
              <AlertTriangle size={10} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 700 }}>HURRY!</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {AWARENESS_QUESTIONS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2, margin: '0 1px',
              background: answers[i] !== undefined ? '#3b82f6' : i === currentQ ? '#475569' : '#1e293b',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
        <p className="text-xs text-slate-500">{Object.keys(answers).length} / {AWARENESS_QUESTIONS.length} answered</p>
      </div>

      {/* Question */}
      <div className="card space-y-4">
        <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontSize: '0.7rem', fontWeight: 600 }}>
          {q.category}
        </div>
        <p className="font-medium text-slate-100 text-base leading-relaxed">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, j) => (
            <label key={j} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderRadius: 10, border: `1px solid ${answers[currentQ] === j ? '#3b82f6' : '#1e293b'}`,
              background: answers[currentQ] === j ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <input type="radio" name={`aq-${currentQ}`} checked={answers[currentQ] === j}
                onChange={() => setAnswers({ ...answers, [currentQ]: j })} style={{ accentColor: '#3b82f6' }} />
              <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}
          className="btn-secondary flex-1" style={{ opacity: currentQ === 0 ? 0.4 : 1 }}>← Previous</button>
        {currentQ < AWARENESS_QUESTIONS.length - 1 ? (
          <button onClick={() => setCurrentQ(p => p + 1)} className="btn-primary flex-1">Next →</button>
        ) : (
          <button onClick={() => handleSubmit(false)}
            disabled={Object.keys(answers).length < AWARENESS_QUESTIONS.length}
            className="btn-primary flex-1"
            style={{ opacity: Object.keys(answers).length < AWARENESS_QUESTIONS.length ? 0.5 : 1 }}>
            Submit Assessment ✓
          </button>
        )}
      </div>

      {currentQ === AWARENESS_QUESTIONS.length - 1 && Object.keys(answers).length < AWARENESS_QUESTIONS.length && (
        <p className="text-xs text-center text-amber-400">Please answer all questions before submitting.</p>
      )}
    </div>
  );
};

export default AwarenessAssessmentPage;
