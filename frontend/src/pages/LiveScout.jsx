import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Search, ExternalLink, Info } from 'lucide-react';

function LiveCard({ article, index }) {
  const biasColor = article.cognitive_bias > 0.6 ? '#ef4444' : article.cognitive_bias > 0.35 ? '#f59e0b' : '#10b981';
  const polLabel  = article.political_leaning > 0.25 ? 'Right-Leaning' : article.political_leaning < -0.25 ? 'Left-Leaning' : 'Centrist';
  const biasLevel = article.cognitive_bias > 0.6 ? 'High Bias' : article.cognitive_bias > 0.35 ? 'Moderate' : 'Balanced';
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      className="card-glow space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge-green flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-dot" style={{ color: '#10b981' }} />LIVE
            </span>
            {article.publisher && <span className="text-[10px] font-mono text-gray-600">{article.publisher}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${biasColor}15`, border: `1px solid ${biasColor}30`, color: biasColor }}>
              {biasLevel}
            </span>
          </div>
          <h4 className="text-white font-semibold leading-snug">{article.title}</h4>
        </div>
        {article.url && article.url !== '#' && (
          <a href={article.url} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 text-blue-400 hover:text-blue-300 transition-colors p-1">
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      {article.content && <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{article.content}</p>}
      <div className="gradient-divider" />
      <div className="flex gap-6">
        {[
          { label: 'Bias Score', val: `${Math.round(article.cognitive_bias * 100)}%`, color: biasColor },
          { label: 'Manipulation', val: `${Math.round(article.emotional_manipulation * 100)}%`, color: '#f59e0b' },
          { label: 'Leaning', val: polLabel, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} className="space-y-0.5">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider">{s.label}</p>
            <p className="text-sm font-bold font-mono" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const SUGGESTIONS = ['climate change', 'immigration policy', 'election fraud', 'gun control', 'healthcare'];

export default function LiveScout({ userId }) {
  const [topic, setTopic]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const API_BASE = import.meta.env.VITE_API_BASE || "https://anti-echo-chamber.onrender.com";

  const scout = async () => {
    if (!topic.trim() || !userId) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/live-scout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, topic }) });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch { setError('Scout failed. Try a different topic or check your connection.'); }
    setLoading(false);
  };

  return (
    <div className="space-y-7">
      <div>
        <span className="badge-blue">Real-time</span>
        <h1 className="text-3xl font-bold text-white mt-2">Live Scout</h1>
        <p className="text-gray-500 text-sm mt-1.5">Search for a topic to fetch live news, score each article, and surface the most balanced counter-perspective.</p>
      </div>
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
        <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400">Live Scout uses NewsAPI to fetch the latest articles, runs them through the NLP engine, and returns the article with the lowest bias that most opposes your political trajectory.</p>
      </div>
      <div className="card space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && scout()}
              placeholder="Enter a news topic..." className="aec-input w-full py-3 pl-10 pr-4" />
          </div>
          <button onClick={scout} disabled={loading || !topic.trim() || !userId} className="btn-green flex items-center gap-2 whitespace-nowrap">
            <Radio size={14} className={loading ? 'animate-pulse' : ''} />
            {loading ? 'Scouting...' : 'Scout & Analyze'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-gray-700 uppercase tracking-wider">Try:</span>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setTopic(s)}
              className="text-xs text-gray-500 hover:text-white px-3 py-1 rounded-full transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {s}
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
      <AnimatePresence>
        {result && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-600 uppercase tracking-widest font-semibold">Best Counter-Perspective</p>
            <LiveCard article={result} index={0} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
