import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertTriangle, BookOpen, Filter, RefreshCw, Download } from 'lucide-react';
import { incidentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SEV_COLORS = { LOW:'#10b981', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };
const STATUS_COLORS = { OPEN:'#60a5fa', INVESTIGATING:'#f59e0b', ESCALATED:'#f97316', RESOLVED:'#10b981' };

const Badge = ({ value, map }) => (
  <span style={{ padding:'2px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:600, fontFamily:"'DM Mono',monospace", background:`${map[value]||'#8ba3cc'}18`, color: map[value]||'#8ba3cc', border:`1px solid ${map[value]||'#8ba3cc'}30` }}>{value}</span>
);

const IncidentListPage = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const load = () => {
    setLoading(true);
    incidentAPI.getAll().then(r=>setIncidents(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = incidents.filter(i => {
    const q = search.toLowerCase();
    return (
      (!q || i.title?.toLowerCase().includes(q) || i.type?.toLowerCase().includes(q) || i.reportedByName?.toLowerCase().includes(q)) &&
      (!statusFilter || i.status===statusFilter) &&
      (!typeFilter || i.type===typeFilter) &&
      (!severityFilter || i.severity===severityFilter)
    );
  });

  const exportCSV = () => {
    const rows=[['Title','Type','Severity','Status','Reporter','Date'],...filtered.map(i=>[i.title,i.type,i.severity,i.status,i.reportedByName||'',new Date(i.createdAt).toLocaleDateString()])];
    const csv=rows.map(r=>r.map(v=>`"${v||''}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='incidents.csv'; a.click();
  };

  const statCount = (key, val) => incidents.filter(i=>i[key]===val).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div className="section-label">Incidents</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>
            {user?.role==='ADMIN' ? 'All Incidents' : 'My Incidents'}
          </h1>
          <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginTop:4 }}>{incidents.length} total incident{incidents.length!==1?'s':''}</p>
        </div>
        <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 0.875rem', borderRadius:8, border:'1px solid rgba(99,149,255,0.15)', background:'transparent', color:'#8ba3cc', fontSize:'0.8rem', cursor:'pointer' }}>
            <RefreshCw size={13}/>Refresh
          </button>
          <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 0.875rem', borderRadius:8, border:'1px solid rgba(16,185,129,0.2)', background:'rgba(16,185,129,0.08)', color:'#34d399', fontSize:'0.8rem', cursor:'pointer' }}>
            <Download size={13}/>Export
          </button>
          <Link to="/incidents/report" style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 1rem', borderRadius:8, background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
            <Plus size={13}/>Report Cyber Incident
          </Link>
          <Link to="/incidents/academic" style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 1rem', borderRadius:8, border:'1px solid rgba(245,158,11,0.25)', background:'rgba(245,158,11,0.08)', color:'#fbbf24', fontSize:'0.8rem', fontWeight:500, textDecoration:'none' }}>
            <BookOpen size={13}/>Report Academic Violation
          </Link>
        </div>
      </div>

      {/* Status summary pills */}
      <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
        {[['OPEN','Open'],['INVESTIGATING','Investigating'],['ESCALATED','Escalated'],['RESOLVED','Resolved']].map(([s,l])=>(
          <button key={s} onClick={()=>setStatusFilter(p=>p===s?'':s)}
            style={{ padding:'0.35rem 0.875rem', borderRadius:20, fontSize:'0.75rem', fontWeight:500, cursor:'pointer', border:`1px solid ${STATUS_COLORS[s]}30`, background: statusFilter===s ? `${STATUS_COLORS[s]}18` : 'transparent', color: STATUS_COLORS[s], transition:'all 150ms' }}>
            {l} ({statCount('status',s)})
          </button>
        ))}
        {statusFilter && <button onClick={()=>setStatusFilter('')} style={{ padding:'0.35rem 0.625rem', borderRadius:20, fontSize:'0.72rem', color:'#4d6080', background:'transparent', border:'1px solid rgba(99,149,255,0.1)', cursor:'pointer' }}>Clear ✕</button>}
      </div>

      {/* Search & filters */}
      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, type, reporter…" className="form-input" style={{ paddingLeft:'2rem' }}/>
        </div>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="form-input" style={{ width:'auto', minWidth:170 }}>
          <option value="">All Types</option>
          <option value="PHISHING">Phishing</option>
          <option value="MALWARE">Malware</option>
          <option value="DATA_BREACH">Data Breach</option>
          <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
          <option value="ACCOUNT_HACKING">Account Hacking</option>
          <option value="DDOS">DDoS</option>
          <option value="ACADEMIC_VIOLATION">Academic Violation</option>
          <option value="OTHER">Other</option>
        </select>
        <select value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)} className="form-input" style={{ width:'auto', minWidth:140 }}>
          <option value="">All Severities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div className="card animate-fade-up" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                {user?.role==='ADMIN' && <th>Reporter</th>}
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'#4d6080' }}>Loading…</td></tr>
              ) : filtered.map((inc,i)=>(
                <tr key={inc.id}>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'#4d6080' }}>{i+1}</span></td>
                  <td>
                    <Link to={`/incidents/${inc.id}`} style={{ color:'#e8f0ff', textDecoration:'none', fontWeight:500, fontSize:'0.875rem' }}
                      onMouseEnter={e=>{ e.currentTarget.style.color='#60a5fa'; }} onMouseLeave={e=>{ e.currentTarget.style.color='#e8f0ff'; }}>
                      {inc.title}
                    </Link>
                  </td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'#8ba3cc' }}>{inc.type?.replace(/_/g,' ')}</span></td>
                  <td><Badge value={inc.severity} map={SEV_COLORS}/></td>
                  <td><Badge value={inc.status} map={STATUS_COLORS}/></td>
                  {user?.role==='ADMIN' && <td><span style={{ fontSize:'0.8rem', color:'#8ba3cc' }}>{inc.reportedByName||'—'}</span></td>}
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'#4d6080' }}>{new Date(inc.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <Link to={`/incidents/${inc.id}`} style={{ padding:'3px 10px', borderRadius:6, border:'1px solid rgba(59,130,246,0.2)', background:'rgba(59,130,246,0.07)', color:'#60a5fa', fontSize:'0.75rem', textDecoration:'none', transition:'all 150ms' }}>View</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length===0 && (
            <div className="empty-state">
              <AlertTriangle size={28} style={{ color:'#2a3a50' }}/>
              <span>{search||statusFilter||typeFilter?'No incidents match your filters':'No incidents found'}</span>
            </div>
          )}
        </div>
        <div style={{ padding:'0.75rem 1.25rem', borderTop:'1px solid rgba(99,149,255,0.08)', fontSize:'0.75rem', color:'#4d6080' }}>
          Showing {filtered.length} of {incidents.length} incident{incidents.length!==1?'s':''}
        </div>
      </div>
    </div>
  );
};
export default IncidentListPage;
