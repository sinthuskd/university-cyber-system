import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, MessageSquare, FileImage, File, ExternalLink, AlertTriangle, CheckCircle, Clock, TrendingUp, Trash2, Edit2, Save, X, Upload } from 'lucide-react';
import { incidentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SEV_COLORS = { LOW:'#10b981', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };
const STATUS_COLORS = { OPEN:'#60a5fa', INVESTIGATING:'#f59e0b', ESCALATED:'#f97316', RESOLVED:'#10b981' };
const STATUS_ICONS = { OPEN: Clock, INVESTIGATING: TrendingUp, ESCALATED: AlertTriangle, RESOLVED: CheckCircle };

const InfoRow = ({ label, value }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:3, padding:'0.625rem 0', borderBottom:'1px solid rgba(99,149,255,0.06)' }}>
    <span style={{ fontSize:'0.7rem', color:'#4d6080', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>{label}</span>
    <span style={{ fontSize:'0.875rem', color:'#e8f0ff', fontWeight:500 }}>{value||'—'}</span>
  </div>
);

const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incident, setIncident] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const load = () => {
    incidentAPI.getById(id)
      .then(r=>{ setIncident(r.data); setEditForm({ title:r.data.title, description:r.data.description, severity:r.data.severity, affectedSystems:r.data.affectedSystems||'', actionsTaken:r.data.actionsTaken||'' }); })
      .catch(()=>toast.error('Failed to load incident'))
      .finally(()=>setLoading(false));
  };
  useEffect(load, [id]);

  const handleStatusChange = async (status) => {
    try { await incidentAPI.updateStatus(id,status); setIncident(p=>({...p,status})); toast.success(`Status updated to ${status}`); }
    catch { toast.error('Failed to update status'); }
  };

  const handleAddNote = async () => {
    if(!note.trim()) return;
    setAddingNote(true);
    try {
      await incidentAPI.addNote(id, note);
      toast.success('Investigation note added');
      setNote('');
      load();
    } catch { toast.error('Failed to add note'); }
    finally { setAddingNote(false); }
  };

  const handleSaveEdit = async () => {
    try { await incidentAPI.update(id, editForm); toast.success('Incident updated!'); setEditMode(false); load(); }
    catch { toast.error('Update failed.'); }
  };

  const handleDelete = async () => {
    if(!window.confirm('Delete this incident? This cannot be undone.')) return;
    try { await incidentAPI.delete(id); toast.success('Incident deleted'); navigate('/incidents'); }
    catch { toast.error('Delete failed'); }
  };

  const handleEvidenceUpload = async (e) => {
    const sel = Array.from(e.target.files||[]); if(!sel.length) return;
    setUploadingEvidence(true);
    try {
      const fd = new FormData(); sel.forEach(f=>fd.append('files',f));
      await incidentAPI.uploadEvidence(id,fd);
      toast.success(`${sel.length} file(s) uploaded`); load();
    } catch { toast.error('Evidence upload failed'); }
    finally { setUploadingEvidence(false); e.target.value=''; }
  };

  if(loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}><div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(99,149,255,0.2)', borderTopColor:'#3b82f6', animation:'spin 0.8s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(!incident) return <div className="card"><p style={{ color:'#4d6080' }}>Incident not found.</p></div>;

  const StatusIcon = STATUS_ICONS[incident.status]||Clock;

  return (
    <div style={{ maxWidth:900, display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
        <button onClick={()=>navigate('/incidents')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#8ba3cc', cursor:'pointer', fontSize:'0.8125rem', padding:0 }}
          onMouseEnter={e=>{ e.currentTarget.style.color='#e8f0ff'; }} onMouseLeave={e=>{ e.currentTarget.style.color='#8ba3cc'; }}>
          <ArrowLeft size={15}/> Back to Incidents
        </button>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          {user?.role==='ADMIN' && (
            <>
              <button onClick={()=>setEditMode(p=>!p)} style={{ display:'flex', alignItems:'center', gap:5, padding:'0.45rem 0.875rem', borderRadius:8, border:'1px solid rgba(99,149,255,0.15)', background:editMode?'rgba(59,130,246,0.12)':'transparent', color:editMode?'#60a5fa':'#8ba3cc', fontSize:'0.8rem', cursor:'pointer' }}>
                {editMode ? <><X size={13}/>Cancel</> : <><Edit2 size={13}/>Edit</>}
              </button>
              <button onClick={handleDelete} style={{ display:'flex', alignItems:'center', gap:5, padding:'0.45rem 0.875rem', borderRadius:8, border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.07)', color:'#f87171', fontSize:'0.8rem', cursor:'pointer' }}>
                <Trash2 size={13}/>Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.25rem', alignItems:'start' }}>
        {/* Main content */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div className="card">
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1rem', gap:'1rem' }}>
              <div style={{ flex:1 }}>
                {editMode ? (
                  <input className="form-input" value={editForm.title} onChange={e=>setEditForm(p=>({...p,title:e.target.value}))} style={{ fontSize:'1.0625rem', fontWeight:700, marginBottom:'0.5rem' }}/>
                ) : (
                  <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.0625rem', fontWeight:700, color:'#e8f0ff', margin:0 }}>{incident.title}</h1>
                )}
                <p style={{ fontSize:'0.78rem', color:'#4d6080', marginTop:4 }}>
                  Reported {new Date(incident.createdAt).toLocaleString()} {incident.reportedByName && `by ${incident.reportedByName}`}
                </p>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                <span style={{ padding:'3px 12px', borderRadius:20, fontSize:'0.72rem', fontWeight:600, fontFamily:"'DM Mono',monospace", background:`${SEV_COLORS[incident.severity]||'#8ba3cc'}18`, color:SEV_COLORS[incident.severity]||'#8ba3cc', border:`1px solid ${SEV_COLORS[incident.severity]||'#8ba3cc'}30` }}>{incident.severity}</span>
                <span style={{ padding:'3px 12px', borderRadius:20, fontSize:'0.72rem', fontWeight:600, fontFamily:"'DM Mono',monospace", background:`${STATUS_COLORS[incident.status]||'#8ba3cc'}18`, color:STATUS_COLORS[incident.status]||'#8ba3cc', border:`1px solid ${STATUS_COLORS[incident.status]||'#8ba3cc'}30`, display:'flex', alignItems:'center', gap:4 }}>
                  <StatusIcon size={10}/>{incident.status}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem' }}>Description</div>
              {editMode ? (
                <textarea className="form-input" rows={5} value={editForm.description} onChange={e=>setEditForm(p=>({...p,description:e.target.value}))} style={{ resize:'vertical' }}/>
              ) : (
                <div style={{ background:'rgba(10,18,36,0.5)', borderRadius:8, padding:'0.875rem', fontSize:'0.875rem', color:'#c8d9f0', lineHeight:1.7 }}>{incident.description}</div>
              )}
            </div>

            {editMode && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem', marginTop:'0.875rem' }}>
                <div>
                  <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.35rem' }}>Affected Systems</div>
                  <input className="form-input" value={editForm.affectedSystems} onChange={e=>setEditForm(p=>({...p,affectedSystems:e.target.value}))} placeholder="Affected systems..."/>
                </div>
                <div>
                  <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.35rem' }}>Actions Taken</div>
                  <textarea className="form-input" rows={2} value={editForm.actionsTaken} onChange={e=>setEditForm(p=>({...p,actionsTaken:e.target.value}))} style={{ resize:'vertical' }}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                  <div>
                    <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.35rem' }}>Severity</div>
                    <select className="form-input" value={editForm.severity} onChange={e=>setEditForm(p=>({...p,severity:e.target.value}))}>
                      {['LOW','MEDIUM','HIGH','CRITICAL'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleSaveEdit} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.575rem 1.25rem', borderRadius:8, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', alignSelf:'flex-start' }}>
                  <Save size={14}/>Save Changes
                </button>
              </div>
            )}

            {!editMode && (incident.affectedSystems||incident.actionsTaken) && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid rgba(99,149,255,0.08)' }}>
                {incident.affectedSystems && (
                  <div>
                    <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.35rem' }}>Affected Systems</div>
                    <div style={{ fontSize:'0.875rem', color:'#c8d9f0' }}>{incident.affectedSystems}</div>
                  </div>
                )}
                {incident.actionsTaken && (
                  <div>
                    <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.35rem' }}>Actions Taken</div>
                    <div style={{ fontSize:'0.875rem', color:'#c8d9f0' }}>{incident.actionsTaken}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Investigation Notes */}
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1rem' }}>
              <MessageSquare size={16} color="#60a5fa"/>
              <h2 style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff', margin:0 }}>Investigation Notes</h2>
              <span style={{ fontSize:'0.72rem', fontFamily:"'DM Mono',monospace", color:'#4d6080', background:'rgba(99,149,255,0.08)', padding:'1px 8px', borderRadius:10 }}>{incident.notes?.length||0}</span>
            </div>

            {incident.notes?.length>0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem', marginBottom:'1rem' }}>
                {incident.notes.map((n,i)=>(
                  <div key={i} style={{ padding:'0.75rem 1rem', background:'rgba(10,18,36,0.5)', borderRadius:8, borderLeft:'3px solid rgba(59,130,246,0.4)', fontSize:'0.875rem', color:'#c8d9f0', lineHeight:1.6 }}>
                    <div style={{ fontSize:'0.7rem', color:'#4d6080', marginBottom:4, fontFamily:"'DM Mono',monospace" }}>Note #{i+1}</div>
                    {n}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'1.25rem', color:'#4d6080', fontSize:'0.8rem', marginBottom:'1rem' }}>No investigation notes yet.</div>
            )}

            {(user?.role==='ADMIN') && (
              <div style={{ display:'flex', gap:'0.625rem' }}>
                <textarea className="form-input" rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add an investigation note…" style={{ flex:1, resize:'none' }}/>
                <button onClick={handleAddNote} disabled={addingNote||!note.trim()} style={{ padding:'0.5rem 1rem', borderRadius:8, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', fontSize:'0.8rem', fontWeight:600, cursor:addingNote||!note.trim()?'not-allowed':'pointer', opacity:addingNote||!note.trim()?0.5:1, whiteSpace:'nowrap' }}>
                  {addingNote?'Adding…':'Add Note'}
                </button>
              </div>
            )}
          </div>

          {/* Evidence Files */}
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                <FileImage size={16} color="#a78bfa"/>
                <h2 style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff', margin:0 }}>Evidence Files</h2>
                <span style={{ fontSize:'0.72rem', fontFamily:"'DM Mono',monospace", color:'#4d6080', background:'rgba(99,149,255,0.08)', padding:'1px 8px', borderRadius:10 }}>{incident.evidenceFiles?.length||0}</span>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:5, padding:'0.4rem 0.875rem', borderRadius:8, border:'1px solid rgba(99,102,241,0.25)', background:'rgba(99,102,241,0.08)', color:'#a78bfa', fontSize:'0.78rem', cursor:'pointer' }}>
                <Upload size={13}/>{uploadingEvidence?'Uploading…':'Upload More'}
                <input type="file" multiple style={{ display:'none' }} onChange={handleEvidenceUpload} disabled={uploadingEvidence}/>
              </label>
            </div>
            {incident.evidenceFiles?.length>0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'0.625rem' }}>
                {incident.evidenceFiles.map((f,i)=>{
                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f);
                  const url = f.startsWith('http') ? f : `http://localhost:8080${f}`;
                  return (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.625rem', background:'rgba(10,18,36,0.6)', borderRadius:8, border:'1px solid rgba(99,149,255,0.1)', textDecoration:'none', transition:'all 150ms' }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.3)'; }} onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.1)'; }}>
                      {isImg ? <FileImage size={16} color="#60a5fa"/> : <File size={16} color="#8ba3cc"/>}
                      <span style={{ fontSize:'0.75rem', color:'#c8d9f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>File {i+1}</span>
                      <ExternalLink size={11} color="#4d6080"/>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'1.25rem', color:'#4d6080', fontSize:'0.8rem' }}>No evidence files attached.</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Info card */}
          <div className="card" style={{ padding:'1rem' }}>
            <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.75rem' }}>Incident Info</div>
            <InfoRow label="Type" value={incident.type?.replace(/_/g,' ')}/>
            <InfoRow label="Incident ID" value={`#${incident.id?.slice(-8).toUpperCase()}`}/>
            {incident.incidentDate && <InfoRow label="Incident Date" value={new Date(incident.incidentDate).toLocaleString()}/>}
            <InfoRow label="Created" value={new Date(incident.createdAt).toLocaleDateString()}/>
            <InfoRow label="Last Updated" value={new Date(incident.updatedAt).toLocaleDateString()}/>
          </div>

          {/* Status update — admin only */}
          {user?.role==='ADMIN' && (
            <div className="card" style={{ padding:'1rem' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.875rem' }}>Update Status</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {['OPEN','INVESTIGATING','ESCALATED','RESOLVED'].map(s=>(
                  <button key={s} onClick={()=>handleStatusChange(s)}
                    style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.875rem', borderRadius:8, border:`1px solid ${incident.status===s?`${STATUS_COLORS[s]}40`:'rgba(99,149,255,0.1)'}`, background: incident.status===s?`${STATUS_COLORS[s]}15`:'transparent', color: incident.status===s?STATUS_COLORS[s]:'#8ba3cc', fontSize:'0.8125rem', cursor:'pointer', fontWeight: incident.status===s?600:400, transition:'all 150ms', textAlign:'left' }}>
                    {React.createElement(STATUS_ICONS[s]||Clock, { size:13 })}
                    {s.charAt(0)+s.slice(1).toLowerCase()}
                    {incident.status===s && <span style={{ marginLeft:'auto', fontSize:'0.65rem' }}>● Current</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="card" style={{ padding:'1rem' }}>
            <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.75rem' }}>Quick Links</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              <Link to="/incidents" style={{ fontSize:'0.8rem', color:'#60a5fa', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>← All Incidents</Link>
              <Link to={`/incidents/${id}/notes`} style={{ fontSize:'0.8rem', color:'#8ba3cc', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>Investigation Notes</Link>
              <Link to={`/incidents/${id}/evidence`} style={{ fontSize:'0.8rem', color:'#8ba3cc', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>Upload Evidence</Link>
              {user?.role==='ADMIN' && <Link to={`/incidents/${id}/status`} style={{ fontSize:'0.8rem', color:'#f59e0b', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>Update Status</Link>}
              {user?.role==='ADMIN' && <Link to={`/incidents/${id}/resolve`} style={{ fontSize:'0.8rem', color:'#34d399', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>Resolve Case</Link>}
              <Link to="/incidents/history" style={{ fontSize:'0.8rem', color:'#8ba3cc', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>My History</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default IncidentDetailPage;
