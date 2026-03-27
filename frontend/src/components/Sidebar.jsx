import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, LayoutDashboard, Zap, Radio,
  BarChart2, Target, LogOut, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'overview',        label: 'Overview',       icon: LayoutDashboard },
  { key: 'analyzer',        label: 'Feed Analyzer',  icon: Zap             },
  { key: 'scout',           label: 'Live Scout',     icon: Radio           },
  { key: 'report',          label: 'Bias Report',    icon: BarChart2       },
  { key: 'recommendations', label: 'Opposing Views', icon: Target          },
];

export default function Sidebar({ activePage, setActivePage, username, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0D0E14] border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <ShieldAlert size={16} className="text-blue-400" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Anti-Echo Chamber</p>
          <p className="text-[#555] text-[10px] tracking-wide">Cognitive Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = activePage === key;
          return (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? 'bg-blue-500/15 border border-blue-500/25 text-blue-300'
                  : 'text-[#6b7280] hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Icon size={16} className={active ? 'text-blue-400' : 'text-[#555] group-hover:text-gray-300'} />
              <span className="flex-1 text-left">{label}</span>
              {active && <ChevronRight size={13} className="text-blue-400/60" />}
            </button>
          );
        })}
      </nav>

      {/* User chip */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 border border-white/10 flex items-center justify-center text-white text-xs font-bold">
            {username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="flex-1 text-sm text-gray-300 truncate font-mono">{username}</span>
          <button onClick={onLogout} title="Logout" className="text-[#444] hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
