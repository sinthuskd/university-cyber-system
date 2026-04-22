import React, { useEffect, useState } from 'react';
import { riskAPI } from '../../services/api';
import { Building2, Download, FileText, Search, RefreshCw, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

/* ── helpers ─────────────────────────────────────────────── */
const riskColor = score =>
  score > 60 ? '#ef4444' : score > 35 ? '#f59e0b' : '#4ade80';

const riskLabel = score =>
  score > 60 ? 'HIGH' : score > 35 ? 'MEDIUM' : 'LOW';

/* ── PDF generation (print-based, no external lib) ───────── */
const generatePDF = (data, summary) => {
  const now = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const rowsHtml = data.map((d, i) => {
    const rl = riskLabel(d.avgScore);
    const rc = riskColor(d.avgScore);
    const total = (d.lowCount + d.mediumCount + d.highCount) || 1;
    const lowW  = Math.round((d.lowCount    / total) * 100);
    const medW  = Math.round((d.mediumCount / total) * 100);
    const hiW   = Math.round((d.highCount   / total) * 100);
    return `<tr style="background:${i % 2 === 0 ? '#0f172a' : '#111827'}">
      <td style="padding:10px 14px;color:#e2e8f0;font-weight:600">${d.department}</td>
      <td style="padding:10px 14px;color:#94a3b8;text-align:center">${d.totalUsers ?? (d.lowCount+d.mediumCount+d.highCount)}</td>
      <td style="padding:10px 14px;text-align:center;font-size:1.05rem;font-weight:700;color:${rc}">${d.avgScore}%</td>
      <td style="padding:10px 14px;text-align:center"><span style="background:rgba(74,222,128,0.15);color:#4ade80;padding:3px 10px;border-radius:20px;font-size:0.78rem">${d.lowCount}</span></td>
      <td style="padding:10px 14px;text-align:center"><span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:3px 10px;border-radius:20px;font-size:0.78rem">${d.mediumCount}</span></td>
      <td style="padding:10px 14px;text-align:center"><span style="background:rgba(239,68,68,0.15);color:#ef4444;padding:3px 10px;border-radius:20px;font-size:0.78rem">${d.highCount}</span></td>
      <td style="padding:10px 14px">
        <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:#1e293b">
          <div style="width:${lowW}%;background:#4ade80"></div>
          <div style="width:${medW}%;background:#f59e0b"></div>
          <div style="width:${hiW}%;background:#ef4444"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:3px">
          <span style="font-size:0.65rem;color:#64748b">L ${lowW}%</span>
          <span style="font-size:0.65rem;color:#64748b">M ${medW}%</span>
          <span style="font-size:0.65rem;color:#64748b">H ${hiW}%</span>
        </div>
      </td>
      <td style="padding:10px 14px;text-align:center">
        <span style="color:${rc};font-size:0.72rem;font-weight:700;letter-spacing:0.5px">${rl}</span>
      </td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>Department Risk Report</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Segoe UI',sans-serif; background:#0a0f1e; color:#e2e8f0; padding:36px; }
.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:18px; border-bottom:1px solid rgba(99,102,241,0.3); }
.title { font-size:1.5rem; font-weight:800; color:#a5b4fc; }
.subtitle { font-size:0.82rem; color:#64748b; margin-top:4px; }
.meta { text-align:right; font-size:0.75rem; color:#64748b; line-height:1.7; }
.cards { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
.card { background:#0f172a; border:1px solid rgba(99,102,241,0.2); border-radius:10px; padding:14px 16px; }
.card-label { font-size:0.68rem; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
.card-value { font-size:1.4rem; font-weight:800; }
table { width:100%; border-collapse:collapse; border:1px solid rgba(99,102,241,0.2); border-radius:10px; overflow:hidden; }
thead { background:#1e293b; }
th { padding:10px 14px; font-size:0.7rem; color:#64748b; text-transform:uppercase; letter-spacing:0.8px; text-align:center; }
th:first-child { text-align:left; }
.footer { margin-top:20px; text-align:center; font-size:0.7rem; color:#475569; }
@media print { body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }
</style></head><body>
  <div class="header">
    <div>
      <div class="title">🏛️ Department Risk Analysis Report</div>
      <div class="subtitle">Cybersecurity Risk Breakdown by University Department</div>
    </div>
    <div class="meta">Generated: ${now}<br/>Departments: ${data.length}<br/>Total Assessments: ${summary.totalAssessments}</div>
  </div>
  <div class="cards">
    <div class="card"><div class="card-label">Departments</div><div class="card-value" style="color:#a5b4fc">${summary.total}</div></div>
    <div class="card"><div class="card-label">Overall Avg Risk</div><div class="card-value" style="color:${riskColor(summary.avgScore)}">${summary.avgScore}%</div></div>
    <div class="card"><div class="card-label">Highest Risk</div><div class="card-value" style="color:#ef4444;font-size:0.95rem;margin-top:4px">${summary.highestDept}</div></div>
    <div class="card"><div class="card-label">Total Assessments</div><div class="card-value" style="color:#38bdf8">${summary.totalAssessments}</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Department</th>
        <th>Users</th>
        <th>Avg Score</th>
        <th>Low</th>
        <th>Medium</th>
        <th>High</th>
        <th>Distribution</th>
        <th>Level</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="footer">University Cybersecurity & Ethics System — ${now}</div>
</body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
};

/* ── CSV export ─────────────────────────────────────────── */
const exportCSV = (data) => {
  const header = ['Department','Total Users','Total Assessments','Avg Score (%)','Low Risk','Medium Risk','High Risk','Risk Level'];
  const rows = data.map(d => [
    `"${d.department}"`,
    d.totalUsers ?? '-',
    d.totalAssessments ?? (d.lowCount + d.mediumCount + d.highCount),
    d.avgScore,
    d.lowCount,
    d.mediumCount,
    d.highCount,
    riskLabel(d.avgScore),
  ]);
  const csv  = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `department-risk-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ═══════════════════════════════════════════════════════════ */
const DepartmentRiskAnalysis = () => {
  const [deptData,   setDeptData]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [sortBy,     setSortBy]     = useState('avgScore');
  const [search,     setSearch]     = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const load = () => {
    setLoading(true);
    riskAPI.getDepartmentAnalytics()
      .then(res => {
        const data = res.data;
        setDeptData(Array.isArray(data) && data.length > 0 ? data : []);
      })
      .catch(() => { toast.error('Failed to load department data'); setDeptData([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = deptData
    .filter(d => d.department.toLowerCase().includes(search.toLowerCase()))
    .filter(d => filterRisk === 'ALL' || riskLabel(d.avgScore) === filterRisk)
    .sort((a, b) => {
      if (sortBy === 'department') return a.department.localeCompare(b.department);
      return b[sortBy] - a[sortBy];
    });

  const summary = {
    total: deptData.length,
    avgScore: deptData.length
      ? Math.round(deptData.reduce((s, d) => s + d.avgScore, 0) / deptData.length) : 0,
    highestDept: deptData.length
      ? [...deptData].sort((a, b) => b.avgScore - a.avgScore)[0]?.department : '—',
    totalAssessments: deptData.reduce((s, d) =>
      s + (d.totalAssessments ?? (d.lowCount + d.mediumCount + d.highCount)), 0),
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Department Risk Analysis</h1>
          <p className="text-sm text-slate-400">Live backend data · Cybersecurity risk by department</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14}/> Refresh
          </button>
          <button
            onClick={() => { exportCSV(filtered); toast.success('CSV downloaded!'); }}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download size={14}/> CSV
          </button>
          <button
            onClick={() => generatePDF(filtered, summary)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FileText size={14}/> PDF Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && deptData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Departments',       value: summary.total,             color: '#a5b4fc', icon: <Building2 size={15}/> },
            { label: 'Overall Avg Risk',  value: `${summary.avgScore}%`,    color: riskColor(summary.avgScore), icon: <TrendingUp size={15}/> },
            { label: 'Total Assessments', value: summary.totalAssessments,  color: '#38bdf8', icon: <Users size={15}/> },
            { label: 'High Risk Depts',   value: deptData.filter(d => riskLabel(d.avgScore) === 'HIGH').length, color: '#ef4444', icon: <AlertTriangle size={15}/> },
          ].map((c, i) => (
            <div key={i} className="card flex items-center gap-3">
              <div style={{ color: c.color }}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-400">{c.label}</p>
                <p className="text-lg font-bold" style={{ color: c.color }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input
            type="text"
            placeholder="Search department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-8 w-full"
          />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input">
          <option value="avgScore">Sort: Avg Score</option>
          <option value="highCount">Sort: High Risk Count</option>
          <option value="totalUsers">Sort: Users</option>
          <option value="department">Sort: Name (A–Z)</option>
        </select>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="form-input">
          <option value="ALL">All Risk Levels</option>
          <option value="HIGH">High Risk Only</option>
          <option value="MEDIUM">Medium Risk Only</option>
          <option value="LOW">Low Risk Only</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"/>
        </div>
      )}

      {/* Empty state */}
      {!loading && deptData.length === 0 && (
        <div className="card text-center py-12">
          <Building2 size={40} className="mx-auto text-slate-600 mb-3"/>
          <p className="text-slate-400 font-medium">No department data yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Data appears once users with departments complete risk assessments.
          </p>
        </div>
      )}

      {/* No filter match */}
      {!loading && deptData.length > 0 && filtered.length === 0 && (
        <div className="card text-center py-8 text-slate-400">No departments match your filters.</div>
      )}

      {/* Department cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((dept, i) => {
            const total = (dept.lowCount + dept.mediumCount + dept.highCount) || 1;
            const rc    = riskColor(dept.avgScore);
            const rl    = riskLabel(dept.avgScore);
            const rlBg  = rl === 'HIGH' ? 'rgba(239,68,68,0.1)' : rl === 'MEDIUM' ? 'rgba(245,158,11,0.1)' : 'rgba(74,222,128,0.1)';
            return (
              <div key={i} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-indigo-300"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-100">{dept.department}</p>
                    <p className="text-xs text-slate-400">
                      {dept.totalUsers != null ? `${dept.totalUsers} users` : ''}
                      {dept.totalAssessments != null
                        ? ` · ${dept.totalAssessments} assessments`
                        : ` · ${total} assessments`}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-xl font-bold" style={{ color: rc }}>{dept.avgScore}%</p>
                    <span style={{ background: rlBg, color: rc, fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, padding: '2px 8px', borderRadius: 20 }}>
                      {rl} RISK
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center bg-green-900/20 rounded-lg py-2">
                    <p className="text-sm font-bold text-green-400">{dept.lowCount}</p>
                    <p className="text-xs text-slate-500">Low</p>
                  </div>
                  <div className="text-center bg-yellow-900/20 rounded-lg py-2">
                    <p className="text-sm font-bold text-yellow-400">{dept.mediumCount}</p>
                    <p className="text-xs text-slate-500">Medium</p>
                  </div>
                  <div className="text-center bg-red-900/20 rounded-lg py-2">
                    <p className="text-sm font-bold text-red-400">{dept.highCount}</p>
                    <p className="text-xs text-slate-500">High</p>
                  </div>
                </div>

                <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-800">
                  <div className="bg-green-500"  style={{ width: `${(dept.lowCount    / total) * 100}%` }}/>
                  <div className="bg-yellow-500" style={{ width: `${(dept.mediumCount / total) * 100}%` }}/>
                  <div className="bg-red-500"    style={{ width: `${(dept.highCount   / total) * 100}%` }}/>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">Low {Math.round((dept.lowCount    / total) * 100)}%</span>
                  <span className="text-xs text-slate-500">Med {Math.round((dept.mediumCount / total) * 100)}%</span>
                  <span className="text-xs text-slate-500">High {Math.round((dept.highCount  / total) * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentRiskAnalysis;
