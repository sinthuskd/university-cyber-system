import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Paperclip, X, FileImage, File, GraduationCap, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { incidentAPI } from '../../services/api';

const VIOLATION_TYPES = [
  { value:'PLAGIARISM', label:'Plagiarism', desc:'Copying without attribution' },
  { value:'CHEATING', label:'Exam Cheating', desc:'Unauthorized material/assistance' },
  { value:'FABRICATION', label:'Data Fabrication', desc:'Falsifying research/data' },
  { value:'IMPERSONATION', label:'Impersonation', desc:'Attending for another person' },
  { value:'CONTRACT_CHEATING', label:'Contract Cheating', desc:'Work done by someone else' },
  { value:'OTHER', label:'Other', desc:'Other academic misconduct' },
];

const Label = ({ children }) => (
  <label style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', letterSpacing:'0.05em', textTransform:'uppercase', display:'block', marginBottom:'0.35rem' }}>{children}</label>
);

const AcademicViolationPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', violationType:'', course:'', description:'', affectedSystems:'', actionsTaken:'', evidence:'' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [anonymous, setAnonymous] = useState(false);

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleFiles = (e) => {
    const sel = Array.from(e.target.files||[]);
    setFiles(p => { const ex=p.map(f=>f.name); return [...p,...sel.filter(f=>!ex.includes(f.name))]; });
    e.target.value='';
  };

  const handleSubmit = async () => {
    if(!form.violationType||!form.description){ toast.error('Fill all required fields.'); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, type:'ACADEMIC_VIOLATION', severity:'MEDIUM', title: form.title||`Academic Violation — ${form.course||'Unknown Course'}` };
      const res = await incidentAPI.createAcademic(payload);
      const id = res.data.id;
      if(files.length>0){
        const fd = new FormData(); files.forEach(f=>fd.append('files',f));
        try { await incidentAPI.uploadEvidence(id,fd); } catch { toast.warn('Report submitted but evidence upload failed.'); }
      }
      toast.success('Academic violation reported!');
      navigate(`/incidents/${id}`);
    } catch { toast.error('Failed to submit report.'); }
    finally { setSubmitting(false); }
  };

  const stepStyle = (s) => ({
    display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.375rem 0.875rem', borderRadius:20,
    fontSize:'0.75rem', fontWeight: step===s ? 600 : 400,
    background: step===s ? 'rgba(245,158,11,0.15)' : step>s ? 'rgba(16,185,129,0.1)' : 'transparent',
    color: step===s ? '#fbbf24' : step>s ? '#34d399' : '#4d6080',
    border:`1px solid ${step===s?'rgba(245,158,11,0.3)':step>s?'rgba(16,185,129,0.2)':'transparent'}`,
  });

  return (
    <div style={{ maxWidth:700, display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up">
        <div className="section-label">Incidents</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>Report Academic Integrity Violation</h1>
        <p style={{ fontSize:'0.8125rem', color:'#4d6080', marginTop:4 }}>Report plagiarism, cheating, or other academic misconduct confidentially.</p>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <div style={stepStyle(1)}>1. Violation Type</div>
        <ChevronRight size={13} color="#2a3a50"/>
        <div style={stepStyle(2)}>2. Details</div>
        <ChevronRight size={13} color="#2a3a50"/>
        <div style={stepStyle(3)}>3. Evidence</div>
      </div>

      <div className="card animate-fade-up">
        {step===1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(245,158,11,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <GraduationCap size={19} color="#fbbf24"/>
              </div>
              <div>
                <div style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff' }}>Type of Violation</div>
                <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Select the category that best describes the misconduct</div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              {VIOLATION_TYPES.map(v=>(
                <button key={v.value} type="button" onClick={()=>set('violationType',v.value)}
                  style={{ padding:'0.875rem', borderRadius:10, border:`1px solid ${form.violationType===v.value?'rgba(245,158,11,0.45)':'rgba(99,149,255,0.12)'}`, background: form.violationType===v.value?'rgba(245,158,11,0.1)':'rgba(10,18,36,0.5)', cursor:'pointer', textAlign:'left', transition:'all 200ms' }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color: form.violationType===v.value?'#fbbf24':'#e8f0ff' }}>{v.label}</div>
                  <div style={{ fontSize:'0.72rem', color:'#4d6080', marginTop:3 }}>{v.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'0.5rem' }}>
              <div>
                <Label>Report Title</Label>
                <input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Brief title (auto-generated if empty)"/>
              </div>
              <div>
                <Label>Course / Subject</Label>
                <input className="form-input" value={form.course} onChange={e=>set('course',e.target.value)} placeholder="e.g. CS301 — Data Structures"/>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'rgba(245,158,11,0.06)', borderRadius:8, border:'1px solid rgba(245,158,11,0.15)', cursor:'pointer' }} onClick={()=>setAnonymous(p=>!p)}>
              <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${anonymous?'#fbbf24':'rgba(99,149,255,0.3)'}`, background: anonymous?'#fbbf24':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 200ms' }}>
                {anonymous && <span style={{ fontSize:'11px', color:'#000', fontWeight:700 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize:'0.8125rem', fontWeight:500, color:'#e8f0ff' }}>Submit anonymously</div>
                <div style={{ fontSize:'0.72rem', color:'#4d6080' }}>Your name will not be attached to this report</div>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={()=>{ if(!form.violationType){toast.error('Select a violation type.');return;} setStep(2); }} className="btn-primary">Next: Details →</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <BookOpen size={19} color="#a78bfa"/>
              </div>
              <div>
                <div style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff' }}>Incident Details</div>
                <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Describe the misconduct in detail</div>
              </div>
            </div>

            <div>
              <Label>Description of Violation *</Label>
              <textarea className="form-input" rows={5} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe the academic misconduct in detail — when did it happen, who was involved, what was the nature of the violation..." style={{ resize:'vertical', minHeight:120 }}/>
            </div>
            <div>
              <Label>Persons Involved (if known)</Label>
              <input className="form-input" value={form.affectedSystems} onChange={e=>set('affectedSystems',e.target.value)} placeholder="Student ID / Name (optional — can remain anonymous)"/>
            </div>
            <div>
              <Label>What actions have been taken so far?</Label>
              <textarea className="form-input" rows={2} value={form.actionsTaken} onChange={e=>set('actionsTaken',e.target.value)} placeholder="e.g. Informed the lecturer, collected screenshots..." style={{ resize:'vertical' }}/>
            </div>

            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'space-between' }}>
              <button onClick={()=>setStep(1)} className="btn-secondary">← Back</button>
              <button onClick={()=>{ if(!form.description){toast.error('Please add a description.');return;} setStep(3); }} className="btn-primary">Next: Evidence →</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(16,185,129,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Paperclip size={19} color="#34d399"/>
              </div>
              <div>
                <div style={{ fontSize:'0.9375rem', fontWeight:600, color:'#e8f0ff' }}>Supporting Evidence</div>
                <div style={{ fontSize:'0.78rem', color:'#4d6080' }}>Upload screenshots, documents, or any proof (optional)</div>
              </div>
            </div>

            <label style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.875rem 1.25rem', borderRadius:10, border:'2px dashed rgba(99,149,255,0.2)', background:'rgba(10,18,36,0.4)', cursor:'pointer', transition:'all 200ms' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.45)'; e.currentTarget.style.background='rgba(59,130,246,0.05)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(99,149,255,0.2)'; e.currentTarget.style.background='rgba(10,18,36,0.4)'; }}>
              <Paperclip size={16} color="#8ba3cc"/>
              <div>
                <div style={{ fontSize:'0.8125rem', color:'#e8f0ff', fontWeight:500 }}>Click to attach evidence files</div>
                <div style={{ fontSize:'0.72rem', color:'#4d6080' }}>Screenshots, documents, PDF — max 10MB each</div>
              </div>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFiles} style={{ display:'none' }}/>
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
                    <button type="button" onClick={()=>setFiles(p=>p.filter((_,idx)=>idx!==i))} style={{ background:'none', border:'none', color:'#4d6080', cursor:'pointer' }}
                      onMouseEnter={e=>{ e.currentTarget.style.color='#f87171'; }} onMouseLeave={e=>{ e.currentTarget.style.color='#4d6080'; }}>
                      <X size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div style={{ background:'rgba(10,18,36,0.5)', borderRadius:10, padding:'1rem', border:'1px solid rgba(99,149,255,0.1)' }}>
              <div style={{ fontSize:'0.75rem', fontWeight:600, color:'#8ba3cc', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.625rem' }}>Report Summary</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {[
                  ['Violation Type', VIOLATION_TYPES.find(v=>v.value===form.violationType)?.label||'—'],
                  ['Course', form.course||'Not specified'],
                  ['Anonymous', anonymous ? 'Yes' : 'No'],
                  ['Evidence Files', `${files.length} file(s)`],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem' }}>
                    <span style={{ color:'#4d6080' }}>{k}</span>
                    <span style={{ color:'#e8f0ff', fontWeight:500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'space-between' }}>
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
export default AcademicViolationPage;
