import React, { useState, useRef, useEffect } from 'react';
import { Shield, LogOut, Bell, ChevronDown, User, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };
  const avatarSrc = user?.profileImageUrl || null;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
      height: '72px',
      background: 'rgba(6,12,26,0.96)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(99,149,255,0.13)',
      display: 'flex', alignItems: 'center',
      padding: '0 2rem',
      justifyContent: 'space-between',
      boxShadow: '0 4px 32px rgba(0,0,0,0.45)',
    }}>
      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Logo */}
      <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:'0.875rem', textDecoration:'none', userSelect:'none' }}>
        <div style={{
          width:46, height:46,
          background:'linear-gradient(135deg,#1d4ed8,#4f46e5)',
          borderRadius:13,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 26px rgba(59,130,246,0.45),0 0 8px rgba(99,102,241,0.3)',
          border:'1px solid rgba(99,149,255,0.25)',
          flexShrink:0,
        }}>
          <Shield size={25} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.2rem', color:'#e8f0ff', letterSpacing:'-0.03em', lineHeight:1 }}>
            Uni<span style={{color:'#60a5fa'}}>Cyber</span>Guard
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'#3b6090', letterSpacing:'0.14em', marginTop:3, lineHeight:1 }}>
            University Security Platform
          </div>
        </div>
      </Link>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
        <button style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(99,149,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#8ba3cc', cursor:'pointer', transition:'all 200ms', position:'relative' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,149,255,0.1)'; e.currentTarget.style.color='#e8f0ff'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#8ba3cc'; }}>
          <Bell size={16}/>
          <span style={{ position:'absolute', top:9, right:9, width:7, height:7, borderRadius:'50%', background:'#3b82f6', border:'1.5px solid #060c1a' }}/>
        </button>

        <div style={{ width:1, height:28, background:'rgba(99,149,255,0.1)', margin:'0 0.25rem' }}/>

        <div ref={dropRef} style={{ position:'relative' }}>
          <button onClick={()=>setDropOpen(p=>!p)} style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.375rem 0.875rem 0.375rem 0.5rem', background:dropOpen?'rgba(99,149,255,0.1)':'rgba(255,255,255,0.04)', border:'1px solid rgba(99,149,255,0.14)', borderRadius:100, cursor:'pointer', transition:'all 200ms' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,149,255,0.1)'; }}
            onMouseLeave={e=>{ if(!dropOpen) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}>
            <div style={{ width:34, height:34, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#3b82f6,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.78rem', fontWeight:700, color:'#fff', flexShrink:0, border:'2px solid rgba(99,149,255,0.2)' }}>
              {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.currentTarget.style.display='none'; }}/> : initials}
            </div>
            <div style={{ lineHeight:1.25, textAlign:'left' }}>
              <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#e8f0ff' }}>{user?.name?.split(' ')[0]||'User'}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.6rem', color:'#4d6080', letterSpacing:'0.06em' }}>{user?.role}</div>
            </div>
            <ChevronDown size={13} color="#4d6080" style={{ transform:dropOpen?'rotate(180deg)':'rotate(0deg)', transition:'transform 200ms' }}/>
          </button>

          {dropOpen && (
            <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:210, background:'#0f1a30', border:'1px solid rgba(99,149,255,0.15)', borderRadius:12, boxShadow:'0 16px 48px rgba(0,0,0,0.55)', overflow:'hidden', zIndex:100, animation:'fadeDown 150ms ease' }}>
              <div style={{ padding:'0.875rem 1rem', borderBottom:'1px solid rgba(99,149,255,0.08)' }}>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#e8f0ff' }}>{user?.name}</div>
                <div style={{ fontSize:'0.72rem', color:'#4d6080', marginTop:2 }}>{user?.email}</div>
              </div>
              {[
                { icon:User, label:'My Profile', to:'/profile' },
                { icon:KeyRound, label:'Reset Password', to:'/profile?tab=password' },
              ].map(item=>(
                <Link key={item.label} to={item.to} onClick={()=>setDropOpen(false)} style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.625rem 1rem', textDecoration:'none', color:'#8ba3cc', fontSize:'0.8125rem', transition:'all 150ms' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,149,255,0.08)'; e.currentTarget.style.color='#e8f0ff'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8ba3cc'; }}>
                  <item.icon size={14}/>{item.label}
                </Link>
              ))}
              <div style={{ borderTop:'1px solid rgba(99,149,255,0.08)', margin:'0.25rem 0' }}/>
              <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.625rem 1rem', width:'100%', background:'transparent', border:'none', color:'#f87171', fontSize:'0.8125rem', cursor:'pointer', transition:'all 150ms' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.08)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
                <LogOut size={14}/>Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
