import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Shield, AlertTriangle, CheckCircle, Search } from 'lucide-react';

const guidelines = [
  {
    category: 'Academic Honesty',
    icon: Shield,
    color: 'blue',
    items: [
      { title: 'No Plagiarism', description: 'All submitted work must be your own. Copying text, ideas, or data from any source without proper citation is prohibited.' },
      { title: 'Proper Citation', description: 'Always cite sources using the required referencing format (APA, MLA, etc.). Give credit to original authors.' },
      { title: 'Collaboration Rules', description: 'Group work must clearly attribute individual contributions. Unauthorized collaboration on individual assignments is not allowed.' },
      { title: 'Use of AI Tools', description: 'AI-generated content must be disclosed. Using AI tools without permission or proper attribution violates academic integrity.' },
    ]
  },
  {
    category: 'Exam Conduct',
    icon: AlertTriangle,
    color: 'amber',
    items: [
      { title: 'No Unauthorized Materials', description: 'Only bring permitted materials to exams. Unauthorized notes, devices, or references are strictly prohibited.' },
      { title: 'No Impersonation', description: 'Students must sit their own exams. Having someone else sit an exam on your behalf is a serious offence.' },
      { title: 'No Communication', description: 'Communication with other students during an exam — verbal or digital — is not permitted.' },
      { title: 'Reporting Misconduct', description: 'If you witness academic misconduct, you are encouraged to report it through the official reporting channels.' },
    ]
  },
  {
    category: 'Consequences',
    icon: AlertTriangle,
    color: 'red',
    items: [
      { title: 'Grade Penalty', description: 'Minor violations may result in a zero on the submitted work or assignment.' },
      { title: 'Course Failure', description: 'Serious violations can result in an automatic fail for the entire course.' },
      { title: 'Suspension', description: 'Repeated or severe violations may lead to temporary suspension from the university.' },
      { title: 'Expulsion', description: 'The most serious violations can result in permanent expulsion and a record on your academic transcript.' },
    ]
  }
];

const colorMap = {
  blue: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa', badge: 'rgba(59,130,246,0.15)' },
  amber: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', badge: 'rgba(245,158,11,0.15)' },
  red: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#f87171', badge: 'rgba(239,68,68,0.15)' },
};

const AccordionItem = ({ item, colorScheme }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: `1px solid ${open ? colorScheme.border : 'rgba(99,149,255,0.08)'}`,
      borderRadius: 10, overflow: 'hidden',
      background: open ? colorScheme.bg : 'rgba(255,255,255,0.02)',
      transition: 'all 200ms',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
          color: '#cbd5e1', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500,
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={14} style={{ color: colorScheme.text, flexShrink: 0 }} />
          {item.title}
        </span>
        {open ? <ChevronUp size={14} style={{ color: '#4d6080' }} /> : <ChevronDown size={14} style={{ color: '#4d6080' }} />}
      </button>
      {open && (
        <div style={{ padding: '0 1rem 0.875rem', color: '#94a3b8', fontSize: '0.8125rem', lineHeight: 1.6 }}>
          {item.description}
        </div>
      )}
    </div>
  );
};

const AcademicIntegrityPage = () => {
  const [search, setSearch] = useState('');

  const filtered = guidelines.map(g => ({
    ...g,
    items: g.items.filter(i =>
      !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Academic Integrity Guidelines</h1>
        <p className="text-sm text-slate-400 mt-1">University policies on academic honesty, exam conduct, and consequences of violations</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 420 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4d6080' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guidelines..."
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,149,255,0.12)',
            borderRadius: 10, padding: '0.625rem 0.75rem 0.625rem 2.25rem',
            color: '#cbd5e1', fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif", outline: 'none',
          }}
        />
      </div>

      {/* Sections */}
      {filtered.map(section => {
        const colors = colorMap[section.color];
        const Icon = section.icon;
        return (
          <div key={section.category} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: colors.badge, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color: colors.text }} />
              </div>
              <div>
                <h2 style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9375rem' }}>{section.category}</h2>
                <p style={{ fontSize: '0.75rem', color: '#4d6080' }}>{section.items.length} guidelines</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {section.items.map(item => (
                <AccordionItem key={item.title} item={item} colorScheme={colors} />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen size={36} style={{ margin: '0 auto 0.75rem', color: '#2a3a50' }} />
          <p style={{ color: '#4d6080', fontSize: '0.875rem' }}>No guidelines matched your search.</p>
        </div>
      )}
    </div>
  );
};

export default AcademicIntegrityPage;
