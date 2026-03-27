import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle, BookOpen, Users, Cpu } from 'lucide-react';

function StatCard({ label, value, sub, gradient, icon: Icon }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">{label}</p>
        {Icon && <Icon size={14} className="text-gray-700" />}
      </div>
      <p className="text-3xl font-bold font-mono mb-1" style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-gray-600">{sub}</p>}
    </motion.div>
  );
}

function HowItWorksStep({ num, title, body }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-blue-300 font-mono mt-0.5"
        style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
        {num}
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-1">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function Overview({ profile }) {
  const noData = !profile || profile.articles_read === 0;
  const trapped = profile?.echo_chamber_detected;
  const biasScore = profile ? Math.round((1 - profile.average_cognitive_bias) * 100) : null;
  const polLabel = !profile ? null
    : profile.average_political_leaning > 0.25 ? 'Right-Leaning'
    : profile.average_political_leaning < -0.25 ? 'Left-Leaning'
    : 'Centrist';

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge-blue">Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Overview</h1>
        <p className="text-gray-500 text-sm mt-1.5">Your cognitive health and reading profile at a glance.</p>
      </div>

      {/* Echo Chamber Status Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: noData
            ? 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
            : trapped
              ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))',
          border: `1px solid ${noData ? 'rgba(255,255,255,0.06)' : trapped ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
          boxShadow: noData ? 'none' : trapped ? '0 0 40px rgba(239,68,68,0.04)' : '0 0 40px rgba(16,185,129,0.04)'
        }}>
        {/* Glow blob */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${noData ? 'rgba(59,130,246,0.06)' : trapped ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'} 0%, transparent 70%)`, filter: 'blur(20px)' }} />
        <div className="relative flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: noData ? 'rgba(255,255,255,0.04)' : trapped ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', border: `1px solid ${noData ? 'rgba(255,255,255,0.06)' : trapped ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}` }}>
            {noData ? <ShieldAlert size={22} className="text-gray-500" />
              : trapped ? <AlertTriangle size={22} className="text-red-400" />
              : <CheckCircle size={22} className="text-emerald-400" />}
          </div>
          <div>
            <p className={`text-xl font-bold mb-1 ${noData ? 'text-gray-400' : trapped ? 'text-red-300' : 'text-emerald-300'}`}>
              {noData ? 'No Data Yet' : trapped ? 'Echo Chamber Detected' : 'Perspective Looks Healthy'}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
              {noData
                ? 'Head to the Feed Analyzer and paste an article to begin building your cognitive profile.'
                : trapped
                  ? (profile.metrics_warning || 'Your reading history shows significant one-sidedness. Visit Opposing Views for recommendations.')
                  : 'Your reading habits reflect a balanced range of perspectives. Keep exploring diverse sources!'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Articles Read" value={profile?.articles_read ?? '—'}
          sub="total analyzed" gradient="linear-gradient(135deg, #60a5fa, #a78bfa)" icon={BookOpen} />
        <StatCard label="Perspective Score" value={biasScore !== null ? `${biasScore}%` : '—'}
          sub="higher = healthier" gradient="linear-gradient(135deg, #34d399, #10b981)" icon={Cpu} />
        <StatCard label="Political Leaning" value={polLabel ?? '—'}
          sub="based on history" gradient="linear-gradient(135deg, #a78bfa, #8b5cf6)" icon={Users} />
        <StatCard
          label="Emotional Manip." icon={AlertTriangle}
          value={profile ? `${Math.round(profile.average_emotional_manipulation * 100)}%` : '—'}
          sub="manipulation index"
          gradient={profile && profile.average_emotional_manipulation > 0.5 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #34d399, #10b981)'} />
      </div>

      {/* Divider */}
      <div className="gradient-divider" />

      {/* How This Works */}
      <div className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={15} className="text-blue-400" />
          <h3 className="text-white font-semibold">How It Works</h3>
          <span className="badge-blue ml-auto">3-Step Process</span>
        </div>
        <div className="space-y-5">
          <HowItWorksStep num="1" title="Paste an article"
            body="Go to Feed Analyzer and paste any news article. Our AI runs zero-shot classification to score cognitive bias, emotional manipulation, and political leaning." />
          <div className="h-px bg-white/[0.04]" />
          <HowItWorksStep num="2" title="Build your profile"
            body="Every article you analyze is tracked. Over time, the system identifies patterns and detects if you're consumed by a one-sided information bubble." />
          <div className="h-px bg-white/[0.04]" />
          <HowItWorksStep num="3" title="Break the bubble"
            body="When an echo chamber is detected, the Opposing Views engine finds and surfaces content from the other side — calibrated to your exact political trajectory." />
        </div>
      </div>
    </div>
  );
}
