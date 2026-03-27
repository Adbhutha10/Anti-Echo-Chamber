import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Info, TrendingUp, AlertTriangle } from 'lucide-react';

function ScoreBar({ label, value, color, description }) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-lg font-bold font-mono" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function FeedAnalyzer({ userId, onProfileUpdate }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || "https://anti-echo-chamber.onrender.com";

  const analyze = async () => {
    if (!text.trim() || !userId) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, text })
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setResult(data);
      if (onProfileUpdate) onProfileUpdate();
    } catch (e) {
      setError('Analysis failed. Ensure the backend is running.');
    }
    setLoading(false);
  };

  const polLabel = (v) => v > 0.25 ? 'Right-Leaning' : v < -0.25 ? 'Left-Leaning' : 'Centrist';
  const polColor = (v) => v > 0.25 ? '#ef4444' : v < -0.25 ? '#3b82f6' : '#10b981';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Feed Analyzer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Paste any news article text below. Our NLP engine will score it for cognitive bias, emotional manipulation, and political leaning.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Info size={14} className="text-blue-400" />
          Paste at least a few sentences for accurate results. Headlines alone may not give meaningful scores.
        </div>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste article text here..."
          className="w-full h-48 bg-black/30 border border-white/5 rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:border-blue-500/40 resize-none transition-all leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{text.length} characters</span>
          <button
            onClick={analyze}
            disabled={loading || !text.trim() || !userId}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 text-blue-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-40"
          >
            <Zap size={15} />
            {loading ? 'Analyzing...' : 'Run Cognitive Inference'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="text-white font-semibold">Analysis Results</h3>
            </div>

            <div className="space-y-6">
              <ScoreBar
                label="Cognitive Bias"
                value={result.cognitive_bias}
                color={result.cognitive_bias > 0.6 ? '#ef4444' : result.cognitive_bias > 0.35 ? '#f59e0b' : '#10b981'}
                description="How one-sided or slanted the content's framing is"
              />
              <ScoreBar
                label="Emotional Manipulation"
                value={result.emotional_manipulation}
                color={result.emotional_manipulation > 0.5 ? '#f59e0b' : '#10b981'}
                description="Use of fear, outrage, or charged language to sway the reader"
              />
            </div>

            {/* Political Leaning */}
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Political Leaning</p>
                <p className="text-lg font-bold" style={{ color: polColor(result.political_leaning) }}>
                  {polLabel(result.political_leaning)}
                </p>
                <p className="text-xs text-gray-500">Raw score: {result.political_leaning.toFixed(3)}</p>
              </div>
              <div className="w-32 space-y-1">
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>Left</span><span>Right</span>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-600 via-gray-600 to-red-600 rounded-full relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-gray-900"
                    style={{ left: `${((result.political_leaning + 1) / 2) * 100}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/[0.02] rounded-xl p-3">
              <AlertTriangle size={12} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              This analysis was recorded to your profile. Check the Overview page to see your running average.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
