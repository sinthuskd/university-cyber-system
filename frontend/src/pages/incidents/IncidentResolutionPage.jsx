import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Shield, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { incidentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const IncidentResolutionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incident, setIncident] = useState(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentAPI.getById(id).then(r=>setIncident(r.data)).catch(()=>toast.error('Not found')).finally(()=>setLoading(false));
  }, [id]);

  const handleResolve = async () => {
    if(!resolution.trim()){ toast.error('Please provide a resolution summary.'); return; }
    setResolving(true);
    try {
      await incidentAPI.updateStatus(id, 'RESOLVED');
      await incidentAPI.addNote(id, `[RESOLUTION] ${resolution}`);
      toast.success('Incident resolved successfully!');
      navigate(`/incidents/${id}`);
    } catch { toast.error('Failed to resolve incident.'); }
    finally { setResolving(false); }
  };

  const exportReport = () => {
    if(!incident) return;
    const lines = [
      '=== INCIDENT RESOLUTION REPORT ===',
      `ID: ${incident.id}`,
      `Title: ${incident.title}`,
      `Type: ${incident.type}`,
      `Severity: ${incident.severity}`,
      `Status: ${incident.status}`,
      `Reporter: ${incident.reportedByName||'Unknown'}`,
      `Reported: ${new Date(incident.createdAt).toLocaleString()}`,
      '',
      '=== DESCRIPTION ===',
      incident.description||'N/A',
      '',
      '=== AFFECTED SYSTEMS ===',
      incident.affectedSystems||'N/A',
      '',
      '=== ACTIONS TAKEN ===',
      incident.actionsTaken||'N/A',
      '',
      '=== INVESTIGATION NOTES ===',
      ...(incident.notes?.map((n,i)=>`[${i+1}] ${n}`) || ['None']),
      '',
      '=== RESOLUTION SUMMARY ===',
      resolution||'Pending',
      '',
      `Report Generated: ${new Date().toLocaleString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type:'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `incident-report-${incident.id?.slice(-8)}.txt`; a.click();
  };

  if(loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}><div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(99,149,255,0.2)', borderTopColor:'#3b82f6', animation:'spin 0.8s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  if(user?.role!=='ADMIN') return (
    <div className="card" style={{ maxWidth:500, textAlign:'center', padding:'3rem' }}>
      <AlertTriangle size={32} color="#f87171" style={{ margin:'0 auto 1rem' }}/>
      <p style={{ color:'#4d6080', fontSize:'0.875rem' }}>Only administrators can resolve incidents.</p>
      <Link to={`/incidents/${id}`} className="btn-primary" style={{ marginTop:'1rem', display:'inline-flex' }}>View Incident</Link>
    </div>
  );

  const isResolved = incident?.status==='RESOLVED';

  return (
    <div style={{ maxWidth:700, display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up">
        <button onClick={()=>navigate(`/incidents/${id}`)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#8ba3cc', cursor:'pointer', fontSize:'0.8125rem', marginBottom:'0.75rem', padding:0 }}>
          <ArrowLeft size={15}/> Back to Incident
        </button>
        <div className="section-label">Incidents</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>
          {isResolved ? 'Resolution Report' : 'Resolve Incident'}
        </h1>
      </div>

      {isResolved && (
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.875rem 1.125rem', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10 }}>
          <CheckCircle size={18} color="#34d399"/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#34d399' }}>This incident has been resolved</div>
            <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Case closed on {new Date(incident.updatedAt).toLocaleDateString()}</div>
          </div>
          <button onClick={exportReport} style={{ display:'flex', alignItems:'center', gap:5, padding:'0.5rem 0.875rem', borderRadius:8, border:'1px solid rgba(16,185,129,0.25)', background:'rgba(16,185,129,0.1)', color:'#34d399', fontSize:'0.78rem', cursor:'pointer' }}>
            <Download size={13}/>Export Report
          </button>
        </div>
      )}

      {/* Incident summary */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1rem' }}>
          <FileText size={16} color="#8ba3cc"/>
          <h2 style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff', margin:0 }}>Case Summary</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
          {[
            ['Title', incident?.title],
            ['Type', incident?.type?.replace(/_/g,' ')],
            ['Severity', incident?.severity],
            ['Status', incident?.status],
            ['Reporter', incident?.reportedByName||'—'],
            ['Evidence Files', incident?.evidenceFiles?.length||0],
            ['Investigation Notes', incident?.notes?.length||0],
            ['Reported', new Date(incident?.createdAt).toLocaleDateString()],
          ].map(([k,v])=>(
            <div key={k} style={{ display:'flex', flexDirection:'column', gap:2, padding:'0.5rem 0', borderBottom:'1px solid rgba(99,149,255,0.06)' }}>
              <span style={{ fontSize:'0.7rem', color:'#4d6080', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>{k}</span>
              <span style={{ fontSize:'0.8375rem', color:'#e8f0ff', fontWeight:500 }}>{v||'—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution section */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1rem' }}>
          <Shield size={16} color="#34d399"/>
          <h2 style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff', margin:0 }}>Resolution Summary</h2>
        </div>

        {isResolved ? (
          <div>
            <div style={{ background:'rgba(10,18,36,0.5)', borderRadius:8, padding:'1rem', fontSize:'0.875rem', color:'#c8d9f0', lineHeight:1.7, marginBottom:'1rem' }}>
              {incident?.notes?.filter(n=>n.startsWith('[RESOLUTION]')).map(n=>n.replace('[RESOLUTION] ','')).join('\n') || 'No resolution note recorded.'}
            </div>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={exportReport} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Download size={14}/>Download Full Report
              </button>
              <Link to="/incidents" className="btn-secondary">All Incidents</Link>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginBottom:'0.875rem' }}>Provide a summary of how this incident was resolved. This will be recorded as the final resolution note.</p>
            <textarea className="form-input" rows={5} value={resolution} onChange={e=>setResolution(e.target.value)} placeholder="Describe the resolution: what was the root cause, what actions were taken to resolve it, and what preventive measures are recommended..." style={{ resize:'vertical', marginBottom:'0.875rem' }}/>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={()=>navigate(`/incidents/${id}`)} className="btn-secondary">Cancel</button>
              <button onClick={handleResolve} disabled={resolving||!resolution.trim()} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#059669,#047857)' }}>
                <CheckCircle size={14}/>{resolving?'Resolving…':'Mark as Resolved'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default IncidentResolutionPage;
