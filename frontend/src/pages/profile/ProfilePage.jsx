import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Building2, GraduationCap, Camera, KeyRound, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE = 'http://localhost:8080/api';

const Field = ({ label, icon: Icon, type='text', value, onChange, disabled, placeholder }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
    <label style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</label>
    <div style={{ position:'relative' }}>
      {Icon && <Icon size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>}
      <input type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder}
        style={{ width:'100%', padding:`0.6rem 0.875rem 0.6rem ${Icon?'2.1rem':'0.875rem'}`, background:disabled?'rgba(10,18,36,0.35)':'rgba(10,18,36,0.8)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:8, color:disabled?'#3b6090':'#e8f0ff', fontSize:'0.875rem', outline:'none', transition:'border 200ms', fontFamily:"'DM Sans',sans-serif", cursor:disabled?'not-allowed':'text' }}
        onFocus={e=>{ if(!disabled) e.target.style.borderColor='rgba(99,149,255,0.45)'; }}
        onBlur={e=>{ e.target.style.borderColor='rgba(99,149,255,0.14)'; }}
      />
    </div>
  </div>
);

const ProfilePage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'profile');
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: user?.name||'', email: user?.email||'', phone: user?.phone||'', department: user?.department||'' });
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.profileImageUrl||null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [pw, setPw] = useState({ current:'', newPass:'', confirm:'' });
  const [showPw, setShowPw] = useState({ current:false, newPass:false, confirm:false });
  const [pwSaving, setPwSaving] = useState(false);

  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';

  const handleAvatarChange = (e) => {
    const f = e.target.files[0]; if(!f) return;
    setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (avatarFile) {
        const fd = new FormData(); fd.append('file', avatarFile);
        await axios.post(`${BASE}/users/profile-image`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      }
      await axios.put(`${BASE}/users/profile`, { name: form.name, phone: form.phone, department: form.department });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const handlePasswordReset = async () => {
    if (pw.newPass !== pw.confirm) { toast.error('Passwords do not match!'); return; }
    if (pw.newPass.length < 8) { toast.error('Min 8 characters required.'); return; }
    setPwSaving(true);
    try {
      await axios.put(`${BASE}/users/password`, { currentPassword: pw.current, newPassword: pw.newPass });
      toast.success('Password updated!'); setPw({ current:'', newPass:'', confirm:'' });
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to update password.'); }
    finally { setPwSaving(false); }
  };

  const strength = (p) => { let s=0; if(p.length>=8)s++; if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++; return s; };
  const str = strength(pw.newPass);
  const strColors = ['#ef4444','#f97316','#eab308','#10b981'];
  const strLabels = ['Weak','Fair','Good','Strong'];

  const tabBtn = (t, label, Icon) => (
    <button onClick={()=>setTab(t)} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1.125rem', borderRadius:8, fontSize:'0.8125rem', fontWeight:500, cursor:'pointer', border:'none', background:tab===t?'rgba(59,130,246,0.15)':'transparent', color:tab===t?'#60a5fa':'#4d6080', transition:'all 200ms' }}>
      <Icon size={13}/>{label}
    </button>
  );

  return (
    <div style={{ maxWidth:740, margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up">
        <div className="section-label">Account</div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>My Profile</h1>
      </div>

      <div style={{ display:'flex', gap:'0.25rem', borderBottom:'1px solid rgba(99,149,255,0.1)', paddingBottom:'0.5rem' }}>
        {tabBtn('profile','Profile Details',User)}
        {tabBtn('password','Reset Password',KeyRound)}
      </div>

      {tab==='profile' && (
        <div className="card animate-fade-up">
          {/* Avatar section */}
          <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.5rem', paddingBottom:'1.25rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:76, height:76, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#3b82f6,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', fontWeight:700, color:'#fff', border:'3px solid rgba(99,149,255,0.2)' }}>
                {avatarPreview ? <img src={avatarPreview} alt="av" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : initials}
              </div>
              <button onClick={()=>fileRef.current?.click()} style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'#3b82f6', border:'2.5px solid #060c1a', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <Camera size={12} color="#fff"/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange}/>
            </div>
            <div>
              <div style={{ fontSize:'1rem', fontWeight:600, color:'#e8f0ff' }}>{user?.name}</div>
              <div style={{ fontSize:'0.8rem', color:'#4d6080', marginTop:2 }}>{user?.email}</div>
              <div style={{ fontSize:'0.72rem', color:'#3b6090', marginTop:5, display:'inline-block', background:'rgba(59,130,246,0.1)', padding:'2px 8px', borderRadius:4 }}>{user?.role}</div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
            <Field label="Full Name" icon={User} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Your name"/>
            <Field label="Email Address" icon={Mail} value={form.email} disabled/>
            <Field label="Phone Number" icon={Phone} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+91 XXXXXXXXXX"/>
            <Field label="Department" icon={Building2} value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))} placeholder="e.g. Computer Science"/>
            <Field label="Student ID" icon={GraduationCap} value={user?.studentId||'—'} disabled/>
            <Field label="Role" icon={User} value={user?.role||''} disabled/>
          </div>

          <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.625rem 1.5rem', background:'linear-gradient(135deg,#2563eb,#4f46e5)', border:'none', borderRadius:9, color:'#fff', fontSize:'0.875rem', fontWeight:600, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
            <Save size={14}/>{saving?'Saving…':'Save Changes'}
          </button>
        </div>
      )}

      {tab==='password' && (
        <div className="card animate-fade-up" style={{ display:'flex', flexDirection:'column', gap:'1.125rem' }}>
          <div style={{ paddingBottom:'1rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
            <h2 style={{ fontSize:'1rem', fontWeight:600, color:'#e8f0ff', margin:0 }}>Change Password</h2>
            <p style={{ fontSize:'0.8125rem', color:'#4d6080', margin:'4px 0 0' }}>Keep your account secure with a strong password.</p>
          </div>

          {/* Current */}
          {[
            { key:'current', label:'Current Password' },
          ].map(f=>(
            <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
              <label style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', letterSpacing:'0.05em', textTransform:'uppercase' }}>{f.label}</label>
              <div style={{ position:'relative' }}>
                <KeyRound size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>
                <input type={showPw[f.key]?'text':'password'} value={pw[f.key]} onChange={e=>setPw(p=>({...p,[f.key]:e.target.value}))} placeholder="Enter current password"
                  style={{ width:'100%', padding:'0.6rem 2.5rem 0.6rem 2.1rem', background:'rgba(10,18,36,0.8)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:8, color:'#e8f0ff', fontSize:'0.875rem', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
                  onFocus={e=>{ e.target.style.borderColor='rgba(99,149,255,0.45)'; }} onBlur={e=>{ e.target.style.borderColor='rgba(99,149,255,0.14)'; }}/>
                <button type="button" onClick={()=>setShowPw(p=>({...p,[f.key]:!p[f.key]}))} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#4d6080', cursor:'pointer' }}>
                  {showPw[f.key] ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
          ))}

          {/* New password */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
            <label style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', letterSpacing:'0.05em', textTransform:'uppercase' }}>New Password</label>
            <div style={{ position:'relative' }}>
              <KeyRound size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>
              <input type={showPw.newPass?'text':'password'} value={pw.newPass} onChange={e=>setPw(p=>({...p,newPass:e.target.value}))} placeholder="Minimum 8 characters"
                style={{ width:'100%', padding:'0.6rem 2.5rem 0.6rem 2.1rem', background:'rgba(10,18,36,0.8)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:8, color:'#e8f0ff', fontSize:'0.875rem', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
                onFocus={e=>{ e.target.style.borderColor='rgba(99,149,255,0.45)'; }} onBlur={e=>{ e.target.style.borderColor='rgba(99,149,255,0.14)'; }}/>
              <button type="button" onClick={()=>setShowPw(p=>({...p,newPass:!p.newPass}))} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#4d6080', cursor:'pointer' }}>
                {showPw.newPass ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            {pw.newPass && (
              <div>
                <div style={{ display:'flex', gap:4, marginTop:6 }}>
                  {[0,1,2,3].map(i=><div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<str ? strColors[str-1] : 'rgba(99,149,255,0.1)', transition:'background 300ms' }}/>)}
                </div>
                <div style={{ fontSize:'0.7rem', color: str>0 ? strColors[str-1] : '#4d6080', marginTop:4 }}>{str>0 ? strLabels[str-1] : ''} password</div>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
            <label style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', letterSpacing:'0.05em', textTransform:'uppercase' }}>Confirm New Password</label>
            <div style={{ position:'relative' }}>
              <KeyRound size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>
              <input type={showPw.confirm?'text':'password'} value={pw.confirm} onChange={e=>setPw(p=>({...p,confirm:e.target.value}))} placeholder="Repeat new password"
                style={{ width:'100%', padding:'0.6rem 2.5rem 0.6rem 2.1rem', background:'rgba(10,18,36,0.8)', border:`1px solid ${pw.confirm && pw.newPass!==pw.confirm ? 'rgba(239,68,68,0.4)' : 'rgba(99,149,255,0.14)'}`, borderRadius:8, color:'#e8f0ff', fontSize:'0.875rem', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
                onFocus={e=>{ e.target.style.borderColor='rgba(99,149,255,0.45)'; }} onBlur={e=>{ e.target.style.borderColor= pw.confirm && pw.newPass!==pw.confirm ? 'rgba(239,68,68,0.4)' : 'rgba(99,149,255,0.14)'; }}/>
              <button type="button" onClick={()=>setShowPw(p=>({...p,confirm:!p.confirm}))} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#4d6080', cursor:'pointer' }}>
                {showPw.confirm ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            {pw.confirm && pw.newPass!==pw.confirm && <span style={{ fontSize:'0.7rem', color:'#f87171', display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11}/>Passwords do not match</span>}
          </div>

          <button onClick={handlePasswordReset} disabled={pwSaving} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.625rem 1.5rem', background:'linear-gradient(135deg,#2563eb,#4f46e5)', border:'none', borderRadius:9, color:'#fff', fontSize:'0.875rem', fontWeight:600, cursor:pwSaving?'not-allowed':'pointer', opacity:pwSaving?0.7:1 }}>
            <KeyRound size={14}/>{pwSaving?'Updating…':'Update Password'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
