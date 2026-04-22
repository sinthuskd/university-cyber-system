import React, { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Users, TrendingUp, Award, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminAssessmentManagementPage = () => {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('awarenessAssessmentResults') || '[]');
    setResults(stored);
  }, []);

  const getGrade = (pct) => {
    if (pct >= 80) return { label: 'Excellent', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' };
    if (pct >= 60) return { label: 'Good', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' };
    if (pct >= 40) return { label: 'Fair', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'Poor', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (iso) => new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const filtered = results.filter(r => {
    const matchSearch = r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(search.toLowerCase());
    const g = getGrade(r.percentage);
    const matchGrade = filterGrade === 'all' || g.label.toLowerCase() === filterGrade;
    return matchSearch && matchGrade;
  });

  const stats = {
    total: results.length,
    avgPct: results.length ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0,
    passed: results.filter(r => r.percentage >= 60).length,
    excellent: results.filter(r => r.percentage >= 80).length,
  };

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleDeleteSelected = () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected record(s)?`)) return;
    const updated = results.filter(r => !selected.includes(r.id));
    setResults(updated);
    localStorage.setItem('awarenessAssessmentResults', JSON.stringify(updated));
    setSelected([]);
    toast.success(`Deleted ${selected.length} record(s)`);
  };

  const handleDeleteAll = () => {
    if (!window.confirm('Delete ALL assessment records? This cannot be undone.')) return;
    setResults([]);
    setSelected([]);
    localStorage.removeItem('awarenessAssessmentResults');
    toast.success('All records cleared');
  };

  // CSV Export
  const exportCSV = () => {
    if (!filtered.length) { toast.error('No data to export'); return; }
    const headers = ['Name', 'Email', 'Score', 'Total', 'Percentage', 'Grade', 'Time Taken', 'Submitted At'];
    const rows = filtered.map(r => [
      `"${r.userName}"`, `"${r.userEmail}"`, r.score, r.total, r.percentage + '%',
      `"${getGrade(r.percentage).label}"`, `"${formatDuration(r.timeTaken)}"`,
      `"${formatDate(r.submittedAt)}"`,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `awareness-assessments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  // PDF Export
  const exportPDF = () => {
    if (!filtered.length) { toast.error('No data to export'); return; }

    const avg = stats.avgPct;
    const passRate = results.length ? Math.round((stats.passed / results.length) * 100) : 0;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Awareness Assessment Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; }
    .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 22px; color: #1e40af; margin-bottom: 4px; }
    .header p { color: #64748b; font-size: 13px; }
    .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 30px; }
    .stat { background: #f8fafc; border-radius: 8px; padding: 14px; text-align: center; border: 1px solid #e2e8f0; }
    .stat .value { font-size: 24px; font-weight: 800; color: #1e40af; }
    .stat .label { font-size: 11px; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; }
    td { padding: 9px 8px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .excellent { background: #dcfce7; color: #16a34a; }
    .good { background: #cffafe; color: #0e7490; }
    .fair { background: #fef3c7; color: #d97706; }
    .poor { background: #fee2e2; color: #dc2626; }
    .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ Cyber Awareness Assessment Report</h1>
    <p>University Cyber Ethical System — Generated ${new Date().toLocaleString('en-GB')}</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="value">${stats.total}</div><div class="label">Total Submissions</div></div>
    <div class="stat"><div class="value">${avg}%</div><div class="label">Average Score</div></div>
    <div class="stat"><div class="value">${passRate}%</div><div class="label">Pass Rate (≥60%)</div></div>
    <div class="stat"><div class="value">${stats.excellent}</div><div class="label">Excellent (≥80%)</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Student Name</th><th>Email</th><th>Score</th><th>Percentage</th><th>Grade</th><th>Time Taken</th><th>Submitted At</th>
      </tr>
    </thead>
    <tbody>
      ${filtered.map((r, i) => {
        const g = getGrade(r.percentage);
        const cls = g.label.toLowerCase();
        return `<tr>
          <td>${i + 1}</td>
          <td>${r.userName}</td>
          <td>${r.userEmail || '—'}</td>
          <td>${r.score} / ${r.total}</td>
          <td>${r.percentage}%</td>
          <td><span class="badge ${cls}">${g.label}</span></td>
          <td>${formatDuration(r.timeTaken)}</td>
          <td>${formatDate(r.submittedAt)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  <div class="footer">Confidential — University Cyber Ethical System • ${filtered.length} record(s) shown</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => { win.print(); };
      toast.success('PDF report opened — use browser Print → Save as PDF');
    }
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Assessment Management</h1>
          <p className="text-sm text-slate-400">Manage and review all student cyber awareness assessments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={exportPDF} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
            background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',
            fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
          }}>
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { icon: Users, label: 'Total Submissions', value: stats.total, color: '#60a5fa' },
          { icon: TrendingUp, label: 'Average Score', value: stats.avgPct + '%', color: '#22d3ee' },
          { icon: Award, label: 'Passed (≥60%)', value: stats.passed, color: '#4ade80' },
          { icon: Award, label: 'Excellent (≥80%)', value: stats.excellent, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 30, paddingRight: 10, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: '0.8rem', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} style={{ color: '#64748b' }} />
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
            style={{ height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: '0.8rem', padding: '0 10px', outline: 'none' }}>
            <option value="all">All Grades</option>
            <option value="excellent">Excellent (≥80%)</option>
            <option value="good">Good (60–79%)</option>
            <option value="fair">Fair (40–59%)</option>
            <option value="poor">Poor (&lt;40%)</option>
          </select>
        </div>
        {selected.length > 0 && (
          <button onClick={handleDeleteSelected} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
            background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',
            fontSize: '0.8rem', cursor: 'pointer',
          }}>
            <Trash2 size={13} /> Delete ({selected.length})
          </button>
        )}
        {results.length > 0 && (
          <button onClick={handleDeleteAll} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
            background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.75rem', cursor: 'pointer',
          }}>
            Clear All
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          {results.length === 0 ? 'No assessments submitted yet. Students can take the assessment from the Awareness Dashboard.' : 'No records match your search.'}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500, width: 36 }}>
                    <input type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={e => setSelected(e.target.checked ? filtered.map(r => r.id) : [])} />
                  </th>
                  {['Student', 'Score', 'Grade', 'Time Taken', 'Submitted At', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const g = getGrade(r.percentage);
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: selected.includes(r.id) ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} />
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{r.userName}</div>
                        <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{r.userEmail || '—'}</div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 700, color: g.color, fontSize: '1rem' }}>{r.percentage}%</div>
                        <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{r.score}/{r.total} correct</div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: g.bg, color: g.color, fontSize: '0.72rem', fontWeight: 600 }}>
                          {g.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#94a3b8' }}>{formatDuration(r.timeTaken)}</td>
                      <td style={{ padding: '10px 16px', color: '#64748b', fontSize: '0.72rem' }}>{formatDate(r.submittedAt)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <button onClick={() => {
                          const updated = results.filter(x => x.id !== r.id);
                          setResults(updated);
                          localStorage.setItem('awarenessAssessmentResults', JSON.stringify(updated));
                          toast.success('Record deleted');
                        }} style={{ padding: '4px', color: '#475569', cursor: 'pointer', background: 'none', border: 'none' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', color: '#64748b', fontSize: '0.72rem' }}>
            Showing {filtered.length} of {results.length} records
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssessmentManagementPage;
