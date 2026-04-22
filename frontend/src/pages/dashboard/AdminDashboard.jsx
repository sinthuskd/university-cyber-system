import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Users, CheckCircle2, Clock, Search, BarChart2, Shield, FileText, Download, TrendingUp, Activity, Settings } from 'lucide-react';
import { incidentAPI } from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE = 'http://localhost:8080/api';

const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    incidentAPI.getAll().then(res => setIncidents(res.data)).catch(() => {});
    axios.get(`${BASE}/users`).then(res => setUsers(res.data)).catch(() => {});
  }, []);

  const byStatus = (s) => incidents.filter(i => i.status === s).length;

  const filtered = incidents.filter(i =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.type?.toLowerCase().includes(search.toLowerCase()) ||
    i.reportedByName?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Incidents', value: incidents.length, icon: AlertTriangle, colorVar: 'blue' },
    { label: 'Open', value: byStatus('OPEN'), icon: Clock, colorVar: 'amber' },
    { label: 'Investigating', value: byStatus('INVESTIGATING'), icon: Activity, colorVar: 'orange' },
    { label: 'Resolved', value: byStatus('RESOLVED'), icon: CheckCircle2, colorVar: 'green' },
  ];

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await axios.get(`${BASE}/risk/report`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'security_report.pdf'; a.click();
      toast.success('Report downloaded!');
    } catch {
      // Fallback: export incidents as CSV
      const rows = [['Title','Type','Reporter','Severity','Status','Date'],
        ...incidents.map(i=>[i.title,i.type,i.reportedByName||'',i.severity,i.status,new Date(i.createdAt).toLocaleDateString()])];
      const csv = rows.map(r=>r.map(v=>`"${v||''}"`).join(',')).join('\n');
      const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='incidents_report.csv'; a.click();
      toast.success('Incidents report exported as CSV!');
    }
    finally { setGeneratingReport(false); }
  };

  const quickLinks = [
    { label:'User Management', desc:`${users.length} users`, icon:Users, to:'/admin/users', color:'blue' },
    { label:'Risk Analytics', desc:'Department insights', icon:BarChart2, to:'/risk/admin/analytics', color:'violet' },
    { label:'Ethics Committee', desc:'Review cases', icon:Shield, to:'/ethical/admin', color:'cyan' },
    { label:'Awareness Admin', desc:'Manage content', icon:Settings, to:'/awareness/admin', color:'green' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
        <div>
          <div className="section-label">Overview</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>Admin Dashboard</h1>
        </div>
        <button onClick={handleGenerateReport} disabled={generatingReport} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.575rem 1.125rem', borderRadius:9, border:'1px solid rgba(16,185,129,0.2)', background:'rgba(16,185,129,0.08)', color:'#34d399', fontSize:'0.8125rem', fontWeight:600, cursor:generatingReport?'not-allowed':'pointer', opacity:generatingReport?0.7:1, transition:'all 200ms' }}>
          <Download size={14}/>{generatingReport?'Generating…':'Generate Report'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.875rem' }} className="stagger">
        {stats.map((s,i) => (
          <div key={s.label} className="stat-card animate-fade-up" style={{ animationDelay:`${i*60}ms` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
              <div className={`icon-wrap-${s.colorVar}`} style={{ width:34, height:34 }}><s.icon size={15}/></div>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'1.75rem', fontWeight:700, color:'#e8f0ff', lineHeight:1 }}>{s.value}</span>
            </div>
            <p style={{ fontSize:'0.8rem', color:'#8ba3cc' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick admin links */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.875rem' }}>
        {quickLinks.map(q=>(
          <Link key={q.label} to={q.to} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.875rem', background:'#111d33', border:'1px solid rgba(99,149,255,0.1)', borderRadius:12, textDecoration:'none', transition:'all 200ms', cursor:'pointer' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.28)'; e.currentTarget.style.background='#142035'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.1)'; e.currentTarget.style.background='#111d33'; }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`rgba(${q.color==='blue'?'59,130,246':q.color==='violet'?'99,102,241':q.color==='cyan'?'34,211,238':'16,185,129'},0.12)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <q.icon size={17} color={q.color==='blue'?'#60a5fa':q.color==='violet'?'#a78bfa':q.color==='cyan'?'#22d3ee':'#34d399'}/>
            </div>
            <div>
              <div style={{ fontSize:'0.8125rem', fontWeight:600, color:'#e8f0ff', lineHeight:1.2 }}>{q.label}</div>
              <div style={{ fontSize:'0.72rem', color:'#4d6080', marginTop:3 }}>{q.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Incidents table */}
      <div className="card animate-fade-up" style={{ animationDelay:'240ms' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
          <h2 style={{ margin:0, fontSize:'0.9375rem', fontWeight:600 }}>All Incidents</h2>
          <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
            <div style={{ position:'relative' }}>
              <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents…"
                style={{ paddingLeft:'2rem', paddingRight:'0.875rem', paddingTop:'0.5rem', paddingBottom:'0.5rem', background:'rgba(10,18,36,0.8)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:8, color:'#e8f0ff', fontFamily:"'DM Sans',sans-serif", fontSize:'0.8125rem', outline:'none', width:220 }}
                onFocus={e=>{ e.target.style.borderColor='rgba(99,149,255,0.45)'; }} onBlur={e=>{ e.target.style.borderColor='rgba(99,149,255,0.14)'; }}
              />
            </div>
            <Link to="/admin/users" style={{ display:'flex', alignItems:'center', gap:5, padding:'0.5rem 0.875rem', borderRadius:8, border:'1px solid rgba(99,149,255,0.15)', background:'rgba(99,149,255,0.06)', color:'#8ba3cc', fontSize:'0.8rem', textDecoration:'none', transition:'all 150ms' }}
              onMouseEnter={e=>{ e.currentTarget.style.color='#e8f0ff'; e.currentTarget.style.background='rgba(99,149,255,0.1)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.color='#8ba3cc'; e.currentTarget.style.background='rgba(99,149,255,0.06)'; }}>
              <Users size={13}/>Manage Users
            </Link>
          </div>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th><th>Type</th><th>Reporter</th><th>Severity</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <tr key={inc.id}>
                  <td>
                    <Link to={`/incidents/${inc.id}`} style={{ color:'#e8f0ff', textDecoration:'none', fontWeight:500 }}
                      onMouseEnter={e=>{ e.currentTarget.style.color='#60a5fa'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.color='#e8f0ff'; }}>
                      {inc.title}
                    </Link>
                  </td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem' }}>{inc.type}</span></td>
                  <td>{inc.reportedByName||'—'}</td>
                  <td><span className={`badge-${inc.severity?.toLowerCase()}`}>{inc.severity}</span></td>
                  <td><span className={`badge-${inc.status?.toLowerCase()}`}>{inc.status}</span></td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'#4d6080' }}>{new Date(inc.createdAt).toLocaleDateString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && (
            <div className="empty-state">
              <AlertTriangle size={28} style={{ color:'#2a3a50' }}/>
              <span>{search?'No results found':'No incidents found'}</span>
            </div>
          )}
        </div>
        <div style={{ marginTop:'0.75rem', fontSize:'0.75rem', color:'#4d6080' }}>
          Showing {filtered.length} of {incidents.length} incidents
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
