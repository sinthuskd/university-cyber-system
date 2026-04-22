import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, CheckCircle, Clock, TrendingUp, Search, Download, Filter, Users, BarChart2, RefreshCw, Trash2, Eye, Edit2, FileText } from 'lucide-react';
import { incidentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SEV_COLORS = { LOW:'#10b981', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };
const STATUS_COLORS = { OPEN:'#60a5fa', INVESTIGATING:'#f59e0b', ESCALATED:'#f97316', RESOLVED:'#10b981' };

const Badge = ({ value, map }) => (
  <span style={{ padding:'2px 10px', borderRadius:20, fontSize:'0.68rem', fontWeight:600, fontFamily:"'DM Mono',monospace", background:`${map[value]||'#8ba3cc'}18`, color: map[value]||'#8ba3cc', border:`1px solid ${map[value]||'#8ba3cc'}28` }}>{value}</span>
);

const AdminIncidentDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const load = () => {
    setLoading(true);
    incidentAPI.getAll().then(r=>setIncidents(r.data)).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if(!window.confirm('Delete this incident?')) return;
    try { await incidentAPI.delete(id); toast.success('Deleted'); setIncidents(p=>p.filter(i=>i.id!==id)); }
    catch { toast.error('Delete failed'); }
  };

  const handleQuickStatus = async (id, status, e) => {
    e.preventDefault(); e.stopPropagation();
    try { await incidentAPI.updateStatus(id, status); toast.success(`→ ${status}`); load(); }
    catch { toast.error('Update failed'); }
  };

  const exportCSV = () => {
    const rows = [['ID','Title','Type','Severity','Status','Reporter','Notes','Evidence','Created'],
      ...filtered.map(i=>[i.id?.slice(-8),i.title,i.type,i.severity,i.status,i.reportedByName||'',i.notes?.length||0,i.evidenceFiles?.length||0,new Date(i.createdAt).toLocaleDateString()])];
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='admin-incidents-report.csv'; a.click();
    toast.success('Report exported!');
  };

  const byStatus = (s) => incidents.filter(i=>i.status===s).length;
  const critical = incidents.filter(i=>i.severity==='CRITICAL'||i.severity==='HIGH').length;
  const needsAction = incidents.filter(i=>i.status==='OPEN'||i.status==='ESCALATED').length;

  const filtered = incidents.filter(i => {
    const q = search.toLowerCase();
    return (
      (!q || i.title?.toLowerCase().includes(q) || i.reportedByName?.toLowerCase().includes(q) || i.type?.toLowerCase().includes(q)) &&
      (!statusFilter || i.status===statusFilter) &&
      (!severityFilter || i.severity===severityFilter) &&
      (!typeFilter || i.type===typeFilter) &&
      (activeTab==='all' || (activeTab==='cyber' && i.type!=='ACADEMIC_VIOLATION') || (activeTab==='academic' && i.type==='ACADEMIC_VIOLATION') || (activeTab==='unresolved' && i.status!=='RESOLVED'))
    );
  });

  const tabStyle = (t) => ({
    padding:'0.45rem 1rem', borderRadius:8, fontSize:'0.8rem', fontWeight: activeTab===t?600:400,
    cursor:'pointer', border:'none', background: activeTab===t?'rgba(59,130,246,0.12)':'transparent', color: activeTab===t?'#60a5fa':'#4d6080', transition:'all 150ms',
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div className="section-label">Admin</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>Incident Management</h1>
          <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginTop:4 }}>Full control over all incidents and violations</p>
        </div>
        <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:5, padding:'0.5rem 0.875rem', borderRadius:8, border:'1px solid rgba(99,149,255,0.15)', background:'transparent', color:'#8ba3cc', fontSize:'0.8rem', cursor:'pointer' }}>
            <RefreshCw size={13}/>Refresh
          </button>
          <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:5, padding:'0.5rem 0.875rem', borderRadius:8, border:'1px solid rgba(16,185,129,0.2)', background:'rgba(16,185,129,0.08)', color:'#34d399', fontSize:'0.8rem', cursor:'pointer' }}>
            <Download size={13}/>Export Report
          </button>
          <Link to="/incidents/report" style={{ display:'flex', alignItems:'center', gap:5, padding:'0.5rem 1rem', borderRadius:8, background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
            + New Incident
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'0.75rem' }}>
        {[
          { label:'Total', value:incidents.length, color:'#60a5fa', icon:FileText },
          { label:'Open', value:byStatus('OPEN'), color:'#60a5fa', icon:Clock },
          { label:'Investigating', value:byStatus('INVESTIGATING'), color:'#f59e0b', icon:TrendingUp },
          { label:'Escalated', value:byStatus('ESCALATED'), color:'#f97316', icon:AlertTriangle },
          { label:'Resolved', value:byStatus('RESOLVED'), color:'#10b981', icon:CheckCircle },
          { label:'Needs Action', value:needsAction, color:'#f87171', icon:AlertTriangle },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{ padding:'0.75rem 0.875rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <s.icon size={13} color={s.color}/>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'1.4rem', fontWeight:700, color:'#e8f0ff', lineHeight:1 }}>{s.value}</span>
            </div>
            <p style={{ fontSize:'0.7rem', color:'#8ba3cc' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + filters */}
      <div className="card animate-fade-up">
        <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1rem', borderBottom:'1px solid rgba(99,149,255,0.08)', paddingBottom:'0.625rem' }}>
          {[['all','All Incidents'],['cyber','Cyber Only'],['academic','Academic Only'],['unresolved','Unresolved']].map(([t,l])=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={tabStyle(t)}>{l}</button>
          ))}
          <div style={{ marginLeft:'auto', fontSize:'0.75rem', color:'#4d6080', display:'flex', alignItems:'center' }}>
            {filtered.length} / {incidents.length}
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'1rem' }}>
          <div style={{ position:'relative', flex:1, minWidth:180 }}>
            <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents, reporter…" className="form-input" style={{ paddingLeft:'2rem' }}/>
          </div>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="form-input" style={{ width:'auto', minWidth:150 }}>
            <option value="">All Status</option>
            {['OPEN','INVESTIGATING','ESCALATED','RESOLVED'].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)} className="form-input" style={{ width:'auto', minWidth:140 }}>
            <option value="">All Severity</option>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Reporter</th>
                <th>Notes</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'#4d6080' }}>Loading…</td></tr>
              ) : filtered.map(inc=>(
                <tr key={inc.id}>
                  <td>
                    <Link to={`/incidents/${inc.id}`} style={{ color:'#e8f0ff', textDecoration:'none', fontWeight:500, fontSize:'0.8375rem' }}
                      onMouseEnter={e=>{ e.currentTarget.style.color='#60a5fa'; }} onMouseLeave={e=>{ e.currentTarget.style.color='#e8f0ff'; }}>
                      {inc.type==='ACADEMIC_VIOLATION' && <BookOpen size={11} style={{ marginRight:5, verticalAlign:'middle', color:'#fbbf24' }}/>}
                      {inc.title}
                    </Link>
                  </td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', color:'#8ba3cc' }}>{inc.type?.replace(/_/g,' ')}</span></td>
                  <td><Badge value={inc.severity} map={SEV_COLORS}/></td>
                  <td><Badge value={inc.status} map={STATUS_COLORS}/></td>
                  <td><span style={{ fontSize:'0.8rem', color:'#8ba3cc' }}>{inc.reportedByName||'—'}</span></td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'#4d6080' }}>{inc.notes?.length||0}</span></td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'#4d6080' }}>{new Date(inc.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <Link to={`/incidents/${inc.id}`} title="View" style={{ padding:'3px 8px', borderRadius:6, border:'1px solid rgba(59,130,246,0.2)', background:'rgba(59,130,246,0.07)', color:'#60a5fa', fontSize:'0.72rem', textDecoration:'none' }}>
                        <Eye size={11}/>
                      </Link>
                      <Link to={`/incidents/${inc.id}/status`} title="Update Status" style={{ padding:'3px 8px', borderRadius:6, border:'1px solid rgba(245,158,11,0.2)', background:'rgba(245,158,11,0.07)', color:'#fbbf24', fontSize:'0.72rem', textDecoration:'none' }}>
                        <Edit2 size={11}/>
                      </Link>
                      {inc.status!=='RESOLVED' && (
                        <button onClick={(e)=>handleQuickStatus(inc.id,'RESOLVED',e)} title="Mark Resolved" style={{ padding:'3px 8px', borderRadius:6, border:'1px solid rgba(16,185,129,0.2)', background:'rgba(16,185,129,0.07)', color:'#34d399', fontSize:'0.72rem', cursor:'pointer' }}>
                          <CheckCircle size={11}/>
                        </button>
                      )}
                      <button onClick={(e)=>handleDelete(inc.id,e)} title="Delete" style={{ padding:'3px 8px', borderRadius:6, border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.07)', color:'#f87171', fontSize:'0.72rem', cursor:'pointer' }}>
                        <Trash2 size={11}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length===0 && (
            <div className="empty-state"><AlertTriangle size={28} style={{ color:'#2a3a50' }}/><span>No incidents match your filters</span></div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminIncidentDashboard;
