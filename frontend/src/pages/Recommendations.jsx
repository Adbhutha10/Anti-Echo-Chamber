import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, RefreshCw, ExternalLink, AlertTriangle, Info } from 'lucide-react';

export default function Recommendations({ userId, profile }) {
  const [rec, setRec]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const API_BASE = import.meta.env.VITE_API_BASE || "https://anti-echo-chamber.onrender.com";
  const trapped = profile?.echo_chamber_detected;
  const biasColor = rec ? (rec.cognitive_bias > 0.6 ? '#ef4444' : rec.cognitive_bias > 0.35 ? '#f59e0b' : '#10b981') : '#10b981';

  const fetchRec = async () => {
    if (!userId) return;
    setLoading(true); setError(''); setRec(null);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/recommend`);
      if (!res.ok) throw new Error();
      setRec(await res.json());
    } catch { setError('No recommendation available. Analyze more articles first.'); }
    setLoading(false);
  };

  const steps = [
    { n: '1', t: 'Profile Analysis', b: 'Your average political leaning, bias, and emotional manipulation are computed from all tracked articles.' },
    { n: '2', t: 'Penalty Scoring', b: 'Every article is scored using a penalty formula — high bias/emotion is penalized, opposing-leaning content is rewarded.' },
    { n: '3', t: 'Recommendation', b: 'The article with the lowest penalty is returned as your "antidote" — content most likely to depolarize your feed.' },
  ];

  return (
    <div className="space-y-7">
      <div>
        <span className="badge-blue">AI Engine</span>
        <h1 className="text-3xl font-bold text-white mt-2">Opposing Views Engine</h1>
        <p className="text-gray-500 text-sm mt-1.5">Our depolarization algorithm finds the article most likely to broaden your perspective based on your reading profile.</p>
      </div>

      {/* Algorithm steps */}
      <div className="card space-y-5">
        <div className="flex items-center gap-2 mb-1"><Info size={14} className="text-blue-400" /><h3 className="text-white font-semibold text-sm">How the Algorithm Works</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map(s => (
            <div key={s.n} className="space-y-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-blue-300 font-mono"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>{s.n}</div>
              <p className="text-sm font-semibold text-white">{s.t}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status banners */}
      {trapped && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{profile.metrics_warning || 'Echo chamber detected.'} An antidote is ready below.</p>
        </div>
      )}
      {profile && !trapped && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Info size={15} className="text-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500">No echo chamber detected. You can still fetch a manual recommendation to explore new perspectives.</p>
        </div>
      )}

      <button onClick={fetchRec} disabled={loading || !userId} className="btn-purple flex items-center gap-2">
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Finding Antidote...' : 'Get Recommendation'}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <AnimatePresence>
        {rec && (
          <motion.div key="rec" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(139,92,246,0.2)', background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.04))' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(139,92,246,0.06)' }}>
              <div className="flex items-center gap-2"><Target size={15} className="text-purple-400" /><h3 className="text-white font-semibold">Recommended Article</h3></div>
              {rec.url && rec.url !== '#' && (
                <a href={rec.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg"
                  style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
                  Read Article <ExternalLink size={11} />
                </a>
              )}
            </div>
            <div className="p-6 space-y-5">
              <h4 className="text-white font-bold text-xl leading-snug">{rec.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed italic border-l-2 border-purple-500/30 pl-4">"{rec.content}"</p>
              <div className="gradient-divider" />
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Bias Score', val: `${Math.round(rec.cognitive_bias * 100)}%`, color: biasColor },
                  { label: 'Emotion Score', val: `${Math.round(rec.emotional_manipulation * 100)}%`, color: '#f59e0b' },
                  { label: 'Depolarization', val: rec.depolarization_score ? `${rec.depolarization_score}/10` : 'N/A', color: '#10b981' },
                ].map(s => (
                  <div key={s.label} className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
