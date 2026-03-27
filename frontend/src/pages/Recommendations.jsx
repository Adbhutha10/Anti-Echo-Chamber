import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, RefreshCw, ExternalLink, AlertTriangle, Info } from 'lucide-react';

export default function Recommendations({ userId, profile }) {
  const [rec, setRec]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || "https://anti-echo-chamber.onrender.com";
  const trapped  = profile?.echo_chamber_detected;

  const fetchRec = async () => {
    if (!userId) return;
    setLoading(true); setError(''); setRec(null);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/recommend`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setRec(await res.json());
    } catch (e) {
      setError('Could not load recommendation. Analyze more articles to build your profile first.');
    }
    setLoading(false);
  };

  const biasColor = rec
    ? rec.cognitive_bias > 0.6 ? '#ef4444' : rec.cognitive_bias > 0.35 ? '#f59e0b' : '#10b981'
    : '#10b981';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Opposing Views Engine</h1>
        <p className="text-gray-500 text-sm mt-1">
          Our depolarization algorithm analyzes your reading trajectory and recommends the article most likely to broaden your perspective.
        </p>
      </div>

      {/* How Recommendations Work */}
      <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info size={15} className="text-blue-400" />
          <h3 className="text-white font-semibold text-sm">How the Algorithm Works</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="space-y-1">
            <p className="text-white font-medium">Step 1 — Profile Analysis</p>
            <p>Your average political leaning, bias score, and emotional manipulation score are computed from all tracked articles.</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">Step 2 — Penalty Scoring</p>
            <p>Every article in the inventory is scored using a penalty formula that penalizes high bias / high emotion, and rewards content that leans opposite to you.</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">Step 3 — Recommendation</p>
            <p>The article with the lowest total penalty score is returned as your "antidote" — the content most likely to depolarize your feed.</p>
          </div>
        </div>
      </div>

      {/* Echo Chamber Status */}
      {profile && !trapped && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex gap-3">
          <Info size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-400">
            No echo chamber detected yet. You can still manually fetch a recommendation using the button below. Recommendations become automatic when your bias score exceeds the warning threshold.
          </p>
        </div>
      )}
      {trapped && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-5 flex gap-3">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{profile.metrics_warning} An antidote article has been identified below.</p>
        </div>
      )}

      {/* Fetch Button */}
      <button
        onClick={fetchRec} disabled={loading || !userId}
        className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 border border-purple-500/25 hover:bg-purple-500/20 text-purple-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-40"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Finding Antidote...' : 'Get Recommendation'}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Recommendation Card */}
      <AnimatePresence>
        {rec && (
          <motion.div
            key="rec" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#111318] border border-purple-500/20 rounded-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-purple-400" />
                <h3 className="text-white font-semibold">Recommended Article</h3>
              </div>
              {rec.url && rec.url !== '#' && (
                <a href={rec.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors border border-blue-400/20 rounded-lg px-3 py-1.5">
                  Read Full Article <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div className="p-6 space-y-5">
              <h4 className="text-white font-bold text-lg leading-snug">{rec.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed italic">"{rec.content}"</p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500">Bias Score</p>
                  <p className="text-lg font-bold font-mono" style={{ color: biasColor }}>
                    {Math.round(rec.cognitive_bias * 100)}%
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500">Emotion Score</p>
                  <p className="text-lg font-bold font-mono text-amber-400">
                    {Math.round(rec.emotional_manipulation * 100)}%
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500">Depolarization</p>
                  <p className="text-lg font-bold font-mono text-emerald-400">
                    {rec.depolarization_score ?? '—'}/10
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
