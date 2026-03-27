import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Search, ExternalLink, Info } from 'lucide-react';

function LiveArticleCard({ article, index }) {
  const biasColor = article.cognitive_bias > 0.6 ? '#ef4444' : article.cognitive_bias > 0.35 ? '#f59e0b' : '#10b981';
  const polLabel  = article.political_leaning > 0.25 ? 'Right-Leaning' : article.political_leaning < -0.25 ? 'Left-Leaning' : 'Centrist';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-[#111318] border border-white/5 rounded-2xl p-5 space-y-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
              LIVE
            </span>
            {article.publisher && (
              <span className="text-[10px] text-gray-500 font-mono">{article.publisher}</span>
            )}
          </div>
          <h4 className="text-white font-semibold text-sm leading-snug">{article.title}</h4>
        </div>
        {article.url && article.url !== '#' && (
          <a href={article.url} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 text-blue-400 hover:text-blue-300 transition-colors mt-1">
            <ExternalLink size={15} />
          </a>
        )}
      </div>
      {article.content && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{article.content}</p>
      )}
      <div className="flex gap-4 pt-2 border-t border-white/5">
        <div className="text-xs space-y-0.5">
          <p className="text-gray-500">Bias Score</p>
          <p className="font-mono font-bold" style={{ color: biasColor }}>
            {Math.round(article.cognitive_bias * 100)}%
          </p>
        </div>
        <div className="text-xs space-y-0.5">
          <p className="text-gray-500">Emotion Score</p>
          <p className="font-mono font-bold text-amber-400">
            {Math.round(article.emotional_manipulation * 100)}%
          </p>
        </div>
        <div className="text-xs space-y-0.5">
          <p className="text-gray-500">Political Lean</p>
          <p className="font-mono font-bold text-purple-400">{polLabel}</p>
        </div>
      </div>
    </motion.div>
  );
}

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
      const res = await fetch(`${API_BASE}/live-scout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, topic })
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Scout failed. Check backend connection or try a different topic.');
    }
    setLoading(false);
  };

  const SUGGESTIONS = ['climate change', 'immigration policy', 'election fraud', 'gun control', 'healthcare reform'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Scout</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter a topic to fetch real-time news articles, analyze them for bias, and surface the most balanced counter-perspective.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5 flex gap-3">
        <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400 leading-relaxed">
          Live Scout uses NewsAPI to fetch the latest articles on your topic, runs each one through the NLP engine, and returns the article with the
          <span className="text-white"> lowest bias and emotional manipulation</span> that most opposes your current political trajectory.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text" value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scout()}
              placeholder="Enter a news topic..."
              className="w-full bg-black/30 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-200 text-sm focus:outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <button
            onClick={scout} disabled={loading || !topic.trim() || !userId}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-40 whitespace-nowrap"
          >
            <Radio size={14} />
            {loading ? 'Scouting...' : 'Scout & Analyze'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-600">Suggestions:</span>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setTopic(s)}
              className="text-xs text-gray-500 hover:text-gray-200 bg-white/[0.03] hover:bg-white/[0.07] px-3 py-1 rounded-full border border-white/5 transition-all">
              {s}
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Best Counter-Perspective Article
            </h3>
            <LiveArticleCard article={result} index={0} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
