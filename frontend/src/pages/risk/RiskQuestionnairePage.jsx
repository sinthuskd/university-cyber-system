// Risk Questionnaire - Handles user risk assessment questions and responses

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { riskAPI } from '../../services/api';
import { Clock, AlertTriangle, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

/* ── Step-by-step Risk Assessment Questionnaire ─────────────── */
const RiskQuestionnairePage = () => {
  const navigate = useNavigate();
  const [questions,   setQuestions]   = useState([]);
  const [answers,     setAnswers]     = useState({});
  const [sessionId,   setSessionId]   = useState(null);
  const [current,     setCurrent]     = useState(0);   // index of shown question
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [timeLimit,   setTimeLimit]   = useState(null);
  const [timeLeft,    setTimeLeft]    = useState(null);
  const timerRef     = useRef(null);
  const submittedRef = useRef(false);

  /* ── auto-submit helper ─── */
  const doSubmit = useCallback(async (autoSubmit, currentAnswers, currentSessionId) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const res = await riskAPI.submitAnswers(currentSessionId, currentAnswers);
      const result = {
        id: Date.now(),
        sessionId: currentSessionId,
        score: res.data?.score ?? 0,
        riskLevel: res.data?.riskLevel ?? 'MEDIUM',
        completedAt: new Date().toISOString(),
        autoSubmitted: autoSubmit,
        answeredCount: Object.keys(currentAnswers).length,
        totalQuestions: questions.length,
      };
      const prev = JSON.parse(localStorage.getItem('riskAssessmentResults') || '[]');
      prev.unshift(result);
      localStorage.setItem('riskAssessmentResults', JSON.stringify(prev.slice(0, 500)));

      if (autoSubmit) toast.warning('⏰ Time is up! Assessment auto-submitted.');
      else            toast.success('Assessment submitted!');
      navigate('/risk/result');
    } catch {
      submittedRef.current = false;
      toast.error('Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }, [navigate, questions.length]);

  /* ── init ─── */
  useEffect(() => {
    const init = async () => {
      try {
        const [sessRes, qRes] = await Promise.all([
          riskAPI.startAssessment(),
          riskAPI.getQuestions(),
        ]);
        setSessionId(sessRes.data.sessionId);
        setQuestions(qRes.data);
        const saved = localStorage.getItem('riskAssessmentTimeLimit');
        if (saved) {
          const secs = parseInt(saved, 10) * 60;
          setTimeLimit(secs);
          setTimeLeft(secs);
        }
      } catch {
        toast.error('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => clearInterval(timerRef.current);
  }, []);

  /* ── countdown ─── */
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submittedRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null && !submittedRef.current ? 'running' : 'idle']); // eslint-disable-line

  /* ── auto-submit at 0 ─── */
  useEffect(() => {
    if (timeLeft === 0 && sessionId && !submittedRef.current)
      doSubmit(true, answers, sessionId);
  }, [timeLeft, sessionId, answers, doSubmit]);

  /* ── 60-sec warning ─── */
  useEffect(() => {
    if (timeLeft === 60) toast.warning('⚠️ Only 1 minute remaining!');
  }, [timeLeft]);

  const formatTime = s => {
    if (s === null) return null;
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const timerColor   = timeLeft !== null
    ? timeLeft <= 60 ? '#ef4444' : timeLeft <= 180 ? '#f59e0b' : '#22d3ee'
    : '#22d3ee';
  const timerPercent = timeLeft !== null && timeLimit ? (timeLeft / timeLimit) * 100 : 100;

  const totalQ      = questions.length;
  const answeredQ   = Object.keys(answers).length;
  const progressPct = totalQ > 0 ? (answeredQ / totalQ) * 100 : 0;
  const isLast      = current === totalQ - 1;
  const isFirst     = current === 0;
  const currentQ    = questions[current];
  const hasAnswer   = answers[current] !== undefined;

  const goNext = () => {
    if (!hasAnswer) { toast.warning('Please select an answer to continue'); return; }
    if (isLast) {
      if (answeredQ < totalQ) { toast.warning('Please answer all questions'); return; }
      doSubmit(false, answers, sessionId);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const goPrev = () => { if (!isFirst) setCurrent(c => c - 1); };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"/>
    </div>
  );

  if (totalQ === 0) return (
    <div className="card text-center py-8 text-gray-400">No questions available yet.</div>
  );

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header + Timer */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Risk Assessment Questionnaire</h1>
          <p className="text-sm text-slate-400">Question {current + 1} of {totalQ}</p>
        </div>

        {timeLeft !== null && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(15,23,42,0.9)', border: `2px solid ${timerColor}`,
            borderRadius: 12, padding: '10px 16px', minWidth: 126, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Clock size={13} style={{ color: timerColor }}/>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>TIME LEFT</span>
            </div>
            <span style={{
              fontSize: '1.65rem', fontWeight: 800, color: timerColor,
              fontVariantNumeric: 'tabular-nums', letterSpacing: 3,
              animation: timeLeft <= 10 ? 'pulse 0.5s infinite' : 'none',
            }}>{formatTime(timeLeft)}</span>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 6 }}>
              <div style={{
                width: `${timerPercent}%`, height: '100%', borderRadius: 2,
                background: timerColor, transition: 'width 1s linear, background 0.5s',
              }}/>
            </div>
            {timeLeft <= 60 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                <AlertTriangle size={11} style={{ color: '#ef4444' }}/>
                <span style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 700 }}>HURRY UP!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overall progress bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">{answeredQ} / {totalQ} answered</span>
          <span className="text-xs text-slate-400">{Math.round(progressPct)}% complete</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question step dots */}
      <div className="flex gap-1.5 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            title={`Question ${i + 1}${answers[i] !== undefined ? ' ✓' : ''}`}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
              transition: 'all 0.2s',
              background: i === current
                ? '#6366f1'
                : answers[i] !== undefined
                  ? '#22c55e'
                  : '#1e293b',
              color: i === current || answers[i] !== undefined ? '#fff' : '#64748b',
              outline: i === current ? '2px solid #818cf8' : 'none',
              outlineOffset: 2,
            }}
          >
            {answers[i] !== undefined && i !== current
              ? <CheckCircle2 size={12} style={{ display: 'inline' }}/>
              : i + 1}
          </button>
        ))}
      </div>

      {/* Current question card */}
      <div className="card" style={{
        border: hasAnswer ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.06)',
        transition: 'border 0.3s',
      }}>
        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">
          Question {current + 1} of {totalQ}
        </p>
        <p className="font-semibold text-slate-100 text-base mb-4 leading-relaxed">
          {currentQ?.question}
        </p>
        <div className="space-y-2">
          {currentQ?.options?.map((opt, j) => (
            <label
              key={j}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${answers[current] === j
                  ? 'border-indigo-500 bg-indigo-950/40'
                  : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${answers[current] === j ? '#6366f1' : '#475569'}`,
                background: answers[current] === j ? '#6366f1' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {answers[current] === j && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }}/>
                )}
              </div>
              <input
                type="radio"
                name={`q-${current}`}
                checked={answers[current] === j}
                onChange={() => setAnswers(prev => ({ ...prev, [current]: j }))}
                style={{ display: 'none' }}
              />
              <span className="text-sm text-slate-100">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="btn-secondary flex items-center gap-2 flex-1"
        >
          <ChevronLeft size={16}/> Previous
        </button>

        <button
          onClick={goNext}
          disabled={submitting || !hasAnswer}
          className="btn-primary flex items-center gap-2 flex-1 justify-center"
          style={{ opacity: !hasAnswer ? 0.5 : 1 }}
        >
          {submitting
            ? 'Submitting...'
            : isLast
              ? <><CheckCircle2 size={16}/> Submit Assessment</>
              : <>Next <ChevronRight size={16}/></>}
        </button>
      </div>

      {/* Skipped warning */}
      {answeredQ < totalQ && isLast && hasAnswer && (
        <p className="text-xs text-yellow-400 text-center">
          ⚠️ {totalQ - answeredQ} question{totalQ - answeredQ > 1 ? 's' : ''} unanswered — use the dots above to go back
        </p>
      )}
    </div>
  );
};

export default RiskQuestionnairePage;
