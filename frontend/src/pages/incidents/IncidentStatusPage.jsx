import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { incidentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUSES = [
  { value:'OPEN', label:'Open', icon:Clock, color:'#60a5fa', desc:'Newly reported, awaiting review' },
  { value:'INVESTIGATING', label:'Under Investigation', icon:TrendingUp, color:'#f59e0b', desc:'Actively being investigated by the team' },
  { value:'ESCALATED', label:'Escalated', icon:AlertTriangle, color:'#f97316', desc:'Escalated to higher authority for action' },
  { value:'RESOLVED', label:'Resolved', icon:CheckCircle, color:'#10b981', desc:'Investigation complete, case closed' },
];

const IncidentStatusPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incident, setIncident] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentAPI.getById(id).then(r=>{ setIncident(r.data); setSelectedStatus(r.data.status||'OPEN'); }).catch(()=>toast.error('Not found')).finally(()=>setLoading(false));
  }, [id]);

  if(user?.role!=='ADMIN') return (
    <div className="card" style={{ maxWidth:500, textAlign:'center', padding:'3rem' }}>
      <AlertTriangle size={32} color="#f87171" style={{ margin:'0 auto 1rem' }}/>
      <h2 style={{ color:'#e8f0ff', marginBottom:8 }}>Access Restricted</h2>
      <p style={{ color:'#4d6080', fontSize:'0.875rem' }}>Only administrators can update incident status.</p>
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await incidentAPI.updateStatus(id, selectedStatus);
      if(statusNote.trim()) await incidentAPI.addNote(id, `[STATUS UPDATE → ${selectedStatus}] ${statusNote}`);
      toast.success(`Status updated to ${selectedStatus}`);
      navigate(`/incidents/${id}`);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if(loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}><div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(99,149,255,0.2)', borderTopColor:'#3b82f6', animation:'spin 0.8s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ maxWidth:620, display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up">
        <button onClick={()=>navigate(`/incidents/${id}`)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#8ba3cc', cursor:'pointer', fontSize:'0.8125rem', marginBottom:'0.75rem', padding:0 }}>
          <ArrowLeft size={15}/> Back to Incident
        </button>
        <div className="section-label">Incidents</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>Update Incident Status</h1>
        {incident && <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginTop:4 }}>Case: <span style={{ color:'#e8f0ff' }}>{incident.title}</span></p>}
      </div>

      <div className="card">
        <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'1rem' }}>Select New Status</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.25rem' }}>
          {STATUSES.map(s=>(
            <button key={s.value} onClick={()=>setSelectedStatus(s.value)}
              style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.875rem 1rem', borderRadius:10, border:`1px solid ${selectedStatus===s.value?`${s.color}50`:'rgba(99,149,255,0.1)'}`, background: selectedStatus===s.value?`${s.color}12`:'rgba(10,18,36,0.4)', cursor:'pointer', textAlign:'left', transition:'all 200ms', position:'relative' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <s.icon size={18} color={s.color}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color: selectedStatus===s.value?s.color:'#e8f0ff' }}>{s.label}</div>
                <div style={{ fontSize:'0.78rem', color:'#4d6080', marginTop:2 }}>{s.desc}</div>
              </div>
              {incident?.status===s.value && (
                <span style={{ fontSize:'0.7rem', color:'#4d6080', background:'rgba(99,149,255,0.08)', padding:'2px 8px', borderRadius:10 }}>Current</span>
              )}
              {selectedStatus===s.value && incident?.status!==s.value && (
                <CheckCircle size={16} color={s.color}/>
              )}
            </button>
          ))}
        </div>

        <div style={{ marginBottom:'1.25rem' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem' }}>Status Change Note (Optional)</div>
          <textarea className="form-input" rows={3} value={statusNote} onChange={e=>setStatusNote(e.target.value)} placeholder="Add a note explaining this status change…" style={{ resize:'vertical' }}/>
          <p style={{ fontSize:'0.72rem', color:'#4d6080', marginTop:4 }}>This note will be added to the investigation timeline automatically.</p>
        </div>

        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button onClick={()=>navigate(`/incidents/${id}`)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving||selectedStatus===incident?.status} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Save size={14}/>{saving?'Updating…':'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default IncidentStatusPage;
