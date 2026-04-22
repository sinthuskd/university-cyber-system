import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit2, Trash2, KeyRound, X, Save, AlertTriangle, Download, Filter, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE = 'http://localhost:8080/api';

const ROLES = ['USER','ADMIN'];
const DEPTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Business','Other'];

const badge = (role) => (
  <span style={{ padding:'2px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:600, fontFamily:"'DM Mono',monospace", letterSpacing:'0.05em', background: role==='ADMIN'?'rgba(99,102,241,0.15)':'rgba(59,130,246,0.12)', color: role==='ADMIN'?'#a78bfa':'#60a5fa', border:`1px solid ${role==='ADMIN'?'rgba(99,102,241,0.2)':'rgba(59,130,246,0.15)'}` }}>{role}</span>
);

const Modal = ({ title, children, onClose }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(6px)' }}>
    <div style={{ background:'#0f1a30', border:'1px solid rgba(99,149,255,0.2)', borderRadius:16, width:520, maxWidth:'95vw', maxHeight:'90vh', overflow:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(99,149,255,0.1)' }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:700, color:'#e8f0ff', margin:0 }}>{title}</h3>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#4d6080', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:6 }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#f87171'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color='#4d6080'; }}>
          <X size={16}/>
        </button>
      </div>
      <div style={{ padding:'1.5rem' }}>{children}</div>
    </div>
  </div>
);

const Field = ({ label, type='text', value, onChange, as, children, disabled }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
    <label style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</label>
    {as==='select'
      ? <select value={value} onChange={onChange} disabled={disabled} style={{ padding:'0.575rem 0.875rem', background:'rgba(10,18,36,0.8)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:8, color:'#e8f0ff', fontSize:'0.875rem', outline:'none', fontFamily:"'DM Sans',sans-serif", cursor:disabled?'not-allowed':'pointer' }}>{children}</select>
      : <input type={type} value={value} onChange={onChange} disabled={disabled} style={{ padding:'0.575rem 0.875rem', background: disabled?'rgba(10,18,36,0.35)':'rgba(10,18,36,0.8)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:8, color:disabled?'#4d6080':'#e8f0ff', fontSize:'0.875rem', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
          onFocus={e=>{ if(!disabled) e.target.style.borderColor='rgba(99,149,255,0.45)'; }}
          onBlur={e=>{ e.target.style.borderColor='rgba(99,149,255,0.14)'; }}
        />}
  </div>
);

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'delete' | 'password'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'USER', department:'', phone:'' });
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await axios.get(`${BASE}/users`); setUsers(r.data); }
    catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.department?.toLowerCase().includes(q);
    const matchR = roleFilter==='ALL' || u.role===roleFilter;
    return matchQ && matchR;
  });

  const openEdit = (u) => { setSelected(u); setForm({ name:u.name||'', email:u.email||'', password:'', role:u.role||'USER', department:u.department||'', phone:u.phone||'' }); setModal('edit'); };
  const openDelete = (u) => { setSelected(u); setModal('delete'); };
  const openPwReset = (u) => { setSelected(u); setNewPw(''); setModal('password'); };

  const handleCreate = async () => {
    if (!form.name||!form.email||!form.password) { toast.error('Name, email, password required.'); return; }
    setSaving(true);
    try { await axios.post(`${BASE}/users`, form); toast.success('User created!'); fetchUsers(); setModal(null); }
    catch (e) { toast.error(e?.response?.data?.message||'Create failed.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try { await axios.put(`${BASE}/users/${selected.id}`, { name:form.name, role:form.role, department:form.department, phone:form.phone }); toast.success('User updated!'); fetchUsers(); setModal(null); }
    catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await axios.delete(`${BASE}/users/${selected.id}`); toast.success('User deleted!'); fetchUsers(); setModal(null); }
    catch { toast.error('Delete failed.'); }
    finally { setSaving(false); }
  };

  const handlePwReset = async () => {
    if (!newPw || newPw.length < 6) { toast.error('Min 6 characters.'); return; }
    setSaving(true);
    try { await axios.put(`${BASE}/users/${selected.id}/reset-password`, { newPassword: newPw }); toast.success('Password reset!'); setModal(null); }
    catch { toast.error('Reset failed.'); }
    finally { setSaving(false); }
  };

  const exportCSV = () => {
    const rows = [['Name','Email','Role','Department','Phone'],...filtered.map(u=>[u.name,u.email,u.role,u.department||'',u.phone||''])];
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='users_report.csv'; a.click();
  };

  const btnSm = (onClick, children, color='blue', title) => (
    <button onClick={onClick} title={title} style={{ display:'flex', alignItems:'center', gap:5, padding:'0.375rem 0.75rem', borderRadius:7, border:`1px solid rgba(${color==='red'?'239,68,68':color==='amber'?'245,158,11':'59,130,246'},0.2)`, background:`rgba(${color==='red'?'239,68,68':color==='amber'?'245,158,11':'59,130,246'},0.07)`, color: color==='red'?'#f87171':color==='amber'?'#fbbf24':'#60a5fa', fontSize:'0.75rem', cursor:'pointer', transition:'all 150ms', whiteSpace:'nowrap' }}
      onMouseEnter={e=>{ e.currentTarget.style.background=`rgba(${color==='red'?'239,68,68':color==='amber'?'245,158,11':'59,130,246'},0.15)`; }}
      onMouseLeave={e=>{ e.currentTarget.style.background=`rgba(${color==='red'?'239,68,68':color==='amber'?'245,158,11':'59,130,246'},0.07)`; }}>
      {children}
    </button>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="animate-fade-up" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
        <div>
          <div className="section-label">Admin</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.375rem', fontWeight:700, color:'#e8f0ff', margin:'0.25rem 0 0', letterSpacing:'-0.02em' }}>User Management</h1>
        </div>
        <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
          <button onClick={fetchUsers} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 1rem', borderRadius:9, border:'1px solid rgba(99,149,255,0.15)', background:'rgba(255,255,255,0.03)', color:'#8ba3cc', fontSize:'0.8125rem', cursor:'pointer' }}>
            <RefreshCw size={13}/>Refresh
          </button>
          <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 1rem', borderRadius:9, border:'1px solid rgba(16,185,129,0.2)', background:'rgba(16,185,129,0.08)', color:'#34d399', fontSize:'0.8125rem', cursor:'pointer' }}>
            <Download size={13}/>Export CSV
          </button>
          <button onClick={()=>{ setForm({ name:'', email:'', password:'', role:'USER', department:'', phone:'' }); setModal('create'); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 1rem', borderRadius:9, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', fontSize:'0.8125rem', fontWeight:600, cursor:'pointer' }}>
            <Plus size={13}/>Add User
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
        {[
          { label:'Total Users', value:users.length, color:'blue' },
          { label:'Admins', value:users.filter(u=>u.role==='ADMIN').length, color:'violet' },
          { label:'Regular Users', value:users.filter(u=>u.role==='USER').length, color:'cyan' },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{ padding:'0.875rem 1rem' }}>
            <div style={{ fontSize:'0.72rem', color:'#4d6080', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'1.75rem', fontWeight:700, color:'#e8f0ff', lineHeight:1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="card animate-fade-up" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#4d6080', pointerEvents:'none' }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, department…"
              style={{ width:'100%', paddingLeft:'2rem', paddingRight:'0.875rem', paddingTop:'0.55rem', paddingBottom:'0.55rem', background:'rgba(10,18,36,0.8)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:8, color:'#e8f0ff', fontSize:'0.8125rem', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
              onFocus={e=>{ e.target.style.borderColor='rgba(99,149,255,0.45)'; }} onBlur={e=>{ e.target.style.borderColor='rgba(99,149,255,0.14)'; }}
            />
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['ALL','USER','ADMIN'].map(r=>(
              <button key={r} onClick={()=>setRoleFilter(r)} style={{ padding:'0.45rem 0.875rem', borderRadius:7, border:'1px solid rgba(99,149,255,0.14)', fontSize:'0.75rem', cursor:'pointer', background: roleFilter===r?'rgba(59,130,246,0.15)':'transparent', color: roleFilter===r?'#60a5fa':'#4d6080', fontWeight: roleFilter===r?600:400, transition:'all 150ms' }}>{r}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'#4d6080' }}>Loading…</td></tr>
              ) : filtered.map((u,i) => (
                <tr key={u.id}>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'#4d6080' }}>{i+1}</span></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {u.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?'}
                      </div>
                      <span style={{ fontWeight:500, color:'#e8f0ff' }}>{u.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'#8ba3cc' }}>{u.email}</span></td>
                  <td>{badge(u.role)}</td>
                  <td><span style={{ color:'#8ba3cc', fontSize:'0.8125rem' }}>{u.department||'—'}</span></td>
                  <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', color:'#4d6080' }}>{u.phone||'—'}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:5 }}>
                      {btnSm(()=>openEdit(u), <><Edit2 size={12}/>Edit</>, 'blue', 'Edit user')}
                      {btnSm(()=>openPwReset(u), <><KeyRound size={12}/>Password</>, 'amber', 'Reset password')}
                      {btnSm(()=>openDelete(u), <><Trash2 size={12}/>Delete</>, 'red', 'Delete user')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length===0 && (
            <div className="empty-state"><Users size={28} style={{ color:'#2a3a50' }}/><span>{search?'No users match your search':'No users found'}</span></div>
          )}
        </div>
        <div style={{ fontSize:'0.75rem', color:'#4d6080' }}>Showing {filtered.length} of {users.length} users</div>
      </div>

      {/* CREATE MODAL */}
      {modal==='create' && (
        <Modal title="Add New User" onClose={()=>setModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
              <Field label="Full Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
              <Field label="Email" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
              <Field label="Password" type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}/>
              <Field label="Phone" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
              <Field label="Role" as="select" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </Field>
              <Field label="Department" as="select" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))}>
                <option value="">Select…</option>
                {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
              </Field>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.625rem', marginTop:'0.5rem' }}>
              <button onClick={()=>setModal(null)} style={{ padding:'0.575rem 1.125rem', borderRadius:8, border:'1px solid rgba(99,149,255,0.15)', background:'transparent', color:'#8ba3cc', fontSize:'0.8125rem', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.575rem 1.25rem', borderRadius:8, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', fontSize:'0.8125rem', fontWeight:600, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
                <Save size={13}/>{saving?'Creating…':'Create User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {modal==='edit' && selected && (
        <Modal title={`Edit — ${selected.name}`} onClose={()=>setModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
              <Field label="Full Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
              <Field label="Email" value={form.email} disabled/>
              <Field label="Phone" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
              <Field label="Role" as="select" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </Field>
              <Field label="Department" as="select" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))}>
                <option value="">Select…</option>
                {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
              </Field>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.625rem', marginTop:'0.5rem' }}>
              <button onClick={()=>setModal(null)} style={{ padding:'0.575rem 1.125rem', borderRadius:8, border:'1px solid rgba(99,149,255,0.15)', background:'transparent', color:'#8ba3cc', fontSize:'0.8125rem', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleUpdate} disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.575rem 1.25rem', borderRadius:8, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', fontSize:'0.8125rem', fontWeight:600, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
                <Save size={13}/>{saving?'Saving…':'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* PASSWORD RESET MODAL */}
      {modal==='password' && selected && (
        <Modal title={`Reset Password — ${selected.name}`} onClose={()=>setModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <p style={{ fontSize:'0.8125rem', color:'#8ba3cc', margin:0 }}>Set a new password for <strong style={{ color:'#e8f0ff' }}>{selected.name}</strong>. They will need to use this to sign in.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
              <label style={{ fontSize:'0.72rem', fontWeight:500, color:'#8ba3cc', letterSpacing:'0.05em', textTransform:'uppercase' }}>New Password</label>
              <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Minimum 6 characters"
                style={{ padding:'0.6rem 0.875rem', background:'rgba(10,18,36,0.8)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:8, color:'#e8f0ff', fontSize:'0.875rem', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
                onFocus={e=>{ e.target.style.borderColor='rgba(99,149,255,0.45)'; }} onBlur={e=>{ e.target.style.borderColor='rgba(99,149,255,0.14)'; }}
              />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.625rem' }}>
              <button onClick={()=>setModal(null)} style={{ padding:'0.575rem 1.125rem', borderRadius:8, border:'1px solid rgba(99,149,255,0.15)', background:'transparent', color:'#8ba3cc', fontSize:'0.8125rem', cursor:'pointer' }}>Cancel</button>
              <button onClick={handlePwReset} disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.575rem 1.25rem', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#000', fontSize:'0.8125rem', fontWeight:600, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
                <KeyRound size={13}/>{saving?'Resetting…':'Reset Password'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {modal==='delete' && selected && (
        <Modal title="Confirm Delete" onClose={()=>setModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', alignItems:'center', textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={26} color="#f87171"/>
            </div>
            <div>
              <div style={{ fontSize:'1rem', fontWeight:600, color:'#e8f0ff', marginBottom:6 }}>Delete "{selected.name}"?</div>
              <div style={{ fontSize:'0.8125rem', color:'#4d6080' }}>This action cannot be undone. All data associated with this user will be permanently removed.</div>
            </div>
            <div style={{ display:'flex', gap:'0.625rem', width:'100%' }}>
              <button onClick={()=>setModal(null)} style={{ flex:1, padding:'0.625rem', borderRadius:8, border:'1px solid rgba(99,149,255,0.15)', background:'transparent', color:'#8ba3cc', fontSize:'0.875rem', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'0.625rem', borderRadius:8, border:'none', background:'rgba(239,68,68,0.15)', color:'#f87171', fontSize:'0.875rem', fontWeight:600, cursor:saving?'not-allowed':'pointer', border:'1px solid rgba(239,68,68,0.25)' }}>
                <Trash2 size={14}/>{saving?'Deleting…':'Delete User'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagementPage;
