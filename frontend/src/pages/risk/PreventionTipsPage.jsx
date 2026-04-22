import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Key, Wifi, Mail, RefreshCw, Lock, Database, Eye } from 'lucide-react';

const tips = [
  {
    category: 'Password Security',
    icon: Key,
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    items: [
      'Use at least 12 characters with uppercase, lowercase, numbers, and symbols.',
      'Never reuse passwords across accounts — use a password manager.',
      'Change passwords every 3–6 months, especially for sensitive accounts.',
      'Avoid using personal info (name, birthday) in passwords.',
      'Use a reputable password manager like Bitwarden or 1Password.',
    ],
  },
  {
    category: 'Phishing Prevention',
    icon: Mail,
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    items: [
      'Always verify the sender email address before clicking links.',
      'Hover over links to preview the URL before clicking.',
      'Never provide credentials or personal info via email.',
      'Report suspicious emails to your IT/security team.',
      'If in doubt, contact the sender through a different channel.',
    ],
  },
  {
    category: 'Two-Factor Authentication',
    icon: Lock,
    color: 'text-green-400',
    bg: 'bg-green-900/30',
    items: [
      'Enable 2FA on all critical accounts (email, banking, university portals).',
      'Use authenticator apps (Google Authenticator, Authy) instead of SMS.',
      'Store backup codes in a safe, offline location.',
      'Never share 2FA codes with anyone, even support staff.',
    ],
  },
  {
    category: 'Software & Updates',
    icon: RefreshCw,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30',
    items: [
      'Enable automatic OS updates to patch security vulnerabilities.',
      'Keep all apps and browsers updated to the latest version.',
      'Remove software you no longer use.',
      'Only install software from trusted, official sources.',
    ],
  },
  {
    category: 'Network & Wi-Fi Safety',
    icon: Wifi,
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    items: [
      'Avoid public Wi-Fi for sensitive activities like banking.',
      'Use a VPN when connecting to public or untrusted networks.',
      'Use WPA3 encryption on your home router.',
      'Change default router passwords immediately.',
      'Regularly check devices connected to your home network.',
    ],
  },
  {
    category: 'Data Protection',
    icon: Database,
    color: 'text-indigo-400',
    bg: 'bg-indigo-900/30',
    items: [
      'Store sensitive files in encrypted folders or cloud storage with 2FA.',
      'Back up important data regularly (follow 3-2-1 rule).',
      'Securely wipe devices before disposing or selling.',
      'Lock your screen when leaving your computer unattended.',
    ],
  },
  {
    category: 'Antivirus & Endpoint',
    icon: Shield,
    color: 'text-teal-400',
    bg: 'bg-teal-900/30',
    items: [
      'Install reputable antivirus/endpoint protection software.',
      'Keep antivirus definitions updated automatically.',
      'Run regular full-system scans.',
      'Enable firewall on your device.',
    ],
  },
  {
    category: 'Privacy Awareness',
    icon: Eye,
    color: 'text-pink-400',
    bg: 'bg-pink-900/30',
    items: [
      'Review privacy settings on social media accounts.',
      'Limit personal information shared publicly online.',
      'Use private browsing/incognito mode on shared computers.',
      'Clear browser cache and cookies regularly.',
    ],
  },
];

const PreventionTipsPage = () => {
  const [search, setSearch] = useState('');
  const filtered = tips.filter(t =>
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.items.some(i => i.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Prevention Tips</h1>
          <p className="text-sm text-slate-400">Practical cybersecurity tips to stay protected</p>
        </div>
        <Link to="/risk/chatbot" className="btn-primary text-sm">Ask AI for Advice</Link>
      </div>

      <input
        type="text"
        placeholder="Search tips..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="form-input w-full max-w-md"
      />

      {filtered.length === 0 ? (
        <div className="card text-center py-10 text-slate-400">No tips match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.bg}`}>
                    <Icon size={18} className={section.color} />
                  </div>
                  <h3 className="font-semibold text-slate-100">{section.category}</h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((tip, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className={`${section.color} mt-1 flex-shrink-0`}>✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PreventionTipsPage;
