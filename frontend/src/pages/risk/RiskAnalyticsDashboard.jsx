import React, { useEffect, useState, useCallback } from 'react';
import { riskAPI } from '../../services/api';
import {
  TrendingUp, Users, AlertTriangle, ShieldCheck, XCircle,
  Download, FileText, Search, Trash2, Eye, RefreshCw, Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';

/* ── helpers ── */
const RISK_CFG = {
  LOW:    { label: 'Low Risk',    color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  bar: '#4ade80' },
  MEDIUM: { label: 'Medium Risk', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', bar: '#f59e0b' },
  HIGH:   { label: 'High Risk',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  bar: '#ef4444' },
};

const fmtDate = iso =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const TABS = ['Overview', 'All Assessments'];

/* ════════════════════════════════════════════════════════ */

/* ── In-UI Confirm Modal (replaces window.confirm) ── */
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}
    onClick={onCancel}
  >
    <div
      style={{
        background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 14, padding: 28, maxWidth: 400, width: '100%',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Trash2 size={20} style={{ color: '#f87171' }} />
        <h2 style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Confirm Delete</h2>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
            color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '8px 18px', borderRadius: 8, background: 'rgba(239,68,68,0.15)',
            color: '#f87171', border: '1px solid rgba(239,68,68,0.35)',
            fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
          }}
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════ */
const RiskAnalyticsDashboard = () => {
  const [tab, setTab]             = useState('Overview');
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selected, setSelected]   = useState([]);
  const [viewRec, setViewRec]     = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }

  const openConfirm = (message, onConfirm) => setConfirmModal({ message, onConfirm });
  const closeConfirm = () => setConfirmModal(null);

  /* ── fetch backend data only — no localStorage ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const aRes = await riskAPI.getAnalytics().catch(() => ({ data: null }));
      setAnalytics(aRes.data);

      let backendRecs = [];
      try {
        const hRes = await riskAPI.getAllAssessments();
        backendRecs = Array.isArray(hRes.data) ? hRes.data : [];
      } catch {
        // endpoint may not be reachable — show empty
      }

      backendRecs.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      setRecords(backendRecs);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── derived stats ── */
  const stats = analytics && analytics.totalAssessments > 0 ? {
    total:  analytics.totalAssessments,
    avg:    analytics.avgScore || 0,
    low:    analytics.lowCount || 0,
    medium: analytics.mediumCount || 0,
    high:   analytics.highCount || 0,
  } : {
    total:  records.length,
    avg:    records.length ? Math.round(records.reduce((s, r) => s + (r.score || 0), 0) / records.length) : 0,
    low:    records.filter(r => r.riskLevel === 'LOW').length,
    medium: records.filter(r => r.riskLevel === 'MEDIUM').length,
    high:   records.filter(r => r.riskLevel === 'HIGH').length,
  };

  /* ── filtered list ── */
  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.userId || '').toString().toLowerCase().includes(q) ||
      (r.userName || '').toLowerCase().includes(q) ||
      (r.sessionId || '').toString().toLowerCase().includes(q);
    const matchLevel = filterLevel === 'all' || r.riskLevel === filterLevel;
    return matchSearch && matchLevel;
  });

  /* ── select helpers ── */
  const toggleSelect = id =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  /* ── delete selected — modal confirm ── */
  const handleDeleteSelected = () => {
    if (!selected.length) return;
    openConfirm(
      `Are you sure you want to delete ${selected.length} selected record(s)? This action cannot be undone.`,
      async () => {
        closeConfirm();
        const toDelete = [...selected];
        for (const id of toDelete) {
          try { await riskAPI.deleteAssessment(id); } catch {}
        }
        setRecords(p => p.filter(r => !toDelete.includes(r.id)));
        setSelected([]);
        toast.success(`Deleted ${toDelete.length} record(s)`);
      }
    );
  };

  /* ── delete one — modal confirm ── */
  const handleDeleteOne = (rec, closeViewModal = false) => {
    openConfirm(
      'Are you sure you want to delete this assessment record? This action cannot be undone.',
      async () => {
        closeConfirm();
        if (closeViewModal) setViewRec(null);
        try { await riskAPI.deleteAssessment(rec.id); } catch {}
        setRecords(p => p.filter(r => r.id !== rec.id));
        toast.success('Record deleted');
      }
    );
  };

  /* ── CSV export ── */
  const exportCSV = () => {
    if (!filtered.length) { toast.error('No data to export'); return; }
    const headers = ['#', 'Session ID', 'User', 'Score (%)', 'Risk Level', 'Answered', 'Total Qs', 'Auto-Submitted', 'Completed At'];
    const rows = filtered.map((r, i) => [
      i + 1,
      `"${r.sessionId || r.id || '—'}"`,
      `"${r.userName || r.userId || '—'}"`,
      r.score ?? '—',
      r.riskLevel || '—',
      r.answeredCount ?? '—',
      r.totalQuestions ?? '—',
      r.autoSubmitted ? 'Yes' : 'No',
      `"${fmtDate(r.completedAt)}"`,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `risk-assessments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  /* ── PDF export ── */
  const exportPDF = () => {
    if (!filtered.length) { toast.error('No data to export'); return; }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Risk Assessment Report</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Arial,sans-serif;color:#1e293b;padding:36px;font-size:13px;}
    .hdr{border-bottom:3px solid #3b82f6;padding-bottom:16px;margin-bottom:24px;}
    .hdr h1{font-size:20px;color:#1e40af;margin-bottom:3px;}
    .hdr p{color:#64748b;font-size:12px;}
    .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;}
    .stat{background:#f8fafc;border-radius:8px;padding:12px;text-align:center;border:1px solid #e2e8f0;}
    .stat .v{font-size:22px;font-weight:800;color:#1e40af;}
    .stat .l{font-size:11px;color:#64748b;margin-top:3px;}
    table{width:100%;border-collapse:collapse;font-size:11.5px;}
    th{background:#1e40af;color:#fff;padding:9px 8px;text-align:left;font-size:11px;}
    td{padding:8px;border-bottom:1px solid #e2e8f0;}
    tr:nth-child(even){background:#f8fafc;}
    .low{background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;}
    .medium{background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;}
    .high{background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;}
    .ftr{margin-top:24px;text-align:center;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;padding-top:12px;}
  </style>
</head>
<body>
  <div class="hdr">
    <h1>Risk Assessment Analytics Report</h1>
    <p>University Cyber Ethical System — Generated ${new Date().toLocaleString('en-GB')}</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="v">${stats.total}</div><div class="l">Total</div></div>
    <div class="stat"><div class="v" style="color:#16a34a">${stats.low}</div><div class="l">Low Risk</div></div>
    <div class="stat"><div class="v" style="color:#d97706">${stats.medium}</div><div class="l">Medium Risk</div></div>
    <div class="stat"><div class="v" style="color:#dc2626">${stats.high}</div><div class="l">High Risk</div></div>
    <div class="stat"><div class="v">${stats.avg}%</div><div class="l">Avg Score</div></div>
  </div>
  <table>
    <thead>
      <tr><th>#</th><th>User</th><th>Score</th><th>Risk Level</th><th>Answered</th><th>Auto-Submitted</th><th>Completed At</th></tr>
    </thead>
    <tbody>
      ${filtered.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.userName || r.userId || '—'}</td>
          <td><strong>${r.score ?? '—'}%</strong></td>
          <td><span class="${(r.riskLevel || 'medium').toLowerCase()}">${r.riskLevel || '—'}</span></td>
          <td>${r.answeredCount ?? '—'} / ${r.totalQuestions ?? '—'}</td>
          <td>${r.autoSubmitted ? 'Yes' : 'No'}</td>
          <td>${fmtDate(r.completedAt)}</td>
        </tr>`).join('')}
    </tbody>
  </table>
  <div class="ftr">Confidential — University Cyber Ethical System • ${filtered.length} record(s)</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) win.onload = () => win.print();
    URL.revokeObjectURL(url);
    toast.success('PDF report opened — Print → Save as PDF');
  };

  /* ── loading ── */
  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const total = stats.total || 1;

  return (
    <div className="space-y-6">

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirm}
        />
      )}

      {/* ── page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Risk Analytics Dashboard</h1>
          <p className="text-sm text-slate-400">University-wide risk assessment management</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={13} /> CSV
          </button>
          <button onClick={exportPDF} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#f87171',
            border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
          }}>
            <FileText size={13} /> PDF
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {[
          { label: 'Total',       value: stats.total,   color: '#e2e8f0', Icon: Users },
          { label: 'Avg Score',   value: stats.avg+'%', color: '#818cf8', Icon: TrendingUp },
          { label: 'Low Risk',    value: stats.low,     color: '#4ade80', Icon: ShieldCheck },
          { label: 'Medium Risk', value: stats.medium,  color: '#f59e0b', Icon: AlertTriangle },
          { label: 'High Risk',   value: stats.high,    color: '#ef4444', Icon: XCircle },
        ].map(s => (
          <div key={s.label} className="card text-center" style={{ padding: '14px 8px' }}>
            <s.Icon size={18} style={{ color: s.color, margin: '0 auto 4px' }} />
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 4 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, background: 'none', border: 'none',
            cursor: 'pointer', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
            color: tab === t ? '#60a5fa' : '#64748b', transition: 'color 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* ════════ OVERVIEW TAB ════════ */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Risk Level Distribution</h3>
            {stats.total === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No assessment data yet.</p>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Low Risk',    count: stats.low,    color: '#4ade80' },
                  { label: 'Medium Risk', count: stats.medium, color: '#f59e0b' },
                  { label: 'High Risk',   count: stats.high,   color: '#ef4444' },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.78rem', color: row.color, fontWeight: 600 }}>{row.label}</span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {row.count} &nbsp;({Math.round((row.count / total) * 100)}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5 }}>
                      <div style={{
                        width: `${(row.count / total) * 100}%`, height: '100%', borderRadius: 5,
                        background: row.color, transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Recent Assessments</h3>
            {records.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No assessments completed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['User', 'Score', 'Risk Level', 'Date'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 5).map((r, i) => {
                      const cfg = RISK_CFG[r.riskLevel] || RISK_CFG.MEDIUM;
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 10px', color: '#e2e8f0' }}>{r.userName || r.userId || '—'}</td>
                          <td style={{ padding: '8px 10px', color: cfg.color, fontWeight: 700 }}>{r.score ?? '—'}%</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 10, background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 600 }}>
                              {r.riskLevel || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#64748b', fontSize: '0.72rem' }}>{fmtDate(r.completedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ ALL ASSESSMENTS TAB ════════ */}
      {tab === 'All Assessments' && (
        <div className="space-y-4">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search by user or session ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 30, paddingRight: 10, height: 36,
                  borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0',
                  fontSize: '0.8rem', outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={13} style={{ color: '#64748b' }} />
              <select
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                style={{
                  height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0',
                  fontSize: '0.8rem', padding: '0 10px', outline: 'none',
                }}
              >
                <option value="all">All Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>
            {selected.length > 0 && (
              <button onClick={handleDeleteSelected} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.8rem', cursor: 'pointer',
              }}>
                <Trash2 size={13} /> Delete ({selected.length})
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="card text-center py-14 text-slate-500">
              {records.length === 0
                ? 'No assessments yet. Records will appear here once students complete the questionnaire.'
                : 'No records match your search.'}
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '11px 14px', width: 36 }}>
                        <input type="checkbox"
                          checked={selected.length === filtered.length && filtered.length > 0}
                          onChange={e => setSelected(e.target.checked ? filtered.map(r => r.id) : [])} />
                      </th>
                      {['#', 'User / Session', 'Score', 'Risk Level', 'Answered', 'Auto-Sub', 'Completed', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => {
                      const cfg = RISK_CFG[r.riskLevel] || RISK_CFG.MEDIUM;
                      return (
                        <tr key={r.id || i}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: selected.includes(r.id) ? 'rgba(59,130,246,0.05)' : 'transparent',
                          }}>
                          <td style={{ padding: '9px 14px' }}>
                            <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} />
                          </td>
                          <td style={{ padding: '9px 14px', color: '#94a3b8' }}>{i + 1}</td>
                          <td style={{ padding: '9px 14px' }}>
                            <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{r.userName || r.userId || '—'}</div>
                            <div style={{ color: '#475569', fontSize: '0.7rem' }}>#{(r.sessionId || r.id || '').toString().slice(-6)}</div>
                          </td>
                          <td style={{ padding: '9px 14px', fontWeight: 700, color: cfg.color, fontSize: '0.95rem' }}>
                            {r.score ?? '—'}%
                          </td>
                          <td style={{ padding: '9px 14px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 12, background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 600 }}>
                              {r.riskLevel || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '9px 14px', color: '#94a3b8' }}>
                            {r.answeredCount ?? '—'} / {r.totalQuestions ?? '—'}
                          </td>
                          <td style={{ padding: '9px 14px' }}>
                            {r.autoSubmitted
                              ? <span style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600 }}>⏰ Auto</span>
                              : <span style={{ color: '#4ade80', fontSize: '0.72rem' }}>Manual</span>}
                          </td>
                          <td style={{ padding: '9px 14px', color: '#64748b', fontSize: '0.72rem' }}>{fmtDate(r.completedAt)}</td>
                          <td style={{ padding: '9px 14px' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => setViewRec(r)}
                                style={{ padding: 5, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
                                title="View">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => handleDeleteOne(r)}
                                style={{ padding: 5, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
                                title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '9px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', color: '#64748b', fontSize: '0.72rem' }}>
                {filtered.length} of {records.length} record(s)
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── View Detail Modal ── */}
      {viewRec && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setViewRec(null)}
        >
          <div
            style={{
              background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: 28, maxWidth: 480, width: '100%',
            }}
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const cfg = RISK_CFG[viewRec.riskLevel] || RISK_CFG.MEDIUM;
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <h2 style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700 }}>Assessment Detail</h2>
                    <button onClick={() => setViewRec(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                  </div>
                  {[
                    ['User',          viewRec.userName || viewRec.userId || '—'],
                    ['Session ID',    viewRec.sessionId || viewRec.id || '—'],
                    ['Score',         (viewRec.score ?? '—') + '%'],
                    ['Risk Level',    viewRec.riskLevel || '—'],
                    ['Answered',      `${viewRec.answeredCount ?? '—'} / ${viewRec.totalQuestions ?? '—'}`],
                    ['Auto-Submitted', viewRec.autoSubmitted ? '⏰ Yes (timer expired)' : 'No'],
                    ['Completed At',  fmtDate(viewRec.completedAt)],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{k}</span>
                      <span style={{ color: k === 'Risk Level' ? cfg.color : '#e2e8f0', fontSize: '0.82rem', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => handleDeleteOne(viewRec, true)}
                    style={{
                      marginTop: 20, width: '100%', padding: '9px', borderRadius: 8,
                      background: 'rgba(239,68,68,0.1)', color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500,
                    }}>
                    Delete This Record
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalyticsDashboard;
