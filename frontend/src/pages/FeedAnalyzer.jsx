import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Info, AlertTriangle, CheckCircle } from 'lucide-react';

function AnimatedBar({ value, color }) {
  const pct = Math.round(value * 100);
  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }} />
    </div>
  );
}

function ScoreRow({ label, description, value, color }) {
  const pct = Math.round(value * 100);
  const level = pct > 65 ? 'High' : pct > 35 ? 'Moderate' : 'Low';
  const levelColor = pct > 65 ? '#ef4444' : pct > 35 ? '#f59e0b' : '#10b981';
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold font-mono" style={{ color }}>{pct}%</p>
          <p className="text-[10px] font-semibold" style={{ color: levelColor }}>{level}</p>
        </div>
      </div>
      <AnimatedBar value={value} color={color} />
    </div>
  );
}

export default function FeedAnalyzer({ userId, onProfileUpdate }) {
  const [text, setText]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');
  const API_BASE = import.meta.env.VITE_API_BASE || "https://anti-echo-chamber.onrender.com";

  const analyze = async () => {
    if (!text.trim() || !userId) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/track`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, text }) });
      if (!res.ok) throw new Error();
      setResult(await res.json());
      if (onProfileUpdate) onProfileUpdate();
    } catch { setError('Analysis failed. Ensure the backend is online.'); }
    setLoading(false);
  };

  const biasColor = result ? (result.cognitive_bias > 0.6 ? '#ef4444' : result.cognitive_bias > 0.35 ? '#f59e0b' : '#10b981') : '#10b981';
  const polLabel = (v) => v > 0.4 ? 'Strongly Right' : v > 0.15 ? 'Slightly Right' : v < -0.4 ? 'Strongly Left' : v < -0.15 ? 'Slightly Left' : 'Centrist';
  const polColor = (v) => v > 0.15 ? '#ef4444' : v < -0.15 ? '#3b82f6' : '#10b981';

  return (
    <div className="space-y-7">
      <div>
        <span className="badge-blue">NLP Engine</span>
        <h1 className="text-3xl font-bold text-white mt-2">Feed Analyzer</h1>
        <p className="text-gray-500 text-sm mt-1.5">Paste article text to score it for bias, emotional manipulation, and political leaning.</p>
      </div>
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
        <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400">Paste at least 3–5 sentences for accurate results. Headlines alone may not score well.</p>
      </div>
      <div className="card space-y-4">
        <div className="relative">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste article text here..."
            className="aec-input w-full h-52 px-4 py-4 resize-none leading-relaxed" />
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-700">{text.length} chars</div>
        </div>
        <div className="flex items-center justify-between">
          <div>{result && <span className="badge-green">Analysis Complete</span>}</div>
          <button onClick={analyze} disabled={loading || !text.trim() || !userId} className="btn-primary flex items-center gap-2">
            <Zap size={14} />{loading ? 'Analyzing...' : 'Run Cognitive Inference'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm flex items-center gap-1.5"><AlertTriangle size={12} />{error}</p>}
      </div>
      <AnimatePresence>
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="card-glow space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <h3 className="text-white font-semibold">Analysis Results</h3>
                </div>
                <span className="badge-green">Scored</span>
              </div>
              <div className="space-y-6">
                <ScoreRow label="Cognitive Bias" value={result.cognitive_bias} color={biasColor} description="How one-sided or slanted the article's framing is" />
                <div className="h-px bg-white/[0.04]" />
                <ScoreRow label="Emotional Manipulation" value={result.emotional_manipulation} color="#f59e0b" description="Use of outrage, fear, and charged language to sway the reader" />
              </div>
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Political Leaning</p>
                    <p className="text-xs text-gray-600 mt-0.5">Ideological orientation in this article</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: polColor(result.political_leaning) }}>{polLabel(result.political_leaning)}</p>
                    <p className="text-[10px] font-mono text-gray-600">{result.political_leaning.toFixed(3)}</p>
                  </div>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #3b82f6, #475569, #ef4444)' }}>
                  <motion.div
                    animate={{ left: `${((result.political_leaning + 1) / 2) * 100}%` }}
                    transition={{ duration: 0.9, type: 'spring' }}
                    className="absolute top-1/2 w-4 h-4 rounded-full -translate-y-1/2 -translate-x-1/2"
                    style={{ background: 'white', boxShadow: `0 0 12px ${polColor(result.political_leaning)}`, border: '2px solid #07080F' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-600"><span>Left</span><span>Center</span><span>Right</span></div>
              </div>
              <p className="text-xs text-gray-600 flex items-center gap-1.5"><AlertTriangle size={11} />Saved to your profile. Check Bias Report for running averages.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
