import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, X, FileImage, File, CheckCircle, ArrowLeft, ExternalLink, Paperclip } from 'lucide-react';
import { toast } from 'react-toastify';
import { incidentAPI } from '../../services/api';

const EvidenceUploadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    incidentAPI.getById(id).then(r=>setIncident(r.data)).catch(()=>toast.error('Incident not found'));
  }, [id]);

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles);
    setFiles(p=>{ const ex=p.map(f=>f.name); return [...p,...arr.filter(f=>!ex.includes(f.name))]; });
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if(!files.length){ toast.error('No files selected.'); return; }
    setUploading(true);
    try {
      const fd = new FormData(); files.forEach(f=>fd.append('files',f));
      await incidentAPI.uploadEvidence(id, fd);
      toast.success(`${files.length} file(s) uploaded successfully!`);
      setUploaded(true); setFiles([]);
      // Refresh incident
      const r = await incidentAPI.getById(id); setIncident(r.data);
    } catch { toast.error('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  const totalSize = files.reduce((s,f)=>s+f.size,0);

  return (
    <div style={{ maxWidth:680, display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up">
        <button onClick={()=>navigate(`/incidents/${id}`)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#8ba3cc', cursor:'pointer', fontSize:'0.8125rem', marginBottom:'0.75rem', padding:0 }}>
          <ArrowLeft size={15}/> Back to Incident
        </button>
        <div className="section-label">Incidents</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>Evidence Upload</h1>
        {incident && <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginTop:4 }}>For: <span style={{ color:'#e8f0ff' }}>{incident.title}</span></p>}
      </div>

      {uploaded && (
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.875rem 1.125rem', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10 }}>
          <CheckCircle size={18} color="#34d399"/>
          <div>
            <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#34d399' }}>Evidence uploaded successfully!</div>
            <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Files are now attached to the incident report.</div>
          </div>
          <Link to={`/incidents/${id}`} style={{ marginLeft:'auto', fontSize:'0.78rem', color:'#34d399', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>View Incident <ExternalLink size={12}/></Link>
        </div>
      )}

      {/* Drop zone */}
      <div className="card"
        onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
        onDragLeave={()=>setDragOver(false)}
        onDrop={handleDrop}
        style={{ border:`2px dashed ${dragOver?'rgba(99,149,255,0.55)':'rgba(99,149,255,0.18)'}`, background: dragOver?'rgba(59,130,246,0.05)':'rgba(10,18,36,0.3)', transition:'all 200ms', cursor:'pointer', textAlign:'center', padding:'2.5rem 1.5rem' }}
        onClick={()=>document.getElementById('ev-input').click()}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
          <Upload size={24} color="#a78bfa"/>
        </div>
        <div style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff', marginBottom:6 }}>Drop files here or click to browse</div>
        <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Supports: Images, PDF, DOC, TXT, ZIP — Max 10MB per file</div>
        <input id="ev-input" type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.zip" style={{ display:'none' }} onChange={e=>addFiles(e.target.files)}/>
      </div>

      {/* File list */}
      {files.length>0 && (
        <div className="card" style={{ padding:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
            <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#e8f0ff' }}>Selected Files ({files.length})</div>
            <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Total: {(totalSize/1024/1024).toFixed(2)} MB</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem' }}>
            {files.map((f,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.875rem', background:'rgba(10,18,36,0.5)', borderRadius:8, border:'1px solid rgba(99,149,255,0.1)' }}>
                {f.type.startsWith('image/')?<FileImage size={16} color="#60a5fa"/>:<File size={16} color="#8ba3cc"/>}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.8125rem', color:'#e8f0ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                  <div style={{ fontSize:'0.7rem', color:'#4d6080' }}>{(f.size/1024).toFixed(1)} KB • {f.type||'Unknown type'}</div>
                </div>
                <button onClick={()=>setFiles(p=>p.filter((_,idx)=>idx!==i))} style={{ background:'none', border:'none', color:'#4d6080', cursor:'pointer', padding:4 }}
                  onMouseEnter={e=>{ e.currentTarget.style.color='#f87171'; }} onMouseLeave={e=>{ e.currentTarget.style.color='#4d6080'; }}>
                  <X size={14}/>
                </button>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button onClick={()=>setFiles([])} className="btn-secondary" style={{ fontSize:'0.8125rem' }}>Clear All</button>
            <button onClick={handleUpload} disabled={uploading} className="btn-primary" style={{ fontSize:'0.8125rem' }}>
              {uploading ? 'Uploading…' : `Upload ${files.length} File${files.length!==1?'s':''}`}
            </button>
          </div>
        </div>
      )}

      {/* Existing evidence */}
      {incident?.evidenceFiles?.length>0 && (
        <div className="card" style={{ padding:'1rem' }}>
          <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#e8f0ff', marginBottom:'0.875rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Paperclip size={15} color="#8ba3cc"/>
            Existing Evidence ({incident.evidenceFiles.length})
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'0.5rem' }}>
            {incident.evidenceFiles.map((f,i)=>{
              const url = f.startsWith('http')?f:`http://localhost:8080${f}`;
              const isImg=/\.(jpg|jpeg|png|gif|webp)$/i.test(f);
              return (
                <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.75rem', background:'rgba(10,18,36,0.5)', borderRadius:8, border:'1px solid rgba(99,149,255,0.1)', textDecoration:'none' }}>
                  {isImg?<FileImage size={14} color="#60a5fa"/>:<File size={14} color="#8ba3cc"/>}
                  <span style={{ fontSize:'0.75rem', color:'#c8d9f0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>File {i+1}</span>
                  <ExternalLink size={11} color="#4d6080"/>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default EvidenceUploadPage;
