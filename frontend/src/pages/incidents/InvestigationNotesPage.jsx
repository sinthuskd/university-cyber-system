import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Plus, Clock, User, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { incidentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const InvestigationNotesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incident, setIncident] = useState(null);
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    incidentAPI.getById(id).then(r=>setIncident(r.data)).catch(()=>toast.error('Not found')).finally(()=>setLoading(false));
  };
  useEffect(load, [id]);

  const handleAdd = async () => {
    if(!note.trim()) return;
    setAdding(true);
    try { await incidentAPI.addNote(id, note); toast.success('Note added!'); setNote(''); load(); }
    catch { toast.error('Failed to add note.'); }
    finally { setAdding(false); }
  };

  if(loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}><div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(99,149,255,0.2)', borderTopColor:'#3b82f6', animation:'spin 0.8s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ maxWidth:700, display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up">
        <button onClick={()=>navigate(`/incidents/${id}`)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#8ba3cc', cursor:'pointer', fontSize:'0.8125rem', marginBottom:'0.75rem', padding:0 }}>
          <ArrowLeft size={15}/> Back to Incident
        </button>
        <div className="section-label">Incidents</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>Investigation Notes</h1>
        {incident && <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginTop:4 }}>Case: <span style={{ color:'#e8f0ff' }}>{incident.title}</span></p>}
      </div>

      {/* Status banner */}
      {incident && (
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.875rem 1.125rem', background:'rgba(10,18,36,0.5)', border:'1px solid rgba(99,149,255,0.12)', borderRadius:10 }}>
          <Shield size={16} color="#60a5fa"/>
          <div style={{ fontSize:'0.875rem', color:'#8ba3cc' }}>
            Status: <span style={{ color:'#60a5fa', fontWeight:600 }}>{incident.status}</span>
            <span style={{ margin:'0 0.625rem', color:'#2a3a50' }}>•</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.78rem' }}>{incident.notes?.length||0} note{incident.notes?.length!==1?'s':''}</span>
          </div>
        </div>
      )}

      {/* Notes timeline */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1.25rem' }}>
          <MessageSquare size={16} color="#60a5fa"/>
          <h2 style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff', margin:0 }}>Investigation Timeline</h2>
        </div>

        {incident?.notes?.length>0 ? (
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:16, top:8, bottom:8, width:1, background:'rgba(99,149,255,0.1)' }}/>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', paddingLeft:'2.5rem' }}>
              {incident.notes.map((n,i)=>(
                <div key={i} style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:'-2.5rem', top:8, width:12, height:12, borderRadius:'50%', background: i===incident.notes.length-1?'#3b82f6':'rgba(99,149,255,0.3)', border:'2px solid', borderColor: i===incident.notes.length-1?'#1d4ed8':'rgba(99,149,255,0.2)', zIndex:1 }}/>
                  <div style={{ background:'rgba(10,18,36,0.5)', borderRadius:10, padding:'0.875rem 1rem', border:'1px solid rgba(99,149,255,0.1)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
                      <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(59,130,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <User size={11} color="#60a5fa"/>
                      </div>
                      <span style={{ fontSize:'0.75rem', fontWeight:500, color:'#60a5fa' }}>Investigator</span>
                      <span style={{ fontSize:'0.7rem', color:'#4d6080', marginLeft:'auto', display:'flex', alignItems:'center', gap:3 }}>
                        <Clock size={10}/>Note #{i+1}
                      </span>
                    </div>
                    <p style={{ fontSize:'0.875rem', color:'#c8d9f0', lineHeight:1.65, margin:0 }}>{n}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'2rem', color:'#4d6080' }}>
            <MessageSquare size={32} style={{ color:'#2a3a50', margin:'0 auto 0.75rem' }}/>
            <div style={{ fontSize:'0.875rem' }}>No investigation notes yet.</div>
          </div>
        )}

        {/* Add note */}
        {user?.role==='ADMIN' && (
          <div style={{ marginTop:'1.25rem', paddingTop:'1.25rem', borderTop:'1px solid rgba(99,149,255,0.08)' }}>
            <div style={{ fontSize:'0.78rem', fontWeight:500, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.625rem' }}>Add Investigation Note</div>
            <textarea className="form-input" rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="Document your findings, actions taken, or next steps for this investigation…" style={{ resize:'vertical', marginBottom:'0.75rem' }}/>
            <button onClick={handleAdd} disabled={adding||!note.trim()} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Plus size={14}/>{adding?'Adding…':'Add Note'}
            </button>
          </div>
        )}

        {user?.role!=='ADMIN' && (
          <div style={{ marginTop:'1rem', padding:'0.75rem', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:8, fontSize:'0.8rem', color:'#fbbf24' }}>
            Only administrators and investigators can add notes to this case.
          </div>
        )}
      </div>
    </div>
  );
};
export default InvestigationNotesPage;
