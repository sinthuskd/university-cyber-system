import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, BookOpen, Scale,
  ShieldCheck, MessageCircle, Settings, ChevronRight,
  FileWarning, History, Newspaper, Brain, Bot,
  Video, GraduationCap, Award, BarChart2,
  Shield, Lightbulb, AlertOctagon, UserCheck,
  HelpCircle, BarChart, Building2, Database,
  Play, ClipboardList, Gavel, Users, UserCog, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  {
    icon: AlertTriangle, label: 'Incidents', path: '/incidents',
    sub: [
      { label: 'Report Incident',    path: '/incidents/report',   icon: FileWarning },
      { label: 'Academic Violation', path: '/incidents/academic', icon: BookOpen },
      { label: 'All Incidents',      path: '/incidents',          icon: AlertTriangle },
      { label: 'My History',         path: '/incidents/history',  icon: History },
    ]
  },
  {
    icon: Newspaper, label: 'Awareness', path: '/awareness',
    sub: [
      { label: 'Dashboard',          path: '/awareness',               icon: Newspaper },
      { label: 'Articles',           path: '/awareness/articles',      icon: BookOpen },
      { label: 'Videos',             path: '/awareness/videos',        icon: Video },
      { label: 'Academic Integrity', path: '/awareness/integrity',     icon: GraduationCap },
      { label: 'Quizzes',            path: '/awareness/quiz',          icon: Brain },
      { label: 'Quiz Results',       path: '/awareness/quiz/results',  icon: BarChart2 },
      { label: 'Training',           path: '/awareness/training',      icon: Award },
    ]
  },
  {
    icon: Scale, label: 'Ethical Review', path: '/ethical',
    sub: [
      { label: 'Dashboard',        path: '/ethical',             icon: Scale },
      { label: 'Create Case',      path: '/ethical/create',      icon: ClipboardList },
      { label: 'Submit Appeal',    path: '/ethical/appeal',      icon: FileWarning },
      { label: 'Case History',     path: '/ethical/history',     icon: History },
    ]
  },
  {
    icon: Shield, label: 'Risk Assessment', path: '/risk',
    sub: [
      { label: 'Dashboard',         path: '/risk',                icon: LayoutDashboard },
      { label: 'Start Assessment',  path: '/risk/start',          icon: Play },
      { label: 'My Results',        path: '/risk/result',         icon: ShieldCheck },
      { label: 'History',           path: '/risk/history',        icon: History },
      { label: 'Personal Security', path: '/risk/personal',       icon: UserCheck },
    ]
  },
  {
    icon: AlertOctagon, label: 'Threat Awareness', path: '/risk/threats',
    sub: [
      { label: 'Threat Dashboard',    path: '/risk/threats',          icon: AlertOctagon },
      { label: 'Prevention Tips',     path: '/risk/prevention',       icon: Lightbulb },
      { label: 'Recommendations',     path: '/risk/recommendations',  icon: ShieldCheck },
    ]
  },
  {
    icon: Bot, label: 'AI Chatbot', path: '/risk/chatbot',
    sub: [
      { label: 'Chat',         path: '/risk/chatbot',       icon: MessageCircle },
      { label: 'Chat History', path: '/risk/chat-history',  icon: History },
    ]
  },
];

const adminNavItems = [
  { label: 'Admin Dashboard',     path: '/admin',                    icon: Settings },
  { label: 'Incident Mgmt',        path: '/admin/incidents',           icon: AlertTriangle },
  { label: 'User Management',     path: '/admin/users',              icon: UserCog },
  { label: 'Awareness Admin',     path: '/awareness/admin',          icon: Newspaper },
  { label: 'Ethics Committee',    path: '/ethical/admin',            icon: Gavel },
  { label: 'Appeal Review',       path: '/ethical/appeal-review',    icon: ClipboardList },
  { label: 'Risk Questions',      path: '/risk/admin/questions',     icon: HelpCircle },
  { label: 'Risk Analytics',      path: '/risk/admin/analytics',     icon: BarChart },
  { label: 'Dept Risk Analysis',  path: '/risk/admin/departments',   icon: Building2 },
  { label: 'AI Knowledge Base',   path: '/risk/admin/knowledge',     icon: Database },
];

const baseStyle = {
  display: 'flex', alignItems: 'center', gap: '0.6rem',
  padding: '0.5rem 0.75rem',
  borderRadius: 8,
  fontSize: '0.8125rem', fontWeight: 500,
  textDecoration: 'none',
  transition: 'all 200ms',
  border: '1px solid transparent',
  fontFamily: "'DM Sans', sans-serif",
};

const SidebarItem = ({ item }) => {
  const location = useLocation();
  const isParentActive = location.pathname.startsWith(item.path) ||
    item.sub?.some(s => location.pathname === s.path);
  const [open, setOpen] = React.useState(isParentActive);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NavLink
          to={item.sub ? item.sub[0].path : item.path}
          end={!item.sub}
          style={({ isActive }) => ({
            ...baseStyle,
            flex: 1,
            color: (item.sub ? isParentActive : isActive) ? '#93c5fd' : '#8ba3cc',
            background: (item.sub ? isParentActive : isActive) ? 'rgba(59,130,246,0.08)' : 'transparent',
            borderColor: (item.sub ? isParentActive : isActive) ? 'rgba(59,130,246,0.15)' : 'transparent',
          })}
          onMouseEnter={e => { if (!isParentActive) { e.currentTarget.style.color = '#e8f0ff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
          onMouseLeave={e => { if (!isParentActive) { e.currentTarget.style.color = '#8ba3cc'; e.currentTarget.style.background = 'transparent'; } }}
        >
          <item.icon size={15} style={{ flexShrink: 0 }} />
          {item.label}
        </NavLink>
        {item.sub && (
          <button onClick={() => setOpen(o => !o)} style={{ ...baseStyle, width: 30, padding: '0.5rem 0.25rem', color: '#4d6080', flexShrink: 0, flex: 'none', justifyContent: 'center' }}>
            <ChevronRight size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }} />
          </button>
        )}
      </div>
      {item.sub && open && (
        <div style={{ marginLeft: '1.75rem', marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {item.sub.map(s => (
            <NavLink key={s.path} to={s.path} end
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 0.75rem', borderRadius: 6,
                fontSize: '0.7813rem', fontFamily: "'DM Sans', sans-serif",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#93c5fd' : '#4d6080',
                background: isActive ? 'rgba(59,130,246,0.07)' : 'transparent',
                textDecoration: 'none', transition: 'all 200ms',
                borderLeft: isActive ? '2px solid rgba(59,130,246,0.5)' : '2px solid transparent',
              })}
              onMouseEnter={e => { e.currentTarget.style.color = '#8ba3cc'; }}
              onMouseLeave={e => { if (!e.currentTarget.className.includes('active')) e.currentTarget.style.color = '#4d6080'; }}
            >
              {s.icon && <s.icon size={12} style={{ flexShrink: 0 }} />}
              {s.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: 72, bottom: 0,
      width: 220,
      background: 'rgba(6,12,26,0.7)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(99,149,255,0.08)',
      overflowY: 'auto',
      zIndex: 50,
      padding: '1rem 0.75rem',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      {/* My Profile quick link */}
      <NavLink to="/profile"
        style={({ isActive }) => ({
          ...baseStyle,
          color: isActive ? '#93c5fd' : '#8ba3cc',
          background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
          borderColor: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
          marginBottom: 4,
        })}
        onMouseEnter={e => { e.currentTarget.style.color = '#e8f0ff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#8ba3cc'; e.currentTarget.style.background = 'transparent'; }}
      >
        <User size={15} style={{ flexShrink: 0 }} />
        My Profile
      </NavLink>

      <div style={{ height: 1, background: 'rgba(99,149,255,0.06)', margin: '0.25rem 0 0.5rem' }} />

      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2a3a50', padding: '0 0.5rem', marginBottom: '0.25rem' }}>
        Navigation
      </div>

      {navItems.map(item => <SidebarItem key={item.path} item={item} />)}

      {user?.role === 'ADMIN' && (
        <>
          <div style={{ height: 1, background: 'rgba(99,149,255,0.06)', margin: '0.5rem 0' }} />
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2a3a50', padding: '0 0.5rem', marginBottom: '0.25rem' }}>
            Admin
          </div>
          {adminNavItems.map(item => (
            <NavLink key={item.path} to={item.path}
              style={({ isActive }) => ({
                ...baseStyle,
                color: isActive ? '#c4b5fd' : '#8ba3cc',
                background: isActive ? 'rgba(139,92,246,0.08)' : 'transparent',
                borderColor: isActive ? 'rgba(139,92,246,0.2)' : 'transparent',
              })}
              onMouseEnter={e => { e.currentTarget.style.color = '#e8f0ff'; e.currentTarget.style.background = 'rgba(139,92,246,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8ba3cc'; e.currentTarget.style.background = 'transparent'; }}
            >
              <item.icon size={15} style={{ flexShrink: 0 }} />
              {item.label}
            </NavLink>
          ))}
        </>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', color: '#1e2d40', letterSpacing: '0.08em', textAlign: 'center' }}>
          v1.0.0 • UniCyberGuard
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
