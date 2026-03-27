import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, LayoutDashboard, Zap, Radio,
  BarChart2, Target, LogOut, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'overview',        label: 'Overview',       icon: LayoutDashboard, desc: 'Your cognitive health' },
  { key: 'analyzer',        label: 'Feed Analyzer',  icon: Zap,             desc: 'Analyze article bias'  },
  { key: 'scout',           label: 'Live Scout',     icon: Radio,           desc: 'Real-time news scan'   },
  { key: 'report',          label: 'Bias Report',    icon: BarChart2,       desc: 'Detailed metrics'      },
  { key: 'recommendations', label: 'Opposing Views', icon: Target,          desc: 'Find your antidote'    },
];

export default function Sidebar({ activePage, setActivePage, username, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0C14 0%, #080910 100%)', borderRight: '1px solid rgba(255,255,255,0.04)' }}>

      {/* Ambient glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />

      {/* Logo */}
      <div className="relative px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))', border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 0 16px rgba(59,130,246,0.1)' }}>
            <ShieldAlert size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Anti-Echo Chamber</p>
            <p className="text-[10px] tracking-widest uppercase font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Cognitive AI</p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>Navigation</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, icon: Icon, desc }) => {
          const active = activePage === key;
          return (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all group relative ${active ? 'nav-active' : 'hover:bg-white/[0.03] border border-transparent'}`}
            >
              {/* left accent bar */}
              {active && (
                <motion.div layoutId="activeBar"
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)' }} />
              )}
              <Icon size={15}
                className={`flex-shrink-0 transition-colors ${active ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
              <div className="flex-1 text-left">
                <p className={`font-medium leading-tight ${active ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-200'}`}>{label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: active ? 'rgba(147,197,253,0.5)' : 'rgba(255,255,255,0.18)' }}>{desc}</p>
              </div>
              {active && <ChevronRight size={12} className="text-blue-400/50 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="gradient-divider mx-3" />

      {/* Version badge */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-dot" style={{ color: '#10b981' }} />
          <span className="text-[10px] text-emerald-400 font-medium tracking-wide">System Online</span>
        </div>
        <p className="text-[10px] text-gray-700 font-mono">v1.0.0 — Phase 8</p>
      </div>

      {/* User chip */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            {username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-200 font-medium truncate font-mono">{username}</p>
            <p className="text-[10px] text-gray-600">Authenticated</p>
          </div>
          <button onClick={onLogout} title="Sign out"
            className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
