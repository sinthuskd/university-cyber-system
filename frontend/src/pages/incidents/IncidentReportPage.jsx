import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Paperclip, X, FileImage, File, Shield, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { incidentAPI } from '../../services/api';

const TYPES = [
  { value:'PHISHING', label:'Phishing Attack' },
  { value:'MALWARE', label:'Malware / Ransomware' },
  { value:'DATA_BREACH', label:'Data Breach' },
  { value:'UNAUTHORIZED_ACCESS', label:'Unauthorized Access' },
  { value:'ACCOUNT_HACKING', label:'Account Hacking' },
  { value:'DDOS', label:'DDoS Attack' },
  { value:'SOCIAL_ENGINEERING', label:'Social Engineering' },
  { value:'OTHER', label:'Other' },
];
const SEVERITIES = [
  { value:'LOW', label:'Low', color:'#10b981', desc:'Minor impact' },
  { value:'MEDIUM', label:'Medium', color:'#f59e0b', desc:'Moderate impact' },
  { value:'HIGH', label:'High', color:'#f97316', desc:'Significant impact' },
  { value:'CRITICAL', label:'Critical', color:'#ef4444', desc:'Severe / urgent' },
];

const Label = ({ children }) => (
  <label style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', letterSpacing:'0.05em', textTransform:'uppercase', display:'block', marginBottom:'0.35rem' }}>{children}</label>
);

const Input = ({ style, ...props }) => (
  <input className="form-input" style={{ fontFamily:"'DM Sans',sans-serif", ...style }} {...props}/>
);

const IncidentReportPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', type:'', severity:'', description:'', incidentDate:'', affectedSystems:'', actionsTaken:'' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleFiles = (e) => {
    const sel = Array.from(e.target.files||[]);
    setFiles(p => { const ex=p.map(f=>f.name); return [...p,...sel.filter(f=>!ex.includes(f.name))]; });
    e.target.value='';
  };

  const handleSubmit = async () => {
    if(!form.title||!form.type||!form.severity||!form.description){ toast.error('Please fill all required fields.'); return; }
    setSubmitting(true);
    try {
      const res = await incidentAPI.create({ ...form, incidentDate: form.incidentDate||null });
      const id = res.data.id;
      if(files.length>0){
        const fd = new FormData(); files.forEach(f=>fd.append('files',f));
        try { await incidentAPI.uploadEvidence(id,fd); } catch { toast.warn('Incident saved but evidence upload failed.'); }
      }
      toast.success('Incident reported successfully!');
      navigate(`/incidents/${id}`);
    } catch { toast.error('Failed to submit report.'); }
    finally { setSubmitting(false); }
  };

  const stepStyle = (s) => ({
    display:'flex', alignItems:'center', gap:'0.5rem',
    padding:'0.375rem 0.875rem', borderRadius:20,
    fontSize:'0.75rem', fontWeight: step===s ? 600 : 400,
    background: step===s ? 'rgba(59,130,246,0.15)' : step>s ? 'rgba(16,185,129,0.1)' : 'transparent',
    color: step===s ? '#60a5fa' : step>s ? '#34d399' : '#4d6080',
    border:`1px solid ${step===s?'rgba(59,130,246,0.3)':step>s?'rgba(16,185,129,0.2)':'transparent'}`,
  });

  return (
    <div style={{ maxWidth:700, display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up">
        <div className="section-label">Incidents</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>Report Cyber Incident</h1>
        <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginTop:4 }}>Provide details about the security incident you experienced or witnessed.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <div style={stepStyle(1)}>1. Basic Info</div>
        <ChevronRight size={13} color="#2a3a50"/>
        <div style={stepStyle(2)}>2. Details</div>
        <ChevronRight size={13} color="#2a3a50"/>
        <div style={stepStyle(3)}>3. Evidence</div>
      </div>

      <div className="card animate-fade-up">
        {step===1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(239,68,68,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <AlertTriangle size={19} color="#f87171"/>
              </div>
              <div>
                <div style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff' }}>Incident Information</div>
                <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>What happened and how severe was it?</div>
              </div>
            </div>

            <div>
              <Label>Incident Title *</Label>
              <Input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Received phishing email from fake university address"/>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div>
                <Label>Incident Type *</Label>
                <select className="form-input" value={form.type} onChange={e=>set('type',e.target.value)}>
                  <option value="">Select type…</option>
                  {TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Date & Time of Incident</Label>
                <Input type="datetime-local" value={form.incidentDate} onChange={e=>set('incidentDate',e.target.value)}/>
              </div>
            </div>

            <div>
              <Label>Severity Level *</Label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.625rem' }}>
                {SEVERITIES.map(s=>(
                  <button key={s.value} type="button" onClick={()=>set('severity',s.value)} style={{ padding:'0.625rem', borderRadius:10, border:`1px solid ${form.severity===s.value ? s.color+'60' : 'rgba(99,149,255,0.12)'}`, background: form.severity===s.value ? s.color+'18' : 'rgba(10,18,36,0.5)', cursor:'pointer', textAlign:'left', transition:'all 200ms' }}>
                    <div style={{ fontSize:'0.8rem', fontWeight:600, color: form.severity===s.value ? s.color : '#8ba3cc' }}>{s.label}</div>
                    <div style={{ fontSize:'0.68rem', color:'#4d6080', marginTop:2 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'0.5rem' }}>
              <button onClick={()=>{ if(!form.title||!form.type||!form.severity){toast.error('Fill required fields.');return;} setStep(2); }} className="btn-primary">Next: Details →</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(59,130,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Shield size={19} color="#60a5fa"/>
              </div>
              <div>
                <div style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff' }}>Incident Details</div>
                <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Describe what happened in detail</div>
              </div>
            </div>

            <div>
              <Label>Full Description *</Label>
              <textarea className="form-input" rows={5} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe what happened, how you discovered it, what was affected, and any other relevant details..." style={{ resize:'vertical', minHeight:120 }}/>
            </div>
            <div>
              <Label>Affected Systems / Location</Label>
              <Input value={form.affectedSystems} onChange={e=>set('affectedSystems',e.target.value)} placeholder="e.g. Student portal, Lab PC-04, University email system"/>
            </div>
            <div>
              <Label>Immediate Actions Taken</Label>
              <textarea className="form-input" rows={3} value={form.actionsTaken} onChange={e=>set('actionsTaken',e.target.value)} placeholder="What steps did you take after discovering the incident? (e.g. changed password, disconnected from network...)" style={{ resize:'vertical' }}/>
            </div>

            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'space-between', marginTop:'0.5rem' }}>
              <button onClick={()=>setStep(1)} className="btn-secondary">← Back</button>
              <button onClick={()=>{ if(!form.description){toast.error('Please add a description.');return;} setStep(3); }} className="btn-primary">Next: Evidence →</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Paperclip size={19} color="#a78bfa"/>
              </div>
              <div>
                <div style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff' }}>Evidence Upload</div>
                <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Attach screenshots, logs, or documents (optional)</div>
              </div>
            </div>

            <label style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.875rem 1.25rem', borderRadius:10, border:'2px dashed rgba(99,149,255,0.2)', background:'rgba(10,18,36,0.4)', cursor:'pointer', transition:'all 200ms' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.45)'; e.currentTarget.style.background='rgba(59,130,246,0.05)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.2)'; e.currentTarget.style.background='rgba(10,18,36,0.4)'; }}>
              <Paperclip size={16} color="#8ba3cc"/>
              <div>
                <div style={{ fontSize:'0.8125rem', color:'#e8f0ff', fontWeight:500 }}>Click to attach evidence files</div>
                <div style={{ fontSize:'0.72rem', color:'#4d6080' }}>Images, PDF, DOC, TXT, ZIP — max 10MB each</div>
              </div>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.zip" onChange={handleFiles} style={{ display:'none' }}/>
            </label>

            {files.length>0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {files.map((f,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0.875rem', background:'rgba(10,18,36,0.6)', borderRadius:8, border:'1px solid rgba(99,149,255,0.1)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', minWidth:0 }}>
                      {f.type.startsWith('image/') ? <FileImage size={14} color="#60a5fa"/> : <File size={14} color="#8ba3cc"/>}
                      <span style={{ fontSize:'0.8rem', color:'#e8f0ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                      <span style={{ fontSize:'0.72rem', color:'#4d6080', flexShrink:0 }}>({(f.size/1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" onClick={()=>setFiles(p=>p.filter((_,idx)=>idx!==i))} style={{ background:'none', border:'none', color:'#4d6080', cursor:'pointer', padding:4 }}
                      onMouseEnter={e=>{ e.currentTarget.style.color='#f87171'; }} onMouseLeave={e=>{ e.currentTarget.style.color='#4d6080'; }}>
                      <X size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div style={{ background:'rgba(10,18,36,0.5)', borderRadius:10, padding:'1rem', border:'1px solid rgba(99,149,255,0.1)', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              <div style={{ fontSize:'0.75rem', fontWeight:600, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Report Summary</div>
              {[['Title',form.title],['Type',TYPES.find(t=>t.value===form.type)?.label||'—'],['Severity',form.severity||'—'],['Evidence',`${files.length} file(s)`]].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem' }}>
                  <span style={{ color:'#4d6080' }}>{k}</span>
                  <span style={{ color:'#e8f0ff', fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'space-between', marginTop:'0.5rem' }}>
              <button onClick={()=>setStep(2)} className="btn-secondary">← Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting…' : '✓ Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default IncidentReportPage;
