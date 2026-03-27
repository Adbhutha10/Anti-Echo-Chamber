import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Users } from 'lucide-react';

function StatCard({ label, value, sub, color = '#3b82f6' }) {
  return (
    <div className="bg-[#111318] border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function Overview({ profile }) {
  const noData = !profile || profile.articles_read === 0;
  const trapped = profile?.echo_chamber_detected;
  const biasScore  = profile ? Math.round((1 - profile.average_cognitive_bias) * 100) : null;
  const polLabel   = !profile ? null
    : profile.average_political_leaning > 0.25  ? 'Right-Leaning'
    : profile.average_political_leaning < -0.25 ? 'Left-Leaning'
    : 'Centrist';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Your cognitive health summary at a glance.</p>
      </div>

      {/* Echo Chamber Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border flex items-start gap-4
          ${noData ? 'bg-white/[0.02] border-white/5'
          : trapped ? 'bg-red-500/10 border-red-500/30'
          : 'bg-emerald-500/10 border-emerald-500/30'}`}
      >
        {noData
          ? <ShieldAlert size={28} className="text-gray-500 flex-shrink-0 mt-0.5" />
          : trapped
            ? <AlertTriangle size={28} className="text-red-400 flex-shrink-0 mt-0.5" />
            : <CheckCircle size={28} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        }
        <div>
          <h2 className={`text-lg font-bold ${noData ? 'text-gray-400' : trapped ? 'text-red-300' : 'text-emerald-300'}`}>
            {noData ? 'No Data Yet'
              : trapped ? 'Echo Chamber Detected'
              : 'Perspective Looks Healthy'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {noData
              ? 'Go to Feed Analyzer and paste some article text to begin tracking your cognitive profile.'
              : trapped
                ? profile.metrics_warning
                : 'Your reading habits show a balanced range of perspectives. Keep it up!'}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Articles Analyzed" value={profile?.articles_read ?? '—'} sub="total tracked" />
        <StatCard label="Perspective Score" value={biasScore !== null ? `${biasScore}%` : '—'} sub="higher is healthier" color="#10b981" />
        <StatCard label="Political Leaning" value={polLabel ?? '—'} sub="based on reading history" color="#a78bfa" />
        <StatCard
          label="Emotional Manip."
          value={profile ? `${Math.round(profile.average_emotional_manipulation * 100)}%` : '—'}
          sub="manipulation level detected"
          color="#f59e0b"
        />
      </div>

      {/* What Is This? */}
      <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Users size={16} className="text-blue-400" /> How This Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
          <div className="space-y-1">
            <p className="text-white font-medium">1. Paste an article</p>
            <p>Go to Feed Analyzer and paste any news article text. Our AI will score it for bias, emotional manipulation, and political leaning.</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">2. Build your profile</p>
            <p>Every article you analyze is tracked. Over time, we identify patterns and detect if you're consumed by a one-sided bubble.</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">3. Break the bubble</p>
            <p>If an echo chamber is detected, the Opposing Views engine finds articles from the other side to help you see the full picture.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
