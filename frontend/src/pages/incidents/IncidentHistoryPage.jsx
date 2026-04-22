import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, Clock, CheckCircle, TrendingUp, Search, Calendar, FileText } from 'lucide-react';
import { incidentAPI } from '../../services/api';

const SEV_COLORS = { LOW:'#10b981', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };
const STATUS_COLORS = { OPEN:'#60a5fa', INVESTIGATING:'#f59e0b', ESCALATED:'#f97316', RESOLVED:'#10b981' };
const STATUS_ICONS = { OPEN: Clock, INVESTIGATING: TrendingUp, ESCALATED: AlertTriangle, RESOLVED: CheckCircle };

const IncidentHistoryPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    incidentAPI.getMyHistory()
      .then(r=>setIncidents(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = incidents.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || i.title?.toLowerCase().includes(q) || i.type?.toLowerCase().includes(q);
    const matchF = filter==='ALL' || i.status===filter || (filter==='ACADEMIC' && i.type==='ACADEMIC_VIOLATION') || (filter==='CYBER' && i.type!=='ACADEMIC_VIOLATION');
    return matchQ && matchF;
  });

  const cyberCount = incidents.filter(i=>i.type!=='ACADEMIC_VIOLATION').length;
  const academicCount = incidents.filter(i=>i.type==='ACADEMIC_VIOLATION').length;
  const resolvedCount = incidents.filter(i=>i.status==='RESOLVED').length;

  if(loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}><div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(99,149,255,0.2)', borderTopColor:'#3b82f6', animation:'spin 0.8s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up">
        <div className="section-label">Incidents</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>My Incident History</h1>
        <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginTop:4 }}>All incidents and violations you have reported</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.875rem' }}>
        {[
          { label:'Total Reports', value:incidents.length, color:'#60a5fa', icon:FileText },
          { label:'Cyber Incidents', value:cyberCount, color:'#f87171', icon:AlertTriangle },
          { label:'Academic', value:academicCount, color:'#fbbf24', icon:BookOpen },
          { label:'Resolved', value:resolvedCount, color:'#34d399', icon:CheckCircle },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <s.icon size={15} color={s.color}/>
              </div>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'1.75rem', fontWeight:700, color:'#e8f0ff', lineHeight:1 }}>{s.value}</span>
            </div>
            <p style={{ fontSize:'0.78rem', color:'#8ba3cc' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reports…" className="form-input" style={{ paddingLeft:'2rem' }}/>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['ALL','All'],['CYBER','Cyber'],['ACADEMIC','Academic'],['OPEN','Open'],['RESOLVED','Resolved']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ padding:'0.45rem 0.875rem', borderRadius:7, border:'1px solid rgba(99,149,255,0.14)', fontSize:'0.75rem', cursor:'pointer', background: filter===v?'rgba(59,130,246,0.12)':'transparent', color: filter===v?'#60a5fa':'#4d6080', fontWeight: filter===v?600:400, transition:'all 150ms' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length===0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(99,149,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
            <FileText size={24} color="#4d6080"/>
          </div>
          <div style={{ fontSize:'0.9375rem', fontWeight:500, color:'#e8f0ff', marginBottom:8 }}>{search?'No matching reports':'No reports yet'}</div>
          <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginBottom:'1.25rem' }}>
            {search ? 'Try a different search term.' : 'You haven\'t reported any incidents or violations yet.'}
          </p>
          <div style={{ display:'flex', gap:'0.625rem', justifyContent:'center' }}>
            <Link to="/incidents/report" className="btn-primary" style={{ fontSize:'0.8125rem' }}>Report Cyber Incident</Link>
            <Link to="/incidents/academic" className="btn-secondary" style={{ fontSize:'0.8125rem' }}>Report Academic Violation</Link>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {filtered.map((inc) => {
            const isAcademic = inc.type==='ACADEMIC_VIOLATION';
            const StatusIcon = STATUS_ICONS[inc.status]||Clock;
            return (
              <Link key={inc.id} to={`/incidents/${inc.id}`} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem', background:'#111d33', border:'1px solid rgba(99,149,255,0.1)', borderRadius:12, textDecoration:'none', transition:'all 200ms' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.28)'; e.currentTarget.style.background='#142035'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.1)'; e.currentTarget.style.background='#111d33'; }}>
                <div style={{ width:40, height:40, borderRadius:10, background: isAcademic?'rgba(245,158,11,0.12)':'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {isAcademic ? <BookOpen size={18} color="#fbbf24"/> : <AlertTriangle size={18} color="#f87171"/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#e8f0ff', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inc.title}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'0.72rem', fontFamily:"'DM Mono',monospace", color:'#4d6080' }}>{inc.type?.replace(/_/g,' ')}</span>
                    <span style={{ fontSize:'0.72rem', color:'#4d6080' }}>•</span>
                    <span style={{ fontSize:'0.72rem', color:'#4d6080', display:'flex', alignItems:'center', gap:3 }}><Calendar size={10}/>{new Date(inc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                  <span style={{ padding:'2px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:600, fontFamily:"'DM Mono',monospace", background:`${SEV_COLORS[inc.severity]||'#8ba3cc'}18`, color:SEV_COLORS[inc.severity]||'#8ba3cc', border:`1px solid ${SEV_COLORS[inc.severity]||'#8ba3cc'}30` }}>{inc.severity}</span>
                  <span style={{ padding:'2px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:600, fontFamily:"'DM Mono',monospace", background:`${STATUS_COLORS[inc.status]||'#8ba3cc'}18`, color:STATUS_COLORS[inc.status]||'#8ba3cc', border:`1px solid ${STATUS_COLORS[inc.status]||'#8ba3cc'}30`, display:'flex', alignItems:'center', gap:3 }}>
                    <StatusIcon size={9}/>{inc.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length>0 && (
        <div style={{ fontSize:'0.75rem', color:'#4d6080' }}>Showing {filtered.length} of {incidents.length} reports</div>
      )}
    </div>
  );
};
export default IncidentHistoryPage;
